import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { DexBrowser } from "@/components/pokemon/DexBrowser";
import { defaultOpenGraph, defaultTwitter } from "@/lib/metadataShared";
import { getAllPokemon, getAllTypes } from "@/lib/pokemon";

export const dynamic = "force-dynamic";

const homeTitle = "Talrega Pokédex — Pokémon Odyssey";
const homeDescription =
  "Browse every Pokémon in the Talrega region — filter by type, compare stats, and open moves, abilities, and locations.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  openGraph: {
    ...defaultOpenGraph,
    title: homeTitle,
    description: homeDescription,
    url: "/",
  },
  twitter: {
    ...defaultTwitter,
    title: homeTitle,
    description: homeDescription,
  },
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [pokemon, types] = await Promise.all([getAllPokemon(), getAllTypes()]);

  return (
    <PageContainer>
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-black text-[#eaeaea] md:text-5xl tracking-tight">
          Talrega{" "}
          <span className="text-[#e94560]">Pokédex</span>
        </h1>
        <p className="mt-2 text-[#8892a4] text-sm">
          Pokémon Odyssey · {pokemon.length} Pokémon in the Talrega region
        </p>
      </div>

      <DexBrowser pokemon={pokemon} types={types} />
    </PageContainer>
  );
}
