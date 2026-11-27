import type { Metadata } from "next";

import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <div className="h-1.5 w-full bg-brand" aria-hidden="true" />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-gold bg-ink">
                <img
                  src="/images/Logo_Kelas.jpg"
                  alt="Logo Kelas CTRL-B"
                  width={48}
                  height={48}
                  className="h-full w-full scale-[1.15] object-cover"
                />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-brand">
                  Panel Admin
                </p>
                <h1 className="truncate text-xl font-extrabold tracking-tight text-ink">
                  Portal Karya CTRL-B
                </h1>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-600">
              Masuk untuk mengelola data project, media, dan dokumen yang
              tampil pada etalase publik.
            </p>

            <LoginForm next={next} />
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-slate-600">
            IK200 Pemrograman Internet · Kelas CTRL-B
            <br />
            Pendidikan Ilmu Komputer 2025, FPMIPA UPI
          </p>
        </div>
      </main>
    </div>
  );
}
