import type { PokemonListItem, SortKey } from "@/lib/types";

export const POKEMON_SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "dex", label: "Dex #" },
  { value: "name", label: "Name" },
  { value: "bst", label: "BST" },
  { value: "hp", label: "HP" },
  { value: "atk", label: "Attack" },
  { value: "def", label: "Defense" },
  { value: "spatk", label: "Sp. Atk" },
  { value: "spdef", label: "Sp. Def" },
  { value: "speed", label: "Speed" },
];

export function sortPokemon(list: PokemonListItem[], key: SortKey): PokemonListItem[] {
  return [...list].sort((a, b) => {
    switch (key) {
      case "name":
        return a.name.localeCompare(b.name);
      case "bst":
        return b.baseTotal - a.baseTotal;
      case "hp":
        return b.baseHp - a.baseHp;
      case "atk":
        return b.baseAtk - a.baseAtk;
      case "def":
        return b.baseDef - a.baseDef;
      case "spatk":
        return b.baseSpAtk - a.baseSpAtk;
      case "spdef":
        return b.baseSpDef - a.baseSpDef;
      case "speed":
        return b.baseSpeed - a.baseSpeed;
      default:
        return a.dexNumber - b.dexNumber;
    }
  });
}
