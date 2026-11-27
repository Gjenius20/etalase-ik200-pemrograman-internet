"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hanya digest yang dikirim: pesan error bisa memuat detail internal.
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        event: "client_error",
        digest: error.digest ?? null,
      }),
    );
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center text-ink">
      <h1 className="text-2xl font-extrabold">Halaman tidak dapat dimuat</h1>
      <p className="max-w-md text-sm text-slate-600">
        Terjadi kesalahan. Silakan coba lagi; jika berulang, hubungi admin kelas.
      </p>
      <button
        type="button"
        onClick={reset}
        className="min-h-[44px] rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
      >
        Coba lagi
      </button>
    </main>
  );
}
