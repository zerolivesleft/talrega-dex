"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { TypeFilter } from "@/components/search/TypeFilter";
import { TypeBadge } from "@/components/pokemon/TypeBadge";
import type { MoveIndexItem } from "@/lib/moves";

const LETTER_ORDER = [...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), "#"] as const;

type SortOption = "name" | "power" | "category";
type GroupMode = "letter" | "type";

function firstLetter(name: string): string {
  const c = name.charAt(0).toUpperCase();
  if (c >= "A" && c <= "Z") return c;
  return "#";
}

function sortMoves(items: MoveIndexItem[], sort: SortOption): MoveIndexItem[] {
  const copy = [...items];
  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "power":
      return copy.sort((a, b) => {
        const pa = a.power ?? -1;
        const pb = b.power ?? -1;
        if (pb !== pa) return pb - pa;
        return a.name.localeCompare(b.name);
      });
    case "category":
      return copy.sort(
        (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      );
    default:
      return copy;
  }
}

function groupByLetter(items: MoveIndexItem[], sort: SortOption): Map<string, MoveIndexItem[]> {
  const map = new Map<string, MoveIndexItem[]>();
  for (const m of items) {
    const L = firstLetter(m.name);
    const list = map.get(L) ?? [];
    list.push(m);
    map.set(L, list);
  }
  for (const [L, list] of map) {
    map.set(L, sortMoves(list, sort));
  }
  return map;
}

function groupByType(
  items: MoveIndexItem[],
  sort: SortOption,
  typeNamesOrdered: string[]
): Map<string, MoveIndexItem[]> {
  const map = new Map<string, MoveIndexItem[]>();
  for (const m of items) {
    const t = m.type.name;
    const list = map.get(t) ?? [];
    list.push(m);
    map.set(t, list);
  }
  for (const [t, list] of map) {
    map.set(t, sortMoves(list, sort));
  }
  const ordered = new Map<string, MoveIndexItem[]>();
  for (const name of typeNamesOrdered) {
    const list = map.get(name);
    if (list?.length) ordered.set(name, list);
  }
  for (const [name, list] of map) {
    if (!ordered.has(name)) ordered.set(name, list);
  }
  return ordered;
}

interface MovesBrowserProps {
  moves: MoveIndexItem[];
  types: { id: number; name: string; color: string; textColor: string }[];
}

