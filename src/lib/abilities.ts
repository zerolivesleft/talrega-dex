import { prisma } from "./prisma";
import { abilitySlug } from "./utils";
import type { PokemonListItem } from "./types";

const typeInclude = {
  include: { type: true },
  orderBy: { slot: "asc" as const },
};

export async function getAllAbilitySlugs(): Promise<{ slug: string }[]> {
  const rows = await prisma.ability.findMany({ select: { name: true } });
  return rows.map((a) => ({ slug: abilitySlug(a.name) }));
}

export type AbilityIndexItem = {
  id: number;
  name: string;
  description: string;
  slug: string;
  pokemonCount: number;
};

export async function getAllAbilitiesIndex(): Promise<AbilityIndexItem[]> {
  const rows = await prisma.ability.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { pokemon: true } },
    },
    orderBy: { name: "asc" },
  });
  return rows.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    slug: abilitySlug(a.name),
    pokemonCount: a._count.pokemon,
  }));
}

export type AbilityDetail = {
  id: number;
  name: string;
  description: string;
  pokemon: PokemonListItem[];
};

export async function getAbilityBySlug(slug: string): Promise<AbilityDetail | null> {
  const abilities = await prisma.ability.findMany({
    select: { id: true, name: true, description: true },
  });
  const ability = abilities.find((a) => abilitySlug(a.name) === slug);
  if (!ability) return null;

  const pokemon = await prisma.pokemon.findMany({
    where: { abilities: { some: { abilityId: ability.id } } },
    orderBy: { dexNumber: "asc" },
    include: {
      types: typeInclude,
      abilities: {
        include: { ability: { select: { name: true } } },
        orderBy: { slot: "asc" },
      },
    },
  });

  return {
    ...ability,
    pokemon: pokemon as unknown as PokemonListItem[],
  };
}
