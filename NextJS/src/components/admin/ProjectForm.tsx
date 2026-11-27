"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  ImagePlus,
  Info,
  ListChecks,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { saveProjectAction, type SaveIntent } from "@/actions/projects";
import CompletenessMeter from "@/components/admin/CompletenessMeter";
import DocumentUploader from "@/components/admin/DocumentUploader";
import FormField from "@/components/admin/form/FormField";
import SectionCard from "@/components/admin/form/SectionCard";
import LogoUploader from "@/components/admin/LogoUploader";
import ScreenshotEditor from "@/components/admin/ScreenshotEditor";
import StatusBadge from "@/components/admin/StatusBadge";
import AppLogo from "@/components/public/AppLogo";
import {
  computeCompleteness,
  parseYouTubeId,
  SECTION_IDS,
  type ProjectDraft,
  type SectionKey,
} from "@/lib/validation/project";

const INPUT_CLASS =
  "min-h-[44px] w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 transition-colors focus:border-brand focus:outline-none";

const TEXTAREA_CLASS =
  "w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink placeholder:text-slate-400 transition-colors focus:border-brand focus:outline-none";

const MAX_FEATURES = 8;
const MAX_MEMBERS = 10;

const SECTION_LABELS: Record<SectionKey, string> = {
  identitas: "Identitas Kelompok",
  aplikasi: "Informasi Aplikasi",
  konteks: "Konteks Pembelajaran",
  fitur: "Fitur & AI",
  media: "Screenshot",
  tautan: "Tautan",
  dokumen: "Dokumen PDF",
};

function sectionForErrorKey(key: string): SectionKey {
  if (key === "groupNumber" || key === "members") return "identitas";

  if (
    key === "appName" ||
    key === "shortDescription" ||
    key === "fullDescription" ||
    key === "logo"
  ) {
    return "aplikasi";
  }

  if (
    key === "targetUser" ||
    key === "targetCompetency" ||
    key === "learningProblem" ||
    key === "learningSuccess"
  ) {
    return "konteks";
  }

  if (key === "features" || key === "aiIntegration") return "fitur";
  if (key === "screenshots") return "media";

  if (
    key === "websiteUrl" ||
    key === "githubUrl" ||
    key === "youtubeUrl"
  ) {
    return "tautan";
  }

  return "dokumen";
}

