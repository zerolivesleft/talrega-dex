"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { NavbarGlobalSearch } from "@/components/layout/NavbarGlobalSearch";
import { NavbarMobileMenu } from "@/components/layout/NavbarMobileMenu";
import { isMainNavActive, MAIN_NAV_LINKS } from "@/components/layout/mainNav";
import { usePokemonNavTheme } from "@/components/layout/PokemonNavThemeContext";
import { pokemonStickyHeaderCompactBg } from "@/lib/typeGradient";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname() ?? "";
  const { theme } = usePokemonNavTheme();
  const navStyle = theme ? pokemonStickyHeaderCompactBg(theme.primary, theme.secondary) : undefined;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-14 w-full min-w-0 overflow-visible border-b border-white/8 backdrop-blur-sm",
        !theme && "bg-[#1a1a2e]/95",
      )}
      style={navStyle}
    >
      <div className="mx-auto grid h-full w-full min-w-0 max-w-7xl grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 px-3 sm:gap-x-4 sm:px-4">
        <Link
          href="/"
          className="group flex min-w-0 max-w-[min(100%,70vw)] shrink-0 items-center gap-2 sm:max-w-none sm:gap-3"
          aria-label="Talrega Pokédex home"
        >
          <Image
            src="/images/logo-pokeball.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain transition duration-200 ease-out group-hover:scale-[1.08] group-hover:brightness-110 group-hover:drop-shadow-[0_0_14px_rgba(233,69,96,0.45)] group-active:scale-95"
            priority
          />
          <div className="hidden min-[420px]:block">
            <span className="font-display text-base font-black leading-none tracking-tight text-[#eaeaea] sm:text-lg">
              TALREGA
            </span>
            <span className="block text-[10px] font-bold uppercase leading-none tracking-[0.2em] text-[#e94560]">
              Pokédex
            </span>
          </div>
        </Link>

        <div className="flex min-w-0 justify-end items-center gap-2 sm:gap-3">
          <nav
            aria-label="Main"
            className="mr-1 hidden items-center gap-1 font-medium md:flex md:gap-1.5 md:text-sm lg:mr-2"
          >
            {MAIN_NAV_LINKS.map((item, i) => {
              const active = isMainNavActive(pathname, item.href);
              return (
                <Fragment key={item.href}>
                  {i > 0 ? (
                    <span className="select-none text-xs text-white/15 md:text-sm" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-1.5 py-1 text-xs transition-colors lg:px-2",
                      active
                        ? "bg-white/10 font-semibold text-[#eaeaea]"
                        : "font-medium text-[#8892a4] hover:bg-white/5 hover:text-[#eaeaea]",
                    )}
                  >
                    {item.label}
                  </Link>
                </Fragment>
              );
            })}
          </nav>

          <NavbarGlobalSearch />
          <NavbarMobileMenu />
        </div>
      </div>
    </header>
  );
}
