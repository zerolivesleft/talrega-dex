"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { pokemonSpriteFrameBackground } from "@/lib/typeGradient";
import { PokemonSprite } from "./PokemonSprite";

interface SpriteToggleProps {
  normalSrc: string;
  shinySrc: string | null;
  alt: string;
  typePrimaryColor: string;
  typeSecondaryColor: string;
  /** Smaller frame for sticky / compact headers */
  compact?: boolean;
}

export function SpriteToggle({
  normalSrc,
  shinySrc,
  alt,
  typePrimaryColor,
  typeSecondaryColor,
  compact = false,
}: SpriteToggleProps) {
  const [shiny, setShiny] = useState(false);
  const src = shiny && shinySrc ? shinySrc : normalSrc;

  return (
    <div className="relative flex shrink-0 justify-center md:justify-start">
      <div
        className={`relative flex flex-col justify-end overflow-hidden rounded-xl transition-[width,height] duration-200 ease-out ${
          compact ? "h-12 w-12 md:h-14 md:w-14" : "h-44 w-44 md:h-56 md:w-56"
        }`}
        style={pokemonSpriteFrameBackground(typePrimaryColor, typeSecondaryColor, shiny)}
      >
        <div className="relative mx-auto h-[90%] w-[90%] shrink-0">
          <PokemonSprite
            src={src}
            alt={alt}
            fill
            pixelArt={!shiny}
            className="object-contain object-bottom drop-shadow-2xl"
            sizes={compact ? "56px" : "(max-width: 768px) 176px, 224px"}
            priority
          />
        </div>
      </div>

      {shinySrc && (
        <button
          type="button"
          onClick={() => setShiny((v) => !v)}
          title={shiny ? "Show normal sprite" : "Show shiny sprite"}
          className={`absolute rounded-lg transition-all duration-200 ${
            compact ? "bottom-0 right-0 p-1" : "bottom-1.5 right-1.5 p-1.5"
          } ${
            shiny
              ? "bg-[#f5a623] text-[#1a1a2e]"
              : "bg-black/30 text-[#8892a4] hover:text-[#f5a623] hover:bg-black/50"
          }`}
        >
          <Sparkles size={compact ? 11 : 14} />
        </button>
      )}
    </div>
  );
}
