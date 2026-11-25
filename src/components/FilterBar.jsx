import { Search, X } from 'lucide-react';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  filteredCount,
  totalCount,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="relative w-full flex-1 sm:max-w-lg">
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
          className="min-h-[44px] w-full rounded-xl border border-stone-300 bg-[#F8F7F3] py-2.5 pl-10 pr-11 text-sm text-[#111920] placeholder:text-slate-500 transition-colors focus:border-[#235334] focus:bg-white focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Hapus kata kunci pencarian"
            className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-stone-200 hover:text-[#111920]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="inline-flex items-center self-start rounded-xl border border-[#235334]/20 bg-[#EEF5F0] px-3.5 py-2 text-xs font-bold text-[#1A3F27] sm:self-auto sm:text-sm">
        Menampilkan {filteredCount} dari {totalCount} proyek
      </p>
    </div>
  );
}
