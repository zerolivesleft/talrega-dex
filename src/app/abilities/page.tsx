import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AbilitiesBrowser } from "@/components/abilities/AbilitiesBrowser";
import { getAllAbilitiesIndex } from "@/lib/abilities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Abilities",
  description: "All abilities in the Talrega Pokédex.",
};

export default async function AbilitiesPage() {
  const abilities = await getAllAbilitiesIndex();

  return (
    <PageContainer className="pb-16">
      <AbilitiesBrowser abilities={abilities} />
    </PageContainer>
  );
}
