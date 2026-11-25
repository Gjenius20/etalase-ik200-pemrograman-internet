import { Compass } from 'lucide-react';

const INSTITUTION_LOGOS = [
  {
    src: '/images/UPI-Logo-FPMIPA.png',
    alt: 'Logo FPMIPA Universitas Pendidikan Indonesia',
    sizeClass: 'h-6 max-w-[155px] sm:h-7 sm:max-w-[170px]',
  },
  {
    src: '/images/UPI-Logo-CSE.png',
    alt: 'Logo Program Studi Pendidikan Ilmu Komputer UPI',
    sizeClass: 'h-6 max-w-[95px] sm:h-7 sm:max-w-[110px]',
  },
  {
    src: '/images/Logo-Tersier-Diktisaintek-Berdampak-Bulat.png',
    alt: 'Logo Diktisaintek Berdampak',
    sizeClass: 'h-8 w-8 sm:h-9 sm:w-9',
  },
];

export default function HeroSection() {
  return (
    <section
      id="top"
      className="border-b-4 border-[#C5A24D] bg-gradient-to-br from-[#111920] via-[#15241B] to-[#1A3323] text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#E2C675] sm:text-sm">
              Kelas CTRL-B · Pendidikan Ilmu Komputer 2025 · IK200 Pemrograman Internet, FPMIPA UPI
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Portal Karya Media Pembelajaran Informatika, Koding &amp; Kecerdasan Artifisial
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
              Etalase produk pembelajaran berbasis web yang dapat diakses publik untuk membantu belajar Informatika, coding, dan kecerdasan artifisial pada jenjang SD, SMP, SMA, dan SMK.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#katalog"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#C5A24D] px-5 py-3 text-sm font-extrabold text-[#111920] transition-colors hover:bg-[#d4b25e] active:bg-[#b59442]"
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
                Jelajahi Katalog Aplikasi
              </a>
              <a
                href="#info-portal"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Tentang Portal
              </a>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="flex flex-col items-center overflow-hidden rounded-3xl border border-[#C5A24D]/45 bg-[#111920]/80 p-6 text-center shadow-lg">
              <span className="h-24 w-24 overflow-hidden rounded-full border-2 border-[#C5A24D] bg-[#111920] sm:h-28 sm:w-28">
                <img
                  src="/images/Logo_Kelas.jpg"
                  alt="Logo Resmi Kelas CTRL-B Pendidikan Ilmu Komputer UPI"
                  width={112}
                  height={112}
                  fetchPriority="high"
                  className="h-full w-full scale-[1.15] object-cover"
                />
              </span>
              <p className="mt-4 text-xs font-extrabold tracking-widest text-[#E2C675]">
                BUILD TO TEACH. CODE TO INSPIRE.
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                Keluarga Mahasiswa Komputer · CTRL-B
              </p>

              <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2.5 rounded-2xl bg-white px-4 py-3">
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
