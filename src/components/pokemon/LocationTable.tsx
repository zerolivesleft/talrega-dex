import Link from "next/link";
import { displayLocationNameWithoutDuplicateMethod, rarityColor, encounterIcon } from "@/lib/utils";
import type { PokemonDetail } from "@/lib/types";

interface LocationTableProps {
  locations: PokemonDetail["locations"];
  /** Pre-evolution species (show Evolve … obtainment lines). */
  evolveFrom?: { slug: string; name: string }[];
}

export function LocationTable({ locations, evolveFrom }: LocationTableProps) {
  const hasEvolve = evolveFrom && evolveFrom.length > 0;
  const hasWild = locations.length > 0;

  if (!hasWild && !hasEvolve) {
    return (
      <p className="text-[#8892a4] text-sm italic py-4">
        Not found in the wild — obtain through evolution or trade.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {hasEvolve && (
        <ul className="space-y-1.5 text-sm">
          {evolveFrom!.map((p) => (
            <li key={p.slug} className="text-[#eaeaea]">
              <span className="text-[#8892a4]">Evolve </span>
              <Link href={`/pokemon/${p.slug}`} className="font-semibold text-[#e94560] hover:underline">
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!hasWild ? (
        <p className="text-[#8892a4] text-sm italic">
          No wild encounters listed — see evolution above or other obtainment.
        </p>
      ) : null}
      {hasWild ? (
        <div className="overflow-x-auto rounded-xl border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 text-left text-[#8892a4] text-xs uppercase tracking-wide">
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3">Rarity</th>
            <th className="px-4 py-3">Levels</th>
            <th className="px-4 py-3">Conditions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr
              key={loc.id}
              className="border-b border-white/5 transition-colors hover:bg-white/5 last:border-0"
            >
              <td className="px-4 py-3 font-medium text-[#eaeaea]">
                {displayLocationNameWithoutDuplicateMethod(loc.location.name, loc.encounterType)}
              </td>
              <td className="px-4 py-3 text-[#8892a4] capitalize">
                <span className="mr-1">{encounterIcon(loc.encounterType)}</span>
                {loc.encounterType.replace(/_/g, " ")}
              </td>
              <td className="px-4 py-3">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold capitalize"
                  style={{
                    backgroundColor: `${rarityColor(loc.rarity)}22`,
                    color: rarityColor(loc.rarity),
                    border: `1px solid ${rarityColor(loc.rarity)}44`,
                  }}
                >
                  {loc.rarity}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-[#eaeaea]">
                {loc.minLevel}–{loc.maxLevel}
              </td>
              <td className="px-4 py-3 text-[#8892a4] italic text-xs">
                {loc.conditions ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      ) : null}
    </div>
  );
}
