/** Seed / placeholder copy from prisma/seed.ts */
export function isPlaceholderDexDescription(description: string): boolean {
  const d = description.trim();
  return !d || d.includes("data imported from the Talrega");
}

export type PokemonHeroSubtext =
  | { kind: "description"; text: string }
  | { kind: "category"; text: string };

/**
 * Line under the species name: prefer real Pokédex flavor text.
 * If that’s still a placeholder, show dex class only when set (e.g. “Seed Pokémon”) — not typings, since type badges already show that.
 */
export function getPokemonHeroSubtext(pokemon: { description: string; category: string }): PokemonHeroSubtext | null {
  if (!isPlaceholderDexDescription(pokemon.description)) {
    return { kind: "description", text: pokemon.description.trim() };
  }
  const cat = pokemon.category.trim();
  if (cat && cat.toLowerCase() !== "pokémon") {
    const lower = cat.toLowerCase();
    if (lower.endsWith(" pokémon")) return { kind: "category", text: cat };
    return { kind: "category", text: `${cat} Pokémon` };
  }
  return null;
}
