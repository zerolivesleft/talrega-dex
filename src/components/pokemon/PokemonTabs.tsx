"use client";

import { useState } from "react";
import { StatBar } from "./StatBar";
import { AbilityList } from "./AbilityList";
import { MoveTable } from "./MoveTable";
import { LocationTable } from "./LocationTable";
import { EvolutionChain } from "./EvolutionChain";
import type { PokemonDetail } from "@/lib/types";

interface PokemonTabsProps {
  pokemon: PokemonDetail;
}

const TABS = [
  { id: "stats", label: "Stats" },
  { id: "moves", label: "Moves" },
  { id: "locations", label: "Locations" },
  { id: "evolution", label: "Evolution" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PokemonTabs({ pokemon }: PokemonTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("stats");

  const stats = [
    { label: "baseHp", value: pokemon.baseHp },
    { label: "baseAtk", value: pokemon.baseAtk },
    { label: "baseDef", value: pokemon.baseDef },
    { label: "baseSpAtk", value: pokemon.baseSpAtk },
    { label: "baseSpDef", value: pokemon.baseSpDef },
    { label: "baseSpeed", value: pokemon.baseSpeed },
    { label: "baseTotal", value: pokemon.baseTotal },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-white/8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${
              activeTab === tab.id
                ? "text-[#eaeaea]"
                : "text-[#8892a4] hover:text-[#eaeaea]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#e94560]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="space-y-3 max-w-sm">
              {stats.map(({ label, value }) => (
                <StatBar key={label} label={label} value={value} max={label === "baseTotal" ? 720 : 255} />
              ))}
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wide text-[#8892a4] mb-2">Abilities</h3>
              <AbilityList abilities={pokemon.abilities} />
            </div>

            {pokemon.eggGroups.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wide text-[#8892a4] mb-2">Egg Groups</h3>
                <div className="flex gap-2 flex-wrap">
                  {pokemon.eggGroups.map(({ eggGroup }) => (
                    <span
                      key={eggGroup.id}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-[#eaeaea]"
                    >
                      {eggGroup.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "moves" && <MoveTable moves={pokemon.moves} />}

        {activeTab === "locations" && (
          <LocationTable
            locations={pokemon.locations}
            evolveFrom={pokemon.evolvesFrom.map((e) => ({
              slug: e.fromPokemon.slug,
              name: e.fromPokemon.name,
            }))}
          />
        )}

        {activeTab === "evolution" && <EvolutionChain pokemon={pokemon} />}
      </div>
    </div>
  );
}
