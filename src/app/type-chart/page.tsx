import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { TypeChart } from "@/components/types/TypeChart";
import { getTypeChartData } from "@/lib/typeChart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Type Chart",
  description: "Type effectiveness for Talrega — attack type vs defending type.",
  openGraph: {
    title: "Type Chart | Talrega Pokédex",
    description: "Full type matchup chart for Pokémon Odyssey — how each attacking type hits every defending type.",
    type: "website",
    url: "/type-chart",
  },
  twitter: {
    card: "summary_large_image",
    title: "Type Chart | Talrega Pokédex",
    description: "Type effectiveness for Talrega — attack type vs defending type.",
  },
  alternates: { canonical: "/type-chart" },
};

export default async function TypeChartPage() {
  const data = await getTypeChartData();

  return (
    <PageContainer className="pb-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-black text-[#eaeaea] md:text-4xl tracking-tight">
          Type chart
        </h1>
        <p className="mt-2 text-[#8892a4] text-sm">
          How attacking types damage each defending type ({data.types.length} types)
        </p>
      </div>

      <TypeChart data={data} />
    </PageContainer>
  );
}
