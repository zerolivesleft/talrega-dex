"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { abilitySlug, padDexNumber, statColor } from "@/lib/utils";
import { pokemonRowTypeGradientStyle } from "@/lib/typeGradient";
import { TypeBadge } from "./TypeBadge";
import { PokemonSprite } from "./PokemonSprite";
import type { PokemonListItem, SortKey } from "@/lib/types";

/** Clicks on ability links must not navigate to the Pokémon page. */
function isAbilityLinkClick(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const a = el.closest("a[href]");
  if (!a) return false;
  return (a.getAttribute("href") ?? "").startsWith("/ability");
}

const STAT_COLS: { key: SortKey; statKey: keyof PokemonListItem; label: string }[] = [
  { key: "hp",    statKey: "baseHp",    label: "HP"  },
  { key: "atk",   statKey: "baseAtk",   label: "Atk" },
  { key: "def",   statKey: "baseDef",   label: "Def" },
  { key: "spatk", statKey: "baseSpAtk", label: "SpA" },
  { key: "spdef", statKey: "baseSpDef", label: "SpD" },
  { key: "speed", statKey: "baseSpeed", label: "Spd" },
  { key: "bst",   statKey: "baseTotal", label: "BST" },
];

interface PokemonListProps {
  pokemon: PokemonListItem[];
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
}

function SortableHeader({ label, sortKey, activeKey, onSort }: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  onSort: (key: SortKey) => void;
}) {
  const active = activeKey === sortKey;
  return (
    <th className="px-3 py-3 text-right hidden lg:table-cell w-12">
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-0.5 text-xs uppercase tracking-wide transition-colors ${
          active ? "text-[#e94560]" : "text-[#8892a4] hover:text-[#eaeaea]"
        }`}
      >
        {label}
        {active && <ChevronDown size={10} />}
      </button>
    </th>
  );
}

export function PokemonList({ pokemon, sortKey, onSort }: PokemonListProps) {
  const router = useRouter();

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
    <div className="rounded-xl border border-white/8 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/8 text-left text-[#8892a4] text-xs uppercase tracking-wide">
            <th className="px-4 py-3 w-12">
              <button
                onClick={() => onSort("dex")}
                className={`text-xs uppercase tracking-wide transition-colors ${sortKey === "dex" ? "text-[#e94560]" : "hover:text-[#eaeaea]"}`}
              >
                #
              </button>
            </th>
            <th className="px-2 py-3 w-12" />
            <th className="px-4 py-3">
              <button
                onClick={() => onSort("name")}
                className={`inline-flex items-center gap-0.5 text-xs uppercase tracking-wide transition-colors ${sortKey === "name" ? "text-[#e94560]" : "hover:text-[#eaeaea]"}`}
              >
                Name {sortKey === "name" && <ChevronDown size={10} />}
              </button>
            </th>
            <th className="px-4 py-3 hidden md:table-cell text-xs uppercase tracking-wide">Type</th>
            <th className="px-4 py-3 hidden xl:table-cell text-xs uppercase tracking-wide">Abilities</th>
            {STAT_COLS.map((col) => (
              <SortableHeader key={col.key} label={col.label} sortKey={col.key} activeKey={sortKey} onSort={onSort} />
            ))}
          </tr>
        </thead>
        <tbody>
          {pokemon.map((p) => (
            <tr
              key={p.id}
              style={pokemonRowTypeGradientStyle(p.types)}
              className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.06] group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#e94560]/70"
              tabIndex={0}
              role="link"
              aria-label={`Open ${p.name} Pokédex entry`}
              onClick={(e) => {
                if (isAbilityLinkClick(e.target)) return;
                router.push(`/pokemon/${p.slug}`);
              }}
              onAuxClick={(e) => {
                if (e.button !== 1) return;
                if (isAbilityLinkClick(e.target)) return;
                e.preventDefault();
                window.open(`/pokemon/${p.slug}`, "_blank", "noopener,noreferrer");
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                if (isAbilityLinkClick(e.target)) return;
                e.preventDefault();
                router.push(`/pokemon/${p.slug}`);
              }}
            >
              <td className="px-4 py-2">
                <span className="font-mono text-xs text-[#8892a4]">{padDexNumber(p.dexNumber)}</span>
              </td>
              <td className="px-2 py-2">
                <div className="relative w-10 h-10 pointer-events-none">
                  <PokemonSprite src={p.imageUrl} alt="" fill className="object-contain" sizes="40px" />
                </div>
              </td>
              <td className="px-4 py-2">
                <span className="font-semibold text-[#eaeaea] group-hover:text-white transition-colors text-sm">
                  {p.name}
                </span>
              </td>
              <td className="px-4 py-2 hidden md:table-cell">
                <div className="flex gap-1.5 flex-wrap">
                  {p.types.sort((a, b) => a.slot - b.slot).map(({ type }) => (
                    <TypeBadge key={type.id} name={type.name} color={type.color} textColor={type.textColor} size="sm" />
                  ))}
                </div>
              </td>
              <td className="px-4 py-2 hidden xl:table-cell">
                <div className="flex flex-col gap-0.5">
                  {p.abilities.filter((a) => !a.isHidden).map((a) => (
                    <Link
                      key={a.slot}
                      href={`/ability/${abilitySlug(a.ability.name)}`}
                      className="text-xs text-[#eaeaea] hover:text-white hover:underline underline-offset-2 text-left"
                    >
                      {a.ability.name}
                    </Link>
                  ))}
                  {p.abilities.filter((a) => a.isHidden).map((a) => (
                    <Link
                      key={a.slot}
                      href={`/ability/${abilitySlug(a.ability.name)}`}
                      className="text-xs text-[#8892a4] italic hover:text-[#eaeaea] hover:underline underline-offset-2 text-left"
                    >
                      {a.ability.name}
                    </Link>
                  ))}
                </div>
              </td>
              {STAT_COLS.map(({ key, statKey }) => {
                const val = p[statKey] as number;
                const isBst = key === "bst";
                const isActive = sortKey === key;
                return (
                  <td key={key} className="px-3 py-2 text-right hidden lg:table-cell">
                    <span
                      className={`font-mono text-sm font-bold transition-opacity ${isActive ? "opacity-100" : "opacity-70"}`}
                      style={{ color: isBst ? "#8892a4" : statColor(val) }}
                    >
                      {val}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
