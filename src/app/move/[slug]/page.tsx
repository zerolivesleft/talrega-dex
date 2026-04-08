import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMoveBySlug, getAllMoveSlugs } from "@/lib/moves";
import { BackButton } from "@/components/layout/BackButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { MoveCategoryCell } from "@/components/pokemon/MoveCategoryCell";
import { MoveLearnersSection } from "@/components/moves/MoveLearnersSection";
import { TypeBadge } from "@/components/pokemon/TypeBadge";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllMoveSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMoveBySlug(slug);
  if (!data) return {};
  const title = `${data.name} — Move`;
  return {
    title,
    description: data.description,
    openGraph: { title, description: data.description, type: "website" },
    twitter: { card: "summary_large_image", title, description: data.description },
    alternates: { canonical: `/move/${slug}` },
  };
}

export default async function MovePage({ params }: Props) {
  const { slug } = await params;
  const data = await getMoveBySlug(slug);
  if (!data) notFound();

  return (
    <PageContainer className="space-y-6 pb-16">
      <BackButton />

      <div className="rounded-2xl border border-white/8 bg-[#16213e] p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#8892a4] mb-2">Move</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <h1 className="font-display text-3xl font-black text-[#eaeaea] md:text-4xl">{data.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge name={data.type.name} color={data.type.color} textColor={data.type.textColor} size="md" />
            <MoveCategoryCell category={data.category} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-xl">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#8892a4]">Power</p>
            <p className="font-mono text-lg font-bold text-[#eaeaea]">{data.power ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#8892a4]">Accuracy</p>
            <p className="font-mono text-lg font-bold text-[#eaeaea]">{data.accuracy != null ? `${data.accuracy}%` : "—"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#8892a4]">PP</p>
            <p className="font-mono text-lg font-bold text-[#eaeaea]">{data.pp}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#8892a4]">Pokémon</p>
            <p className="font-mono text-lg font-bold text-[#eaeaea]">{data.learners.length}</p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-[#a7b3c6] max-w-3xl">{data.description}</p>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#8892a4] mb-4">Pokémon that learn this move</h2>
        <MoveLearnersSection moveName={data.name} learners={data.learners} />
      </div>
    </PageContainer>
  );
}
