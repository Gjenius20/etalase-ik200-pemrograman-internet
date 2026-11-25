export default function Footer() {
  return (
    <footer id="info-portal" className="mt-16 bg-[#1E3A5F] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-white/15 pb-8 md:flex-row md:items-center">
          <div className="space-y-4">
            <div className="inline-flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-2.5">
              <img
                src="/images/UPI-Logo-FPMIPA.png"
                alt="Logo FPMIPA UPI"
                height={36}
                loading="lazy"
                className="h-8 w-auto object-contain sm:h-9"
              />
              <img
                src="/images/UPI-Logo-CSE.png"
                alt="Logo Pendidikan Ilmu Komputer UPI"
                height={36}
                loading="lazy"
                className="h-8 w-auto object-contain sm:h-9"
              />
              <img
                src="/images/Logo-Tersier-Diktisaintek-Berdampak-Bulat.png"
                alt="Logo Diktisaintek Berdampak"
                height={36}
                loading="lazy"
                className="h-8 w-auto object-contain sm:h-9"
              />
              <img
                src="/images/Logo_Kelas.jpg"
                alt="Logo Kelas IK200"
                height={36}
                loading="lazy"
                className="h-8 w-auto rounded-lg object-contain sm:h-9"
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
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
              className="inline-flex min-h-[44px] items-center rounded-xl bg-[#01875F] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#016e4d]"
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
