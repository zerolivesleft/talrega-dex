import { resolveTmNumber } from "./tmLocations";
import type { PokemonListItem } from "./types";

export type LearnSource = {
  learnMethod: string;
  learnLevel: number | null;
  tmNumber: number | null;
};

export type MoveLearner = {
  pokemon: PokemonListItem;
  sources: LearnSource[];
};

/** Human-readable “Lv 12 · TM03 · Egg” for a move’s learn rows. */
export function formatLearnSources(sources: LearnSource[], moveName: string): string {
  return sources
    .map((s) => {
      if (s.learnMethod === "level_up") {
        const lv = s.learnLevel ?? 1;
        return lv <= 1 ? "Lv 1" : `Lv ${lv}`;
      }
      if (s.learnMethod === "tm") {
        const n = resolveTmNumber(moveName, s.tmNumber);
        return n != null ? `TM${String(n).padStart(2, "0")}` : "TM";
      }
      if (s.learnMethod === "egg") return "Egg";
      if (s.learnMethod === "tutor") return "Tutor";
      return s.learnMethod;
    })
    .join(" · ");
}
