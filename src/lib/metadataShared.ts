import type { Metadata } from "next";
import { getSiteUrl } from "./siteUrl";

const defaultTitle = "Talrega Pokédex — Pokémon Odyssey";
const defaultDescription =
  "The complete Pokédex for Pokémon Odyssey — explore every Pokémon in the Talrega region, their moves, locations, and evolutions.";

export function rootMetadataBase(): Pick<Metadata, "metadataBase"> {
  const base = getSiteUrl();
  return base ? { metadataBase: base } : {};
}

export const defaultOpenGraph: NonNullable<Metadata["openGraph"]> = {
  type: "website",
  locale: "en_US",
  siteName: "Talrega Pokédex",
  title: defaultTitle,
  description: defaultDescription,
};

export const defaultTwitter: NonNullable<Metadata["twitter"]> = {
  card: "summary_large_image",
  title: defaultTitle,
  description: defaultDescription,
};

export const siteKeywords = [
  "Pokédex",
  "Talrega",
  "Pokémon Odyssey",
  "ROM hack",
  "Pokémon",
  "moves",
  "abilities",
  "type chart",
];
