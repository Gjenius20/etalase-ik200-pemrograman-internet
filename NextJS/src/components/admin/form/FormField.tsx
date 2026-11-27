import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

/** Bungkus satu field form dengan label, hint, penghitung, dan pesan error. */
export default function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  counter,
  counterOver = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  counter?: string;
  counterOver?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-slate-800">
          {label}
          {required && (
            <span className="ml-1 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {counter && (
          <span
            className={`text-[11px] font-semibold ${
              counterOver ? "text-red-600" : "text-slate-600"
            }`}
          >
            {counter}
          </span>
        )}
      </div>

      {hint && <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{hint}</p>}

      <div className="mt-1.5">{children}</div>

      {error && (
        <p
          role="alert"
          className="mt-1.5 flex items-start gap-1 text-xs font-semibold text-red-700"
        >
          <AlertCircle
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
