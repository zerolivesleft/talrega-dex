"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search by name, #, or ability..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892a4]"
        size={16}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-10 py-2.5 text-sm text-[#eaeaea] placeholder-[#8892a4] outline-none transition-colors focus:border-[#e94560]/50 focus:bg-white/8"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8892a4] hover:text-[#eaeaea] transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
