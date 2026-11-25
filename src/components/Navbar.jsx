export default function Navbar({ totalProjects }) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="h-1 w-full bg-[#235334]" aria-hidden="true" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="flex min-h-[44px] min-w-0 items-center gap-2.5 rounded-lg pr-1 text-[#111920] transition-colors hover:text-[#235334] sm:gap-3"
        >
          <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#C5A24D] bg-[#111920] sm:h-10 sm:w-10">
            <img
              src="/images/Logo_Kelas.jpg"
              alt="Logo Kelas CTRL-B"
              width={40}
              height={40}
              fetchPriority="high"
              className="h-full w-full scale-[1.15] object-cover"
            />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-bold tracking-tight sm:text-base">
              Portal Karya CTRL-B
            </span>
            <span className="truncate text-[11px] font-medium text-slate-600 sm:text-xs">
              Pendidikan Ilmu Komputer 2025, UPI
            </span>
          </span>
        </a>

        <nav aria-label="Navigasi utama" className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <a
            href="#katalog"
            className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#EEF5F0] hover:text-[#1A3F27] sm:px-3 sm:text-sm"
          >
            Katalog ({totalProjects})
          </a>
          <a
            href="#info-portal"
            className="hidden min-h-[44px] items-center whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#EEF5F0] hover:text-[#1A3F27] min-[400px]:inline-flex sm:px-3 sm:text-sm"
          >
            Tentang
          </a>
        </nav>
      </div>
    </header>
  );
}
