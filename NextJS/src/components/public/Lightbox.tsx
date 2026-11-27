"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";

import type { PublicScreenshot } from "@/lib/types";

export default function Lightbox({
  images,
  currentIndex,
  appName,
  onClose,
  onNavigate,
}: {
  images: PublicScreenshot[];
  currentIndex: number;
  appName: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>(
    {},
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      } else if (event.key === "ArrowLeft") {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      } else if (event.key === "ArrowRight") {
        onNavigate((currentIndex + 1) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!images.length) return null;

  const current = images[currentIndex];
  const isBroken = Boolean(failedIndices[currentIndex]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pratinjau screenshot ${appName}`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-5xl flex-col items-center gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between gap-3 text-white">
          <p className="min-w-0 text-sm font-semibold">
            <span className="block truncate">
              {appName} - Screenshot {currentIndex + 1} dari {images.length}
            </span>
            {current.caption && (
              <span className="mt-0.5 block truncate text-xs font-normal text-slate-300">
                {current.caption}
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pratinjau screenshot"
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-slate-900">
          {isBroken ? (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 p-8 text-center text-slate-300">
              <ImageOff className="h-10 w-10 text-slate-400" aria-hidden="true" />
              <p className="text-sm font-semibold">Screenshot gagal dimuat</p>
              <p className="text-xs text-slate-400">
                Periksa kembali tautan gambar pada data proyek.
              </p>
            </div>
          ) : (
            <img
              src={current.url}
              alt={
                current.caption
                  ? `${current.caption} - ${appName}`
                  : `Screenshot ${currentIndex + 1} aplikasi ${appName}`
              }
              onError={() =>
                setFailedIndices((previous) => ({
                  ...previous,
                  [currentIndex]: true,
                }))
              }
              className="aspect-video max-h-[75vh] w-full object-contain"
            />
          )}

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  onNavigate((currentIndex - 1 + images.length) % images.length)
                }
                aria-label="Screenshot sebelumnya"
                className="absolute left-3 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/75 text-white transition-colors hover:bg-slate-950"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate((currentIndex + 1) % images.length)}
                aria-label="Screenshot berikutnya"
                className="absolute right-3 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/75 text-white transition-colors hover:bg-slate-950"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
