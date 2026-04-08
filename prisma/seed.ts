import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { promises as fs } from "fs";
import path from "path";
import { getTmEntryByMoveName } from "../src/lib/tmLocations";
import {
  canonicalPokemonNameKey,
  matchSheetPokemonToId,
  parseEncounterSheet,
  parseLevels,
} from "./parseEncounterSheet";
import { seedShinySpritesFromPokeApiGaps, seedShinySpritesFromRoster } from "./shinySpritesFromSheet";
import { resolveSqliteFilePath } from "../src/lib/sqlitePath";

const dbPath = resolveSqliteFilePath();
const adapter = new PrismaBetterSqlite3({ url: dbPath });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const DATA_URL =
  process.env.TALREGA_DATA_URL ??
  "https://raw.githubusercontent.com/epieffe/talrega-dex/main/data.json";
const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const POKEAPI_SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species";

type PokeApiSpeciesExtras = { flavorText: string; category: string };
const OVERRIDES_PATH = path.resolve(__dirname, "../data/overrides/pokemon.json");
const LOCATIONS_CSV_PATH = path.resolve(__dirname, "../data/locations/talrega-encounters.csv");
const LOCATIONS_CSV_URL =
  process.env.TALREGA_LOCATIONS_CSV_URL ??
  "https://docs.google.com/spreadsheets/d/1-duiiF5TXQtI3E9BdyXEViYYYVel_sUstNk1lZCqHsE/export?format=csv&gid=0";

type Dict<T> = Record<string, T>;

type TalregaData = {
  species: Dict<{
    ID: number;
    dexID: number;
    name: string;
    key?: string;
    stats: number[];
    type: number[];
    abilities: number[][];
    levelupMoves: number[][];
    tmMoves: number[];
    tutorMoves: number[];
    eggMoves: number[];
    evolutions?: number[][];
  }>;
  moves: Dict<{
    ID: number;
    name: string;
    power: number;
    type: number;
    accuracy: number;
    pp: number;
    split: number;
    description: string;
  }>;
  abilities: Dict<{
    ID: number;
    names: string[];
    description: string;
  }>;
  types: Dict<{
    ID: number;
    name: string;
    color: string;
    matchup: number[];
  }>;
  splits: Dict<string>;
  evolutions: Dict<string>;
  sprites: Dict<string>;
};

type PokemonOverrides = Record<
  string,
  {
    height?: number;
    weight?: number;
  }
>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueValue(base: string, used: Set<string>, fallbackSuffix: string): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let idx = 2;
  let candidate = `${base}-${fallbackSuffix}`;
  while (used.has(candidate)) {
    candidate = `${base}-${fallbackSuffix}-${idx}`;
    idx += 1;
  }
  used.add(candidate);
  return candidate;
}

/** Prefer `key` when it disambiguates forms (e.g. Minun vs Minun (Battle Bond)); avoids "Minun-324" for the base form. */
function pokemonDisplayLabel(mon: { name: string; key?: string }): string {
  const name = mon.name.trim();
  const key = mon.key?.trim();
  if (key && key !== name) return key;
  return name;
}

function normalizePokemonLookupName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.'\s]/g, "-")
    .replace("♀", "-f")
    .replace("♂", "-m")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const speciesExtrasCache = new Map<string, PokeApiSpeciesExtras | null>();

