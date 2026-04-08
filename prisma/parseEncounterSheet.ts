/**
 * Parses the Talrega wild-encounter Google Sheet (exported CSV).
 * Sheet: https://docs.google.com/spreadsheets/d/1-duiiF5TXQtI3E9BdyXEViYYYVel_sUstNk1lZCqHsE
 */

export type ParsedEncounter = {
  /** Human-readable place, e.g. "Fibernia Woods — Tall grass" */
  locationDisplayName: string;
  /** snake_case method for icons / filtering */
  encounterType: string;
  /** Raw species cell from the sheet */
  sheetPokemonName: string;
  levelRaw: string;
  encounterPct: string;
  /** Extra text (Trade, Sidequest, Event notes, etc.) */
  conditions: string | null;
};

const ENCOUNTER_METHODS = new Set(
  [
    "TALL GRASS",
    "HEADBUTT",
    "SURFING",
    "FISHING",
    "CAVE",
    "FLOOR",
    "GRASS",
    "ROCK SMASH",
    "OLD ROD",
    "GOOD ROD",
    "SUPER ROD",
    "SPECIAL",
    "STATIC",
    "SAND",
    "WATER",
    "F.O.E.",
  ].map((s) => s.toUpperCase())
);

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === '"') {
      i++;
      while (i < line.length && line[i] !== '"') {
        cur += line[i];
        i++;
      }
      if (line[i] === '"') i++;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
      i++;
    } else {
      cur += ch;
      i++;
    }
  }
  out.push(cur);
  return out;
}

