import { Database } from "lucide-react";

export default function SetupNotice({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-amber-300 bg-amber-50 text-center ${
        compact ? "px-4 py-8" : "px-6 py-12"
      }`}
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300 bg-white text-amber-700">
        <Database className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-3 text-lg font-bold text-amber-900">
        Database Neon belum dikonfigurasi
      </h2>
      <p className="mx-auto mt-1 max-w-lg text-sm leading-relaxed text-amber-800">
        Isi <code className="rounded bg-white px-1 py-0.5">DATABASE_URL</code>{" "}
        (dan variabel lain) pada{" "}
        <code className="rounded bg-white px-1 py-0.5">.env.local</code>{" "}
        mengikuti{" "}
        <code className="rounded bg-white px-1 py-0.5">.env.example</code>, lalu
        jalankan migrasi dan seed.
      </p>
      <code className="mt-4 inline-block rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900">
        npm run db:migrate &amp;&amp; npm run db:seed
      </code>
    </div>
  );
}
