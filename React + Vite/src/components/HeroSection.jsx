import { Compass } from 'lucide-react';

const INSTITUTION_LOGOS = [
  {
    src: '/images/UPI-Logo-FPMIPA.png',
    alt: 'Logo FPMIPA Universitas Pendidikan Indonesia',
    sizeClass: 'h-5 max-w-[130px] sm:h-7 sm:max-w-[170px]',
  },
  {
    src: '/images/UPI-Logo-CSE.png',
    alt: 'Logo Program Studi Pendidikan Ilmu Komputer UPI',
    sizeClass: 'h-5 max-w-[82px] sm:h-7 sm:max-w-[110px]',
  },
  {
    src: '/images/Logo-Tersier-Diktisaintek-Berdampak-Bulat.png',
    alt: 'Logo Diktisaintek Berdampak',
    sizeClass: 'h-7 w-7 sm:h-9 sm:w-9',
  },
];

export default function HeroSection() {
  return (
    <section
      id="top"
      className="border-b-4 border-[#C5A24D] bg-gradient-to-br from-[#111920] via-[#15241B] to-[#1A3323] text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 lg:items-center">
          <div className="min-w-0 lg:col-span-8">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#E2C675] sm:text-sm">
              Kelas CTRL-B · Pendidikan Ilmu Komputer 2025 · IK200 Pemrograman Internet, FPMIPA UPI
            </p>
            <h1 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-tight text-white sm:mt-3 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Portal Karya Media Pembelajaran Informatika, Koding &amp; Kecerdasan Artifisial
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-200 sm:mt-4 sm:text-lg">
              Etalase produk pembelajaran berbasis web yang dapat diakses publik untuk membantu belajar Informatika, coding, dan kecerdasan artifisial pada jenjang SD, SMP, SMA, dan SMK.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <a
                href="#katalog"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#C5A24D] px-5 py-3 text-sm font-extrabold text-[#111920] transition-colors hover:bg-[#d4b25e] active:bg-[#b59442] sm:w-auto"
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
                Jelajahi Katalog Aplikasi
              </a>
              <a
                href="#info-portal"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Tentang Portal
              </a>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-4">
            <div className="flex flex-col items-center overflow-hidden rounded-2xl border border-[#C5A24D]/45 bg-[#111920]/80 p-5 text-center shadow-lg sm:rounded-3xl sm:p-6">
              <span className="h-20 w-20 overflow-hidden rounded-full border-2 border-[#C5A24D] bg-[#111920] sm:h-28 sm:w-28">
                <img
                  src="/images/Logo_Kelas.jpg"
                  alt="Logo Resmi Kelas CTRL-B Pendidikan Ilmu Komputer UPI"
                  width={112}
                  height={112}
                  fetchPriority="high"
                  className="h-full w-full scale-[1.15] object-cover"
                />
              </span>
              <p className="mt-3.5 text-[11px] font-extrabold tracking-widest text-[#E2C675] sm:mt-4 sm:text-xs">
                BUILD TO TEACH. CODE TO INSPIRE.
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-200 sm:text-sm">
                Keluarga Mahasiswa Komputer · CTRL-B
              </p>

              <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-xl bg-white px-3 py-2.5 sm:mt-5 sm:gap-x-4 sm:gap-y-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
                {INSTITUTION_LOGOS.map((logo) => (
                  <img
                    key={logo.src}
                    src={logo.src}
                    alt={logo.alt}
                    height={36}
                    fetchPriority="high"
                    className={`${logo.sizeClass} w-auto object-contain`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
