import { prisma } from "./prisma";
import type { PokemonListItem, PokemonDetail } from "./types";

const typeInclude = {
  include: { type: true },
  orderBy: { slot: "asc" as const },
};

// One level of evolution chain node (types only)
const evoMonInclude = {
  include: { types: typeInclude },
};

// Two levels deep so viewing any stage shows the full chain
const evolvesFromInclude = {
  include: {
    fromPokemon: {
      include: {
        types: typeInclude,
        evolvesInto: {
          include: { toPokemon: evoMonInclude },
        },
        evolvesFrom: {
          include: { fromPokemon: evoMonInclude },
        },
      },
    },
  },
};

const evolvesIntoInclude = {
  include: {
    toPokemon: {
      include: {
        types: typeInclude,
        evolvesInto: {
          include: { toPokemon: evoMonInclude },
        },
      },
    },
  },
};

export async function getAllPokemon(): Promise<PokemonListItem[]> {
  const pokemon = await prisma.pokemon.findMany({
    orderBy: { dexNumber: "asc" },
    include: {
      types: typeInclude,
      abilities: {
        include: { ability: { select: { name: true } } },
        orderBy: { slot: "asc" },
      },
      moves: {
        select: { move: { select: { name: true } } },
      },
    },
  });
  return pokemon as unknown as PokemonListItem[];
}

export async function getPokemonBySlug(slug: string): Promise<PokemonDetail | null> {
  const pokemon = await prisma.pokemon.findUnique({
    where: { slug },
    include: {
      types: typeInclude,
      abilities: {
        include: { ability: true },
        orderBy: { slot: "asc" },
      },
      locations: {
        include: { location: true },
        orderBy: { rarity: "asc" },
      },
      evolvesInto: evolvesIntoInclude,
      evolvesFrom: evolvesFromInclude,
      moves: {
        include: { move: { include: { type: true } } },
        orderBy: [{ learnMethod: "asc" }, { learnLevel: "asc" }],
      },
      eggGroups: { include: { eggGroup: true } },
    },
  });
  return pokemon as unknown as PokemonDetail | null;
}

/** Lightweight lookup for nav theming on Pokémon routes. */
export async function getPokemonTypesForSlug(
  slug: string,
): Promise<{ slot: number; type: { color: string } }[] | null> {
  const row = await prisma.pokemon.findUnique({
    where: { slug },
    select: {
      types: {
        include: { type: { select: { color: true } } },
        orderBy: { slot: "asc" },
      },
    },
  });
  return row?.types ?? null;
}

export async function searchPokemon(
  q: string,
  typeFilter?: string[]
): Promise<PokemonListItem[]> {
  const pokemon = await prisma.pokemon.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q } },
                { slug: { contains: q } },
                { abilities: { some: { ability: { name: { contains: q } } } } },
                { moves: { some: { move: { name: { contains: q } } } } },
              ],
            }
          : {},
        typeFilter && typeFilter.length > 0
          ? { types: { some: { type: { name: { in: typeFilter } } } } }
          : {},
      ],
    },
    orderBy: { dexNumber: "asc" },
    include: { types: typeInclude },
    take: 20,
  });
  return pokemon as unknown as PokemonListItem[];
}

export async function getAllTypes() {
  return prisma.type.findMany({ orderBy: { name: "asc" } });
}

export async function getAllSlugs(): Promise<string[]> {
  const pokemon = await prisma.pokemon.findMany({ select: { slug: true } });
  return pokemon.map((p) => p.slug);
}

export type PokemonNavNeighbor = {
  slug: string;
  name: string;
  dexNumber: number;
  imageUrl: string;
};

/** Previous / next by regional dex order (no wrap). */
export async function getAdjacentPokemon(
  dexNumber: number
): Promise<{ prev: PokemonNavNeighbor | null; next: PokemonNavNeighbor | null }> {
  const [prev, next] = await Promise.all([
    prisma.pokemon.findFirst({
      where: { dexNumber: { lt: dexNumber } },
      orderBy: { dexNumber: "desc" },
      select: { slug: true, name: true, dexNumber: true, imageUrl: true },
    }),
    prisma.pokemon.findFirst({
      where: { dexNumber: { gt: dexNumber } },
      orderBy: { dexNumber: "asc" },
      select: { slug: true, name: true, dexNumber: true, imageUrl: true },
    }),
  ]);
  return { prev, next };
}
