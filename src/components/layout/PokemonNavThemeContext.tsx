"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type PokemonNavTheme = { primary: string; secondary: string } | null;

type Ctx = {
  theme: PokemonNavTheme;
  setTheme: (t: PokemonNavTheme) => void;
};

const PokemonNavThemeContext = createContext<Ctx | null>(null);

export function PokemonNavThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<PokemonNavTheme>(null);
  const setTheme = useCallback((t: PokemonNavTheme) => {
    setThemeState(t);
  }, []);
  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <PokemonNavThemeContext.Provider value={value}>{children}</PokemonNavThemeContext.Provider>;
}

export function usePokemonNavTheme(): Ctx {
  const ctx = useContext(PokemonNavThemeContext);
  if (!ctx) {
    return { theme: null, setTheme: () => {} };
  }
  return ctx;
}
