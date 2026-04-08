"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { PokemonGrid } from "./PokemonGrid";
import { PokemonList } from "./PokemonList";
import { SearchBar } from "@/components/search/SearchBar";
import { TypeFilter } from "@/components/search/TypeFilter";
import { POKEMON_SORT_OPTIONS, sortPokemon } from "@/lib/pokemonSort";
import type { PokemonListItem, SortKey } from "@/lib/types";

interface DexBrowserProps {
  pokemon: PokemonListItem[];
  types: { id: number; name: string; color: string; textColor: string }[];
}

export function DexBrowser({ pokemon, types }: DexBrowserProps) {
  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [matchAll, setMatchAll] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortKey, setSortKey] = useState<SortKey>("dex");

  const toggleType = (typeName: string) => {
    setActiveTypes((prev) =>
      prev.includes(typeName) ? prev.filter((t) => t !== typeName) : [...prev, typeName]
    );
  };

  const filtered = useMemo(() => {
    const f = pokemon.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(q) ||
        String(p.dexNumber).includes(q) ||
        p.abilities.some((a) => a.ability.name.toLowerCase().includes(q));
      if (activeTypes.length === 0) return matchesSearch;
      const pokemonTypeNames = p.types.map((t) => t.type.name);
      const matchesType = matchAll
        ? activeTypes.every((t) => pokemonTypeNames.includes(t))
        : activeTypes.some((t) => pokemonTypeNames.includes(t));
      return matchesSearch && matchesType;
    });
    return sortPokemon(f, sortKey);
  }, [pokemon, search, activeTypes, matchAll, sortKey]);

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onChange={setSearch} />
        </div>

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

        <span className="text-sm text-[#8892a4] hidden sm:block shrink-0">
          {filtered.length} / {pokemon.length}
        </span>

        <div className="flex rounded-lg border border-white/10 overflow-hidden shrink-0">
          <button
            onClick={() => setView("list")}
            aria-label="List view"
            className={`p-2 transition-colors ${view === "list" ? "bg-[#e94560] text-white" : "text-[#8892a4] hover:text-[#eaeaea] hover:bg-white/5"}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView("grid")}
            aria-label="Grid view"
            className={`p-2 transition-colors ${view === "grid" ? "bg-[#e94560] text-white" : "text-[#8892a4] hover:text-[#eaeaea] hover:bg-white/5"}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      <TypeFilter
        types={types}
        activeTypes={activeTypes}
        onToggle={toggleType}
        matchAll={matchAll}
        onToggleMatch={() => setMatchAll((v) => !v)}
      />

      {view === "list" ? (
        <PokemonList pokemon={filtered} sortKey={sortKey} onSort={setSortKey} />
      ) : (
        <PokemonGrid pokemon={filtered} />
      )}
    </div>
  );
}
