"use client";

interface TypeFilterProps {
  types: { id: number; name: string; color: string; textColor: string }[];
  activeTypes: string[];
  onToggle: (typeName: string) => void;
  matchAll: boolean;
  onToggleMatch: () => void;
  /** When false, hides Any/All (e.g. moves have a single type per row). Default true. */
  showMatchToggle?: boolean;
}

export function TypeFilter({
  types,
  activeTypes,
  onToggle,
  matchAll,
  onToggleMatch,
  showMatchToggle = true,
}: TypeFilterProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {types.map((type) => {
          const isActive = activeTypes.includes(type.name);
          return (
            <button
              key={type.id}
              onClick={() => onToggle(type.name)}
              className="rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition-all duration-150"
              style={{
                backgroundColor: isActive ? type.color : "transparent",
                color: isActive ? type.textColor : type.color,
                borderColor: type.color,
                opacity: activeTypes.length > 0 && !isActive ? 0.5 : 1,
              }}
            >
              {type.name}
            </button>
          );
        })}
      </div>

      {showMatchToggle && activeTypes.length > 1 && (
        <div className="flex items-center gap-2 text-xs text-[#8892a4]">
          <span>Match:</span>
          <button
            onClick={onToggleMatch}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              !matchAll ? "bg-[#e94560] text-white" : "bg-white/10 text-[#8892a4]"
            }`}
          >
            Any
          </button>
          <button
            onClick={onToggleMatch}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
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
