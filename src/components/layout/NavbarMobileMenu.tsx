"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Pokédex" },
  { href: "/abilities", label: "Abilities" },
  { href: "/type-chart", label: "Type Chart" },
  { href: "/moves", label: "Moves" },
] as const;

export function NavbarMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 text-[#8892a4] transition-[border-color,background-color,color,transform] duration-200 hover:border-white/15 hover:bg-white/[0.07] hover:text-[#eaeaea] active:scale-95 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <Menu
            className={cn(
              "size-5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              open ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
            )}
            aria-hidden
          />
          <X
            className={cn(
              "absolute inset-0 m-auto size-5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              open ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0",
            )}
            aria-hidden
          />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* Below navbar (z-50); only dims page content */}
        <Dialog.Overlay
          className={cn(
            "fixed inset-x-0 bottom-0 top-14 z-[40] bg-black/55",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "duration-300",
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed inset-x-0 top-14 z-[48] flex max-h-[min(calc(100dvh-3.5rem),32rem)] flex-col border-b border-x border-white/10 bg-[#1a1a2e] shadow-[0_16px_48px_rgba(0,0,0,0.45)] outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-top-3 data-[state=open]:slide-in-from-top-3",
            "data-[state=open]:duration-300 data-[state=closed]:duration-200",
            "sm:left-auto sm:right-3 sm:top-16 sm:max-h-[min(80vh,28rem)] sm:w-[min(18rem,calc(100vw-1.5rem))] sm:rounded-xl sm:border sm:border-white/10",
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Dialog.Title className="sr-only">Site menu</Dialog.Title>
          <Dialog.Description className="sr-only">
            Site sections: Pokédex, abilities, type chart, and moves.
          </Dialog.Description>
          <nav className="flex flex-col gap-0.5 overflow-y-auto p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3">
            {links.map(({ href, label }, i) => (
              <Dialog.Close asChild key={href}>
                <Link
                  href={href}
                  className="rounded-lg px-4 py-3.5 text-base font-medium text-[#eaeaea] transition-[transform,opacity,background-color] duration-200 animate-in fade-in slide-in-from-left-2 hover:bg-white/5 active:bg-white/10"
                  style={{ animationDelay: `${Math.min(i, 5) * 40}ms`, animationFillMode: "backwards" }}
                >
                  {label}
                </Link>
              </Dialog.Close>
            ))}
          </nav>
          <p className="border-t border-white/8 px-4 py-3 text-center text-[11px] text-[#8892a4]">
            Use the search field for Pokémon, moves, and abilities.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
