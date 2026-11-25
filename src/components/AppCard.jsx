import { ExternalLink, Info } from 'lucide-react';
import AppLogo from './AppLogo';

const LEVEL_BADGE_STYLES = {
  SD: 'border-amber-200 bg-amber-50 text-amber-900',
  SMP: 'border-sky-200 bg-sky-50 text-sky-900',
  SMA: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  SMK: 'border-slate-300 bg-slate-100 text-slate-800',
};

export default function AppCard({ project, onSelect }) {
  const levelStyle =
    LEVEL_BADGE_STYLES[project.level] || 'border-slate-200 bg-slate-100 text-slate-800';

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-emerald-700/40 hover:shadow-md">
      <div>
        <div className="flex items-start gap-4">
          <AppLogo src={project.logoUrl} appName={project.appName} sizeClass="h-16 w-16" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">
                {project.groupName}
              </span>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold ${levelStyle}`}
              >
                {project.level}
              </span>
            </div>

            <h3 className="mt-1 truncate text-lg font-bold text-slate-900">
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

      <div className="mt-5 flex items-center gap-2.5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onSelect(project)}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#01875F] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#016e4d] active:bg-[#01593f]"
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
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