/** English Pokédex blurb + species class (e.g. “Seed Pokémon”) from PokéAPI. */
async function getSpeciesExtrasFromPokeApi(lookupName: string): Promise<PokeApiSpeciesExtras | null> {
  if (!lookupName) return null;
  if (speciesExtrasCache.has(lookupName)) return speciesExtrasCache.get(lookupName) ?? null;
  try {
    const res = await fetch(`${POKEAPI_SPECIES_URL}/${encodeURIComponent(lookupName)}`);
    if (!res.ok) {
      speciesExtrasCache.set(lookupName, null);
      return null;
    }
    const j = (await res.json()) as {
      flavor_text_entries?: { flavor_text: string; language: { name: string } }[];
      genera?: { genus: string; language: { name: string } }[];
    };
    const enGenus = j.genera?.find((g) => g.language.name === "en");
    const category = (enGenus?.genus ?? "Pokémon").trim();
    const enEntries = j.flavor_text_entries?.filter((e) => e.language.name === "en") ?? [];
    const latest = enEntries[enEntries.length - 1];
    let flavorText = latest?.flavor_text ?? "";
    flavorText = flavorText
      .replace(/\u000c/g, " ")
      .replace(/\r?\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const out: PokeApiSpeciesExtras = {
      flavorText: flavorText || "",
      category: category || "Pokémon",
    };
    speciesExtrasCache.set(lookupName, out);
    await new Promise((r) => setTimeout(r, 35));
    return out;
  } catch {
    speciesExtrasCache.set(lookupName, null);
    return null;
  }
}

async function loadOverrides(): Promise<PokemonOverrides> {
  try {
    const raw = await fs.readFile(OVERRIDES_PATH, "utf8");
    const parsed = JSON.parse(raw) as PokemonOverrides;
    return parsed;
  } catch {
    return {};
  }
}

function parseEvolution(
  sourceMethodId: number,
  sourceValue: number,
  evoTemplates: Dict<string>
) {
  const template = evoTemplates[String(sourceMethodId)] ?? "";
  if (template.includes("Level")) {
    return {
      method: "level_up",
      trigger: template.replace("${evo[1]}", String(sourceValue)).replaceAll("`", ""),
      requiredLevel: sourceValue,
      requiredItem: null as string | null,
    };
  }
  if (template.includes("with ")) {
    const item = template
      .replace("`with ", "")
      .replace("`", "")
      .trim();
    return {
      method: "item",
      trigger: item.length > 0 ? `Use ${item}` : "Use evolution item",
      requiredLevel: null as number | null,
      requiredItem: item.length > 0 ? item : null,
    };
  }
  return {
    method: "special",
    trigger: template.replace("${evo[1]}", String(sourceValue)).replaceAll("`", "") || "Special evolution",
    requiredLevel: null as number | null,
    requiredItem: null as string | null,
  };
}

async function loadEncounterCsvText(): Promise<string> {
  try {
    const res = await fetch(LOCATIONS_CSV_URL, { redirect: "follow" });
    if (res.ok) {
      const text = await res.text();
      if (text.length > 500 && text.includes("POKÉMON")) return text;
    }
  } catch {
    // fall back to bundled CSV
  }
  return fs.readFile(LOCATIONS_CSV_PATH, "utf8");
}

async function seedEncounterLocationsFromSheet() {
  const csvText = await loadEncounterCsvText();
  const rows = parseEncounterSheet(csvText);
  const allPokemon = await prisma.pokemon.findMany({
    select: { id: true, name: true, slug: true },
  });
  const bySlug = new Map(allPokemon.map((p) => [p.slug, p.id]));
  const byNameLower = new Map(
    allPokemon.map((p) => [canonicalPokemonNameKey(p.name), p.id])
  );

  const locationIdByDisplayName = new Map<string, number>();
  let unmatched = 0;
  let linked = 0;

  for (const r of rows) {
    const pid = matchSheetPokemonToId(r.sheetPokemonName, bySlug, byNameLower);
    if (!pid) {
      unmatched++;
      continue;
    }

    let locationId = locationIdByDisplayName.get(r.locationDisplayName);
    if (!locationId) {
      const created = await prisma.location.create({
        data: {
          name: r.locationDisplayName,
          areaType: r.encounterType,
          description: null,
        },
      });
      locationId = created.id;
      locationIdByDisplayName.set(r.locationDisplayName, locationId);
    }

    const { min, max, note } = parseLevels(r.levelRaw);
    let cond: string | null = r.conditions;
    if (note) cond = [cond, note].filter(Boolean).join(" · ");

    await prisma.pokemonLocation.create({
      data: {
        pokemonId: pid,
        locationId,
        encounterType: r.encounterType,
        rarity: r.encounterPct,
        minLevel: min,
        maxLevel: max,
        conditions: cond,
      },
    });
    linked++;
  }

  console.log(
    `✓ Wild encounters (${linked} from sheet; ${unmatched} name(s) unmatched; ${locationIdByDisplayName.size} location areas)`
  );
}

async function main() {
  console.log("Seeding Talrega Dex from upstream data...");
  console.log(`Source: ${DATA_URL}`);

  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch upstream data: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as TalregaData;
  const overrides = await loadOverrides();
  const spriteOutputDir = path.resolve(__dirname, "../public/images/pokemon");
  await fs.mkdir(spriteOutputDir, { recursive: true });
  await fs.mkdir(path.dirname(OVERRIDES_PATH), { recursive: true });

  await prisma.$transaction([
    prisma.pokemonMove.deleteMany(),
    prisma.evolution.deleteMany(),
    prisma.pokemonLocation.deleteMany(),
    prisma.pokemonEggGroup.deleteMany(),
    prisma.pokemonAbility.deleteMany(),
    prisma.pokemonType.deleteMany(),
    prisma.pokemon.deleteMany(),
    prisma.move.deleteMany(),
    prisma.ability.deleteMany(),
    prisma.typeMatchup.deleteMany(),
    prisma.type.deleteMany(),
    prisma.eggGroup.deleteMany(),
    prisma.location.deleteMany(),
  ]);

  const typeBySourceId: Record<number, number> = {};
  for (const sourceType of Object.values(data.types).sort((a, b) => a.ID - b.ID)) {
    const created = await prisma.type.create({
      data: {
        name: sourceType.name,
        color: sourceType.color,
        textColor: "#FFFFFF",
      },
    });
    typeBySourceId[sourceType.ID] = created.id;
  }
  console.log(`✓ Types seeded (${Object.keys(typeBySourceId).length})`);

  for (const sourceType of Object.values(data.types)) {
    const attackingTypeId = typeBySourceId[sourceType.ID];
    for (const [defendingSourceIdStr, rawMultiplier] of sourceType.matchup.entries()) {
      const defendingTypeId = typeBySourceId[Number(defendingSourceIdStr)];
      if (!attackingTypeId || !defendingTypeId) {
        continue;
      }
      await prisma.typeMatchup.create({
        data: {
          attackingTypeId,
          defendingTypeId,
          multiplier: Number(rawMultiplier) / 10,
        },
      });
    }
  }
  console.log("✓ Type chart seeded");

  const abilityBySourceId: Record<number, number> = {};
  for (const sourceAbility of Object.values(data.abilities).sort((a, b) => a.ID - b.ID)) {
    const name = sourceAbility.names[0]?.trim() || `Ability-${sourceAbility.ID}`;
    const created = await prisma.ability.upsert({
      where: { name },
      update: {
        description: sourceAbility.description || "No description available.",
      },
      create: {
        name,
        description: sourceAbility.description || "No description available.",
      },
    });
    abilityBySourceId[sourceAbility.ID] = created.id;
  }
  console.log(`✓ Abilities seeded (${Object.keys(abilityBySourceId).length})`);

  const moveBySourceId: Record<number, number> = {};
  for (const sourceMove of Object.values(data.moves).sort((a, b) => a.ID - b.ID)) {
    const created = await prisma.move.upsert({
      where: { name: sourceMove.name },
      update: {
        name: sourceMove.name,
        typeId: typeBySourceId[sourceMove.type],
        category: (data.splits[String(sourceMove.split)] || "Status").toLowerCase(),
        power: sourceMove.power > 0 ? sourceMove.power : null,
        accuracy: sourceMove.accuracy > 0 ? sourceMove.accuracy : null,
        pp: sourceMove.pp,
        description: sourceMove.description || "No description available.",
      },
      create: {
        name: sourceMove.name,
        typeId: typeBySourceId[sourceMove.type],
        category: (data.splits[String(sourceMove.split)] || "Status").toLowerCase(),
        power: sourceMove.power > 0 ? sourceMove.power : null,
        accuracy: sourceMove.accuracy > 0 ? sourceMove.accuracy : null,
        pp: sourceMove.pp,
        description: sourceMove.description || "No description available.",
      },
    });
    moveBySourceId[sourceMove.ID] = created.id;
  }
  console.log(`✓ Moves seeded (${Object.keys(moveBySourceId).length})`);

  const pokemonBySourceId: Record<number, number> = {};
  const pokemonBySpeciesKey: Record<string, number> = {};
  const spritePathBySourceId: Record<number, string> = {};
  const pokeApiDimensionCache = new Map<string, { height: number; weight: number } | null>();
  let speciesExtrasResolved = 0;
  const usedNames = new Set<string>();
  const usedSlugs = new Set<string>();
  const writtenSpriteFiles = new Set<string>();
  const sortedSpeciesEntries = Object.entries(data.species).sort((a, b) => a[1].dexID - b[1].dexID);
  for (const [index, [speciesKey, mon]] of sortedSpeciesEntries.entries()) {
    const hp = mon.stats[0] ?? 1;
    const atk = mon.stats[1] ?? 1;
    const def = mon.stats[2] ?? 1;
    const speed = mon.stats[3] ?? 1;
    const spAtk = mon.stats[4] ?? 1;
    const spDef = mon.stats[5] ?? 1;
    const uniqueName = uniqueValue(pokemonDisplayLabel(mon), usedNames, String(mon.ID));
    const uniqueSlug = uniqueValue(slugify(mon.key || mon.name), usedSlugs, String(mon.ID));
    let height = 1;
    let weight = 1;

    const override = overrides[uniqueSlug] ?? overrides[String(mon.ID)] ?? overrides[normalizePokemonLookupName(mon.name)];
    if (override?.height && override?.weight) {
      height = override.height;
      weight = override.weight;
    } else {
      const lookupCandidates = [
        normalizePokemonLookupName(mon.name),
        normalizePokemonLookupName(mon.key || mon.name),
        normalizePokemonLookupName(uniqueSlug),
      ];
      let dimensions: { height: number; weight: number } | null = null;
      for (const lookupName of lookupCandidates) {
        if (pokeApiDimensionCache.has(lookupName)) {
          dimensions = pokeApiDimensionCache.get(lookupName) ?? null;
          if (dimensions) break;
          continue;
        }
        try {
          const pokeRes = await fetch(`${POKEAPI_BASE_URL}/${lookupName}`);
          if (pokeRes.ok) {
            const pokeData = (await pokeRes.json()) as { height: number; weight: number };
            dimensions = {
              height: pokeData.height / 10,
              weight: pokeData.weight / 10,
            };
            pokeApiDimensionCache.set(lookupName, dimensions);
            break;
          }
        } catch {
          // Keep fallback defaults when unavailable.
        }
        pokeApiDimensionCache.set(lookupName, null);
      }
      if (dimensions) {
        height = dimensions.height;
        weight = dimensions.weight;
      }
    }
    const spriteDataUri = data.sprites?.[String(mon.ID)];
    let imageUrl = "/images/pokemon/placeholder.png";
    if (spriteDataUri && !spritePathBySourceId[mon.ID]) {
      const match = /^data:image\/png;base64,(.+)$/i.exec(spriteDataUri);
      if (match?.[1]) {
        const fileName = `${String(mon.ID).padStart(4, "0")}.png`;
        const outputPath = path.join(spriteOutputDir, fileName);
        if (!writtenSpriteFiles.has(outputPath)) {
          await fs.writeFile(outputPath, Buffer.from(match[1], "base64"));
          writtenSpriteFiles.add(outputPath);
        }
        spritePathBySourceId[mon.ID] = `/images/pokemon/${fileName}`;
      }
    }
    if (spritePathBySourceId[mon.ID]) {
      imageUrl = spritePathBySourceId[mon.ID];
    }

    let description = `${mon.name} data imported from the Talrega source dex.`;
    let category = "Pokémon";
    const speciesCandidates = [
      normalizePokemonLookupName(mon.name),
      normalizePokemonLookupName(mon.key || mon.name),
      normalizePokemonLookupName(uniqueSlug),
    ];
    for (const cand of speciesCandidates) {
      if (!cand) continue;
      const extras = await getSpeciesExtrasFromPokeApi(cand);
      if (extras) {
        if (extras.flavorText) description = extras.flavorText;
        category = extras.category;
        speciesExtrasResolved += 1;
        break;
      }
    }

    const created = await prisma.pokemon.create({
      data: {
        dexNumber: index + 1,
        name: uniqueName,
        slug: uniqueSlug,
        description,
        category,
        baseHp: hp,
        baseAtk: atk,
        baseDef: def,
        baseSpAtk: spAtk,
        baseSpDef: spDef,
        baseSpeed: speed,
        baseTotal: hp + atk + def + spAtk + spDef + speed,
        height,
        weight,
        imageUrl,
      },
    });
    pokemonBySpeciesKey[speciesKey] = created.id;
    if (!pokemonBySourceId[mon.ID]) {
      pokemonBySourceId[mon.ID] = created.id;
    }
  }
  console.log(`✓ Pokemon seeded (${Object.keys(pokemonBySpeciesKey).length})`);
  console.log(`✓ Pokédex flavor + species class from PokéAPI (${speciesExtrasResolved} matched)`);
  console.log(`✓ Sprites written (${Object.keys(spritePathBySourceId).length})`);

  await seedEncounterLocationsFromSheet();
  const sheetShinySlugs = await seedShinySpritesFromRoster(prisma);
  await seedShinySpritesFromPokeApiGaps(prisma, { sheetSlugs: sheetShinySlugs });

  for (const [speciesKey, mon] of Object.entries(data.species)) {
    const pokemonId = pokemonBySpeciesKey[speciesKey];
    const seenTypeIds = new Set<number>();
    for (const [slot, sourceTypeId] of mon.type.entries()) {
      const resolvedTypeId = typeBySourceId[sourceTypeId];
      if (resolvedTypeId && !seenTypeIds.has(resolvedTypeId)) {
        seenTypeIds.add(resolvedTypeId);
        await prisma.pokemonType.create({
          data: {
            pokemonId,
            typeId: resolvedTypeId,
            slot: slot + 1,
          },
        });
      }
    }

    const seenAbilityIds = new Set<number>();
    for (const [slot, abilityData] of mon.abilities.entries()) {
      const sourceAbilityId = abilityData[0];
      if (!sourceAbilityId || !abilityBySourceId[sourceAbilityId]) {
        continue;
      }
      const resolvedAbilityId = abilityBySourceId[sourceAbilityId];
      if (seenAbilityIds.has(resolvedAbilityId)) {
        continue;
      }
      seenAbilityIds.add(resolvedAbilityId);
      await prisma.pokemonAbility.create({
        data: {
          pokemonId,
          abilityId: resolvedAbilityId,
          slot: slot + 1,
          isHidden: slot === 2 || abilityData[1] === 1,
        },
      });
    }

    for (const [sourceMoveId, level] of mon.levelupMoves) {
      if (!moveBySourceId[sourceMoveId]) continue;
      try {
        await prisma.pokemonMove.create({
          data: {
            pokemonId,
            moveId: moveBySourceId[sourceMoveId],
            learnMethod: "level_up",
            learnLevel: level || 1,
          },
        });
      } catch {
        // ignore duplicate learnset entries
      }
    }

    for (const sourceMoveId of mon.tmMoves) {
      if (!moveBySourceId[sourceMoveId]) continue;
      const moveRow = data.moves[String(sourceMoveId)];
      const tmNum = moveRow?.name ? getTmEntryByMoveName(moveRow.name)?.tm ?? null : null;
      try {
        await prisma.pokemonMove.create({
          data: {
            pokemonId,
            moveId: moveBySourceId[sourceMoveId],
            learnMethod: "tm",
            tmNumber: tmNum,
          },
        });
      } catch {
        // ignore duplicate learnset entries
      }
    }

    for (const sourceMoveId of mon.tutorMoves) {
      if (!moveBySourceId[sourceMoveId]) continue;
      try {
        await prisma.pokemonMove.create({
          data: {
            pokemonId,
            moveId: moveBySourceId[sourceMoveId],
            learnMethod: "tutor",
          },
        });
      } catch {
        // ignore duplicate learnset entries
      }
    }

    for (const sourceMoveId of mon.eggMoves) {
      if (!moveBySourceId[sourceMoveId]) continue;
      try {
        await prisma.pokemonMove.create({
          data: {
            pokemonId,
            moveId: moveBySourceId[sourceMoveId],
            learnMethod: "egg",
          },
        });
      } catch {
        // ignore duplicate learnset entries
      }
    }

    for (const evo of mon.evolutions ?? []) {
      const [sourceMethodId, sourceValue, toSourcePokemonId] = evo;
      const toPokemonId = pokemonBySourceId[toSourcePokemonId];
      if (!toPokemonId) continue;
      const parsed = parseEvolution(sourceMethodId, sourceValue, data.evolutions);
      await prisma.evolution.create({
        data: {
          fromPokemonId: pokemonId,
          toPokemonId,
          method: parsed.method,
          trigger: parsed.trigger,
          requiredLevel: parsed.requiredLevel,
          requiredItem: parsed.requiredItem,
        },
      });
    }
  }

  console.log("✓ Relations seeded");
  console.log("✅ Talrega Dex seeding complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
