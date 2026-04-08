"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import type { AbilityIndexItem } from "@/lib/abilities";

const LETTER_ORDER = [...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), "#"] as const;

function firstLetter(name: string): string {
  const c = name.charAt(0).toUpperCase();
  if (c >= "A" && c <= "Z") return c;
  return "#";
}

function groupByLetter(items: AbilityIndexItem[]): Map<string, AbilityIndexItem[]> {
  const map = new Map<string, AbilityIndexItem[]>();
  for (const a of items) {
    const L = firstLetter(a.name);
    const list = map.get(L) ?? [];
    list.push(a);
    map.set(L, list);
  }
  for (const [, list] of map) {
    list.sort((x, y) => x.name.localeCompare(y.name));
  }
  return map;
}

interface AbilitiesBrowserProps {
  abilities: AbilityIndexItem[];
}

export function AbilitiesBrowser({ abilities }: AbilitiesBrowserProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return abilities;
    return abilities.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.slug.includes(q)
    );
  }, [abilities, query]);

  const grouped = useMemo(() => {
    if (query.trim()) return null;
    return groupByLetter(abilities);
  }, [abilities, query]);

  const showGrouped = grouped !== null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-black text-[#eaeaea] md:text-4xl tracking-tight">
          Abilities
        </h1>
        <p className="mt-2 text-[#8892a4] text-sm">
          {query.trim()
            ? `${filtered.length} of ${abilities.length} match`
            : `${abilities.length} abilities · browse A–Z or search`}
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by name, description…"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-[#16213e]/50 px-6 py-16 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-[#eaeaea] font-semibold">No abilities match</p>
          <p className="text-[#8892a4] text-sm mt-1">Try a shorter or different search.</p>
        </div>
      ) : showGrouped ? (
        <div className="space-y-8">
          <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
            {LETTER_ORDER.map((letter) => {
              const section = grouped!.get(letter);
              if (!section?.length) return null;
              return (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="min-w-[1.75rem] rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-1 text-center font-mono text-[11px] font-semibold text-[#8892a4] transition-colors hover:border-[#e94560]/40 hover:bg-[#e94560]/10 hover:text-[#eaeaea]"
                >
                  {letter}
                </a>
              );
            })}
          </div>

          <div className="space-y-10">
          {LETTER_ORDER.map((letter) => {
            const section = grouped!.get(letter);
            if (!section?.length) return null;
            return (
              <section key={letter} className="scroll-mt-28" id={`letter-${letter}`}>
                <h2 className="sticky top-14 z-10 -mx-1 mb-3 border-b border-white/10 bg-[#1a1a2e]/95 backdrop-blur-sm px-1 py-2 font-mono text-xs font-bold uppercase tracking-widest text-[#e94560]">
                  {letter}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {section.map((a) => (
                    <AbilityCard key={a.id} ability={a} />
                  ))}
                </ul>
              </section>
            );
          })}
          </div>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <AbilityCard key={a.id} ability={a} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AbilityCard({ ability: a }: { ability: AbilityIndexItem }) {
  return (
    <li>
      <Link
        href={`/ability/${a.slug}`}
        className="group flex h-full flex-col rounded-2xl border border-white/8 bg-gradient-to-br from-[#16213e] to-[#12182a] p-4 shadow-sm transition-all hover:border-[#e94560]/35 hover:shadow-[0_8px_32px_rgba(233,69,96,0.08)]"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-bold text-[#eaeaea] leading-snug group-hover:text-white transition-colors">
            {a.name}
          </h3>
          <span
            title={`${a.pokemonCount} Pokémon`}
            aria-label={`${a.pokemonCount} Pokémon`}
            className="shrink-0 rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium tabular-nums text-[#a7b3c6]"
          >
            {a.pokemonCount}
          </span>
        </div>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-[#8892a4] line-clamp-3 group-hover:text-[#a7b3c6] transition-colors">
          {a.description}
        </p>
        <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-[#e94560]/80 opacity-0 transition-opacity group-hover:opacity-100">
          View Pokémon →
        </p>
      </Link>
    </li>
  );
}
