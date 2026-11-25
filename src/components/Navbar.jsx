export default function Navbar({ totalProjects }) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="h-1 w-full bg-[#235334]" aria-hidden="true" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="flex min-h-[44px] items-center gap-3 rounded-lg pr-2 text-[#111920] transition-colors hover:text-[#235334]"
        >
          <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#C5A24D] bg-[#111920]">
            <img
              src="/images/Logo_Kelas.jpg"
              alt="Logo Kelas CTRL-B"
              width={40}
              height={40}
              fetchPriority="high"
              className="h-full w-full scale-[1.15] object-cover"
            />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight sm:text-base">
              Portal Karya CTRL-B
            </span>
            <span className="text-xs font-medium text-slate-600">
              Pendidikan Ilmu Komputer 2025, UPI
            </span>
          </span>
        </a>

        <nav aria-label="Navigasi utama" className="flex items-center gap-1 sm:gap-2">
          <a
            href="#katalog"
            className="inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#EEF5F0] hover:text-[#1A3F27]"
          >
            Katalog ({totalProjects})
          </a>
          <a
            href="#info-portal"
            className="inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#EEF5F0] hover:text-[#1A3F27]"
          >
            Tentang
          </a>
        </nav>
      </div>
    </header>
  );
}
