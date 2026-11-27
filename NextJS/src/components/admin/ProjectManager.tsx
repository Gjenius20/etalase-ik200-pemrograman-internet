"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  EyeOff,
  FilePenLine,
  FolderKanban,
  Loader2,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";

import {
  deleteProjectAction,
  setProjectStatusAction,
} from "@/actions/projects";
import CompletenessMeter from "@/components/admin/CompletenessMeter";
import StatusBadge from "@/components/admin/StatusBadge";
import AppLogo from "@/components/public/AppLogo";
import type {
  AdminProjectSummary,
  AdminStats,
} from "@/lib/admin-projects";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT";

type ToastMessage = {
  type: "success" | "error";
  message: string;
};

const STAT_CARDS = [
  {
    key: "total" as const,
    label: "Total Project",
    icon: FolderKanban,
    tone: "text-slate-700 bg-slate-100 border-slate-200",
  },
  {
    key: "published" as const,
    label: "Terbit",
    icon: CheckCircle2,
    tone: "text-brand-dark bg-brand-soft border-brand/20",
  },
  {
    key: "draft" as const,
    label: "Draft",
    icon: FilePenLine,
    tone: "text-amber-800 bg-amber-50 border-amber-200",
  },
  {
    key: "incomplete" as const,
    label: "Belum Lengkap",
    icon: AlertTriangle,
    tone: "text-red-700 bg-red-50 border-red-200",
  },
];

