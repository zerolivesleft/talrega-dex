import Link from "next/link";
import { TypeBadge } from "./TypeBadge";
import { MoveCategoryCell } from "./MoveCategoryCell";
import { TmCell } from "./TmCell";
import { getTmLocation, resolveTmNumber } from "@/lib/tmLocations";
import { moveSlug } from "@/lib/utils";
import type { PokemonDetail } from "@/lib/types";

interface MoveTableProps {
  moves: PokemonDetail["moves"];
}

const SECTIONS: { method: string; label: string }[] = [
  { method: "level_up", label: "Level Up" },
  { method: "tm",       label: "TM / HM" },
  { method: "egg",      label: "Egg Moves" },
  { method: "tutor",    label: "Tutor" },
];

function MoveRows({ moves, method }: { moves: MoveTableProps["moves"]; method: string }) {
  const filtered = moves.filter((m) => m.learnMethod === method);
  if (filtered.length === 0) return null;

  const sorted =
    method === "level_up"
      ? [...filtered].sort((a, b) => (a.learnLevel ?? 0) - (b.learnLevel ?? 0))
      : method === "tm"
      ? [...filtered].sort((a, b) => {
          const na = resolveTmNumber(a.move.name, a.tmNumber) ?? 999;
          const nb = resolveTmNumber(b.move.name, b.tmNumber) ?? 999;
          return na - nb;
        })
      : filtered;

  const hasLevelCol = method === "level_up";
  const hasTmCol = method === "tm";

  return (
    <div className="overflow-x-auto rounded-xl border border-white/8 -mx-1 sm:mx-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 text-left text-[#8892a4] text-[10px] uppercase tracking-wide sm:text-xs">
            {hasLevelCol && <th className="px-2 py-2 w-10 sm:px-3 sm:w-14">Lv</th>}
            {hasTmCol && <th className="px-2 py-2 w-12 sm:px-3 sm:w-14">TM</th>}
            <th className="px-2 py-2 sm:px-3">Move</th>
            <th className="px-2 py-2 sm:px-3">Type</th>
            <th className="hidden min-[480px]:table-cell px-2 py-2 sm:px-3">Cat.</th>
            <th className="px-2 py-2 text-right sm:px-3">Pwr</th>
            <th className="px-2 py-2 text-right sm:px-3">Acc</th>
            <th className="hidden min-[480px]:table-cell px-2 py-2 text-right sm:px-3">PP</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((pm) => (
            <tr key={pm.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
              {hasLevelCol && (
                <td className="px-2 py-2 font-mono text-[#f5a623] font-bold text-[10px] sm:px-3 sm:text-xs">
                  {pm.learnLevel === 1 ? "—" : pm.learnLevel}
                </td>
              )}
              {hasTmCol && (
                <TmCell
                  tmNumber={resolveTmNumber(pm.move.name, pm.tmNumber)}
                  moveName={pm.move.name}
                  location={getTmLocation(pm.move.name)}
                  compact
                />
              )}
              <td className="px-2 py-2 font-medium sm:px-3">
                <Link
                  href={`/move/${moveSlug(pm.move.name)}`}
                  className="text-[#eaeaea] hover:text-white underline decoration-white/20 underline-offset-2 transition-colors text-xs sm:text-sm"
                >
                  {pm.move.name}
                </Link>
              </td>
              <td className="px-2 py-2 sm:px-3">
                <TypeBadge name={pm.move.type.name} color={pm.move.type.color} textColor={pm.move.type.textColor} size="sm" />
              </td>
              <td className="hidden min-[480px]:table-cell px-2 py-2 sm:px-3">
                <MoveCategoryCell category={pm.move.category} compact />
              </td>
              <td className="px-2 py-2 text-right font-mono text-xs text-[#eaeaea] sm:text-sm">{pm.move.power ?? "—"}</td>
              <td className="px-2 py-2 text-right font-mono text-xs text-[#eaeaea] sm:text-sm">{pm.move.accuracy ? `${pm.move.accuracy}%` : "—"}</td>
              <td className="hidden min-[480px]:table-cell px-2 py-2 text-right font-mono text-xs text-[#eaeaea] sm:text-sm">{pm.move.pp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MoveTable({ moves }: MoveTableProps) {
  return (
    <div className="space-y-6">
      {SECTIONS.map(({ method, label }) => {
        const count = moves.filter((m) => m.learnMethod === method).length;
        if (count === 0) return null;
        return (
          <div key={method}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8892a4] mb-3 flex items-center gap-2">
              {label}
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] normal-case tracking-normal font-normal text-[#8892a4]">
                {count}
              </span>
            </h3>
            <MoveRows moves={moves} method={method} />
          </div>
        );
      })}
    </div>
  );
}
