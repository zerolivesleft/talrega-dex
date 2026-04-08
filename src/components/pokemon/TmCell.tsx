"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TmCellProps {
  tmNumber: number | null;
  moveName: string;
  location: string | null;
  compact?: boolean;
}

export function TmCell({ tmNumber, moveName, location, compact }: TmCellProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cellCls = compact
    ? "px-2 py-2 font-mono text-[10px] sm:px-3 sm:text-xs"
    : "px-4 py-2.5 font-mono text-xs";

  if (tmNumber == null) {
    return (
      <td className={`${cellCls} text-[#8892a4]`} title={`No TM mapping for "${moveName}"`}>
        —
      </td>
    );
  }

  const label = `TM${String(tmNumber).padStart(2, "0")}`;

  if (!location) {
    return (
      <td className={`${cellCls} text-[#8892a4] tabular-nums`}>
        {label}
      </td>
    );
  }

  const dialog = (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-[200] w-[min(calc(100vw-2rem),28rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-[#16213e] p-0 text-[#eaeaea] shadow-2xl [&::backdrop]:bg-black/70"
      aria-labelledby={titleId}
    >
      <div className="border-b border-white/10 px-5 py-4">
        <p id={titleId} className="font-display text-lg font-bold text-[#eaeaea]">
          {label} — {moveName}
        </p>
        <p className="mt-1 text-xs uppercase tracking-wider text-[#8892a4]">Where to obtain</p>
      </div>
      <p className="px-5 py-4 text-sm leading-relaxed text-[#a7b3c6]">{location}</p>
      <div className="flex justify-end border-t border-white/10 px-5 py-3">
        <form method="dialog">
          <button
            type="submit"
            className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d63850]"
          >
            Close
          </button>
        </form>
      </div>
    </dialog>
  );

  return (
    <td className={cellCls}>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="tabular-nums text-[#e94560] hover:text-[#ff6b86] underline decoration-[#e94560]/40 underline-offset-2 transition-colors"
        aria-haspopup="dialog"
      >
        {label}
      </button>
      {mounted ? createPortal(dialog, document.body) : null}
    </td>
  );
}
