import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { MovesBrowser } from "@/components/moves/MovesBrowser";
import { getAllMovesIndex } from "@/lib/moves";
import { getAllTypes } from "@/lib/pokemon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moves",
  description: "All moves in the Talrega Pokédex.",
  openGraph: {
    title: "Moves | Talrega Pokédex",
    description: "All moves in the Talrega Pokédex — power, PP, type, and which Pokémon learn each move.",
    type: "website",
    url: "/moves",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moves | Talrega Pokédex",
    description: "All moves in the Talrega Pokédex.",
  },
  alternates: { canonical: "/moves" },
};

export default async function MovesPage() {
  const [moves, types] = await Promise.all([getAllMovesIndex(), getAllTypes()]);

  return (
    <PageContainer className="pb-16">
      <MovesBrowser moves={moves} types={types} />
    </PageContainer>
  );
}
