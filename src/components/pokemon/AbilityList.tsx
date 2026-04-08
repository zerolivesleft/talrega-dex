import Link from "next/link";
import type { PokemonDetail } from "@/lib/types";
import { abilitySlug } from "@/lib/utils";

interface AbilityListProps {
  abilities: PokemonDetail["abilities"];
}

export function AbilityList({ abilities }: AbilityListProps) {
  const sorted = [...abilities].sort((a, b) => a.slot - b.slot);

  return (
    <div className="space-y-2">
      {sorted.map(({ ability, isHidden, slot }) => (
        <Link
          key={slot}
          href={`/ability/${abilitySlug(ability.name)}`}
          className={`block rounded-lg border px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.03] ${
            isHidden
              ? "border-white/8 bg-white/3"
              : "border-[#e94560]/20 bg-[#e94560]/5"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold ${isHidden ? "text-[#8892a4]" : "text-[#eaeaea]"}`}>
              {ability.name}
            </span>
            {isHidden && (
              <span className="text-[10px] uppercase tracking-wide text-[#8892a4] border border-[#8892a4]/30 rounded px-1.5 py-0.5">
                Hidden
              </span>
            )}
          </div>
          <p className="text-xs text-[#8892a4] leading-relaxed">
            {ability.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
