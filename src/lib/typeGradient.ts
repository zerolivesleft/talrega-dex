import type { CSSProperties } from "react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const s = hex.trim();
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(s);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function getPokemonTypePairColors(types: { slot: number; type: { color: string } }[]): {
  primary: string;
  secondary: string;
} {
  const sorted = [...types].sort((a, b) => a.slot - b.slot);
  const primary = sorted[0]?.type.color ?? "#A8A878";
  const secondary = sorted[1]?.type.color ?? primary;
  return { primary, secondary };
}

/** Hero header wash when expanded (both typings). */
export function pokemonHeroHeaderGradient(primary: string, secondary: string): string {
  const rgb1 = hexToRgb(primary);
  const rgb2 = hexToRgb(secondary);
  if (!rgb1 || !rgb2) {
    return `linear-gradient(135deg, ${primary}22 0%, #16213e 55%)`;
  }
  return `linear-gradient(128deg, rgba(${rgb1.r},${rgb1.g},${rgb1.b},0.32) 0%, rgba(${rgb2.r},${rgb2.g},${rgb2.b},0.2) 46%, #121a32 78%)`;
}

/** Panels / cards on Pokémon detail pages. */
export function pokemonTypeThemedCardStyle(primary: string, secondary: string): CSSProperties {
  const rgb1 = hexToRgb(primary);
  const rgb2 = hexToRgb(secondary);
  if (!rgb1 || !rgb2) {
    return {
      backgroundColor: "#16213e",
      borderColor: "rgba(255,255,255,0.08)",
    };
  }
  return {
    backgroundImage: `linear-gradient(168deg, rgba(${rgb1.r},${rgb1.g},${rgb1.b},0.14) 0%, rgba(${rgb2.r},${rgb2.g},${rgb2.b},0.07) 52%, #141c34 100%)`,
    borderColor: `rgba(${rgb1.r},${rgb1.g},${rgb1.b},0.26)`,
  };
}

/** Sprite frame behind normal (non-shiny) art — both typings. */
export function pokemonSpriteFrameBackground(
  primary: string,
  secondary: string,
  shiny: boolean,
): CSSProperties {
  if (shiny) {
    return { backgroundColor: "#f5a62318" };
  }
  const rgb1 = hexToRgb(primary);
  const rgb2 = hexToRgb(secondary);
  if (!rgb1 || !rgb2) {
    return { backgroundColor: `${primary}18` };
  }
  return {
    backgroundImage: `linear-gradient(145deg, rgba(${rgb1.r},${rgb1.g},${rgb1.b},0.26) 0%, rgba(${rgb2.r},${rgb2.g},${rgb2.b},0.14) 100%)`,
  };
}

/** Full-page ambient background for Pokémon detail pages. */
export function pokemonPageBackgroundStyle(primary: string, secondary: string): CSSProperties {
  const rgb1 = hexToRgb(primary);
  const rgb2 = hexToRgb(secondary);
  if (!rgb1 || !rgb2) return {};
  return {
    backgroundImage: [
      `radial-gradient(ellipse 130% 80% at 50% -10%, rgba(${rgb1.r},${rgb1.g},${rgb1.b},0.18) 0%, rgba(${rgb1.r},${rgb1.g},${rgb1.b},0.06) 42%, transparent 78%)`,
      `radial-gradient(ellipse 110% 72% at 85% 10%, rgba(${rgb2.r},${rgb2.g},${rgb2.b},0.12) 0%, rgba(${rgb2.r},${rgb2.g},${rgb2.b},0.035) 38%, transparent 74%)`,
      `radial-gradient(ellipse 110% 72% at 15% 18%, rgba(${rgb1.r},${rgb1.g},${rgb1.b},0.095) 0%, rgba(${rgb1.r},${rgb1.g},${rgb1.b},0.03) 35%, transparent 72%)`,
      `linear-gradient(180deg, rgba(${rgb1.r},${rgb1.g},${rgb1.b},0.055) 0%, rgba(${rgb2.r},${rgb2.g},${rgb2.b},0.04) 34%, rgba(26,26,46,0) 62%, rgba(${rgb2.r},${rgb2.g},${rgb2.b},0.032) 84%, rgba(${rgb1.r},${rgb1.g},${rgb1.b},0.028) 100%)`,
    ].join(", "),
  };
}

/** Compact sticky header background (type-tinted frosted glass). */
export function pokemonStickyHeaderCompactBg(primary: string, secondary: string): CSSProperties {
  const rgb1 = hexToRgb(primary);
  const rgb2 = hexToRgb(secondary);
  if (!rgb1 || !rgb2) return { backgroundColor: "rgba(22,33,62,0.9)" };
  return {
    backgroundImage: `linear-gradient(105deg, rgba(${rgb1.r},${rgb1.g},${rgb1.b},0.18) 0%, rgba(${rgb2.r},${rgb2.g},${rgb2.b},0.10) 40%, rgba(22,33,62,0.92) 70%)`,
  };
}

/** Subtle row background using primary → secondary type colors (matches Talrega dex row hover). */
export function pokemonRowTypeGradientStyle(
  types: { slot: number; type: { color: string } }[],
): CSSProperties {
  const sorted = [...types].sort((a, b) => a.slot - b.slot);
  const primary = sorted[0]?.type.color ?? "#A8A878";
  const secondary = sorted[1]?.type.color ?? primary;
  const rgb1 = hexToRgb(primary);
  const rgb2 = hexToRgb(secondary);
  if (!rgb1 || !rgb2) return {};
  return {
    backgroundImage: `linear-gradient(105deg, rgba(${rgb1.r},${rgb1.g},${rgb1.b},0.2) 0%, rgba(${rgb2.r},${rgb2.g},${rgb2.b},0.12) 42%, rgba(26,26,46,0.97) 88%)`,
  };
}
