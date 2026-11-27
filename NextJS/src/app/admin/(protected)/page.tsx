import Link from "next/link";
import { Plus } from "lucide-react";

import ProjectManager from "@/components/admin/ProjectManager";
import SetupNotice from "@/components/public/SetupNotice";
import { getAdminProjects } from "@/lib/admin-projects";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const configured = isDatabaseConfigured();
  const data = configured ? await getAdminProjects() : null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola data project yang tampil pada etalase publik.
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah Project
        </Link>
      </div>

      {data ? (
        <ProjectManager projects={data.projects} stats={data.stats} />
      ) : (
        <div className="mt-6">
          <SetupNotice />
        </div>
      )}
    </main>
  );
}
