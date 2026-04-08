import Link from "next/link";
import { NavbarGlobalSearch } from "@/components/layout/NavbarGlobalSearch";
import { NavbarMobileMenu } from "@/components/layout/NavbarMobileMenu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-14 w-full min-w-0 overflow-visible border-b border-white/8 bg-[#1a1a2e]/95 backdrop-blur-sm">
      <div className="mx-auto grid h-full w-full min-w-0 max-w-7xl grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 px-3 sm:gap-x-4 sm:px-4">
        <Link
          href="/"
          className="flex min-w-0 max-w-[min(100%,70vw)] shrink-0 items-center gap-2 sm:max-w-none sm:gap-3 group"
          aria-label="Talrega Pokédex home"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e94560] ring-2 ring-white/20 transition-all group-hover:ring-[#e94560]/60">
            <div className="h-2.5 w-2.5 rounded-full bg-white ring-1 ring-white/40" />
          </div>
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
            className="mr-1 hidden items-center gap-1 text-xs font-medium text-[#8892a4] md:flex md:gap-1.5 md:text-sm lg:mr-2"
          >
            <Link
              href="/"
              className="rounded-md px-1.5 py-1 transition-colors hover:bg-white/5 hover:text-[#eaeaea] lg:px-2"
            >
              Pokédex
            </Link>
            <span className="select-none text-white/15" aria-hidden>
              ·
            </span>
            <Link
              href="/abilities"
              className="rounded-md px-1.5 py-1 transition-colors hover:bg-white/5 hover:text-[#eaeaea] lg:px-2"
            >
              Abilities
            </Link>
            <span className="select-none text-white/15" aria-hidden>
              ·
            </span>
            <Link
              href="/type-chart"
              className="rounded-md px-1.5 py-1 transition-colors hover:bg-white/5 hover:text-[#eaeaea] lg:px-2"
            >
              Type Chart
            </Link>
            <span className="select-none text-white/15" aria-hidden>
              ·
            </span>
            <Link
              href="/moves"
              className="rounded-md px-1.5 py-1 transition-colors hover:bg-white/5 hover:text-[#eaeaea] lg:px-2"
            >
              Moves
            </Link>
          </nav>

          <NavbarGlobalSearch />
          <NavbarMobileMenu />
        </div>
      </div>
    </header>
  );
}
