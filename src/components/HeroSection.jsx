import { Compass } from 'lucide-react';

export default function HeroSection() {
  return (
    <section id="top" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F] sm:text-sm">
              Tugas Besar Pengganti UAS · IK200 Pemrograman Internet | Program Studi Pendidikan Ilmu Komputer, FPMIPA UPI
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Portal Karya Media Pembelajaran Informatika, Koding &amp; Kecerdasan Artifisial
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Etalase produk pembelajaran berbasis web yang dapat diakses publik untuk membantu belajar Informatika, coding, dan kecerdasan artifisial pada jenjang SD, SMP, SMA, dan SMK.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 border-t border-slate-200 pt-6 lg:col-span-4 lg:items-end lg:border-t-0 lg:pt-0">
            <p className="text-xs font-extrabold tracking-widest text-[#01875F] sm:text-sm">
              BUILD TO TEACH. CODE TO INSPIRE.
            </p>
            <a
              href="#katalog"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#01875F] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#016e4d] active:bg-[#01593f]"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              Jelajahi Katalog Aplikasi
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
