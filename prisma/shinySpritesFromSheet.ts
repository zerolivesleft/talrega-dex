import { promises as fs } from "fs";
import path from "path";
import type { PrismaClient } from "@prisma/client";
import { extractShinyPngsBySlugFromXlsxBuffer } from "./parseShinySheetXlsx";
import { getSpriteBoxFromPublicImageUrl, normalizeShinyToMatchSpritePng } from "./normalizeShinySprite";
import { removeShinySheetBackgroundPng } from "./removeShinyBackground";

const SHINY_XLSX_PATH = path.resolve(__dirname, "../data/shiny/talrega-shiny-art.xlsx");
const SHINY_XLSX_URL =
  process.env.TALREGA_SHINY_SHEET_XLSX_URL ??
  "https://docs.google.com/spreadsheets/d/1Es1clPMUhEEqZRHW0tgAmvxqSzVXiXmD/export?format=xlsx&gid=1620070709";

const POKEAPI_POKEMON_URL = "https://pokeapi.co/api/v2/pokemon";

/**
 * DB slug → PokéAPI `GET /pokemon/{name}` for shinies not supplied by the sheet.
 */
const POKEAPI_SHINY_LOOKUP: Record<string, string> = {
  ratreecate: "raticate",
  reefsola: "corsola-galar",
  yggdreon: "sylveon",
  "farfetch-d": "farfetchd",
  "farfetch-d-galar": "farfetchd-galar",
  "sirfetch-d": "sirfetchd",
  /** PokéAPI uses two-/three-segment forms; default to two-segment shiny. */
  dudunsparce: "dudunsparce-two-segment",
  "plusle-battle-bond": "plusle",
  "minun-battle-bond": "minun",
  "kecleon-battle-bond": "kecleon",
  "mawile-battle-bond": "mawile",
  "blaziken-battle-bond": "blaziken",
};

/** Classic pixel shiny (`sprites/pokemon/shiny/*.png`), not HOME or official artwork. */
function shinyPixelUrlFromPokemonPayload(j: {
  sprites?: { front_shiny?: string | null; back_shiny?: string | null };
}): string | null {
  const s = j.sprites;
  if (!s) return null;
  return s.front_shiny || s.back_shiny || null;
}

async function loadShinySheetXlsxBuffer(): Promise<Buffer> {
  try {
    const res = await fetch(SHINY_XLSX_URL, { redirect: "follow" });
    if (res.ok) {
      const ab = await res.arrayBuffer();
      const buf = Buffer.from(ab);
      if (buf.length > 50_000 && buf[0] === 0x50 && buf[1] === 0x4b) return buf;
    }
  } catch {
    // bundled file
  }
  return fs.readFile(SHINY_XLSX_PATH);
}

/**
 * Writes `public/images/pokemon/shiny/{slug}.png` from embedded sheet artwork
 * and sets `Pokemon.shinyImageUrl`. CSV has no images; the xlsx carries xl/media PNGs.
 */
export async function seedShinySpritesFromRoster(prisma: PrismaClient): Promise<Set<string>> {
  const xlsxBuf = await loadShinySheetXlsxBuffer();
  const bySlug = await extractShinyPngsBySlugFromXlsxBuffer(xlsxBuf);
  const shinyDir = path.resolve(__dirname, "../public/images/pokemon/shiny");
  await fs.mkdir(shinyDir, { recursive: true });

  let saved = 0;
  let skipped = 0;

  for (const [slug, buf] of bySlug) {
    const row = await prisma.pokemon.findUnique({ where: { slug }, select: { id: true, imageUrl: true } });
    if (!row) {
      console.warn(`  shiny: no DB row for sheet slug "${slug}"`);
      skipped++;
      continue;
    }
    const fileName = `${slug}.png`;
    const publicPath = `/images/pokemon/shiny/${fileName}`;
    const bgRemoved = await removeShinySheetBackgroundPng(buf);
    const box = await getSpriteBoxFromPublicImageUrl(row.imageUrl);
    const processed = await normalizeShinyToMatchSpritePng(bgRemoved, "artwork", box);
    await fs.writeFile(path.join(shinyDir, fileName), processed);
    await prisma.pokemon.update({
      where: { slug },
      data: { shinyImageUrl: publicPath },
    });
    saved++;
  }

  console.log(
    `✓ Shiny sprites from sheet xlsx (${saved} saved${skipped ? `; ${skipped} skipped` : ""}; ${bySlug.size} extracted; mint background removed)`,
  );
  return new Set(bySlug.keys());
}

