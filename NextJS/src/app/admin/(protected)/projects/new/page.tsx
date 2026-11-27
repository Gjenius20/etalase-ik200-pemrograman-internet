import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ProjectForm from "@/components/admin/ProjectForm";
import SetupNotice from "@/components/public/SetupNotice";
import { isDatabaseConfigured } from "@/lib/env";
import { isStorageConfigured } from "@/lib/s3";
import { createEmptyDraft } from "@/lib/validation/project";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  const databaseReady = isDatabaseConfigured();

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/admin"
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-sm font-semibold text-slate-600 transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Dashboard
      </Link>

      <div className="mt-2">
        <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          Tambah Project
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
          Lengkapi form bertahap. Nomor kelompok dan nama aplikasi wajib diisi
          untuk menyimpan draft; seluruh syarat harus lengkap sebelum project
          dapat diterbitkan.
        </p>
      </div>

      {databaseReady ? (
        <ProjectForm
          mode="create"
          initialDraft={createEmptyDraft()}
          initialStatus="DRAFT"
          storageConfigured={isStorageConfigured()}
        />
      ) : (
        <div className="mt-6">
          <SetupNotice />
        </div>
      )}
    </main>
  );
}