export default function ProjectManager({
  projects,
  stats,
}: {
  projects: AdminProjectSummary[];
  stats: AdminStats;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProjectSummary | null>(
    null,
  );
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!deleteTarget) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDeleteTarget(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteTarget]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects.filter((project) => {
      if (statusFilter !== "ALL" && project.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) return true;

      return [
        project.appName,
        project.slug,
        project.groupLabel,
        `kelompok ${project.groupNumber}`,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [projects, query, statusFilter]);

  const countByStatus = useMemo(
    () => ({
      ALL: projects.length,
      PUBLISHED: projects.filter((project) => project.status === "PUBLISHED")
        .length,
      DRAFT: projects.filter((project) => project.status === "DRAFT").length,
    }),
    [projects],
  );

  async function handleToggleStatus(project: AdminProjectSummary) {
    const nextStatus = project.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setBusyId(project.id);

    const result = await setProjectStatusAction(project.id, nextStatus);

    setBusyId(null);

    if (result.ok) {
      setToast({
        type: "success",
        message:
          nextStatus === "PUBLISHED"
            ? `${project.appName} berhasil diterbitkan.`
            : `${project.appName} ditarik menjadi draft.`,
      });
      router.refresh();
    } else {
      setToast({
        type: "error",
        message: result.message ?? "Gagal mengubah status project.",
      });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setBusyId(deleteTarget.id);
    const result = await deleteProjectAction(deleteTarget.id);
    setBusyId(null);

    if (result.ok) {
      setToast({
        type: "success",
        message: `${deleteTarget.appName} berhasil dihapus.`,
      });
      setDeleteTarget(null);
      router.refresh();
    } else {
      setToast({
        type: "error",
        message: result.message ?? "Gagal menghapus project.",
      });
    }
  }

  function renderActions(project: AdminProjectSummary) {
    const isBusy = busyId === project.id;
    const isPublished = project.status === "PUBLISHED";
    const canPublish = project.completeness >= 100;

    return (
      <div className="flex items-center justify-end gap-1.5">
        <Link
          href={`/admin/projects/${project.id}`}
          aria-label={`Edit ${project.appName}`}
          title="Edit project"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-stone-300 bg-white text-slate-700 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Link>

        {isPublished ? (
          <Link
            href={`/proyek/${project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Lihat halaman publik ${project.appName}`}
            title="Lihat halaman publik"
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-stone-300 bg-white text-slate-700 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span
            aria-hidden="true"
            title="Terbitkan project untuk melihat halaman publik"
            className="inline-flex min-h-[40px] min-w-[40px] cursor-not-allowed items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-slate-300"
          >
            <CheckCircle2 className="h-4 w-4" />
          </span>
        )}

        <button
          type="button"
          onClick={() => handleToggleStatus(project)}
          disabled={isBusy || (!isPublished && !canPublish)}
          aria-label={
            isPublished
              ? `Tarik ${project.appName} menjadi draft`
              : `Terbitkan ${project.appName}`
          }
          title={
            isPublished
              ? "Tarik menjadi draft"
              : canPublish
                ? "Terbitkan project"
                : "Lengkapi project sebelum menerbitkan"
          }
          className={`inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${
            isPublished
              ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
              : "border-brand/25 bg-brand-soft text-brand-dark hover:bg-[#dfeee5]"
          }`}
        >
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : isPublished ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setDeleteTarget(project)}
          disabled={isBusy}
          aria-label={`Hapus ${project.appName}`}
          title="Hapus project"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.key}
              className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  {card.label}
                </p>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${card.tone}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-ink">
                {stats[card.key]}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-stone-100 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="relative w-full sm:max-w-sm">
            <label htmlFor="admin-search" className="sr-only">
              Cari project berdasarkan nama, slug, atau kelompok
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
              aria-hidden="true"
            />
            <input
              id="admin-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari project..."
              className="min-h-[44px] w-full rounded-xl border border-stone-300 bg-cream py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-slate-600 focus:border-brand focus:bg-white focus:outline-none"
            />
          </div>

          <div
            role="group"
            aria-label="Filter status project"
            className="flex flex-wrap gap-1.5"
          >
            {(
              [
                ["ALL", "Semua"],
                ["PUBLISHED", "Terbit"],
                ["DRAFT", "Draft"],
              ] as const
            ).map(([value, label]) => {
              const active = statusFilter === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  aria-pressed={active}
                  className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                    active
                      ? "border-brand bg-brand text-white"
                      : "border-stone-300 bg-white text-slate-700 hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
                  }`}
                >
                  {label}
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] ${
                      active ? "bg-white/20 text-white" : "bg-stone-100 text-slate-600"
                    }`}
                  >
                    {countByStatus[value]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <FolderKanban className="h-10 w-10 text-slate-400" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold text-slate-900">
              Belum ada project
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-600">
              Tambahkan project pertama, lengkapi artefaknya, lalu terbitkan ke
              etalase publik.
            </p>
            <Link
              href="/admin/projects/new"
              className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah Project
            </Link>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <Search className="h-9 w-9 text-slate-400" aria-hidden="true" />
            <h2 className="mt-3 text-base font-bold text-slate-900">
              Tidak ada project yang cocok
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Ubah kata kunci atau filter status.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("ALL");
              }}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="bg-cream/70 text-[11px] uppercase tracking-wide text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Project
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Kelompok
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Anggota
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Kelengkapan
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Diperbarui
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-cream/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <AppLogo
                            src={project.logoUrl}
                            appName={project.appName}
                            sizeClass="h-10 w-10"
                            textClass="text-xs"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-ink">
                              {project.appName}
                            </p>
                            <p className="truncate text-xs text-slate-600">
                              /proyek/{project.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {project.groupLabel}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {project.memberCount}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3">
                        <CompletenessMeter percent={project.completeness} compact />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                        {project.updatedAtLabel}
                      </td>
                      <td className="px-4 py-3">{renderActions(project)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-stone-100 md:hidden">
              {filteredProjects.map((project) => (
                <li key={project.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <AppLogo
                      src={project.logoUrl}
                      appName={project.appName}
                      sizeClass="h-11 w-11"
                      textClass="text-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={project.status} />
                        <span className="text-xs font-semibold text-slate-600">
                          {project.groupLabel}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-bold text-ink">
                        {project.appName}
                      </p>
                      <p className="truncate text-xs text-slate-600">
                        /proyek/{project.slug}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-cream p-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        Anggota
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {project.memberCount} orang
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        Diperbarui
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {project.updatedAtLabel}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <CompletenessMeter percent={project.completeness} />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    {renderActions(project)}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-project-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() => {
            if (!busyId) setDeleteTarget(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2
                  id="delete-project-title"
                  className="text-lg font-bold text-ink"
                >
                  Hapus project?
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  <strong className="font-semibold text-slate-800">
                    {deleteTarget.appName}
                  </strong>{" "}
                  beserta data anggota akan dihapus permanen. Tindakan ini tidak
                  dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={Boolean(busyId)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-stone-100 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={Boolean(busyId)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-70"
              >
                {busyId ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-[60] flex max-w-sm items-start gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "success"
              ? "border-brand/30 bg-brand-soft text-brand-dark"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
