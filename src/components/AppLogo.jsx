import { useEffect, useState } from 'react';

/**
 * Renders an application logo with an accessible fallback badge when the URL fails to load.
 */
export default function AppLogo({ src, appName, sizeClass = 'h-16 w-16', textClass = 'text-lg' }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = (appName || 'AP')
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('');

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={`Logo ${appName}`}
        className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-[#1E3A5F] font-extrabold text-white select-none ${textClass}`}
      >
        {initials || 'IK'}
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
      className={`${sizeClass} shrink-0 rounded-2xl border border-slate-200 bg-slate-100 object-cover`}
    />
  );
}
