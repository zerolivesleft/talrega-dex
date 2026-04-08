import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPokemonBySlug, getAllSlugs, getAdjacentPokemon } from "@/lib/pokemon";
import { getPokemonHeroSubtext, isPlaceholderDexDescription } from "@/lib/pokemonTagline";
import { padDexNumber } from "@/lib/utils";
import { StatBar } from "@/components/pokemon/StatBar";
import { AbilityList } from "@/components/pokemon/AbilityList";
import { MoveTable } from "@/components/pokemon/MoveTable";
import { LocationTable } from "@/components/pokemon/LocationTable";
import { EvolutionChain } from "@/components/pokemon/EvolutionChain";
import { PokemonDetailStickyHero } from "@/components/pokemon/PokemonDetailStickyHero";
import { PokemonSprite } from "@/components/pokemon/PokemonSprite";
import { PageContainer } from "@/components/layout/PageContainer";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pokemon = await getPokemonBySlug(slug);
  if (!pokemon) return {};
  const blurb =
    isPlaceholderDexDescription(pokemon.description) ?
      `${pokemon.name} (#${pokemon.dexNumber}) in the Talrega Pokédex — stats, moves, locations, and evolution.`
    : pokemon.description;
  return { title: pokemon.name, description: blurb };
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-[#8892a4] mb-4 pb-2 border-b border-white/8">
      {children}
    </h2>
  );
}

export default async function PokemonPage({ params }: Props) {
  const { slug } = await params;
  const pokemon = await getPokemonBySlug(slug);
  if (!pokemon) notFound();

  const { prev, next } = await getAdjacentPokemon(pokemon.dexNumber);

  const primaryType = pokemon.types.find((t) => t.slot === 1)?.type;
  const typeColor = primaryType?.color ?? "#A8A878";

  const heroSub = getPokemonHeroSubtext(pokemon);

  const stats = [
    { label: "baseHp", value: pokemon.baseHp },
    { label: "baseAtk", value: pokemon.baseAtk },
    { label: "baseDef", value: pokemon.baseDef },
    { label: "baseSpAtk", value: pokemon.baseSpAtk },
    { label: "baseSpDef", value: pokemon.baseSpDef },
    { label: "baseSpeed", value: pokemon.baseSpeed },
    { label: "baseTotal", value: pokemon.baseTotal },
  ];

  return (
    <PageContainer className="space-y-6 pb-16">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[#8892a4] transition-colors hover:text-[#eaeaea]"
      >
        <ChevronLeft size={16} />
        Back to Pokédex
      </Link>

      <PokemonDetailStickyHero
        typeColor={typeColor}
        name={pokemon.name}
        dexNumber={pokemon.dexNumber}
        imageUrl={pokemon.imageUrl}
        shinyImageUrl={pokemon.shinyImageUrl}
        types={pokemon.types}
        heroSub={
          heroSub?.kind === "description" ? (
            <p className="max-w-2xl text-sm leading-relaxed text-[#a7b3c6]">{heroSub.text}</p>
          ) : heroSub?.kind === "category" ? (
            <p className="text-sm italic text-[#8892a4]">{heroSub.text}</p>
          ) : null
        }
        height={pokemon.height}
        weight={pokemon.weight}
        baseTotal={pokemon.baseTotal}
      />

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Base Stats */}
        <div className="rounded-2xl border border-white/8 bg-[#16213e] p-6">
          <SectionHeading>Base Stats</SectionHeading>
          <div className="space-y-3">
            {stats.map(({ label, value }) => (
              <StatBar key={label} label={label} value={value} max={label === "baseTotal" ? 720 : 255} />
            ))}
          </div>
        </div>

        {/* Abilities */}
        <div className="rounded-2xl border border-white/8 bg-[#16213e] p-6">
          <SectionHeading>Abilities</SectionHeading>
          <AbilityList abilities={pokemon.abilities} />
          {pokemon.eggGroups.length > 0 && (
            <div className="mt-5">
              <SectionHeading>Egg Groups</SectionHeading>
              <div className="flex gap-2 flex-wrap">
                {pokemon.eggGroups.map(({ eggGroup }) => (
                  <span key={eggGroup.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-[#eaeaea]">
                    {eggGroup.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Evolution */}
      <div className="rounded-2xl border border-white/8 bg-[#16213e] p-6">
        <SectionHeading>Evolution</SectionHeading>
        <EvolutionChain pokemon={pokemon} />
      </div>

      {/* Locations */}
      <div className="rounded-2xl border border-white/8 bg-[#16213e] p-6">
        <SectionHeading>Locations</SectionHeading>
        <LocationTable
          locations={pokemon.locations}
          evolveFrom={pokemon.evolvesFrom.map((e) => ({
            slug: e.fromPokemon.slug,
            name: e.fromPokemon.name,
          }))}
        />
      </div>

      {/* Moves */}
      <div className="rounded-2xl border border-white/8 bg-[#16213e] p-6">
        <SectionHeading>Moves</SectionHeading>
        <MoveTable moves={pokemon.moves} />
      </div>

      {/* Prev / next by dex */}
      <nav
        className="grid grid-cols-2 gap-3 rounded-2xl border border-white/8 bg-[#16213e] p-4"
        aria-label="Previous and next Pokémon"
      >
        {prev ? (
          <Link
            href={`/pokemon/${prev.slug}`}
            className="group flex min-w-0 items-center gap-2 overflow-hidden rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.04] sm:gap-3 sm:px-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#8892a4] transition-colors group-hover:text-[#eaeaea] sm:h-9 sm:w-9">
              <ChevronLeft size={18} />
            </span>
            <div className="relative hidden h-10 w-10 shrink-0 rounded-lg bg-black/20 p-0.5 min-[480px]:block sm:h-12 sm:w-12 sm:p-1">
              <PokemonSprite
                src={prev.imageUrl}
                alt={prev.name}
                fill
                className="object-contain p-0.5"
                sizes="48px"
              />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[9px] uppercase tracking-widest text-[#8892a4] sm:text-[10px]">Previous</p>
              <p className="truncate font-display text-xs font-bold text-[#eaeaea] sm:text-sm">{prev.name}</p>
              <p className="font-mono text-[10px] text-[#8892a4] sm:text-xs">#{padDexNumber(prev.dexNumber)}</p>
            </div>
          </Link>
        ) : (
          <div aria-hidden />
        )}
        {next ? (
          <Link
            href={`/pokemon/${next.slug}`}
            className="group flex min-w-0 items-center justify-end gap-2 overflow-hidden rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3 text-right transition-colors hover:border-white/15 hover:bg-white/[0.04] sm:gap-3 sm:px-4"
          >
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-widest text-[#8892a4] sm:text-[10px]">Next</p>
              <p className="truncate font-display text-xs font-bold text-[#eaeaea] sm:text-sm">{next.name}</p>
              <p className="font-mono text-[10px] text-[#8892a4] sm:text-xs">#{padDexNumber(next.dexNumber)}</p>
            </div>
            <div className="relative hidden h-10 w-10 shrink-0 rounded-lg bg-black/20 p-0.5 min-[480px]:block sm:h-12 sm:w-12 sm:p-1">
              <PokemonSprite
                src={next.imageUrl}
                alt={next.name}
                fill
                className="object-contain p-0.5"
                sizes="48px"
              />
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#8892a4] transition-colors group-hover:text-[#eaeaea] sm:h-9 sm:w-9">
              <ChevronRight size={18} />
            </span>
          </Link>
        ) : (
          <div aria-hidden />
        )}
      </nav>
    </PageContainer>
  );
}