function formatDraftSavedAt(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function countSectionErrors(
  errors: Record<string, string>,
): Record<SectionKey, number> {
  const counts: Record<SectionKey, number> = {
    identitas: 0,
    aplikasi: 0,
    konteks: 0,
    fitur: 0,
    media: 0,
    tautan: 0,
    dokumen: 0,
  };

  for (const key of Object.keys(errors)) {
    counts[sectionForErrorKey(key)] += 1;
  }

  return counts;
}

type Toast = { type: "success" | "error"; text: string };

export default function ProjectForm({
  mode,
  projectId,
  projectSlug,
  initialDraft,
  initialStatus,
  storageConfigured,
  justCreated = false,
  justSaved = false,
}: {
  mode: "create" | "edit";
  projectId?: string;
  projectSlug?: string;
  initialDraft: ProjectDraft;
  initialStatus: "DRAFT" | "PUBLISHED";
  storageConfigured: boolean;
  justCreated?: boolean;
  justSaved?: boolean;
}) {
  const router = useRouter();

  const [draft, setDraft] = useState<ProjectDraft>(initialDraft);
  const [status, setStatus] = useState(initialStatus);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<Toast | null>(
    justCreated
      ? { type: "success", text: "Project berhasil dibuat dan disimpan sebagai draft." }
      : justSaved
        ? { type: "success", text: "Perubahan berhasil disimpan." }
        : null,
  );
  const [busy, setBusy] = useState<SaveIntent | null>(null);
  const [dirty, setDirty] = useState(false);
  const [localSavedAt, setLocalSavedAt] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<{
    draft: ProjectDraft;
    savedAt: string;
  } | null>(null);
  const [showProblems, setShowProblems] = useState(false);

  const initialDraftRef = useRef(initialDraft);
  const storageKey = `ik200-project-draft:${projectId ?? "new"}`;

  const completeness = useMemo(() => computeCompleteness(draft), [draft]);
  const sectionErrors = useMemo(
    () => countSectionErrors(fieldErrors),
    [fieldErrors],
  );
  const youtubeId = useMemo(
    () => parseYouTubeId(draft.youtubeUrl),
    [draft.youtubeUrl],
  );

  /* ------------------------- draft recovery lokal ------------------------- */

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        version?: number;
        draft?: ProjectDraft;
        savedAt?: string;
      };

      if (!parsed || parsed.version !== 1 || !parsed.draft || !parsed.savedAt) {
        return;
      }

      if (
        JSON.stringify(parsed.draft) === JSON.stringify(initialDraftRef.current)
      ) {
        window.localStorage.removeItem(storageKey);
        return;
      }

      setRecovery({ draft: parsed.draft, savedAt: parsed.savedAt });
    } catch {
      /* localStorage bisa tidak tersedia; abaikan. */
    }
  }, [storageKey]);

  useEffect(() => {
    if (!dirty) return undefined;

    const timer = window.setTimeout(() => {
      try {
        const savedAt = new Date().toISOString();
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ version: 1, draft, savedAt }),
        );
        setLocalSavedAt(savedAt);
      } catch {
        /* kuota penuh / private mode; abaikan diam-diam. */
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [draft, dirty, storageKey]);

  useEffect(() => {
    if (!dirty) return undefined;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  /* ----------------------------- mutation ------------------------------- */

  function patch(update: Partial<ProjectDraft>) {
    setDraft((previous) => ({ ...previous, ...update }));
    setDirty(true);
    setToast(null);
  }

  function clearFieldError(...keys: string[]) {
    setFieldErrors((previous) => {
      if (!keys.some((key) => key in previous)) return previous;

      const next = { ...previous };
      for (const key of keys) delete next[key];
      return next;
    });
  }

  function scrollToSection(section: SectionKey) {
    const element = document.getElementById(SECTION_IDS[section]);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function restoreRecovery() {
    if (!recovery) return;
    setDraft(recovery.draft);
    setDirty(true);
    setRecovery(null);
    setToast({ type: "success", text: "Draft lokal berhasil dipulihkan." });
  }

  function discardRecovery() {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* abaikan */
    }
    setRecovery(null);
  }

  function moveMember(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft.members.length) return;

    const next = draft.members.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    clearFieldError("members");
    patch({ members: next });
  }

  function moveFeature(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft.features.length) return;

    const next = draft.features.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    clearFieldError("features");
    patch({ features: next });
  }

  async function submit(intent: SaveIntent) {
    setBusy(intent);
    setFieldErrors({});
    setToast(null);

    if (
      intent === "publish" &&
      status !== "PUBLISHED" &&
      !completeness.isComplete
    ) {
      const problems = completeness.problems;
      setBusy(null);
      setFieldErrors(
        Object.fromEntries(problems.map((problem) => [problem.key, problem.label])),
      );
      setShowProblems(true);
      setToast({
        type: "error",
        text: `Project belum lengkap: ${problems.length} hal perlu dilengkapi sebelum terbit.`,
      });
      scrollToSection(problems[0].section);
      return;
    }

    const result = await saveProjectAction({
      id: projectId,
      draft,
      intent,
    });

    setBusy(null);

    if (!result.ok) {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        const firstKey = Object.keys(result.fieldErrors)[0];
        if (firstKey) scrollToSection(sectionForErrorKey(firstKey));
      }

      setToast({ type: "error", text: result.message });
      return;
    }

    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* abaikan */
    }

    setDirty(false);
    setLocalSavedAt(null);
    setStatus(result.status);
    setLastAction(new Date().toISOString());

    if (intent === "publish") {
      setToast({
        type: "success",
        text:
          status === "PUBLISHED"
            ? "Perubahan berhasil disimpan dan langsung tampil di portal publik."
            : "Project berhasil diterbitkan dan sudah tampil di portal publik.",
      });
    } else {
      setToast({ type: "success", text: "Project berhasil disimpan sebagai draft." });
    }

    if (mode === "create") {
      router.replace(`/admin/projects/${result.id}?created=1`);
    } else {
      router.refresh();
    }
  }

  /* ------------------------------ preview -------------------------------- */

  const previewFeatures = draft.features
    .map((feature) => feature.trim())
    .filter(Boolean)
    .slice(0, 4);
  const previewMembers = draft.members.filter(
    (member) => member.name.trim() || member.nim.trim(),
  );
  const previewScreenshot = draft.screenshots.find((shot) => shot.url);

  /* ------------------------------- render -------------------------------- */

  return (
    <div className="mt-6">
      {!storageConfigured && (
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 text-sm leading-relaxed">
            <p className="font-bold">Neon Object Storage belum dikonfigurasi</p>
            <p className="mt-0.5">
              Unggah file dinonaktifkan. Isi variabel <code>AWS_*</code> dan{" "}
              <code>NEON_STORAGE_BUCKET</code> pada{" "}
              <code>.env.local</code> agar logo, screenshot, dan PDF bisa
              diunggah. Untuk sementara, screenshot dan PDF masih dapat memakai
              URL https://.
            </p>
          </div>
        </div>
      )}

      {recovery && (
        <div
          role="status"
          className="mb-4 flex flex-col gap-2.5 rounded-2xl border border-brand/30 bg-brand-soft p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2.5">
            <ClipboardCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-brand-dark"
              aria-hidden="true"
            />
            <div className="min-w-0 text-sm text-brand-dark">
              <p className="font-bold">Ditemukan draft tersimpan di perangkat ini</p>
              <p className="mt-0.5 text-xs">
                Disimpan {formatDraftSavedAt(recovery.savedAt)}. Pulihkan jika sesi
                sebelumnya tertutup sebelum tersimpan ke server.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={discardRecovery}
              className="inline-flex min-h-[40px] items-center rounded-lg border border-brand/30 bg-white px-3 py-1.5 text-xs font-bold text-brand-dark transition-colors hover:bg-white/70"
            >
              Abaikan
            </button>
            <button
              type="button"
              onClick={restoreRecovery}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-dark"
            >
              <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Pulihkan
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="min-w-0 space-y-4 xl:col-span-8">
          {/* 1. Identitas */}
          <SectionCard
            id={SECTION_IDS.identitas}
            number={1}
            title="Identitas Kelompok"
            description="Nomor kelompok dan anggota penyusun project. Nomor kelompok wajib unik."
            errorCount={sectionErrors.identitas}
          >
            <div className="space-y-4">
              <FormField
                id="groupNumber"
                label="Nomor Kelompok"
                required
                hint="Angka 1–99. Wajib diisi agar project dapat disimpan."
                error={fieldErrors.groupNumber}
              >
                <input
                  id="groupNumber"
                  type="text"
                  inputMode="numeric"
                  value={draft.groupNumber}
                  maxLength={2}
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^0-9]/g, "");
                    clearFieldError("groupNumber");
                    patch({ groupNumber: value });
                  }}
                  placeholder="Contoh: 1"
                  aria-invalid={Boolean(fieldErrors.groupNumber)}
                  className={`${INPUT_CLASS} max-w-[140px]`}
                />
              </FormField>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                    <Users className="h-4 w-4 text-brand" aria-hidden="true" />
                    Anggota Kelompok
                  </p>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {draft.members.length}/{MAX_MEMBERS} anggota
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600">
                  Minimal 1 anggota dengan nama (min. 3 karakter) dan NIM (6–20
                  digit) sebelum terbit.
                </p>

                <ul className="mt-2.5 space-y-2">
                  {draft.members.map((member, index) => (
                    <li key={index} className="flex flex-col gap-2 sm:flex-row">
                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor={`member-name-${index}`}
                          className="sr-only"
                        >
                          Nama anggota {index + 1}
                        </label>
                        <input
                          id={`member-name-${index}`}
                          type="text"
                          value={member.name}
                          maxLength={80}
                          onChange={(event) => {
                            clearFieldError("members");
                            patch({
                              members: draft.members.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, name: event.target.value }
                                  : item,
                              ),
                            });
                          }}
                          placeholder={`Nama lengkap anggota ${index + 1}`}
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="sm:w-44">
                        <label
                          htmlFor={`member-nim-${index}`}
                          className="sr-only"
                        >
                          NIM anggota {index + 1}
                        </label>
                        <input
                          id={`member-nim-${index}`}
                          type="text"
                          inputMode="numeric"
                          value={member.nim}
                          maxLength={20}
                          onChange={(event) => {
                            clearFieldError("members");
                            patch({
                              members: draft.members.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      nim: event.target.value.replace(/[^0-9]/g, ""),
                                    }
                                  : item,
                              ),
                            });
                          }}
                          placeholder="NIM"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="flex shrink-0 items-center gap-1 self-start">
                        <button
                          type="button"
                          onClick={() => moveMember(index, -1)}
                          disabled={index === 0}
                          aria-label={`Naikkan anggota ${index + 1}`}
                          className="inline-flex h-11 w-10 items-center justify-center rounded-lg border border-stone-300 bg-white text-slate-600 transition-colors hover:bg-stone-100 disabled:opacity-40"
                        >
                          <ArrowUp className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMember(index, 1)}
                          disabled={index === draft.members.length - 1}
                          aria-label={`Turunkan anggota ${index + 1}`}
                          className="inline-flex h-11 w-10 items-center justify-center rounded-lg border border-stone-300 bg-white text-slate-600 transition-colors hover:bg-stone-100 disabled:opacity-40"
                        >
                          <ArrowDown className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            clearFieldError("members");
                            patch({
                              members: draft.members.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            });
                          }}
                          disabled={draft.members.length === 1}
                          aria-label={`Hapus anggota ${index + 1}`}
                          className="inline-flex h-11 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition-colors hover:bg-red-100 disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      patch({ members: [...draft.members, { name: "", nim: "" }] })
                    }
                    disabled={draft.members.length >= MAX_MEMBERS}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Tambah Anggota
                  </button>
                </div>

                {fieldErrors.members && (
                  <p className="mt-1.5 text-xs font-semibold text-red-700" role="alert">
                    {fieldErrors.members}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* 2. Aplikasi */}
          <SectionCard
            id={SECTION_IDS.aplikasi}
            number={2}
            title="Informasi Aplikasi"
            description="Nama aplikasi, deskripsi, dan logo yang tampil pada kartu katalog."
            errorCount={sectionErrors.aplikasi}
          >
            <div className="space-y-4">
              <FormField
                id="appName"
                label="Nama Aplikasi"
                required
                hint="Maksimal 80 karakter. Slug halaman publik dibuat sekali dari nama ini."
                error={fieldErrors.appName}
                counter={`${draft.appName.length}/80`}
                counterOver={draft.appName.length > 80}
              >
                <input
                  id="appName"
                  type="text"
                  value={draft.appName}
                  maxLength={80}
                  onChange={(event) => {
                    clearFieldError("appName");
                    patch({ appName: event.target.value });
                  }}
                  placeholder="Contoh: MathQuest: Petualangan Matematika"
                  aria-invalid={Boolean(fieldErrors.appName)}
                  className={INPUT_CLASS}
                />
              </FormField>

              <FormField
                id="shortDescription"
                label="Deskripsi Singkat"
                required
                hint="Tampil pada kartu katalog. Minimal 20 karakter saat diterbitkan."
                error={fieldErrors.shortDescription}
                counter={`${draft.shortDescription.length}/180`}
                counterOver={draft.shortDescription.length > 180}
              >
                <textarea
                  id="shortDescription"
                  rows={3}
                  value={draft.shortDescription}
                  maxLength={180}
                  onChange={(event) => {
                    clearFieldError("shortDescription");
                    patch({ shortDescription: event.target.value });
                  }}
                  placeholder="Ringkas manfaat aplikasi dalam 1–2 kalimat."
                  aria-invalid={Boolean(fieldErrors.shortDescription)}
                  className={TEXTAREA_CLASS}
                />
              </FormField>

              <FormField
                id="fullDescription"
                label="Deskripsi Lengkap"
                hint="Alur penggunaan dan pengalaman belajar. Minimal 100 karakter saat terbit."
                error={fieldErrors.fullDescription}
                counter={`${draft.fullDescription.length}/3000`}
                counterOver={draft.fullDescription.length > 3000}
              >
                <textarea
                  id="fullDescription"
                  rows={7}
                  value={draft.fullDescription}
                  maxLength={3000}
                  onChange={(event) => {
                    clearFieldError("fullDescription");
                    patch({ fullDescription: event.target.value });
                  }}
                  placeholder="Jelaskan masalah, alur penggunaan, dan pengalaman belajar."
                  aria-invalid={Boolean(fieldErrors.fullDescription)}
                  className={TEXTAREA_CLASS}
                />
              </FormField>

              <div>
                <p className="mb-1.5 text-sm font-bold text-slate-800">
                  Logo Aplikasi
                  <span className="ml-1 text-red-600" aria-hidden="true">
                    *
                  </span>
                </p>
                <LogoUploader
                  value={draft.logo}
                  onChange={(logo) => {
                    clearFieldError("logo");
                    patch({ logo });
                  }}
                  disabled={!storageConfigured}
                  error={fieldErrors.logo}
                />
              </div>
            </div>
          </SectionCard>

          {/* 3. Konteks */}
          <SectionCard
            id={SECTION_IDS.konteks}
            number={3}
            title="Konteks Pembelajaran"
            description="Sasaran pengguna, kompetensi, masalah belajar, dan indikator keberhasilan."
            errorCount={sectionErrors.konteks}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="targetUser"
                label="Target Pengguna"
                hint="Contoh: Siswa SMP kelas VIII."
                error={fieldErrors.targetUser}
                counter={`${draft.targetUser.length}/300`}
                counterOver={draft.targetUser.length > 300}
              >
                <textarea
                  id="targetUser"
                  rows={3}
                  value={draft.targetUser}
                  maxLength={300}
                  onChange={(event) => {
                    clearFieldError("targetUser");
                    patch({ targetUser: event.target.value });
                  }}
                  className={TEXTAREA_CLASS}
                  placeholder="Siapa pengguna utama aplikasi?"
                />
              </FormField>

              <FormField
                id="targetCompetency"
                label="Kompetensi yang Dituju"
                hint="Contoh: Pemahaman konsep pecahan."
                error={fieldErrors.targetCompetency}
                counter={`${draft.targetCompetency.length}/300`}
                counterOver={draft.targetCompetency.length > 300}
              >
                <textarea
                  id="targetCompetency"
                  rows={3}
                  value={draft.targetCompetency}
                  maxLength={300}
                  onChange={(event) => {
                    clearFieldError("targetCompetency");
                    patch({ targetCompetency: event.target.value });
                  }}
                  className={TEXTAREA_CLASS}
                  placeholder="Kompetensi apa yang dilatih?"
                />
              </FormField>

              <FormField
                id="learningProblem"
                label="Masalah Belajar yang Dibantu"
                hint="Kesulitan yang ingin diselesaikan."
                error={fieldErrors.learningProblem}
                counter={`${draft.learningProblem.length}/300`}
                counterOver={draft.learningProblem.length > 300}
              >
                <textarea
                  id="learningProblem"
                  rows={3}
                  value={draft.learningProblem}
                  maxLength={300}
                  onChange={(event) => {
                    clearFieldError("learningProblem");
                    patch({ learningProblem: event.target.value });
                  }}
                  className={TEXTAREA_CLASS}
                  placeholder="Masalah belajar apa yang dibantu?"
                />
              </FormField>

              <FormField
                id="learningSuccess"
                label="Indikator Keberhasilan Belajar"
                hint="Bagaimana keberhasilan diukur?"
                error={fieldErrors.learningSuccess}
                counter={`${draft.learningSuccess.length}/300`}
                counterOver={draft.learningSuccess.length > 300}
              >
                <textarea
                  id="learningSuccess"
                  rows={3}
                  value={draft.learningSuccess}
                  maxLength={300}
                  onChange={(event) => {
                    clearFieldError("learningSuccess");
                    patch({ learningSuccess: event.target.value });
                  }}
                  className={TEXTAREA_CLASS}
                  placeholder="Contoh: 80% siswa menjawab benar pada kuis akhir."
                />
              </FormField>
            </div>
          </SectionCard>

          {/* 4. Fitur & AI */}
          <SectionCard
            id={SECTION_IDS.fitur}
            number={4}
            title="Fitur Pembelajaran & Integrasi AI"
            description="Poin fitur utama (maks. 8) dan penjelasan bila aplikasi memakai AI."
            errorCount={sectionErrors.fitur}
          >
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-800">Fitur Utama</p>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {draft.features.length}/{MAX_FEATURES} poin
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600">
                  Minimal 1 poin (min. 5 karakter) saat diterbitkan.
                </p>

                <ul className="mt-2.5 space-y-2">
                  {draft.features.map((feature, index) => (
                    <li key={index} className="flex gap-2">
                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor={`feature-${index}`}
                          className="sr-only"
                        >
                          Fitur {index + 1}
                        </label>
                        <input
                          id={`feature-${index}`}
                          type="text"
                          value={feature}
                          maxLength={200}
                          onChange={(event) => {
                            clearFieldError("features");
                            patch({
                              features: draft.features.map((item, itemIndex) =>
                                itemIndex === index
                                  ? event.target.value
                                  : item,
                              ),
                            });
                          }}
                          placeholder={`Fitur ${index + 1}`}
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveFeature(index, -1)}
                          disabled={index === 0}
                          aria-label={`Naikkan fitur ${index + 1}`}
                          className="inline-flex h-11 w-10 items-center justify-center rounded-lg border border-stone-300 bg-white text-slate-600 transition-colors hover:bg-stone-100 disabled:opacity-40"
                        >
                          <ArrowUp className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFeature(index, 1)}
                          disabled={index === draft.features.length - 1}
                          aria-label={`Turunkan fitur ${index + 1}`}
                          className="inline-flex h-11 w-10 items-center justify-center rounded-lg border border-stone-300 bg-white text-slate-600 transition-colors hover:bg-stone-100 disabled:opacity-40"
                        >
                          <ArrowDown className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            clearFieldError("features");
                            patch({
                              features: draft.features.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            });
                          }}
                          disabled={draft.features.length === 1}
                          aria-label={`Hapus fitur ${index + 1}`}
                          className="inline-flex h-11 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition-colors hover:bg-red-100 disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => patch({ features: [...draft.features, ""] })}
                  disabled={draft.features.length >= MAX_FEATURES}
                  className="mt-2.5 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Tambah Fitur
                </button>

                {fieldErrors.features && (
                  <p className="mt-1.5 text-xs font-semibold text-red-700" role="alert">
                    {fieldErrors.features}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-stone-200 bg-cream p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                      <Bot className="h-4 w-4 text-brand" aria-hidden="true" />
                      Apakah aplikasi memakai AI?
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      Aktifkan untuk menampilkan bagian integrasi kecerdasan
                      artifisial pada halaman publik.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.aiEnabled}
                    aria-label="Aktifkan integrasi AI"
                    onClick={() =>
                      patch({ aiEnabled: !draft.aiEnabled })
                    }
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
                      draft.aiEnabled
                        ? "border-brand bg-brand"
                        : "border-stone-300 bg-stone-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        draft.aiEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {draft.aiEnabled && (
                  <div className="mt-3">
                    <FormField
                      id="aiIntegration"
                      label="Penjelasan Integrasi AI"
                      hint="Jelaskan model/teknik dan perannya dalam pembelajaran."
                      error={fieldErrors.aiIntegration}
                      counter={`${draft.aiIntegration.length}/1000`}
                      counterOver={draft.aiIntegration.length > 1000}
                    >
                      <textarea
                        id="aiIntegration"
                        rows={4}
                        value={draft.aiIntegration}
                        maxLength={1000}
                        onChange={(event) => {
                          clearFieldError("aiIntegration");
                          patch({ aiIntegration: event.target.value });
                        }}
                        placeholder="Contoh: Menggunakan model bahasa untuk umpan balik otomatis pada latihan menulis."
                        className={TEXTAREA_CLASS}
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          {/* 5. Media */}
          <SectionCard
            id={SECTION_IDS.media}
            number={5}
            title="Galeri Screenshot"
            description="Unggah 2–8 tangkapan layar aplikasi. Klik gambar pada halaman publik untuk memperbesar."
            errorCount={sectionErrors.media}
          >
            <ScreenshotEditor
              value={draft.screenshots}
              onChange={(screenshots) => {
                clearFieldError("screenshots");
                patch({ screenshots });
              }}
              disabled={!storageConfigured}
              error={fieldErrors.screenshots}
            />
          </SectionCard>

          {/* 6. Tautan */}
          <SectionCard
            id={SECTION_IDS.tautan}
            number={6}
            title="Tautan Aplikasi & Video"
            description="Website aktif, repositori GitHub, dan video demo YouTube."
            errorCount={sectionErrors.tautan}
          >
            <div className="space-y-4">
              <FormField
                id="websiteUrl"
                label="Link Website Aplikasi"
                required
                hint="URL https:// aplikasi yang dapat diakses publik."
                error={fieldErrors.websiteUrl}
              >
                <input
                  id="websiteUrl"
                  type="url"
                  inputMode="url"
                  value={draft.websiteUrl}
                  onChange={(event) => {
                    clearFieldError("websiteUrl");
                    patch({ websiteUrl: event.target.value });
                  }}
                  placeholder="https://aplikasi.vercel.app"
                  aria-invalid={Boolean(fieldErrors.websiteUrl)}
                  className={INPUT_CLASS}
                />
              </FormField>

              <FormField
                id="githubUrl"
                label="Link Repositori GitHub"
                required
                hint="Harus URL github.com."
                error={fieldErrors.githubUrl}
              >
                <input
                  id="githubUrl"
                  type="url"
                  inputMode="url"
                  value={draft.githubUrl}
                  onChange={(event) => {
                    clearFieldError("githubUrl");
                    patch({ githubUrl: event.target.value });
                  }}
                  placeholder="https://github.com/username/repo"
                  aria-invalid={Boolean(fieldErrors.githubUrl)}
                  className={INPUT_CLASS}
                />
              </FormField>

              <FormField
                id="youtubeUrl"
                label="Link Video Demo YouTube"
                required
                hint="Tempel URL YouTube (watch, youtu.be, shorts, atau embed)."
                error={fieldErrors.youtubeUrl}
              >
                <input
                  id="youtubeUrl"
                  type="url"
                  inputMode="url"
                  value={draft.youtubeUrl}
                  onChange={(event) => {
                    clearFieldError("youtubeUrl");
                    patch({ youtubeUrl: event.target.value });
                  }}
                  placeholder="https://www.youtube.com/watch?v=…"
                  aria-invalid={Boolean(fieldErrors.youtubeUrl)}
                  className={INPUT_CLASS}
                />
              </FormField>

              {draft.youtubeUrl.trim() !== "" && (
                <div className="rounded-xl border border-stone-200 bg-cream p-3">
                  {youtubeId ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <img
                        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
                        alt="Pratinjau video YouTube"
                        className="h-20 w-32 rounded-lg border border-stone-200 object-cover"
                      />
                      <div className="min-w-0 text-xs">
                        <p className="font-bold text-brand-dark">
                          Video terdeteksi: {youtubeId}
                        </p>
                        <a
                          href={`https://www.youtube.com/watch?v=${youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 font-semibold text-slate-600 underline-offset-2 hover:underline"
                        >
                          Buka di YouTube
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-amber-800">
                      ID video belum terbaca. Pastikan tautan YouTube valid.
                    </p>
                  )}
                </div>
              )}
            </div>
          </SectionCard>

          {/* 7. Dokumen */}
          <SectionCard
            id={SECTION_IDS.dokumen}
            number={7}
            title="Dokumen PDF"
            description="Unggah PDF ke Neon Object Storage atau tautkan file publik (mis. Google Drive)."
            errorCount={sectionErrors.dokumen}
          >
            <div className="space-y-3">
              <DocumentUploader
                id="document-presentation"
                label="Slide Presentasi (PDF)"
                document={draft.documents.presentation}
                onChange={(document) => {
                  clearFieldError("documents.presentation");
                  patch({
                    documents: { ...draft.documents, presentation: document },
                  });
                }}
                disabled={!storageConfigured}
                error={fieldErrors["documents.presentation"]}
              />

              <DocumentUploader
                id="document-skpl"
                label="Dokumen SKPL (PDF)"
                document={draft.documents.skpl}
                onChange={(document) => {
                  clearFieldError("documents.skpl");
                  patch({ documents: { ...draft.documents, skpl: document } });
                }}
                disabled={!storageConfigured}
                error={fieldErrors["documents.skpl"]}
              />

              <DocumentUploader
                id="document-user-guide"
                label="Panduan Pengguna (PDF)"
                document={draft.documents.userGuide}
                onChange={(document) => {
                  clearFieldError("documents.userGuide");
                  patch({
                    documents: { ...draft.documents, userGuide: document },
                  });
                }}
                disabled={!storageConfigured}
                error={fieldErrors["documents.userGuide"]}
              />
            </div>
          </SectionCard>

          {/* Aksi bawah untuk mobile */}
          <div className="flex flex-col-reverse gap-2 rounded-2xl border border-stone-200 bg-white p-3.5 sm:flex-row sm:justify-end xl:hidden">
            {status !== "PUBLISHED" && (
              <button
                type="button"
                onClick={() => submit("draft")}
                disabled={busy !== null}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-stone-100 disabled:opacity-60"
              >
                {busy === "draft" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                Simpan Draft
              </button>
            )}
            <button
              type="button"
              onClick={() => submit("publish")}
              disabled={busy !== null}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {busy === "publish" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {status === "PUBLISHED" ? (
                "Simpan Perubahan"
              ) : (
                <>Simpan &amp; Terbitkan</>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:col-span-4 xl:self-start xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto xl:pr-1">
          <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-ink">Status Project</h2>
              <StatusBadge status={status} />
            </div>

            <CompletenessMeter percent={completeness.percent} />

            {completeness.problems.length > 0 ? (
              <div>
                <button
                  type="button"
                  onClick={() => setShowProblems((value) => !value)}
                  aria-expanded={showProblems}
                  className="flex w-full items-center justify-between gap-2 rounded-lg bg-cream px-3 py-2 text-left text-xs font-bold text-slate-700 transition-colors hover:bg-stone-100"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <ListChecks className="h-4 w-4 text-amber-700" aria-hidden="true" />
                    {completeness.problems.length} hal belum lengkap
                  </span>
                  <span aria-hidden="true">{showProblems ? "−" : "+"}</span>
                </button>

                {showProblems && (
                  <ul className="mt-1.5 max-h-64 space-y-0.5 overflow-y-auto">
                    {completeness.problems.map((problem) => (
                      <li key={problem.key}>
                        <button
                          type="button"
                          onClick={() => scrollToSection(problem.section)}
                          className="flex w-full items-start gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] font-semibold text-slate-600 transition-colors hover:bg-cream hover:text-brand-dark"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
                          <span className="min-w-0">
                            {problem.label}
                            <span className="ml-1 font-normal text-slate-400">
                              · {SECTION_LABELS[problem.section]}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="flex items-center gap-1.5 rounded-lg border border-brand/20 bg-brand-soft px-3 py-2 text-xs font-bold text-brand-dark">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Semua syarat terbit terpenuhi
              </p>
            )}

            <div className="flex flex-col gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={() => submit("publish")}
                disabled={busy !== null}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
              >
                {busy === "publish" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                {status === "PUBLISHED" ? "Simpan Perubahan" : "Simpan & Terbitkan"}
              </button>

              {status !== "PUBLISHED" && (
                <button
                  type="button"
                  onClick={() => submit("draft")}
                  disabled={busy !== null}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-stone-100 disabled:opacity-60"
                >
                  {busy === "draft" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden="true" />
                  )}
                  Simpan sebagai Draft
                </button>
              )}

              {dirty ? (
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                  <Info className="h-3.5 w-3.5" aria-hidden="true" />
                  Ada perubahan belum disimpan
                  {localSavedAt ? ` · cadangan lokal ${formatDraftSavedAt(localSavedAt)}` : ""}
                </p>
              ) : lastAction ? (
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-dark">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Tersimpan ke server
                </p>
              ) : (
                <p className="text-[11px] text-slate-600">
                  Perubahan tersimpan otomatis di perangkat ini sebagai cadangan.
                </p>
              )}

              {mode === "edit" && projectSlug && (
                <Link
                  href={`/proyek/${projectSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-brand underline-offset-2 hover:underline"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  {status === "PUBLISHED"
                    ? "Lihat halaman publik"
                    : "Pratinjau halaman publik (belum terbit)"}
                </Link>
              )}
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-ink">Pratinjau Kartu Katalog</h2>
              <span className="rounded-md bg-cream px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                Live
              </span>
            </div>

            <div className="mt-3 rounded-2xl border border-stone-200 bg-cream p-3.5">
              <div className="flex items-start gap-3">
                <AppLogo
                  src={draft.logo?.url}
                  appName={draft.appName || "Aplikasi"}
                  sizeClass="h-14 w-14"
                />
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center rounded-md border border-brand/20 bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand-dark">
                    {draft.groupNumber ? `Kelompok ${draft.groupNumber}` : "Kelompok —"}
                  </span>
                  <h3 className="mt-1 truncate text-base font-bold text-ink">
                    {draft.appName.trim() || "Nama aplikasi"}
                  </h3>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-600">
                    {previewMembers.length > 0
                      ? `${previewMembers.length} Anggota`
                      : "Karya Kelompok"}
                  </p>
                </div>
              </div>

              <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600">
                {draft.shortDescription.trim() ||
                  "Deskripsi singkat aplikasi akan tampil di sini."}
              </p>

              {previewFeatures.length > 0 && (
                <ul className="mt-2.5 space-y-1">
                  {previewFeatures.map((feature, index) => (
                    <li
                      key={`${feature}-${index}`}
                      className="flex items-start gap-1.5 text-[11px] text-slate-700"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-3 w-3 shrink-0 text-brand"
                        aria-hidden="true"
                      />
                      <span className="line-clamp-1">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {previewScreenshot ? (
                <img
                  src={previewScreenshot.url}
                  alt="Pratinjau screenshot pertama"
                  className="mt-3 aspect-video w-full rounded-lg border border-stone-200 object-cover"
                />
              ) : (
                <div className="mt-3 flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-stone-300 bg-white text-slate-400">
                  <ImagePlus className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[10px] font-semibold text-slate-600">
                    Screenshot pertama
                  </span>
                </div>
              )}

              <div className="mt-3 flex items-center gap-1.5 border-t border-stone-200 pt-2.5 text-[10px] font-semibold text-slate-600">
                <FileText className="h-3 w-3" aria-hidden="true" />
                {draft.documents.presentation.url &&
                draft.documents.skpl.url &&
                draft.documents.userGuide.url
                  ? "3 dokumen PDF siap"
                  : "Dokumen PDF belum lengkap"}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
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
          <span className="min-w-0 flex-1">{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
