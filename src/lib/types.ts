export interface PokemonListItem {
  id: number;
  dexNumber: number;
  name: string;
  slug: string;
  imageUrl: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpAtk: number;
  baseSpDef: number;
  baseSpeed: number;
  baseTotal: number;
  types: { slot: number; type: { id: number; name: string; color: string; textColor: string } }[];
  abilities: { slot: number; isHidden: boolean; ability: { name: string } }[];
  /** Present on full dex list from `getAllPokemon` for client search by move name. */
  moves?: { move: { name: string } }[];
}

// A mon node in an evolution chain (may carry its own chain links)
export interface EvoMon extends Omit<PokemonListItem, "abilities"> {
  abilities?: PokemonListItem["abilities"];
  evolvesFrom?: EvoEdge[];
  evolvesInto?: EvoEdge[];
}

export interface EvoEdge {
  id: number;
  trigger: string | null;
  notes: string | null;
  fromPokemon: EvoMon;
  toPokemon: EvoMon;
}

export interface PokemonDetail extends PokemonListItem {
  description: string;
  category: string;
  height: number;
  weight: number;
  shinyImageUrl: string | null;
  abilities: {
    slot: number;
    isHidden: boolean;
    ability: { id: number; name: string; description: string };
  }[];
  locations: {
    id: number;
    encounterType: string;
    rarity: string;
    minLevel: number;
    maxLevel: number;
    conditions: string | null;
    location: { id: number; name: string; areaType: string };
  }[];
  evolvesInto: EvoEdge[];
  evolvesFrom: EvoEdge[];
  moves: {
    id: number;
    learnMethod: string;
    learnLevel: number | null;
    tmNumber: number | null;
    move: {
      id: number;
      name: string;
      category: string;
      power: number | null;
      accuracy: number | null;
      pp: number;
      description: string;
      type: { id: number; name: string; color: string; textColor: string };
    };
  }[];
  eggGroups: { eggGroup: { id: number; name: string } }[];
}

export type RarityLevel = "common" | "uncommon" | "rare" | "mythic";
export type LearnMethod = "level_up" | "tm" | "egg" | "tutor";
export type SortKey = "dex" | "name" | "bst" | "hp" | "atk" | "def" | "spatk" | "spdef" | "speed";
