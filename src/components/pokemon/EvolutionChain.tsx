import Link from "next/link";
import { Gem } from "lucide-react";
import { padDexNumber } from "@/lib/utils";
import { TypeBadge } from "./TypeBadge";
import { PokemonSprite } from "./PokemonSprite";
import type { PokemonDetail, EvoMon } from "@/lib/types";

function PokemonNode({ pokemon, isCurrent }: { pokemon: EvoMon; isCurrent?: boolean }) {
  return (
    <Link
      href={`/pokemon/${pokemon.slug}`}
      className={`group flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors hover:bg-white/5 min-w-[80px] max-w-[110px] ${
        isCurrent ? "border-[#e94560]/40 bg-[#e94560]/5" : "border-white/8"
      }`}
    >
      <div className="relative w-14 h-14">
        <PokemonSprite src={pokemon.imageUrl} alt={pokemon.name} fill className="object-contain drop-shadow-md" sizes="56px" />
      </div>
      <span className="font-mono text-[10px] text-[#8892a4]">#{padDexNumber(pokemon.dexNumber)}</span>
      <span className="text-xs font-bold text-[#eaeaea] text-center leading-tight">{pokemon.name}</span>
      <div className="flex gap-1 flex-wrap justify-center">
        {pokemon.types.sort((a, b) => a.slot - b.slot).map(({ type }) => (
          <TypeBadge key={type.id} name={type.name} color={type.color} textColor={type.textColor} size="sm" />
        ))}
      </div>
    </Link>
  );
}

function CompactPokemonNode({ pokemon, isCurrent }: { pokemon: EvoMon; isCurrent?: boolean }) {
  return (
    <Link
      href={`/pokemon/${pokemon.slug}`}
      className={`group flex w-[120px] flex-col items-center gap-1 rounded-2xl border px-2 py-2 transition-colors hover:bg-white/5 ${
        isCurrent ? "border-[#e94560]/40 bg-[#e94560]/5" : "border-white/8 bg-white/[0.02]"
      }`}
    >
      <div className="relative h-14 w-14">
        <PokemonSprite src={pokemon.imageUrl} alt={pokemon.name} fill className="object-contain" sizes="56px" />
      </div>
      <span className="font-mono text-[10px] text-[#8892a4]">#{padDexNumber(pokemon.dexNumber)}</span>
      <span className="text-xs font-bold text-[#eaeaea] text-center leading-tight">{pokemon.name}</span>
      <div className="flex gap-1 flex-wrap justify-center">
        {pokemon.types.slice(0, 1).map(({ type }) => (
          <TypeBadge key={type.id} name={type.name} color={type.color} textColor={type.textColor} size="sm" />
        ))}
      </div>
    </Link>
  );
}

function Arrow({ trigger }: { trigger: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1 px-1 shrink-0">
      <span className="text-[#8892a4] text-xl leading-none">→</span>
      {trigger && (
        <span className="max-w-[min(11rem,calc(100vw-2rem))] rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-center text-[11px] leading-snug text-[#8892a4] [overflow-wrap:anywhere]">
          {trigger}
        </span>
      )}
    </div>
  );
}

type Segment = { mon: EvoMon; trigger: string | null; isCurrent?: boolean };

function getTriggerMeta(trigger: string | null): { text: string; color: string } {
  const text = trigger ?? "Special evolution";
  const lower = text.toLowerCase();
  if (lower.includes("thunder")) return { text, color: "#f8d030" };
  if (lower.includes("water")) return { text, color: "#6890f0" };
  if (lower.includes("fire")) return { text, color: "#f08030" };
  if (lower.includes("sun")) return { text, color: "#f5a623" };
  if (lower.includes("moon")) return { text, color: "#8571be" };
  if (lower.includes("leaf")) return { text, color: "#78c850" };
  if (lower.includes("dusk")) return { text, color: "#4a4a6a" };
  if (lower.includes("dawn")) return { text, color: "#f5c7cf" };
  if (lower.includes("shiny")) return { text, color: "#ee99ac" };
  if (lower.includes("level")) return { text, color: "#8892a4" };
  return { text, color: "#6f7a8f" };
}

function toCurrentEvoMon(pokemon: PokemonDetail): EvoMon {
  return {
    id: pokemon.id,
    slug: pokemon.slug,
    name: pokemon.name,
    dexNumber: pokemon.dexNumber,
    imageUrl: pokemon.imageUrl,
    baseHp: pokemon.baseHp,
    baseAtk: pokemon.baseAtk,
    baseDef: pokemon.baseDef,
    baseSpAtk: pokemon.baseSpAtk,
    baseSpDef: pokemon.baseSpDef,
    baseSpeed: pokemon.baseSpeed,
    baseTotal: pokemon.baseTotal,
    types: pokemon.types,
  };
}

