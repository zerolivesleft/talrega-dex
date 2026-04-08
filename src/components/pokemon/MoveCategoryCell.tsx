const CATEGORY_COLOR: Record<string, string> = {
  physical: "#F08030",
  special: "#6890F0",
  status: "#78C850",
};

/** Official-style category artwork (Gen IV+ UI). */
const CATEGORY_IMAGE: Record<string, string> = {
  physical: "/images/move-categories/physical.png",
  special: "/images/move-categories/special.png",
  status: "/images/move-categories/status.png",
};

export function MoveCategoryCell({ category, compact }: { category: string; compact?: boolean }) {
  const src = CATEGORY_IMAGE[category];
  const color = CATEGORY_COLOR[category] ?? "#8892a4";

  return (
    <span className="inline-flex items-center gap-1.5 sm:gap-2" title={category}>
      {src ? (
        <img
          src={src}
          alt={category}
          width={20}
          height={20}
          className="h-4 w-4 shrink-0 object-contain sm:h-5 sm:w-5"
          loading="lazy"
          decoding="async"
        />
      ) : null}
      {!compact && (
        <span className="text-xs font-bold capitalize" style={{ color }}>
          {category}
        </span>
      )}
    </span>
  );
}
