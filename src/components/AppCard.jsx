import { ExternalLink, Info } from 'lucide-react';
import AppLogo from './AppLogo';

export default function AppCard({ project, onSelect }) {
  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 transition-all hover:border-[#235334]/50 hover:shadow-md">
      <div>
        <div className="flex items-start gap-4">
          <AppLogo src={project.logoUrl} appName={project.appName} sizeClass="h-16 w-16" />

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center rounded-md border border-[#235334]/20 bg-[#EEF5F0] px-2 py-0.5 text-xs font-bold text-[#1A3F27]">
              {project.groupName}
            </span>

            <h3 className="mt-1.5 truncate text-lg font-bold text-[#111920]">
              {project.appName}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {project.members?.length ? `${project.members.length} Anggota` : 'Karya Kelompok'}
            </p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {project.shortDescription}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-2.5 border-t border-stone-100 pt-4">
        <button
          type="button"
          onClick={() => onSelect(project)}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#235334] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1a3f27] active:bg-[#13301d]"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
          Lihat Detail
        </button>

        <a
          href={project.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Buka website aktif ${project.appName}`}
          title={`Buka website ${project.appName}`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-stone-300 bg-white text-slate-700 transition-colors hover:border-[#235334] hover:bg-[#EEF5F0] hover:text-[#1A3F27]"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
