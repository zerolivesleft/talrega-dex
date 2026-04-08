"use client";

interface TypeBadgeProps {
  name: string;
  color: string;
  textColor?: string;
  size?: "sm" | "md";
}

export function TypeBadge({ name, color, textColor = "#FFFFFF", size = "md" }: TypeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-wide ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
      style={{ backgroundColor: color, color: textColor }}
    >
      {name}
    </span>
  );
}
