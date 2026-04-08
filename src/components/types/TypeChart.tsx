import { TypeBadge } from "@/components/pokemon/TypeBadge";
import type { TypeChartData } from "@/lib/typeChart";

function formatMultiplier(m: number): string {
  if (m === 0) return "0×";
  if (Math.abs(m - 0.5) < 0.001) return "½×";
  if (Math.abs(m - 2) < 0.001) return "2×";
  if (Math.abs(m - 1) < 0.001) return "—";
  return `${m}×`;
}

function cellClass(mult: number): string {
  if (mult === 0) return "bg-zinc-900/90 text-zinc-400 font-semibold";
  if (Math.abs(mult - 0.5) < 0.001) return "bg-orange-950/70 text-orange-100 font-semibold";
  if (Math.abs(mult - 2) < 0.001) return "bg-emerald-950/70 text-emerald-100 font-semibold";
  return "bg-white/[0.02] text-[#5c6575]";
}

interface TypeChartProps {
  data: TypeChartData;
}

export function TypeChart({ data }: TypeChartProps) {
  const { types, matrix } = data;

  return (
    <div className="space-y-4">
      <div className="max-h-[min(75vh,880px)] overflow-auto rounded-xl border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <table className="w-max min-w-full border-collapse text-center text-[11px] sm:text-xs">
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 top-0 z-30 min-w-[8.5rem] border-b border-r border-white/10 bg-[#1a1a2e] px-2 py-2.5 text-left align-bottom shadow-[2px_0_8px_rgba(0,0,0,0.35)] sm:min-w-[9.5rem]"
              >
                <span className="sr-only">
                  Type chart axes: the types along the top are defending types; the types down the left are attacking
                  move types.
                </span>
                <div className="flex flex-col gap-2.5 pr-0.5 text-left leading-tight">
                  <div>
                    <p className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[#8892a4]">
                      Across →
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-[#eaeaea] sm:text-xs">Defending type</p>
                  </div>
                  <div className="border-t border-white/10 pt-2.5">
                    <p className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[#8892a4]">
                      Down ↓
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-[#eaeaea] sm:text-xs">Move type (attack)</p>
                  </div>
                </div>
              </th>
              {types.map((t) => (
                <th
                  key={t.id}
                  scope="col"
                  className="sticky top-0 z-20 min-w-[3.25rem] border-b border-white/10 bg-[#1a1a2e] px-0.5 py-1.5 sm:min-w-[4rem] sm:px-1"
                >
                  <div className="flex justify-center">
                    <TypeBadge name={t.name} color={t.color} textColor={t.textColor} size="sm" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {types.map((rowType, i) => (
              <tr key={rowType.id} className="border-b border-white/5 last:border-0">
                <th
                  scope="row"
                  className="sticky left-0 z-10 min-w-[5.5rem] border-r border-white/10 bg-[#1a1a2e] px-1 py-1 text-left shadow-[2px_0_8px_rgba(0,0,0,0.35)] sm:min-w-[7rem] sm:px-2"
                >
                  <TypeBadge name={rowType.name} color={rowType.color} textColor={rowType.textColor} size="sm" />
                </th>
                {matrix[i].map((mult, j) => (
                  <td
                    key={`${rowType.id}-${types[j].id}`}
                    className={`border-l border-white/5 px-0.5 py-1.5 tabular-nums sm:px-1 ${cellClass(mult)}`}
                    title={`${rowType.name} → ${types[j].name}: ${formatMultiplier(mult)}`}
                  >
                    {formatMultiplier(mult)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#8892a4]">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-6 rounded bg-emerald-950/70 ring-1 ring-white/10" />
          Super effective (2×)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-6 rounded bg-white/[0.02] ring-1 ring-white/10" />
          Neutral (1×)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-6 rounded bg-orange-950/70 ring-1 ring-white/10" />
          Not very effective (½×)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-6 rounded bg-zinc-900/90 ring-1 ring-white/10" />
          No effect (0×)
        </span>
      </div>

      <p className="text-sm leading-relaxed text-[#8892a4] max-w-2xl">
        Read down the left for the move&apos;s type, across the top for what you&apos;re hitting. Dual-type defenders:
        multiply both cells (e.g. 2× and ½× → 1×).
      </p>
    </div>
  );
}
