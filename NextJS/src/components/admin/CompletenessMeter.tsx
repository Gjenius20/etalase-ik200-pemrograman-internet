export default function CompletenessMeter({
  percent,
  compact = false,
}: {
  percent: number;
  compact?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const complete = clamped === 100;

  return (
    <div className={compact ? "w-28" : "w-full"}>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs font-bold ${
            complete ? "text-brand-dark" : "text-slate-600"
          }`}
        >
          {clamped}%
        </span>
        {!compact && (
          <span className="text-[11px] font-medium text-slate-600">
            {complete ? "Lengkap" : "Belum lengkap"}
          </span>
        )}
      </div>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Kelengkapan ${clamped}%`}
      >
        <div
          className={`h-full rounded-full ${
            complete ? "bg-brand" : "bg-gold"
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
