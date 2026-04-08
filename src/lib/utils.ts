import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function padDexNumber(num: number, length = 3): string {
  return String(num).padStart(length, "0");
}

/** URL-safe slug for ability names (matches lookup in ability routes). */
export function abilitySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** URL-safe slug for move names (`/move/[slug]`). */
export function moveSlug(name: string): string {
  return abilitySlug(name);
}

export function formatStatName(stat: string): string {
  const map: Record<string, string> = {
    baseHp: "HP",
    baseAtk: "Attack",
    baseDef: "Defense",
    baseSpAtk: "Sp. Atk",
    baseSpDef: "Sp. Def",
    baseSpeed: "Speed",
    baseTotal: "Total",
  };
  return map[stat] ?? stat;
}

export function statColor(value: number): string {
  if (value >= 110) return "#00C0FF";
  if (value >= 80) return "#5AC45A";
  if (value >= 50) return "#FFD059";
  return "#FF5959";
}

export function rarityColor(rarity: string): string {
  const map: Record<string, string> = {
    common: "#5AC45A",
    uncommon: "#F8D030",
    rare: "#F08030",
    mythic: "#A040A0",
  };
  return map[rarity] ?? "#888";
}

/**
 * When the stored location string ends with the same phrase as the encounter method
 * (e.g. "Brigit Farm — Tall Grass" + tall_grass), return only the place part so the
 * Method column is not duplicated in the Location column.
 */
export function displayLocationNameWithoutDuplicateMethod(
  locationName: string,
  encounterType: string
): string {
  const methodWords = encounterType.replace(/_/g, " ").toLowerCase().trim();
  if (!methodWords) return locationName;
  const parts = locationName.split(/\s*[—–-]\s*/).map((p) => p.trim());
  if (parts.length < 2) return locationName;
  const last = parts[parts.length - 1]!.toLowerCase();
  if (last === methodWords) {
    return parts.slice(0, -1).join(" — ");
  }
  return locationName;
}

export function encounterIcon(type: string): string {
  const map: Record<string, string> = {
    grass: "🌿",
    tall_grass: "🌿",
    surfing: "🏄",
    fishing: "🎣",
    old_rod: "🎣",
    good_rod: "🎣",
    super_rod: "🎣",
    cave: "🦇",
    floor: "🦇",
    headbutt: "🌳",
    rock_smash: "🪨",
    sand: "🏜️",
    water: "💧",
    special: "✨",
    static: "⭐",
    gift: "🎁",
    event: "🎫",
    f_oe: "⚔️",
  };
  return map[type] ?? "📍";
}
