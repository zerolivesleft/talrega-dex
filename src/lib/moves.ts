import { prisma } from "./prisma";
import type { LearnSource, MoveLearner } from "./moveLearn";
import { moveSlug } from "./utils";
import type { PokemonListItem } from "./types";

const typeInclude = {
  include: { type: true },
  orderBy: { slot: "asc" as const },
};

export type { LearnSource, MoveLearner } from "./moveLearn";

export type MoveDetail = {
  id: number;
  name: string;
  description: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  type: { id: number; name: string; color: string; textColor: string };
  learners: MoveLearner[];
};

export type MoveIndexItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  power: number | null;
  type: { name: string; color: string; textColor: string };
  pokemonCount: number;
};

export async function getAllMoveSlugs(): Promise<{ slug: string }[]> {
  const rows = await prisma.move.findMany({ select: { name: true } });
  return rows.map((m) => ({ slug: moveSlug(m.name) }));
}

export async function getAllMovesIndex(): Promise<MoveIndexItem[]> {
  const rows = await prisma.move.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      power: true,
      type: { select: { name: true, color: true, textColor: true } },
      _count: { select: { learnedBy: true } },
    },
    orderBy: { name: "asc" },
  });
  return rows.map((m) => ({
    id: m.id,
    name: m.name,
    slug: moveSlug(m.name),
    description: m.description,
    category: m.category,
    power: m.power,
    type: m.type,
    pokemonCount: m._count.learnedBy,
  }));
}

function sortLearnSources(sources: LearnSource[]): LearnSource[] {
  const methodOrder = (m: string) =>
    ({ level_up: 0, tm: 1, egg: 2, tutor: 3 } as Record<string, number>)[m] ?? 4;
  return [...sources].sort((a, b) => {
    const oa = methodOrder(a.learnMethod);
    const ob = methodOrder(b.learnMethod);
    if (oa !== ob) return oa - ob;
    return (a.learnLevel ?? 0) - (b.learnLevel ?? 0);
  });
}

export async function getMoveBySlug(slug: string): Promise<MoveDetail | null> {
  const rows = await prisma.move.findMany({
    include: { type: true },
  });
  const move = rows.find((m) => moveSlug(m.name) === slug);
  if (!move) return null;

  const pokemonMoves = await prisma.pokemonMove.findMany({
    where: { moveId: move.id },
    include: {
      pokemon: {
        include: {
          types: typeInclude,
          abilities: {
            include: { ability: { select: { name: true } } },
            orderBy: { slot: "asc" },
          },
        },
      },
    },
  });

  const byPokemon = new Map<number, MoveLearner>();
  for (const pm of pokemonMoves) {
    const src: LearnSource = {
      learnMethod: pm.learnMethod,
      learnLevel: pm.learnLevel,
      tmNumber: pm.tmNumber,
    };
    const existing = byPokemon.get(pm.pokemonId);
    if (!existing) {
      byPokemon.set(pm.pokemonId, {
        pokemon: pm.pokemon as unknown as PokemonListItem,
        sources: [src],
      });
    } else {
      existing.sources.push(src);
    }
  }

  const learners = [...byPokemon.values()]
    .map((L) => ({ ...L, sources: sortLearnSources(L.sources) }))
    .sort((a, b) => a.pokemon.dexNumber - b.pokemon.dexNumber);

  return {
    id: move.id,
    name: move.name,
    description: move.description,
    category: move.category,
    power: move.power,
    accuracy: move.accuracy,
    pp: move.pp,
    type: move.type,
    learners,
  };
}
