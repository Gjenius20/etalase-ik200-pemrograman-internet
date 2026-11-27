"use server";

import { Prisma, ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { projectToDraft } from "@/lib/admin-projects";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/logger";
import {
  collectDraftMediaKeys,
  collectProjectMediaKeys,
} from "@/lib/media";
import { deleteObjectsBestEffort, findMismatchedMedia } from "@/lib/s3";
import { generateUniqueSlug } from "@/lib/slug";
import {
  getPublishProblems,
  parseYouTubeId,
  projectDraftSchema,
  toFieldErrors,
  type ProjectDraft,
} from "@/lib/validation/project";

export type SaveIntent = "draft" | "publish";

export type SaveProjectResult =
  | { ok: true; id: string; slug: string; status: "DRAFT" | "PUBLISHED" }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string>;
    };

export type ActionResult = {
  ok: boolean;
  message?: string;
};

function revalidateProject(slug: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/proyek/${slug}`);
  revalidatePath("/proyek/[slug]", "page");
}

function normalizeDocuments(draft: ProjectDraft) {
  const normalize = (document: ProjectDraft["documents"]["presentation"]) => ({
    source: document.source,
    url: document.url.trim(),
    ...(document.key ? { key: document.key } : {}),
  });

  return {
    presentation: normalize(draft.documents.presentation),
    skpl: normalize(draft.documents.skpl),
    userGuide: normalize(draft.documents.userGuide),
  };
}

export async function saveProjectAction(input: {
  id?: string;
  draft: ProjectDraft;
  intent: SaveIntent;
}): Promise<SaveProjectResult> {
  await requireAdmin();

  const parsed = projectDraftSchema.safeParse(input.draft);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali isian form.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const draft = parsed.data as ProjectDraft;
  const isPublish = input.intent === "publish";

  const existing = input.id
    ? await prisma.project.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          slug: true,
          status: true,
          logoKey: true,
          screenshots: true,
          documents: true,
        },
      })
    : null;

  if (input.id && !existing) {
    return { ok: false, message: "Project tidak ditemukan." };
  }

  // Validasi kelengkapan penuh hanya saat transisi draft → terbit. Project yang
  // sudah terbit tetap boleh menyimpan perubahan bertahap tanpa ditarik dulu.
  if (isPublish && existing?.status !== ProjectStatus.PUBLISHED) {
    const problems = getPublishProblems(draft);

    if (problems.length > 0) {
      return {
        ok: false,
        message: `Project belum lengkap. ${problems.length} hal perlu dilengkapi sebelum terbit.`,
        fieldErrors: Object.fromEntries(
          problems.map((problem) => [problem.key, problem.label]),
        ),
      };
    }
  }

  const groupNumber = Number(draft.groupNumber);
  const groupConflict = await prisma.project.findFirst({
    where: {
      groupNumber,
      ...(input.id ? { NOT: { id: input.id } } : {}),
    },
    select: { id: true },
  });

  if (groupConflict) {
    return {
      ok: false,
      message: "Nomor kelompok sudah dipakai project lain.",
      fieldErrors: {
        groupNumber: "Nomor kelompok sudah dipakai project lain",
      },
    };
  }

  const memberRows = draft.members
    .map((member) => ({
      name: member.name.trim(),
      nim: member.nim.trim(),
    }))
    .filter((member) => member.name || member.nim);

  const incompleteMember = memberRows.some(
    (member) => !member.name || !member.nim,
  );

  if (incompleteMember) {
    return {
      ok: false,
      message: "Lengkapi nama dan NIM setiap anggota.",
      fieldErrors: { members: "Lengkapi nama dan NIM setiap anggota" },
    };
  }

  const nims = memberRows.map((member) => member.nim);
  if (new Set(nims).size !== nims.length) {
    return {
      ok: false,
      message: "NIM anggota tidak boleh sama.",
      fieldErrors: { members: "NIM anggota tidak boleh sama" },
    };
  }

  const slug =
    existing?.slug ?? (await generateUniqueSlug(draft.appName));

  const features = draft.features
    .map((feature) => feature.trim())
    .filter(Boolean);

  const screenshots = draft.screenshots
    .map((screenshot) => ({
      url: screenshot.url.trim(),
      ...(screenshot.key ? { key: screenshot.key } : {}),
      ...(screenshot.caption?.trim()
        ? { caption: screenshot.caption.trim() }
        : {}),
    }))
    .filter((screenshot) => screenshot.url);

  const members = memberRows.map((member, index) => ({
    name: member.name,
    nim: member.nim,
    order: index,
  }));

  const status =
    isPublish
      ? ProjectStatus.PUBLISHED
      : existing?.status ?? ProjectStatus.DRAFT;

  // Verifikasi isi objek di storage, bukan hanya MIME yang dikirim klien.
  // File yang tidak cocok dengan ekstensinya ditolak sebelum masuk ke DB.
  const mediaKeys = [
    ...(draft.logo?.key ? [draft.logo.key] : []),
    ...draft.screenshots
      .map((shot) => shot.key)
      .filter((key): key is string => Boolean(key)),
    ...Object.values(draft.documents)
      .map((document) => document.key)
      .filter((key): key is string => Boolean(key)),
  ];

  if (mediaKeys.length > 0) {
    try {
      const mismatched = await findMismatchedMedia(mediaKeys);
      if (mismatched.length > 0) {
        return {
          ok: false,
          message: "Isi file tidak sesuai dengan jenis media yang diunggah.",
          fieldErrors: { media: "Ganti file yang tidak sesuai." },
        };
      }
    } catch (error) {
      logEvent("error", "project_media_check_failed", {
        message: error instanceof Error ? error.message : "unknown",
      });
      return {
        ok: false,
        message: "Gagal memverifikasi media dari storage. Silakan coba lagi.",
      };
    }
  }

  const data = {
    groupNumber,
    appName: draft.appName.trim(),
    shortDescription: draft.shortDescription.trim(),
    fullDescription: draft.fullDescription.trim(),
    targetUser: draft.targetUser.trim(),
    targetCompetency: draft.targetCompetency.trim(),
    learningProblem: draft.learningProblem.trim(),
    learningSuccess: draft.learningSuccess.trim(),
    features,
    aiIntegration:
      draft.aiEnabled && draft.aiIntegration.trim()
        ? draft.aiIntegration.trim()
        : null,
    websiteUrl: draft.websiteUrl.trim(),
    githubUrl: draft.githubUrl.trim(),
    youtubeId: parseYouTubeId(draft.youtubeUrl) ?? "",
    logoUrl: draft.logo?.url.trim() ?? "",
    logoKey: draft.logo?.key ?? null,
    screenshots: screenshots as Prisma.InputJsonValue,
    documents: normalizeDocuments(draft) as Prisma.InputJsonValue,
    status,
  };

  try {
    let id: string;

    if (existing) {
      const updated = await prisma.project.update({
        where: { id: existing.id },
        data: {
          ...data,
          members: {
            deleteMany: {},
            create: members,
          },
        },
        select: { id: true },
      });

      id = updated.id;
    } else {
      const created = await prisma.project.create({
        data: {
          ...data,
          slug,
          members: {
            create: members,
          },
        },
        select: { id: true },
      });

      id = created.id;
    }

    revalidateProject(slug);

    if (existing) {
      const retainedKeys = new Set(collectDraftMediaKeys(draft));
      const removedKeys = collectProjectMediaKeys(existing).filter(
        (key) => !retainedKeys.has(key),
      );

      await deleteObjectsBestEffort(removedKeys);
    }

    return { ok: true, id, slug, status };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = String(error.meta?.target ?? "");

      if (target.includes("groupNumber")) {
        return {
          ok: false,
          message: "Nomor kelompok sudah dipakai project lain.",
          fieldErrors: {
            groupNumber: "Nomor kelompok sudah dipakai project lain",
          },
        };
      }

      if (target.includes("nim")) {
        return {
          ok: false,
          message: "NIM anggota tidak boleh sama dalam satu project.",
          fieldErrors: { members: "NIM anggota tidak boleh sama" },
        };
      }

      return {
        ok: false,
        message: "Slug sudah dipakai. Coba ubah nama aplikasi.",
      };
    }

    logEvent("error", "project_save_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });

    return {
      ok: false,
      message: "Gagal menyimpan project. Silakan coba lagi.",
    };
  }
}

export async function setProjectStatusAction(
  id: string,
  status: "DRAFT" | "PUBLISHED",
): Promise<ActionResult> {
  await requireAdmin();

  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: true },
  });

  if (!project) {
    return { ok: false, message: "Project tidak ditemukan." };
  }

  if (status === "PUBLISHED") {
    const problems = getPublishProblems(projectToDraft(project));

    if (problems.length > 0) {
      return {
        ok: false,
        message: `Project belum lengkap (${problems.length} hal). Lengkapi lewat form edit sebelum menerbitkan.`,
      };
    }
  }

  await prisma.project.update({
    where: { id },
    data: { status: status === "PUBLISHED" ? ProjectStatus.PUBLISHED : ProjectStatus.DRAFT },
  });

  revalidateProject(project.slug);

  return { ok: true };
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      logoKey: true,
      screenshots: true,
      documents: true,
    },
  });

  if (!project) {
    return { ok: false, message: "Project tidak ditemukan." };
  }

  const mediaKeys = collectProjectMediaKeys(project);

  await prisma.project.delete({ where: { id } });

  revalidateProject(project.slug);
  await deleteObjectsBestEffort(mediaKeys);

  return { ok: true };
}
