"use client";

import { cn } from "@/lib/utils";

interface TypeFilterProps {
  types: { id: number; name: string; color: string; textColor: string }[];
  activeTypes: string[];
  onToggle: (typeName: string) => void;
  matchAll: boolean;
  onToggleMatch: () => void;
  /** When false, hides Any/All (e.g. moves have a single type per row). Default true. */
  showMatchToggle?: boolean;
}

const chipStyle = (type: {
  color: string;
  textColor: string;
  isActive: boolean;
  dimInactive: boolean;
}) => ({
  backgroundColor: type.isActive ? type.color : "transparent",
  color: type.isActive ? type.textColor : type.color,
  borderColor: type.color,
  opacity: type.dimInactive ? 0.5 : 1,
});

export function TypeFilter({
  types,
  activeTypes,
  onToggle,
  matchAll,
  onToggleMatch,
  showMatchToggle = true,
}: TypeFilterProps) {
  const dimInactive = activeTypes.length > 0;

  const renderChip = (
    type: { id: number; name: string; color: string; textColor: string },
    layout: "row" | "grid",
  ) => {
    const isActive = activeTypes.includes(type.name);
    return (
      <button
        key={type.id}
        type="button"
        onClick={() => onToggle(type.name)}
        aria-pressed={isActive}
        title={type.name}
        className={cn(
          "inline-flex items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full border text-center font-bold uppercase leading-none tracking-tighter transition-all duration-150",
          layout === "row" &&
            "min-h-7 min-w-0 flex-1 basis-0 px-0.5 py-px text-[9px] sm:min-h-8 sm:px-1 sm:text-[10px]",
          layout === "grid" &&
            "w-full min-w-0 max-w-full px-1 py-px text-[9px] sm:px-1.5 sm:py-0.5 sm:text-[10px]",
        )}
        style={chipStyle({
          color: type.color,
          textColor: type.textColor,
          isActive,
          dimInactive: dimInactive && !isActive,
        })}
      >
        {type.name}
      </button>
    );
  };

  return (
    <div className="min-w-0 space-y-1.5">
      <div role="toolbar" aria-label="Filter by type" className="min-w-0">
        {/* xl+: one row — flex + equal flex-basis (no CSS repeat(var) quirks) */}
        <div className="hidden min-w-0 gap-0.5 xl:flex xl:flex-nowrap">
          {types.map((t) => renderChip(t, "row"))}
        </div>
        {/* Below xl: compact wrapped grid */}
        <div className="grid min-w-0 gap-1 xl:hidden [grid-template-columns:repeat(auto-fill,minmax(min(100%,4.25rem),1fr))]">
          {types.map((t) => renderChip(t, "grid"))}
        </div>
      </div>

      {showMatchToggle && activeTypes.length > 1 && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#8892a4]">
          <span>Match:</span>
          <button
            type="button"
            onClick={onToggleMatch}
            className={`rounded px-1.5 py-px text-[11px] font-medium transition-colors ${
              !matchAll ? "bg-[#e94560] text-white" : "bg-white/10 text-[#8892a4]"
            }`}
          >
            Any
          </button>
          <button
            type="button"
            onClick={onToggleMatch}
            className={`rounded px-1.5 py-px text-[11px] font-medium transition-colors ${
              matchAll ? "bg-[#e94560] text-white" : "bg-white/10 text-[#8892a4]"
            }`}
          >
            All
          </button>
        </div>
      )}
    </div>
  );
}
