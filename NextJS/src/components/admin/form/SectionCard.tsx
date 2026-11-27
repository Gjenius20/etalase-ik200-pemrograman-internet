"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

/** Kartu seksi form yang bisa dilipat dan otomatis terbuka saat ada error baru. */
export default function SectionCard({
  id,
  number,
  title,
  description,
  errorCount = 0,
  children,
}: {
  id: string;
  number: number;
  title: string;
  description?: string;
  errorCount?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const previousErrors = useRef(errorCount);

  useEffect(() => {
    if (errorCount > previousErrors.current) setOpen(true);
    previousErrors.current = errorCount;
  }, [errorCount]);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-stone-200 bg-white"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`${id}-body`}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-cream/50 sm:p-5"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-extrabold text-white">
          {number}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span id={`${id}-title`} className="text-base font-bold text-ink">
              {title}
            </span>
            {errorCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errorCount} perlu diperbaiki
              </span>
            )}
          </span>
          {description && (
            <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
              {description}
            </span>
          )}
        </span>

        <ChevronDown
          className={`mt-1 h-5 w-5 shrink-0 text-slate-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div id={`${id}-body`} className="border-t border-stone-100 p-4 sm:p-5">
          {children}
        </div>
      )}
    </section>
  );
}
