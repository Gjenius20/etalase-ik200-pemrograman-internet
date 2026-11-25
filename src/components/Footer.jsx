export default function Footer() {
  return (
    <footer id="info-portal" className="mt-16 border-t-4 border-[#C5A24D] bg-[#111920] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-white/15 pb-8 md:flex-row md:items-center">
          <div className="space-y-4">
            <div className="inline-flex max-w-full flex-wrap items-center gap-x-4 gap-y-2.5 rounded-2xl bg-white px-4 py-3">
              <img
                src="/images/UPI-Logo-FPMIPA.png"
                alt="Logo FPMIPA UPI"
                height={32}
                loading="lazy"
                className="h-6 w-auto max-w-[165px] object-contain sm:h-7"
              />
              <img
                src="/images/UPI-Logo-CSE.png"
                alt="Logo Pendidikan Ilmu Komputer UPI"
                height={32}
                loading="lazy"
                className="h-6 w-auto max-w-[105px] object-contain sm:h-7"
              />
              <img
                src="/images/Logo-Tersier-Diktisaintek-Berdampak-Bulat.png"
                alt="Logo Diktisaintek Berdampak"
                height={36}
                loading="lazy"
                className="h-8 w-8 object-contain sm:h-9 sm:w-9"
              />
              <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#C5A24D] bg-[#111920] sm:h-9 sm:w-9">
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
              <p className="text-xs font-bold uppercase tracking-widest text-[#E2C675]">
                BUILD TO TEACH. CODE TO INSPIRE.
              </p>
              <h2 className="mt-1.5 text-lg font-bold text-white sm:text-xl">
                IK200 Pemrograman Internet · Kelas CTRL-B
              </h2>
              <p className="mt-1 text-sm text-slate-200">
                Pendidikan Ilmu Komputer 2025, FPMIPA, Universitas Pendidikan Indonesia
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#katalog"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-white/25 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Kembali ke Katalog
            </a>
            <a
              href="#top"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-[#235334] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1a3f27]"
            >
              Ke Atas
            </a>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-300">
          Portal Katalog Resmi Kelas · Tema: Media Pembelajaran Informatika, Koding &amp; Kecerdasan Artifisial
        </p>
      </div>
    </footer>
  );
}
