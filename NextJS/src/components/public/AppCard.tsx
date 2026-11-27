import Link from "next/link";
import { ExternalLink, Info } from "lucide-react";

import AppLogo from "@/components/public/AppLogo";
import type { CatalogProject } from "@/lib/types";

export default function AppCard({ project }: { project: CatalogProject }) {
  return (
    <article className="flex h-full min-w-0 flex-col justify-between rounded-2xl border border-stone-200 bg-white p-4 transition-all hover:border-brand/50 hover:shadow-md sm:p-5">
      <div>
        <div className="flex items-start gap-3.5 sm:gap-4">
          <AppLogo
            src={project.logoUrl}
            appName={project.appName}
            sizeClass="h-14 w-14 sm:h-16 sm:w-16"
          />

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center rounded-md border border-brand/20 bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand-dark">
              {project.groupLabel}
            </span>

            <h3 className="mt-1.5 truncate text-lg font-bold text-ink">
              {project.appName}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-slate-600">
              {project.members.length > 0
                ? `${project.members.length} Anggota`
                : "Karya Kelompok"}
            </p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {project.shortDescription}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-2.5 border-t border-stone-100 pt-4">
        <Link
          href={`/proyek/${project.slug}`}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark active:bg-brand-darker"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
          Lihat Detail
        </Link>

        <a
          href={project.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Buka website aktif ${project.appName}`}
          title={`Buka website ${project.appName}`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-stone-300 bg-white text-slate-700 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
