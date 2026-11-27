"use client";

import { useEffect, useState } from "react";

/**
 * Logo aplikasi dengan fallback inisial ketika URL gagal dimuat.
 */
export default function AppLogo({
  src,
  appName,
  sizeClass = "h-16 w-16",
  textClass = "text-lg",
}: {
  src?: string | null;
  appName: string;
  sizeClass?: string;
  textClass?: string;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = (appName || "AP")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={`Logo ${appName}`}
        className={`${sizeClass} flex shrink-0 select-none items-center justify-center rounded-2xl border border-gold/60 bg-brand font-extrabold text-white ${textClass}`}
      >
        {initials || "IK"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Logo ${appName}`}
      width={80}
      height={80}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${sizeClass} shrink-0 rounded-2xl border border-stone-200 bg-stone-100 object-cover`}
    />
  );
}
