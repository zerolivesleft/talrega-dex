"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface PokemonSpriteProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  pixelArt?: boolean;
}

export function PokemonSprite({ src, alt, fill, width, height, className, sizes, priority, pixelArt = true }: PokemonSpriteProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const base = pixelArt ? "pixel-art" : "";
  const spriteClassName = className ? `${base} ${className}`.trim() : base;

  // `useState(src)` only runs on mount — when parent switches normal ↔ shiny, `src` changes and we must sync.
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return fill ? (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={spriteClassName}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setImgSrc("/images/pokemon/placeholder.svg")}
    />
  ) : (
    <Image
      src={imgSrc}
      alt={alt}
      width={width ?? 96}
      height={height ?? 96}
      className={spriteClassName}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setImgSrc("/images/pokemon/placeholder.svg")}
    />
  );
}
