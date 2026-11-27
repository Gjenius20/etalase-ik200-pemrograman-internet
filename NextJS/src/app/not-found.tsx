import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <div className="h-1 w-full bg-brand" aria-hidden="true" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/60 bg-ink">
          <SearchX className="h-7 w-7 text-gold-light" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-widest text-brand">
          404
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
          Project yang Anda cari tidak ada, masih berstatus draft, atau sudah
          tidak diterbitkan oleh admin.
        </p>
        <Link
          href="/#katalog"
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke Katalog
        </Link>
      </main>
    </div>
  );
}