function slugifyMethod(m: string): string {
  return m
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function titleCaseArea(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  return s
    .toLowerCase()
    .split(/\s+/u)
    .map((w) => {
      if (/^b\d+f$/i.test(w)) return w.toUpperCase();
      if (/^[-–]/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ")
    .replace(/ - /g, " — ");
}

function rowLooksLikePokemonData(cells: string[]): boolean {
  for (let c = 0; c + 2 < cells.length; c += 4) {
    const name = cells[c]?.trim() ?? "";
    const lv = cells[c + 1]?.trim() ?? "";
    if (!name || name === "POKÉMON") continue;
    if (!lv) continue;
    if (/^(\d+-\d+|\d+|\?\?\?)/.test(lv)) return true;
    if (/^(event|trade)/i.test(lv)) return true;
  }
  return false;
}

function isPokemonHeader(cells: string[]): boolean {
  return cells[0]?.trim() === "POKÉMON" && cells[1]?.trim().toUpperCase() === "LEVEL";
}

function extractMethodSlots(cells: string[]): string[] {
  const found: string[] = [];
  for (let c = 0; c < cells.length; c += 4) {
    const v = cells[c]?.trim().toUpperCase();
    if (v && ENCOUNTER_METHODS.has(v)) {
      found.push(slugifyMethod(cells[c]!.trim()));
    }
  }
  if (found.length > 0) return found;
  const only = cells[0]?.trim().toUpperCase();
  if (only && ENCOUNTER_METHODS.has(only)) {
    return [slugifyMethod(cells[0]!.trim())];
  }
  return [];
}

function isMethodRow(cells: string[]): boolean {
  return extractMethodSlots(cells).length > 0;
}

function isAreaTitle(cells: string[]): boolean {
  const c0 = cells[0]?.trim() ?? "";
  if (!c0 || c0.startsWith("⭐") || c0.includes("Regional Variant")) return false;
  if (c0 === "POKÉMON" || c0 === "EVENT") return false;
  if (ENCOUNTER_METHODS.has(c0.toUpperCase())) return false;
  if (isMethodRow(cells)) return false;
  const c1 = cells[1]?.trim() ?? "";
  if (c1 && /^(\d|LEVEL)/.test(c1)) return false;
  if (rowLooksLikePokemonData(cells)) return false;
  return c0.length >= 3;
}

function splitConditions(levelRaw: string, pctRaw: string): { level: string; pct: string; conditions: string | null } {
  const lv = levelRaw.trim();
  const pc = pctRaw.trim();
  if (/trade|sidequest|event/i.test(lv) || /trade|sidequest/i.test(pc)) {
    const parts = [lv, pc].filter((p) => p && !/^\d+-\d+$/.test(p) && !/^\d+%?$/.test(p) && !/^\?\?\?$/.test(p));
    return {
      level: /\d+-\d+|\d+/.test(lv) ? lv : "—",
      pct: /%$/.test(pc) ? pc : pc || "—",
      conditions: parts.length ? parts.join(" · ") : pc || lv || null,
    };
  }
  return { level: lv, pct: pc, conditions: null };
}

function emitRow(
  out: ParsedEncounter[],
  area: string,
  methods: string[],
  name: string,
  levelRaw: string,
  pctRaw: string,
  slotIndex: number,
  eventBanner: string | null
) {
  const trimmed = name.trim();
  if (!trimmed || trimmed === "POKÉMON") return;
  if (/\/|,.*\//.test(trimmed)) return;
  if (/^(OLD ROD|GOOD ROD|SUPER ROD|POKÉMON LAB|KRABBY CLUB)/i.test(trimmed)) return;

  const method = methods[slotIndex] ?? methods[0] ?? "overworld";
  const { level, pct, conditions } = splitConditions(levelRaw, pctRaw);
  const merged =
    [eventBanner, conditions].filter((x): x is string => Boolean(x && x.trim())).join(" · ") || null;
  const areaT = titleCaseArea(area);
  const methodLabel = method
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const locationDisplayName = `${areaT} — ${methodLabel}`;

  out.push({
    locationDisplayName,
    encounterType: method,
    sheetPokemonName: trimmed,
    levelRaw: level,
    encounterPct: pct,
    conditions: merged,
  });
}

/**
 * Walk the sheet and extract wild encounter rows (best-effort; sheet layout varies).
 */
export function parseEncounterSheet(csvText: string): ParsedEncounter[] {
  const lines = csvText.split(/\r?\n/);
  const out: ParsedEncounter[] = [];

  let currentArea = "Unknown";
  let pendingMethods: string[] = [];
  let eventBanner: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);

    if (cells[0]?.trim() === "EVENT") {
      eventBanner = cells[4]?.trim() || null;
      continue;
    }

    if (isPokemonHeader(cells)) {
      const methods = pendingMethods.length > 0 ? pendingMethods : ["tall_grass"];
      const tableBanner = eventBanner;
      eventBanner = null;
      i++;
      while (i < lines.length) {
        const row = parseCsvLine(lines[i]);
        const rowEmpty = !row.some((x) => x?.trim());
        if (rowEmpty) {
          break;
        }
        if (isPokemonHeader(row)) {
          const sub = extractMethodSlots(row);
          if (sub.length) pendingMethods = sub;
          i++;
          continue;
        }
        if (!row[0]?.trim() && row[4]?.trim() === "POKÉMON" && row[5]?.trim().toUpperCase() === "LEVEL") {
          i++;
          continue;
        }
        if (!rowLooksLikePokemonData(row)) {
          i--;
          break;
        }

        for (let s = 0; s < Math.ceil(row.length / 4); s++) {
          const base = s * 4;
          const name = row[base]?.trim() ?? "";
          const lv = row[base + 1]?.trim() ?? "";
          const pct = row[base + 2]?.trim() ?? "";
          if (!name || name === "POKÉMON") continue;
          if (!lv && !pct) continue;
          emitRow(out, currentArea, methods, name, lv, pct, s, tableBanner);
        }
        i++;
      }
      i--;
      continue;
    }

    if (isMethodRow(cells)) {
      pendingMethods = extractMethodSlots(cells);
      continue;
    }

    if (isAreaTitle(cells)) {
      currentArea = cells[0]!.trim();
      pendingMethods = [];
      continue;
    }
  }

  return out;
}

/** Normalize sheet text for matching to DB `Pokemon.name` / slug. */
export function normalizeSheetSpeciesName(raw: string): string {
  return raw
    .replace(/⭐/g, "")
    .replace(/\u2605/g, "")
    .replace(/\(⭐\)/g, "")
    .replace(/[''´`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const SHEET_NAME_TO_SLUG: Record<string, string> = {
  "nidoran (m)": "nidoran-m",
  "nidoran (f)": "nidoran-f",
  "nidoran♂": "nidoran-m",
  "nidoran♀": "nidoran-f",
  farfetchd: "farfetchd",
  "farfetch'd": "farfetchd",
  "sirfetch'd": "sirfetchd",
};

/** Normalize Pokémon name for case- and apostrophe-insensitive lookup (matches seed map keys). */
export function canonicalPokemonNameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''´`]/g, "'")
    .normalize("NFKC");
}

/**
 * Resolve sheet label to pokemon id using name/slug maps built from DB.
 */
export function matchSheetPokemonToId(
  sheetName: string,
  bySlug: Map<string, number>,
  byNameLower: Map<string, number>
): number | null {
  const cleaned = normalizeSheetSpeciesName(sheetName);
  const lower = cleaned.toLowerCase();
  const nameKey = canonicalPokemonNameKey(cleaned);

  const directSlug = SHEET_NAME_TO_SLUG[lower];
  if (directSlug && bySlug.has(directSlug)) {
    return bySlug.get(directSlug)!;
  }

  if (byNameLower.has(nameKey)) return byNameLower.get(nameKey)!;
  if (byNameLower.has(lower)) return byNameLower.get(lower)!;

  const paren = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(cleaned);
  if (paren) {
    const base = paren[1]!.trim();
    const inner = paren[2]!.trim().toLowerCase();
    if (inner === "m" || inner === "male") {
      const slug = `${base.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-m`.replace(/^-+|-+$/g, "");
      if (bySlug.has(slug)) return bySlug.get(slug)!;
    }
    if (inner === "f" || inner === "female") {
      const slug = `${base.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-f`.replace(/^-+|-+$/g, "");
      if (bySlug.has(slug)) return bySlug.get(slug)!;
    }
    const baseLower = base.toLowerCase();
    if (byNameLower.has(canonicalPokemonNameKey(base))) return byNameLower.get(canonicalPokemonNameKey(base))!;
    if (byNameLower.has(baseLower)) return byNameLower.get(baseLower)!;
    const baseSlug = base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (bySlug.has(baseSlug)) return bySlug.get(baseSlug)!;
  }

  const noParen = cleaned.replace(/\s*\([^)]*\)/g, "").trim();
  if (noParen !== cleaned) {
    const np = noParen.toLowerCase();
    if (byNameLower.has(canonicalPokemonNameKey(noParen))) return byNameLower.get(canonicalPokemonNameKey(noParen))!;
    if (byNameLower.has(np)) return byNameLower.get(np)!;
    const slug = noParen
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (bySlug.has(slug)) return bySlug.get(slug)!;
  }

  if (/sandy\s*shocks?/i.test(cleaned) && bySlug.has("sandy-shocks")) {
    return bySlug.get("sandy-shocks")!;
  }
  if (/farfetch/i.test(sheetName) && /⭐/.test(sheetName) && bySlug.has("farfetch-d-galar")) {
    return bySlug.get("farfetch-d-galar")!;
  }

  return null;
}

export function parseLevels(levelRaw: string): { min: number; max: number; note: string | null } {
  const s = levelRaw.trim();
  if (s === "—" || !s) return { min: 1, max: 1, note: null };
  const m = /^(\d+)\s*-\s*(\d+)$/.exec(s);
  if (m) {
    return { min: Number(m[1]), max: Number(m[2]), note: null };
  }
  const n = /^(\d+)$/.exec(s);
  if (n) {
    const v = Number(n[1]);
    return { min: v, max: v, note: null };
  }
  if (s === "???") return { min: 0, max: 0, note: "???" };
  return { min: 1, max: 1, note: s };
}