export type PokeApiShinySeedOptions = {
  /** Slugs that already use custom sheet art; never overwritten by PokéAPI. */
  sheetSlugs: Set<string>;
};

/**
 * Fills `shinyImageUrl` with **pixel** shiny sprites (`sprites.front_shiny`) from PokéAPI for Pokémon
 * that still lack one. Set `TALREGA_REFETCH_POKEAPI_SHINIES=1` to re-download for all non-sheet species
 * (e.g. after switching away from HOME artwork).
 */
export async function seedShinySpritesFromPokeApiGaps(
  prisma: PrismaClient,
  options: PokeApiShinySeedOptions,
): Promise<void> {
  const refetch =
    process.env.TALREGA_REFETCH_POKEAPI_SHINIES === "1" ||
    process.env.TALREGA_REFETCH_POKEAPI_SHINIES === "true";
  const sheetList = [...options.sheetSlugs];
  if (refetch && sheetList.length === 0) {
    console.warn("✓ Shiny sprites from PokéAPI refetch skipped (no sheet slugs; run sheet step first)");
    return;
  }
  const missing = await prisma.pokemon.findMany({
    where: refetch ? { slug: { notIn: sheetList } } : { shinyImageUrl: null },
    select: { slug: true },
  });
  if (missing.length === 0) {
    console.log("✓ Shiny sprites from PokéAPI (0 needed)");
    return;
  }

  const shinyDir = path.resolve(__dirname, "../public/images/pokemon/shiny");
  await fs.mkdir(shinyDir, { recursive: true });

  let saved = 0;
  let skipped = 0;

  for (const { slug } of missing) {
    const apiName = POKEAPI_SHINY_LOOKUP[slug] ?? slug;
    try {
      const pokeRow = await prisma.pokemon.findUnique({
        where: { slug },
        select: { imageUrl: true },
      });
      if (!pokeRow) {
        console.warn(`  shiny API: missing row for ${slug}`);
        skipped++;
        continue;
      }
      const box = await getSpriteBoxFromPublicImageUrl(pokeRow.imageUrl);
      const res = await fetch(`${POKEAPI_POKEMON_URL}/${encodeURIComponent(apiName)}`);
      if (!res.ok) {
        console.warn(`  shiny API: skip ${slug} (PokéAPI ${res.status} for ${apiName})`);
        skipped++;
        continue;
      }
      const json = (await res.json()) as {
        sprites?: { front_shiny?: string | null; back_shiny?: string | null };
      };
      const imgUrl = shinyPixelUrlFromPokemonPayload(json);
      if (!imgUrl) {
        console.warn(`  shiny API: no pixel shiny (front_shiny) for ${slug} (${apiName})`);
        skipped++;
        continue;
      }
      const imgRes = await fetch(imgUrl);
      if (!imgRes.ok) {
        console.warn(`  shiny API: image fetch failed ${slug}`);
        skipped++;
        continue;
      }
      const raw = Buffer.from(await imgRes.arrayBuffer());
      const buf = await normalizeShinyToMatchSpritePng(raw, "pixel", box);
      const fileName = `${slug}.png`;
      await fs.writeFile(path.join(shinyDir, fileName), buf);
      await prisma.pokemon.update({
        where: { slug },
        data: { shinyImageUrl: `/images/pokemon/shiny/${fileName}` },
      });
      saved++;
      await new Promise((r) => setTimeout(r, 45));
    } catch (e) {
      console.warn(`  shiny API: error ${slug}`, e);
      skipped++;
    }
  }

  console.log(
    `✓ Shiny sprites from PokéAPI (${saved} pixel sprites saved${skipped ? `; ${skipped} skipped` : ""}${refetch ? "; refetched" : ""})`,
  );
}
