"use client";

import { useEffect, useState } from "react";
import { statColor, formatStatName } from "@/lib/utils";

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
}

export function StatBar({ label, value, max = 255 }: StatBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth((value / max) * 100), 100);
    return () => clearTimeout(timer);
  }, [value, max]);

  const color = statColor(value);

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-right text-xs font-medium text-[#8892a4]">
        {formatStatName(label)}
      </span>
      <span className="w-8 shrink-0 font-mono text-sm font-bold text-[#eaeaea]">
        {value}
      </span>
      <div className="flex-1 overflow-hidden rounded-full bg-white/10 h-2.5">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
