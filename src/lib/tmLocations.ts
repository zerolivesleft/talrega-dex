/**
 * Pokémon Odyssey v4 — TM number, move name, and where to obtain.
 * Sources: walkthrough guides (e.g. Walkthrough For Gaming, guidetonote) aligned with Talrega.
 */

export type TmEntry = { tm: number; move: string; location: string };

export const TM_LOCATIONS: readonly TmEntry[] = [
  { tm: 1, move: "Drain Punch", location: "Sixth Stratum, central area" },
  { tm: 2, move: "Dragon Claw", location: "Cave of Ages" },
  { tm: 3, move: "Water Pulse", location: "Second Stratum, right side" },
  { tm: 4, move: "Calm Mind", location: "Fifth stratum, B1F" },
  { tm: 5, move: "Snarl", location: "Quest reward: “Show me a Sneasel!”, Krabby Club" },
  { tm: 6, move: "Toxic", location: "Sixth Stratum, western area" },
  { tm: 7, move: "Hail", location: "Arundel" },
  { tm: 8, move: "Bulk Up", location: "Quest reward: “Eeveelution!”, Third Stratum Base" },
  { tm: 9, move: "Bullet Seed", location: "Varley Woods" },
  { tm: 10, move: "Flash Cannon", location: "Seventh Stratum, B1F" },
  { tm: 11, move: "Sunny Day", location: "Charon" },
  { tm: 12, move: "Taunt", location: "Talrega’s Guild, TM machine near Rikkah" },
  { tm: 13, move: "Ice Beam", location: "Sea of Galazeah, eastern side" },
  { tm: 14, move: "Blizzard", location: "Sixth Stratum, southern area" },
  { tm: 15, move: "Hyper Beam", location: "Fifth Stratum, B2F" },
  { tm: 16, move: "Light Screen", location: "Quest reward: “The Cake is a Lie”, Krabby Club" },
  { tm: 17, move: "Protect", location: "Fourth Stratum" },
  { tm: 18, move: "Rain Dance", location: "Gorge of Zanado" },
  { tm: 19, move: "Giga Drain", location: "First Stratum" },
  { tm: 20, move: "Safeguard", location: "Talrega’s Guild, TM machine near Rikkah" },
  { tm: 21, move: "Frustration", location: "Gorenil" },
  { tm: 22, move: "Solar Beam", location: "Third Stratum" },
  { tm: 23, move: "Iron Tail", location: "Quest reward: “Eeveelution!”, Third Stratum Base" },
  { tm: 24, move: "Thunderbolt", location: "Quest reward: “The lost Castform”, Auburn Thicket" },
  { tm: 25, move: "Thunder", location: "Quest reward: “The Mantis’ Nest”, Rade of Carcino" },
  { tm: 26, move: "Earthquake", location: "Second Stratum, right side" },
  { tm: 27, move: "Return", location: "Gorenil" },
  { tm: 28, move: "Dig", location: "Second Stratum, left side" },
  { tm: 29, move: "Psychic", location: "Fifth Stratum, B2F" },
  { tm: 30, move: "Shadow Ball", location: "Third Stratum" },
  { tm: 31, move: "Brick Break", location: "Quest reward: “One drink too many…”, Brigit Farm" },
  { tm: 32, move: "Double Team", location: "Lost Woods" },
  { tm: 33, move: "Reflect", location: "Quest reward: “The Cake is a Lie”, Krabby Club" },
  { tm: 34, move: "Shock Wave", location: "Quest reward: “One drink too many…”, Brigit Farm" },
  { tm: 35, move: "Flamethrower", location: "Third Stratum" },
  { tm: 36, move: "Sludge Bomb", location: "Auburn Thicket" },
  { tm: 37, move: "Sandstorm", location: "Desert of Golgonda" },
  { tm: 38, move: "Fire Blast", location: "Porcelain Cave" },
  { tm: 39, move: "Rock Tomb", location: "Coastal Road" },
  { tm: 40, move: "Aerial Ace", location: "First Stratum" },
  { tm: 41, move: "Torment", location: "Talrega’s Guild, TM machine near Rikkah" },
  { tm: 42, move: "Facade", location: "Second Stratum, left side" },
  { tm: 43, move: "Dragon Pulse", location: "Seventh Stratum, B2F" },
  { tm: 44, move: "Rest", location: "Fourth Stratum" },
  { tm: 45, move: "Attract", location: "Talrega’s Guild, TM machine near Rikkah" },
  { tm: 46, move: "Dark Pulse", location: "Abyssal Fortress" },
  { tm: 47, move: "Steel Wing", location: "Sea of Galazeah, eastern side" },
  { tm: 48, move: "Skill Swap", location: "Fourth Stratum" },
  { tm: 49, move: "Scald", location: "Azure Cave" },
  { tm: 50, move: "Overheat", location: "Seventh Stratum, B4F" },
] as const;

const byMoveLower = new Map<string, TmEntry>(
  TM_LOCATIONS.map((e) => [e.move.toLowerCase(), e])
);

/** Lookup TM # and location by move name (case-insensitive). */
export function getTmEntryByMoveName(moveName: string): TmEntry | undefined {
  return byMoveLower.get(moveName.trim().toLowerCase());
}

/** Prefer DB value when set; otherwise map from move name. */
export function resolveTmNumber(moveName: string, dbTmNumber: number | null): number | null {
  if (dbTmNumber != null && dbTmNumber > 0) return dbTmNumber;
  return getTmEntryByMoveName(moveName)?.tm ?? null;
}

export function getTmLocation(moveName: string): string | null {
  return getTmEntryByMoveName(moveName)?.location ?? null;
}
