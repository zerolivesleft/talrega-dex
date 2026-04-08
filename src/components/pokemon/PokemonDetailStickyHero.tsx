"use client";

import { useEffect, useRef, useState } from "react";
import { cn, padDexNumber } from "@/lib/utils";
import { TypeBadge } from "./TypeBadge";
import { SpriteToggle } from "./SpriteToggle";
import type { PokemonDetail } from "@/lib/types";

const SCROLL_RANGE = 168;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type Props = {
  typeColor: string;
  name: string;
  dexNumber: number;
  imageUrl: string;
  shinyImageUrl: string | null;
  types: PokemonDetail["types"];
  heroSub: React.ReactNode;
  height: number;
  weight: number;
  baseTotal: number;
};

export function PokemonDetailStickyHero({
  typeColor,
  name,
  dexNumber,
  imageUrl,
  shinyImageUrl,
  types,
  heroSub,
  height,
  weight,
  baseTotal,
}: Props) {
  const [isMd, setIsMd] = useState(false);
  const [scrollP, setScrollP] = useState(0);
  const lastPRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsMd(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMd(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isMd) {
      setScrollP(0);
      lastPRef.current = null;
      return;
    }
    let ticking = false;
    const read = () => {
      ticking = false;
      const next = clamp(window.scrollY / SCROLL_RANGE, 0, 1);
      if (
        lastPRef.current !== null &&
        next !== 0 &&
        next !== 1 &&
        Math.abs(next - lastPRef.current) < 0.006
      ) {
        return;
      }
      lastPRef.current = next;
      setScrollP(next);
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(read);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    read();
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [isMd]);

  const p = isMd ? scrollP : 0;
  const padX = 0.5 + (1 - p) * 0.75;
  const padY = 0.5 + (1 - p) * 0.875;
  const titleRem = clamp(2.25 - p * 1.05, 1.125, 2.25);
  const metaOpacity = clamp(1 - p / 0.42, 0, 1);
  const metaMaxH = Math.max(0, (1 - p / 0.38) * 180);

  const sortedTypes = [...types].sort((a, b) => a.slot - b.slot);
  const attachedToNav = p > 0.06;
  const padXInset = Math.max(padX, 1);

  return (
    <div
      className={cn(
        "mb-6 -mx-4 md:-mx-0 md:w-screen md:ml-[calc(50%-50vw)] md:max-w-[100vw]",
        "md:sticky md:top-14 md:z-40",
      )}
    >
      <header
        className={cn(
          "w-full border rounded-none",
          isMd && "transition-[border-color,background-color,box-shadow] duration-200 ease-out",
          attachedToNav
            ? "border-x border-b border-white/12 bg-[#16213e]/90 shadow-[0_12px_40px_rgba(0,0,0,0.45)] md:backdrop-blur-md md:supports-[backdrop-filter]:bg-[#16213e]/78"
            : "border border-white/8",
        )}
        style={{
          backgroundImage:
            p < 0.92 ? `linear-gradient(135deg, ${typeColor}22 0%, #16213e 55%)` : undefined,
        }}
      >
        <div
          className="mx-auto max-w-7xl"
          style={
            isMd
              ? {
                  paddingLeft: `${padXInset}rem`,
                  paddingRight: `${padXInset}rem`,
                  paddingTop: `${padY}rem`,
                  paddingBottom: `${padY}rem`,
                }
              : { padding: "1.375rem 1.25rem" }
          }
        >
          <div
            className={cn(
              "flex",
              isMd && "transition-[flex-direction,gap] duration-200 ease-out",
              p > 0.55
                ? "flex-row items-center gap-3 md:gap-4"
                : "flex-col gap-6 md:flex-row md:items-start md:gap-8",
            )}
          >
            <SpriteToggle
              normalSrc={imageUrl}
              shinySrc={shinyImageUrl}
              alt={name}
              typeColor={typeColor}
              compact={isMd && p > 0.45}
            />

            <div className="min-w-0 flex-1 space-y-3">
              <div
                className={cn(
                  "flex flex-wrap items-start justify-between gap-3",
                  p > 0.55 && "items-center gap-2",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={cn("font-mono text-[#8892a4]", isMd && "transition-[font-size] duration-200")}
                    style={{ fontSize: `${clamp(0.7 + (1 - p) * 0.125, 0.7, 0.875)}rem` }}
                  >
                    #{padDexNumber(dexNumber)}
                  </p>
                  <h1
                    className={cn(
                      "font-display font-black leading-tight text-[#eaeaea]",
                      isMd && "transition-[font-size] duration-200",
                      p > 0.55 && "truncate",
                    )}
                    style={{ fontSize: `${titleRem}rem` }}
                  >
                    {name}
                  </h1>
                </div>
                <div
                  className={cn(
                    "flex shrink-0 flex-wrap gap-2",
                    isMd && "transition-transform duration-200",
                    p > 0.55 && "scale-[0.92] md:scale-95",
                  )}
                >
                  {sortedTypes.map(({ type }) => (
                    <TypeBadge
                      key={type.id}
                      name={type.name}
                      color={type.color}
                      textColor={type.textColor}
                      size={p > 0.55 ? "sm" : "md"}
                    />
                  ))}
                </div>
              </div>

              <div
                className={cn("overflow-hidden", isMd && "transition-[max-height,opacity,margin] duration-200 ease-out")}
                style={
                  isMd
                    ? {
                        maxHeight: `${metaMaxH}px`,
                        opacity: metaOpacity,
                        marginTop: metaMaxH < 8 ? 0 : undefined,
                      }
                    : undefined
                }
                aria-hidden={isMd && metaOpacity < 0.05}
              >
                <div className="flex flex-col gap-3">
                  {heroSub}
                  <div className="flex flex-wrap gap-6">
                    {[
                      { label: "Height", value: `${height.toFixed(1)} m` },
                      { label: "Weight", value: `${weight.toFixed(1)} kg` },
                      { label: "Base Total", value: String(baseTotal) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] uppercase tracking-wide text-[#8892a4]">{label}</p>
                        <p className="font-mono text-sm font-bold text-[#eaeaea]">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
