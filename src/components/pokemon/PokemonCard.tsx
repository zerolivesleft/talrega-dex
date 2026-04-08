import Link from "next/link";
import { padDexNumber, statColor } from "@/lib/utils";
import { TypeBadge } from "./TypeBadge";
import { PokemonSprite } from "./PokemonSprite";
import type { PokemonListItem } from "@/lib/types";

const MINI_STATS = [
  { key: "baseHp" as const, label: "HP" },
  { key: "baseAtk" as const, label: "Atk" },
  { key: "baseDef" as const, label: "Def" },
  { key: "baseSpeed" as const, label: "Spd" },
];

interface PokemonCardProps {
  pokemon: PokemonListItem;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const primaryType = pokemon.types.find((t) => t.slot === 1)?.type;
  const typeColor = primaryType?.color ?? "#A8A878";

  return (
    <Link href={`/pokemon/${pokemon.slug}`} className="group block">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/8 transition-all duration-200 ease-out group-hover:scale-[1.03] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        style={{
          background: `linear-gradient(135deg, ${typeColor}33 0%, #16213e 60%)`,
        }}
      >
        {/* Dex number */}
        <span className="absolute top-2 right-3 font-mono text-xs text-[#8892a4] select-none">
          #{padDexNumber(pokemon.dexNumber)}
        </span>

        {/* Sprite */}
        <div className="flex justify-center pt-5 pb-1">
          <div className="relative w-20 h-20">
            <PokemonSprite
              src={pokemon.imageUrl}
              alt={pokemon.name}
              fill
              className="object-contain drop-shadow-lg"
              sizes="80px"
            />
          </div>
        </div>

        {/* Name */}
        <div className="px-3 pb-1 text-center">
          <p className="font-display text-sm font-bold text-[#eaeaea] leading-tight truncate">
            {pokemon.name}
          </p>
        </div>

        {/* Types */}
        <div className="flex justify-center gap-1 px-2 pb-2 flex-wrap">
          {pokemon.types
            .sort((a, b) => a.slot - b.slot)
            .map(({ type }) => (
              <TypeBadge
                key={type.id}
                name={type.name}
                color={type.color}
                textColor={type.textColor}
                size="sm"
              />
            ))}
        </div>

        {/* Mini stats */}
        <div className="border-t border-white/8 px-3 py-2 grid grid-cols-4 gap-1">
          {MINI_STATS.map(({ key, label }) => {
            const val = pokemon[key];
            return (
              <div key={key} className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] uppercase tracking-wide text-[#8892a4]">{label}</span>
                <span
                  className="font-mono text-[11px] font-bold leading-none"
                  style={{ color: statColor(val) }}
                >
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
