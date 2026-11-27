import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import ProjectForm from "@/components/admin/ProjectForm";
import SetupNotice from "@/components/public/SetupNotice";
import { getAdminProjectForEdit } from "@/lib/admin-projects";
import { isDatabaseConfigured } from "@/lib/env";
import { isStorageConfigured } from "@/lib/s3";

export const dynamic = "force-dynamic";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditProjectPage({
  params,
  searchParams,
}: EditProjectPageProps) {
  const { id } = await params;

  if (!isDatabaseConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <SetupNotice />
      </main>
    );
  }

  const [project, query] = await Promise.all([
    getAdminProjectForEdit(id),
    searchParams,
  ]);

  if (!project) notFound();

  const created = query.created === "1";
  const saved = query.saved === "1";

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/admin"
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-sm font-semibold text-slate-600 transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Dashboard
      </Link>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            Edit Project
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">
              Kelompok {project.draft.groupNumber || "—"}
            </span>{" "}
            ·{" "}
            <span className="font-mono text-xs text-slate-600">
              /proyek/{project.slug}
            </span>
          </p>
        </div>
      </div>

      <ProjectForm
        mode="edit"
        projectId={project.id}
        projectSlug={project.slug}
        initialDraft={project.draft}
        initialStatus={project.status}
        storageConfigured={isStorageConfigured()}
        justCreated={created}
        justSaved={saved}
      />
    </main>
  );
}
