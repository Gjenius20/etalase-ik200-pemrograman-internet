"use client";

import { useMemo, useState } from "react";
import { RotateCcw, SearchX } from "lucide-react";

import AppCard from "@/components/public/AppCard";
import FilterBar from "@/components/public/FilterBar";
import type { CatalogProject } from "@/lib/types";

export default function Catalog({ projects }: { projects: CatalogProject[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return projects;

    return projects.filter((project) => {
      const searchableText = [
        project.appName,
        project.groupLabel,
        `kelompok ${project.groupNumber}`,
        project.shortDescription,
        project.fullDescription,
        ...project.features,
        ...project.members.flatMap((member) => [member.name, member.nim]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [projects, searchQuery]);

  return (
    <>
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredCount={filteredProjects.length}
        totalCount={projects.length}
      />

      {filteredProjects.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <AppCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <SearchX className="h-10 w-10 text-slate-400" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">
            Tidak ada proyek yang cocok
          </h3>
          <p className="mt-1 max-w-md text-sm text-slate-600">
            Pencarian &ldquo;{searchQuery}&rdquo; tidak menemukan aplikasi. Coba
            ubah kata kunci atau reset pencarian.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset Pencarian
          </button>
        </div>
      )}
    </>
  );
}
