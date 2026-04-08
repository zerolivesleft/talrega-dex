import { prisma } from "./prisma";
import { abilitySlug, moveSlug } from "./utils";

const TAKE = 8;

export type GlobalSearchPokemon = { kind: "pokemon"; slug: string; name: string; dexNumber: number };
export type GlobalSearchMove = { kind: "move"; slug: string; name: string };
export type GlobalSearchAbility = { kind: "ability"; slug: string; name: string };

export type GlobalSearchResponse = {
  pokemon: GlobalSearchPokemon[];
  moves: GlobalSearchMove[];
  abilities: GlobalSearchAbility[];
};

export async function globalSearch(q: string): Promise<GlobalSearchResponse> {
  const trimmed = q.trim();
  if (!trimmed) {
    return { pokemon: [], moves: [], abilities: [] };
  }

  const dexNum = /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : null;

  const [pokemon, moves, abilities] = await Promise.all([
    prisma.pokemon.findMany({
      where: {
        OR: [
          { name: { contains: trimmed } },
          { slug: { contains: trimmed } },
          ...(dexNum !== null ? [{ dexNumber: dexNum }] : []),
        ],
      },
      orderBy: { dexNumber: "asc" },
      select: { slug: true, name: true, dexNumber: true },
      take: TAKE,
    }),
    prisma.move.findMany({
      where: { name: { contains: trimmed } },
      orderBy: { name: "asc" },
      select: { name: true },
      take: TAKE,
    }),
    prisma.ability.findMany({
      where: { name: { contains: trimmed } },
      orderBy: { name: "asc" },
      select: { name: true },
      take: TAKE,
    }),
  ]);

  return {
    pokemon: pokemon.map((p) => ({ kind: "pokemon" as const, ...p })),
    moves: moves.map((m) => ({ kind: "move" as const, name: m.name, slug: moveSlug(m.name) })),
    abilities: abilities.map((a) => ({ kind: "ability" as const, name: a.name, slug: abilitySlug(a.name) })),
  };
}
