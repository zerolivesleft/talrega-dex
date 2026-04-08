import { notFound } from "next/navigation";
import { PokemonNavThemeSync } from "@/components/layout/PokemonNavThemeSync";
import { getPokemonTypePairColors } from "@/lib/typeGradient";
import { getPokemonTypesForSlug } from "@/lib/pokemon";

export default async function PokemonSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const types = await getPokemonTypesForSlug(slug);
  if (!types || types.length === 0) notFound();
  const { primary, secondary } = getPokemonTypePairColors(types);

  return (
    <>
      <PokemonNavThemeSync primary={primary} secondary={secondary} />
      {children}
    </>
  );
}
