"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 text-sm text-[#8892a4] transition-colors hover:text-[#eaeaea]"
      aria-label="Go back"
    >
      <ChevronLeft size={16} aria-hidden />
      Back
    </button>
  );
}
