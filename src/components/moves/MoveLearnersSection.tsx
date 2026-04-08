"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { PokemonCard } from "@/components/pokemon/PokemonCard";
import { PokemonSprite } from "@/components/pokemon/PokemonSprite";
import { TypeBadge } from "@/components/pokemon/TypeBadge";
import { formatLearnSources, type MoveLearner } from "@/lib/moveLearn";
import { POKEMON_SORT_OPTIONS, sortPokemon } from "@/lib/pokemonSort";
import { padDexNumber } from "@/lib/utils";
import type { SortKey } from "@/lib/types";

interface MoveLearnersSectionProps {
  moveName: string;
  learners: MoveLearner[];
}

export function MoveLearnersSection({ moveName, learners }: MoveLearnersSectionProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortKey, setSortKey] = useState<SortKey>("dex");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return learners;
    return learners.filter((L) => L.pokemon.name.toLowerCase().includes(q) || String(L.pokemon.dexNumber).includes(q));
  }, [learners, query]);

  const sorted = useMemo(() => {
    const order = sortPokemon(
      filtered.map((l) => l.pokemon),
      sortKey
    );
    const byId = new Map(filtered.map((l) => [l.pokemon.id, l]));
    return order.map((p) => byId.get(p.id)!).filter(Boolean);
  }, [filtered, sortKey]);

  if (learners.length === 0) {
    return <p className="text-sm text-[#8892a4] italic">No Pokémon learn this move in the dex data.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchBar value={query} onChange={setQuery} placeholder="Search Pokémon by name or #" />
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
        <span className="text-sm text-[#8892a4] shrink-0">
          {sorted.length} / {learners.length}
        </span>
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

      {sorted.length === 0 ? (
        <p className="text-sm text-[#8892a4]">No matches.</p>
      ) : view === "list" ? (
        <MoveLearnerTable learners={sorted} moveName={moveName} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {sorted.map((L) => (
            <div key={L.pokemon.id} className="flex flex-col gap-1.5">
              <PokemonCard pokemon={L.pokemon} />
              <p className="px-1 text-center text-[10px] leading-snug text-[#8892a4]">
                {formatLearnSources(L.sources, moveName)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MoveLearnerTable({ learners, moveName }: { learners: MoveLearner[]; moveName: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 text-left text-[#8892a4] text-xs uppercase tracking-wide">
            <th className="px-4 py-2.5 w-14">#</th>
            <th className="px-4 py-2.5 w-12" />
            <th className="px-4 py-2.5">Pokémon</th>
            <th className="px-4 py-2.5 hidden md:table-cell">Type</th>
            <th className="px-4 py-2.5">Learned by</th>
          </tr>
        </thead>
        <tbody>
          {learners.map((L) => (
            <tr
              key={L.pokemon.id}
              className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/5"
            >
              <td className="px-4 py-2.5 font-mono text-xs text-[#8892a4]">{padDexNumber(L.pokemon.dexNumber)}</td>
              <td className="px-2 py-2">
                <div className="relative h-10 w-10">
                  <PokemonSprite src={L.pokemon.imageUrl} alt="" fill className="object-contain" sizes="40px" />
                </div>
              </td>
              <td className="px-4 py-2.5">
                <Link href={`/pokemon/${L.pokemon.slug}`} className="font-semibold text-[#eaeaea] hover:text-white transition-colors">
                  {L.pokemon.name}
                </Link>
              </td>
              <td className="px-4 py-2.5 hidden md:table-cell">
                <div className="flex flex-wrap gap-1.5">
                  {L.pokemon.types
                    .sort((a, b) => a.slot - b.slot)
                    .map(({ type }) => (
                      <TypeBadge key={type.id} name={type.name} color={type.color} textColor={type.textColor} size="sm" />
                    ))}
                </div>
              </td>
              <td className="px-4 py-2.5 text-xs text-[#a7b3c6]">{formatLearnSources(L.sources, moveName)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
