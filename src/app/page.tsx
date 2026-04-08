import { PageContainer } from "@/components/layout/PageContainer";
import { DexBrowser } from "@/components/pokemon/DexBrowser";
import { getAllPokemon, getAllTypes } from "@/lib/pokemon";

export const dynamic = "force-dynamic";

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
