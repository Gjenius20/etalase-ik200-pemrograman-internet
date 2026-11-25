import { Layers } from 'lucide-react';

export default function Navbar({ totalProjects }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="flex min-h-[44px] items-center gap-3 rounded-lg pr-2 text-slate-900 transition-colors hover:text-emerald-800"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E3A5F] text-white">
            <Layers className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight sm:text-base">
              Portal Karya IK200
            </span>
            <span className="text-xs font-medium text-slate-600">
              Pendidikan Ilmu Komputer, UPI
            </span>
          </span>
        </a>

        <nav aria-label="Navigasi utama" className="flex items-center gap-1 sm:gap-2">
          <a
            href="#katalog"
            className="inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Katalog ({totalProjects})
          </a>
          <a
            href="#info-portal"
            className="inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Tentang
          </a>
        </nav>
      </div>
    </header>
  );
}