export function MovesBrowser({ moves, types }: MovesBrowserProps) {
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [groupMode, setGroupMode] = useState<GroupMode>("type");
  const [sort, setSort] = useState<SortOption>("name");

  const typeNamesOrdered = useMemo(() => types.map((t) => t.name), [types]);

  const toggleType = (name: string) => {
    setActiveTypes((prev) => (prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = moves;
    if (q) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.slug.includes(q) ||
          m.type.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }
    if (activeTypes.length === 0) return list;
    return list.filter((m) => activeTypes.includes(m.type.name));
  }, [moves, query, activeTypes]);

  const sortedFlat = useMemo(() => sortMoves(filtered, sort), [filtered, sort]);

  const groupedByLetter = useMemo(
    () => groupByLetter(filtered, sort),
    [filtered, sort]
  );

  const groupedByType = useMemo(
    () => groupByType(filtered, sort, typeNamesOrdered),
    [filtered, sort, typeNamesOrdered]
  );

  const searching = query.trim().length > 0;
  const showLetterSections = !searching && groupMode === "letter";
  const showTypeSections = !searching && groupMode === "type";

  const subtitle = searching
    ? `${sortedFlat.length} of ${moves.length} match`
    : activeTypes.length > 0
      ? `${filtered.length} moves (filtered)`
      : `${moves.length} moves · default view is by type`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-black text-[#eaeaea] md:text-4xl tracking-tight">Moves</h1>
        <p className="mt-2 text-[#8892a4] text-sm">{subtitle}</p>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto w-full">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by name, type, description…" />

        <TypeFilter
          types={types}
          activeTypes={activeTypes}
          onToggle={toggleType}
          matchAll={false}
          onToggleMatch={() => {}}
          showMatchToggle={false}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <label className="flex items-center gap-2 text-sm text-[#8892a4] shrink-0">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-lg border border-white/10 bg-[#16213e] px-3 py-2 text-sm text-[#eaeaea] outline-none focus:border-[#e94560]/50 cursor-pointer min-w-[10rem]"
            >
              <option value="name">Name (A–Z)</option>
              <option value="power">Power (high → low)</option>
              <option value="category">Category, then name</option>
            </select>
          </label>

          <div className="flex items-center gap-2 text-sm text-[#8892a4]">
            <span className="shrink-0">Group</span>
            <div className="flex rounded-lg border border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setGroupMode("type")}
                disabled={searching}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  groupMode === "type"
                    ? "bg-[#e94560] text-white"
                    : "text-[#8892a4] hover:bg-white/5 hover:text-[#eaeaea] disabled:opacity-40"
                }`}
              >
                By type
              </button>
              <button
                type="button"
                onClick={() => setGroupMode("letter")}
                disabled={searching}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  groupMode === "letter"
                    ? "bg-[#e94560] text-white"
                    : "text-[#8892a4] hover:bg-white/5 hover:text-[#eaeaea] disabled:opacity-40"
                }`}
              >
                A–Z
              </button>
            </div>
            {searching && (
              <span className="text-[10px] text-[#8892a4]/80">Grouping uses search results · clear search for sections</span>
            )}
          </div>
        </div>
      </div>

      {sortedFlat.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-[#16213e]/50 px-6 py-16 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-[#eaeaea] font-semibold">No moves match</p>
          <p className="text-[#8892a4] text-sm mt-1">Try different types or search.</p>
        </div>
      ) : searching ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sortedFlat.map((m) => (
            <MoveCard key={m.id} move={m} types={types} />
          ))}
        </ul>
      ) : showLetterSections ? (
        <div className="space-y-8">
          <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
            {LETTER_ORDER.map((letter) => {
              const section = groupedByLetter.get(letter);
              if (!section?.length) return null;
              return (
                <a
                  key={letter}
                  href={`#move-letter-${letter}`}
                  className="min-w-[1.75rem] rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-1 text-center font-mono text-[11px] font-semibold text-[#8892a4] transition-colors hover:border-[#e94560]/40 hover:bg-[#e94560]/10 hover:text-[#eaeaea]"
                >
                  {letter}
                </a>
              );
            })}
          </div>

          <div className="space-y-10">
            {LETTER_ORDER.map((letter) => {
              const section = groupedByLetter.get(letter);
              if (!section?.length) return null;
              return (
                <section key={letter} className="scroll-mt-28" id={`move-letter-${letter}`}>
                  <h2 className="sticky top-14 z-10 -mx-1 mb-3 border-b border-white/10 bg-[#1a1a2e]/95 backdrop-blur-sm px-1 py-2 font-mono text-xs font-bold uppercase tracking-widest text-[#e94560]">
                    {letter}
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {section.map((m) => (
                      <MoveCard key={m.id} move={m} types={types} />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      ) : showTypeSections ? (
        <div className="space-y-8">
          <div className="flex flex-wrap justify-center gap-1.5">
            {[...groupedByType.keys()].map((typeName) => {
              const meta = types.find((t) => t.name === typeName);
              return (
                <a
                  key={typeName}
                  href={`#move-type-${encodeURIComponent(typeName)}`}
                  className="transition-opacity hover:opacity-90"
                >
                  {meta ? (
                    <TypeBadge name={meta.name} color={meta.color} textColor={meta.textColor} size="sm" />
                  ) : (
                    <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-[#eaeaea]">
                      {typeName}
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          <div className="space-y-10">
            {[...groupedByType.entries()].map(([typeName, section]) => (
              <section
                key={typeName}
                className="scroll-mt-28"
                id={`move-type-${encodeURIComponent(typeName)}`}
              >
                <h2 className="sticky top-14 z-10 -mx-1 mb-3 flex items-center gap-2 border-b border-white/10 bg-[#1a1a2e]/95 backdrop-blur-sm px-1 py-2">
                  {(() => {
                    const meta = types.find((t) => t.name === typeName);
                    return meta ? (
                      <TypeBadge name={meta.name} color={meta.color} textColor={meta.textColor} size="sm" />
                    ) : (
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#e94560]">
                        {typeName}
                      </span>
                    );
                  })()}
                  <span className="font-mono text-xs text-[#8892a4]">({section.length})</span>
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {section.map((m) => (
                    <MoveCard key={m.id} move={m} types={types} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MoveCard({
  move: m,
  types,
}: {
  move: MoveIndexItem;
  types: { id: number; name: string; color: string; textColor: string }[];
}) {
  const typeMeta = types.find((t) => t.name === m.type.name);
  return (
    <li>
      <Link
        href={`/move/${m.slug}`}
        className="group flex h-full flex-col rounded-2xl border border-white/8 bg-gradient-to-br from-[#16213e] to-[#12182a] p-4 shadow-sm transition-all hover:border-[#e94560]/35 hover:shadow-[0_8px_32px_rgba(233,69,96,0.08)]"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold text-[#eaeaea] leading-snug group-hover:text-white transition-colors">
            {m.name}
          </h3>
          <span
            title={`${m.pokemonCount} Pokémon`}
            aria-label={`${m.pokemonCount} Pokémon`}
            className="shrink-0 text-[10px] text-[#a7b3c6] tabular-nums"
          >
            {m.pokemonCount}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {typeMeta ? (
            <TypeBadge name={typeMeta.name} color={typeMeta.color} textColor={typeMeta.textColor} size="sm" />
          ) : (
            <TypeBadge name={m.type.name} color={m.type.color} textColor={m.type.textColor} size="sm" />
          )}
          <span className="text-[10px] uppercase tracking-wide text-[#8892a4]">{m.category}</span>
          <span className="text-[10px] font-mono text-[#8892a4]">{m.power != null ? `${m.power} BP` : "— BP"}</span>
        </div>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-[#8892a4] line-clamp-2 group-hover:text-[#a7b3c6] transition-colors">
          {m.description}
        </p>
        <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-[#e94560]/80 opacity-0 transition-opacity group-hover:opacity-100">
          Details →
        </p>
      </Link>
    </li>
  );
}