function buildLinearChain(pokemon: PokemonDetail): Segment[] {
  const segments: Segment[] = [];

  // Walk backwards: evolvesFrom gives us predecessors (oldest ancestor first)
  // Level 2: pokemon.evolvesFrom[0].fromPokemon.evolvesFrom[0].fromPokemon
  // Level 1: pokemon.evolvesFrom[0].fromPokemon
  for (const evo of pokemon.evolvesFrom) {
    const parent = evo.fromPokemon;
    // Does parent have its own ancestor?
    if (parent.evolvesFrom && parent.evolvesFrom.length > 0) {
      const grandparent = parent.evolvesFrom[0].fromPokemon;
      segments.push({ mon: grandparent, trigger: parent.evolvesFrom[0].trigger });
    }
    segments.push({ mon: parent, trigger: evo.trigger });
  }

  // Current pokémon
  segments.push({
    mon: {
      id: pokemon.id,
      slug: pokemon.slug,
      name: pokemon.name,
      dexNumber: pokemon.dexNumber,
      imageUrl: pokemon.imageUrl,
      types: pokemon.types,
      baseHp: pokemon.baseHp,
      baseAtk: pokemon.baseAtk,
      baseDef: pokemon.baseDef,
      baseSpAtk: pokemon.baseSpAtk,
      baseSpDef: pokemon.baseSpDef,
      baseSpeed: pokemon.baseSpeed,
      baseTotal: pokemon.baseTotal,
    },
    trigger: pokemon.evolvesInto[0]?.trigger ?? null,
    isCurrent: true,
  });

  // Walk forwards: evolvesInto gives us successors
  for (const evo of pokemon.evolvesInto) {
    const child = evo.toPokemon;
    segments.push({ mon: child, trigger: child.evolvesInto?.[0]?.trigger ?? null });
    // Does child have its own successor?
    if (child.evolvesInto && child.evolvesInto.length > 0) {
      segments.push({ mon: child.evolvesInto[0].toPokemon, trigger: null });
    }
  }

  return segments;
}

export function EvolutionChain({ pokemon }: { pokemon: PokemonDetail }) {
  const hasEvolutions = pokemon.evolvesInto.length > 0 || pokemon.evolvesFrom.length > 0;

  if (!hasEvolutions) {
    return <p className="text-[#8892a4] text-sm italic py-4">{pokemon.name} does not evolve.</p>;
  }

  const isBranching = pokemon.evolvesInto.length > 1;
  const branchSourceFromParent =
    !isBranching &&
    pokemon.evolvesFrom.length > 0 &&
    (pokemon.evolvesFrom[0].fromPokemon.evolvesInto?.length ?? 0) > 1
      ? pokemon.evolvesFrom[0].fromPokemon
      : null;

  if (!isBranching && !branchSourceFromParent) {
    const segments = buildLinearChain(pokemon);
    const notes = pokemon.evolvesInto.filter((e) => e.notes);

    return (
      <div className="w-full overflow-x-auto">
        <div className="flex justify-center py-2">
          <div className="flex min-w-fit items-center gap-0">
            {segments.map((seg, i) => (
              <div key={seg.mon.slug} className="flex items-center gap-0">
                <PokemonNode pokemon={seg.mon} isCurrent={seg.isCurrent} />
                {i < segments.length - 1 && <Arrow trigger={seg.trigger} />}
              </div>
            ))}
          </div>
        </div>
        {notes.length > 0 && (
          <div className="mt-2 space-y-1">
            {notes.map((evo) => (
              <p key={evo.id} className="text-xs text-[#8892a4] italic">* {evo.notes}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  const branchSource = branchSourceFromParent ?? toCurrentEvoMon(pokemon);
  const branchEdges = branchSourceFromParent
    ? branchSourceFromParent.evolvesInto ?? []
    : pokemon.evolvesInto;

  // Branching evolutions: render all options without horizontal scrolling.
  return (
    <div className="space-y-4">
      {pokemon.evolvesFrom.length > 0 && !branchSourceFromParent && (
        <div>
          <p className="text-xs text-[#8892a4] uppercase tracking-wide mb-2">Evolves from</p>
          <div className="flex flex-wrap gap-3 items-center">
            {pokemon.evolvesFrom.map((evo) => (
              <div key={evo.id} className="flex items-center gap-0">
                <PokemonNode pokemon={evo.fromPokemon} />
                <Arrow trigger={evo.trigger} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-[#8892a4] uppercase tracking-wide mb-2">Branches into</p>
        <div className="rounded-xl border border-white/8 bg-[#0f3460]/20 p-3 md:p-4">
          <div className="flex flex-col items-center">
            <CompactPokemonNode pokemon={branchSource} isCurrent={branchSource.slug === pokemon.slug} />
            <div className="mt-2 h-5 w-px bg-white/20" />
            <div className="h-px w-full max-w-5xl bg-white/15" />
          </div>

          <div className="mt-3 flex flex-wrap items-start justify-center gap-3 md:gap-4">
              {branchEdges.map((evo) => (
                <div key={evo.id} className="flex w-[120px] flex-col items-center gap-1.5">
                <div className="h-3 w-px bg-white/20" />
                {(() => {
                  const meta = getTriggerMeta(evo.trigger);
                  return (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[#a7b3c6] text-center leading-tight">
                      <span
                        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${meta.color}33`, color: meta.color }}
                      >
                        <Gem size={10} />
                      </span>
                      <span>{meta.text}</span>
                    </span>
                  );
                })()}
                <CompactPokemonNode pokemon={evo.toPokemon} isCurrent={evo.toPokemon.slug === pokemon.slug} />
                {evo.notes && <p className="text-[10px] text-[#8892a4] italic text-center">* {evo.notes}</p>}
              </div>
              ))}
          </div>
          {branchEdges.some((e) => e.notes) && (
            <p className="mt-3 text-[10px] text-[#8892a4]">* Some branches have special conditions.</p>
          )}
        </div>
      </div>
      {pokemon.evolvesFrom.some((e) => e.notes) && (
        <div className="space-y-1">
          {pokemon.evolvesFrom
            .filter((e) => e.notes)
            .map((e) => (
              <p key={e.id} className="text-xs text-[#8892a4] italic">
                * {e.notes}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
