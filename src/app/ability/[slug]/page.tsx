import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAbilityBySlug, getAllAbilitySlugs } from "@/lib/abilities";
import { BackButton } from "@/components/layout/BackButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { AbilityPokemonSection } from "@/components/pokemon/AbilityPokemonSection";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllAbilitySlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAbilityBySlug(slug);
  if (!data) return {};
  return {
    title: `${data.name} — Ability`,
    description: data.description,
  };
}

export default async function AbilityPage({ params }: Props) {
  const { slug } = await params;
  const data = await getAbilityBySlug(slug);
  if (!data) notFound();

  return (
    <PageContainer className="space-y-6 pb-16">
      <BackButton />

      <div className="rounded-2xl border border-white/8 bg-[#16213e] p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#8892a4] mb-2">Ability</p>
        <h1 className="font-display text-3xl font-black text-[#eaeaea] md:text-4xl">{data.name}</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#a7b3c6] max-w-2xl">{data.description}</p>
        <p className="mt-4 font-mono text-xs text-[#8892a4]">
          {data.pokemon.length} Pokémon {data.pokemon.length === 1 ? "has" : "have"} this ability
        </p>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#8892a4] mb-4">Pokémon with this ability</h2>
        {data.pokemon.length === 0 ? (
          <p className="text-sm text-[#8892a4] italic">No Pokémon found.</p>
        ) : (
          <AbilityPokemonSection pokemon={data.pokemon} />
        )}
      </div>
    </PageContainer>
  );
}
