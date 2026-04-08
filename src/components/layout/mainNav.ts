/** Primary site nav — shared by desktop navbar and mobile menu. */
export const MAIN_NAV_LINKS = [
  { href: "/", label: "Pokédex" },
  { href: "/abilities", label: "Abilities" },
  { href: "/type-chart", label: "Type Chart" },
  { href: "/moves", label: "Moves" },
] as const;

export function isMainNavActive(pathname: string, itemHref: string): boolean {
  if (itemHref === "/") {
    return pathname === "/" || pathname.startsWith("/pokemon");
  }
  if (itemHref === "/abilities") {
    return pathname === "/abilities" || pathname.startsWith("/ability/");
  }
  if (itemHref === "/moves") {
    return pathname === "/moves" || pathname.startsWith("/move/");
  }
  if (itemHref === "/type-chart") {
    return pathname === "/type-chart";
  }
  return false;
}
