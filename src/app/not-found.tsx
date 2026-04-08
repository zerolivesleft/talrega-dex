import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export default function NotFound() {
  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-8xl mb-6 select-none">?</p>
      <div
        className="text-6xl font-display font-black mb-2"
        style={{ color: "#e94560" }}
      >
        404
      </div>
      <h1 className="text-2xl font-bold text-[#eaeaea] mb-2">
        Pokémon Not Found
      </h1>
      <p className="text-[#8892a4] mb-8 max-w-sm">
        This Pokémon doesn&apos;t exist in the Talrega region — or it&apos;s still undiscovered.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-[#e94560] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        Return to Pokédex
      </Link>
    </PageContainer>
  );
}
