"use client";

import { useState } from "react";
import { ImageOff, Maximize2 } from "lucide-react";

import Lightbox from "@/components/public/Lightbox";
import type { PublicScreenshot } from "@/lib/types";

export default function ScreenshotGallery({
  images,
  appName,
}: {
  images: PublicScreenshot[];
  appName: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [brokenShots, setBrokenShots] = useState<Record<number, boolean>>({});

  if (!images.length) {
    return (
      <p className="mt-2 text-sm text-slate-600">
        Belum ada screenshot yang ditambahkan.
      </p>
    );
  }

  return (
    <>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((shot, index) => {
          const isBroken = Boolean(brokenShots[index]);

          return (
            <button
              key={`${shot.url}-${index}`}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left"
            >
              {isBroken ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-4 text-center text-slate-600">
                  <ImageOff className="h-6 w-6" aria-hidden="true" />
                  <span className="text-xs font-semibold">
                    Gambar {index + 1} gagal dimuat
                  </span>
                </div>
              ) : (
                <img
                  src={shot.url}
                  alt={
                    shot.caption
                      ? `${shot.caption} - ${appName}`
                      : `Screenshot ${index + 1} ${appName}`
                  }
                  loading="lazy"
                  onError={() =>
                    setBrokenShots((previous) => ({
                      ...previous,
                      [index]: true,
                    }))
                  }
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                />
              )}

              {shot.caption && (
                <span className="absolute inset-x-2.5 bottom-2.5 line-clamp-1 rounded-lg bg-slate-950/75 px-2.5 py-1 text-xs font-semibold text-white">
                  {shot.caption}
                </span>
              )}

              <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white">
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                Perbesar
              </span>
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          appName={appName}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
