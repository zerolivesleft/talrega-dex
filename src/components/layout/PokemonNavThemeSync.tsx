"use client";

import { useEffect } from "react";
import { usePokemonNavTheme } from "./PokemonNavThemeContext";

export function PokemonNavThemeSync({ primary, secondary }: { primary: string; secondary: string }) {
  const { setTheme } = usePokemonNavTheme();
  useEffect(() => {
    setTheme({ primary, secondary });
    return () => setTheme(null);
  }, [primary, secondary, setTheme]);
  return null;
}
