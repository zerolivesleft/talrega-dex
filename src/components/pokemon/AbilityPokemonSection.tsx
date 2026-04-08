"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { POKEMON_SORT_OPTIONS, sortPokemon } from "@/lib/pokemonSort";
import { PokemonGrid } from "./PokemonGrid";
import { PokemonList } from "./PokemonList";
import type { PokemonListItem, SortKey } from "@/lib/types";

interface AbilityPokemonSectionProps {
  pokemon: PokemonListItem[];
}

export function AbilityPokemonSection({ pokemon }: AbilityPokemonSectionProps) {
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortKey, setSortKey] = useState<SortKey>("dex");

  const sorted = useMemo(() => sortPokemon(pokemon, sortKey), [pokemon, sortKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-lg border border-white/10 bg-[#16213e] px-3 py-2 text-sm text-[#eaeaea] outline-none focus:border-[#e94560]/50 cursor-pointer"
        >
          {POKEMON_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>

        <span className="text-sm text-[#8892a4] hidden sm:block shrink-0">{sorted.length}</span>

        <div className="ml-auto flex rounded-lg border border-white/10 overflow-hidden shrink-0">
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="List view"
            className={`p-2 transition-colors ${view === "list" ? "bg-[#e94560] text-white" : "text-[#8892a4] hover:text-[#eaeaea] hover:bg-white/5"}`}
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Grid view"
            className={`p-2 transition-colors ${view === "grid" ? "bg-[#e94560] text-white" : "text-[#8892a4] hover:text-[#eaeaea] hover:bg-white/5"}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {view === "list" ? (
        <PokemonList pokemon={sorted} sortKey={sortKey} onSort={setSortKey} />
      ) : (
        <PokemonGrid pokemon={sorted} />
      )}
    </div>
  );
}
