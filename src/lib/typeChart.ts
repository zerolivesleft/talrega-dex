import { prisma } from "./prisma";

/** Matches the Talrega reference sheet column/row order (classic + Aether). */
export const TYPE_CHART_ORDER = [
  "Normal",
  "Fighting",
  "Flying",
  "Poison",
  "Ground",
  "Rock",
  "Bug",
  "Ghost",
  "Steel",
  "Fire",
  "Water",
  "Grass",
  "Electric",
  "Psychic",
  "Ice",
  "Dragon",
  "Dark",
  "Aether",
] as const;

export type TypeChartRow = {
  id: number;
  name: string;
  color: string;
  textColor: string;
};

export type TypeChartData = {
  types: TypeChartRow[];
  /** matrix[attackerIndex][defenderIndex] = damage multiplier */
  matrix: number[][];
};

function sortTypesLikeChart(
  types: { id: number; name: string; color: string; textColor: string }[]
): TypeChartRow[] {
  const byLower = new Map(types.map((t) => [t.name.toLowerCase(), t]));
  const ordered: TypeChartRow[] = [];
  const used = new Set<number>();
  for (const name of TYPE_CHART_ORDER) {
    const t = byLower.get(name.toLowerCase());
    if (t) {
      ordered.push(t);
      used.add(t.id);
    }
  }
  for (const t of [...types].sort((a, b) => a.name.localeCompare(b.name))) {
    if (!used.has(t.id)) ordered.push(t);
  }
  return ordered;
}

export async function getTypeChartData(): Promise<TypeChartData> {
  const [allTypes, matchups] = await Promise.all([
    prisma.type.findMany({ orderBy: { name: "asc" } }),
    prisma.typeMatchup.findMany(),
  ]);

  const types = sortTypesLikeChart(allTypes);
  const n = types.length;

  const mult = new Map<string, number>();
  for (const m of matchups) {
    mult.set(`${m.attackingTypeId}-${m.defendingTypeId}`, m.multiplier);
  }

  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(1));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ai = types[i].id;
      const dj = types[j].id;
      const key = `${ai}-${dj}`;
      if (mult.has(key)) {
        matrix[i][j] = mult.get(key)!;
      }
    }
  }

  return { types, matrix };
}
