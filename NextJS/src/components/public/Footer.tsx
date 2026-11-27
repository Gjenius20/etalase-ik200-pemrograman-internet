import Link from "next/link";

export default function Footer() {
  return (
    <footer
      id="info-portal"
      className="mt-10 border-t-4 border-gold bg-ink text-white sm:mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-white/15 pb-7 sm:pb-8 md:flex-row md:items-center">
          <div className="min-w-0 space-y-4">
            <div className="inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-white px-3.5 py-2.5 sm:gap-x-4 sm:gap-y-2.5 sm:px-4 sm:py-3">
              <img
                src="/images/UPI-Logo-FPMIPA.png"
                alt="Logo FPMIPA UPI"
                height={32}
                loading="lazy"
                className="h-5 w-auto max-w-[135px] object-contain sm:h-7 sm:max-w-[165px]"
              />
              <img
                src="/images/UPI-Logo-CSE.png"
                alt="Logo Pendidikan Ilmu Komputer UPI"
                height={32}
                loading="lazy"
                className="h-5 w-auto max-w-[85px] object-contain sm:h-7 sm:max-w-[105px]"
              />
              <img
                src="/images/Logo-Tersier-Diktisaintek-Berdampak-Bulat.png"
                alt="Logo Diktisaintek Berdampak"
                height={36}
                loading="lazy"
                className="h-7 w-7 object-contain sm:h-9 sm:w-9"
              />
              <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-gold bg-ink sm:h-9 sm:w-9">
                <img
                  src="/images/Logo_Kelas.jpg"
                  alt="Logo Kelas CTRL-B"
                  width={36}
                  height={36}
                  loading="lazy"
                  className="h-full w-full scale-[1.15] object-cover"
                />
              </span>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gold-light">
                BUILD TO TEACH. CODE TO INSPIRE.
              </p>
              <h2 className="mt-1.5 text-lg font-bold text-white sm:text-xl">
                IK200 Pemrograman Internet · Kelas CTRL-B
              </h2>
              <p className="mt-1 text-sm text-slate-200">
                Pendidikan Ilmu Komputer 2025, FPMIPA, Universitas Pendidikan
                Indonesia
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/#katalog"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-white/25 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Kembali ke Katalog
            </Link>
            <a
              href="#top"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
            >
              Ke Atas
            </a>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-300">
          Portal Katalog Resmi Kelas · Tema: Media Pembelajaran Informatika,
          Koding &amp; Kecerdasan Artifisial
        </p>
      </div>
    </footer>
  );
}
