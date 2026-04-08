import { PokemonCard } from "./PokemonCard";
import type { PokemonListItem } from "@/lib/types";

interface PokemonGridProps {
  pokemon: PokemonListItem[];
  // kept for legacy usage but filtering is done upstream in DexBrowser
  searchQuery?: string;
  activeTypes?: string[];
  matchAll?: boolean;
}

export function PokemonGrid({ pokemon }: PokemonGridProps) {
  if (pokemon.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-[#eaeaea] font-bold text-lg">No Pokémon found</p>
        <p className="text-[#8892a4] text-sm mt-1">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {pokemon.map((p) => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}
    </div>
  );
}
