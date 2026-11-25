import { Search, X } from 'lucide-react';

const LEVELS = ['Semua', 'SD', 'SMP', 'SMA', 'SMK'];

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  levelCounts,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative flex-1 lg:max-w-md">
        <label htmlFor="search-projects" className="sr-only">
          Cari nama aplikasi, topik pembelajaran, atau nama kelompok
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
        <input
          id="search-projects"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama aplikasi, topik, atau kelompok..."
          className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-500 transition-colors focus:border-[#01875F] focus:bg-white focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Hapus kata kunci pencarian"
            className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div
        role="group"
        aria-label="Filter jenjang sasaran"
        className="flex flex-wrap items-center gap-2"
      >
        {LEVELS.map((level) => {
          const isActive = selectedLevel === level;
          const count = levelCounts[level] ?? 0;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onLevelChange(level)}
              aria-pressed={isActive}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-[#01875F] text-white hover:bg-[#016e4d]'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>{level}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
