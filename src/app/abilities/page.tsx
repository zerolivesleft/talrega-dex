import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AbilitiesBrowser } from "@/components/abilities/AbilitiesBrowser";
import { getAllAbilitiesIndex } from "@/lib/abilities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Abilities",
  description: "All abilities in the Talrega Pokédex.",
  openGraph: {
    title: "Abilities | Talrega Pokédex",
    description: "All abilities in the Talrega Pokédex — descriptions and which Pokémon have each ability.",
    type: "website",
    url: "/abilities",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abilities | Talrega Pokédex",
    description: "All abilities in the Talrega Pokédex.",
  },
  alternates: { canonical: "/abilities" },
};

export default async function AbilitiesPage() {
  const abilities = await getAllAbilitiesIndex();

  return (
    <PageContainer className="pb-16">
      <AbilitiesBrowser abilities={abilities} />
    </PageContainer>
  );
}
