"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { padDexNumber } from "@/lib/utils";

type Item =
  | { kind: "pokemon"; slug: string; name: string; dexNumber: number }
  | { kind: "move"; slug: string; name: string }
  | { kind: "ability"; slug: string; name: string };

type SearchPayload = {
  pokemon: Extract<Item, { kind: "pokemon" }>[];
  moves: Extract<Item, { kind: "move" }>[];
  abilities: Extract<Item, { kind: "ability" }>[];
};

function hrefFor(item: Item): string {
  switch (item.kind) {
    case "pokemon":
      return `/pokemon/${item.slug}`;
    case "move":
      return `/move/${item.slug}`;
    case "ability":
      return `/ability/${item.slug}`;
  }
}

function indexedItems(data: SearchPayload): Item[] {
  return [...data.pokemon, ...data.moves, ...data.abilities];
}

export function NavbarGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchPayload | null>(null);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json() as Promise<SearchPayload>)
        .then((json) => {
          setData(json);
          setActive(0);
        })
        .catch(() => setData({ pokemon: [], moves: [], abilities: [] }))
        .finally(() => setLoading(false));
    }, 200);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const flat = useMemo(() => (data ? indexedItems(data) : []), [data]);
  const showPanel = open && query.trim().length > 0;

  const go = useCallback(
    (item: Item) => {
      router.push(hrefFor(item));
      setOpen(false);
      setQuery("");
      setData(null);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!showPanel || flat.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[active]!);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  let row = 0;

  return (
    <div
      ref={wrapRef}
      className="relative w-[7.25rem] shrink-0 min-[420px]:w-[9rem] sm:w-[10.5rem] md:w-[11.5rem]"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#8892a4]" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search…"
          title="Search Pokémon, moves, abilities (⌘K)"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          className={`h-9 w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-9 text-sm text-[#eaeaea] placeholder:text-[#8892a4]/90 outline-none transition-colors focus:border-[#e94560]/40 focus:bg-white/[0.07] ${loading ? "pr-9" : "pr-3"}`}
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-[#8892a4]" aria-hidden />
        )}
      </div>

      {showPanel && (
        <div
          className="fixed inset-x-3 top-[calc(3.5rem+0.35rem)] z-[200] max-h-[min(70dvh,24rem)] overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a2e]/98 py-2 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-md supports-[backdrop-filter]:bg-[#1a1a2e]/92 md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-1 md:w-[min(22rem,calc(100vw-2rem))]"
          role="listbox"
        >
          {loading && flat.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-[#8892a4]">Searching…</p>
          )}
          {!loading && flat.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-[#8892a4]">No matches.</p>
          )}
          {data && data.pokemon.length > 0 && (
            <div className="px-2 pb-1">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8892a4]">Pokémon</p>
              <ul className="space-y-0.5">
                {data.pokemon.map((p) => {
                  const idx = row++;
                  return (
                    <li key={`p-${p.slug}`} role="option" aria-selected={idx === active}>
                      <Link
                        href={hrefFor(p)}
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                        }}
                        onMouseEnter={() => setActive(idx)}
                        className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                          idx === active ? "bg-[#e94560]/20 text-[#eaeaea]" : "text-[#a7b3c6] hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate font-medium">{p.name}</span>
                        <span className="shrink-0 font-mono text-xs text-[#8892a4]">#{padDexNumber(p.dexNumber)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {data && data.moves.length > 0 && (
            <div className="px-2 pb-1 pt-1 border-t border-white/6">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8892a4]">Moves</p>
              <ul className="space-y-0.5">
                {data.moves.map((m) => {
                  const idx = row++;
                  return (
                    <li key={`m-${m.slug}`} role="option" aria-selected={idx === active}>
                      <Link
                        href={hrefFor(m)}
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                        }}
                        onMouseEnter={() => setActive(idx)}
                        className={`block truncate rounded-lg px-2 py-1.5 text-sm transition-colors ${
                          idx === active ? "bg-[#e94560]/20 text-[#eaeaea]" : "text-[#a7b3c6] hover:bg-white/5"
                        }`}
                      >
                        {m.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {data && data.abilities.length > 0 && (
            <div className="px-2 pt-1 border-t border-white/6">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8892a4]">Abilities</p>
              <ul className="space-y-0.5">
                {data.abilities.map((a) => {
                  const idx = row++;
                  return (
                    <li key={`a-${a.slug}`} role="option" aria-selected={idx === active}>
                      <Link
                        href={hrefFor(a)}
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                        }}
                        onMouseEnter={() => setActive(idx)}
                        className={`block truncate rounded-lg px-2 py-1.5 text-sm transition-colors ${
                          idx === active ? "bg-[#e94560]/20 text-[#eaeaea]" : "text-[#a7b3c6] hover:bg-white/5"
                        }`}
                      >
                        {a.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
