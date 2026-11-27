import "server-only";

import type { Prisma, Project } from "@prisma/client";

import type {
  DraftDocument,
  DraftScreenshot,
  ProjectDraft,
} from "@/lib/validation/project";

function keyFromJsonValue(value: Prisma.JsonValue | undefined): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const key = (value as Record<string, Prisma.JsonValue>).key;
  return typeof key === "string" && key ? key : null;
}

/**
 * Ambil semua object key Neon Storage milik satu project.
 * Dipakai untuk membersihkan media lama setelah update/hapus.
 */
export function collectProjectMediaKeys(
  project: Pick<Project, "logoKey" | "screenshots" | "documents">,
): string[] {
  const keys: string[] = [];

  if (project.logoKey) keys.push(project.logoKey);

  if (Array.isArray(project.screenshots)) {
    for (const item of project.screenshots) {
      const key = keyFromJsonValue(item);
      if (key) keys.push(key);
    }
  }

  if (
    project.documents &&
    typeof project.documents === "object" &&
    !Array.isArray(project.documents)
  ) {
    for (const value of Object.values(
      project.documents as Record<string, Prisma.JsonValue>,
    )) {
      const key = keyFromJsonValue(value);
      if (key) keys.push(key);
    }
  }

  return keys;
}

export function collectDraftMediaKeys(draft: ProjectDraft): string[] {
  const keys: string[] = [];

  if (draft.logo?.key) keys.push(draft.logo.key);

  for (const screenshot of draft.screenshots) {
    if (screenshot.key) keys.push(screenshot.key);
  }

  for (const document of Object.values(draft.documents)) {
    if (document.key) keys.push(document.key);
  }

  return keys;
}

/**
 * Versi draft dari `parseScreenshots`: mempertahankan `key` agar media lama
 * tidak dianggap orphan saat project disimpan ulang tanpa mengganti gambar.
 */
export function parseScreenshotDrafts(
  value: Prisma.JsonValue,
): DraftScreenshot[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): DraftScreenshot[] => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return [];
    }

    const record = item as Record<string, unknown>;
    if (typeof record.url !== "string" || !record.url) return [];

    const screenshot: DraftScreenshot = { url: record.url };
    if (typeof record.key === "string" && record.key) {
      screenshot.key = record.key;
    }
    if (typeof record.caption === "string" && record.caption) {
      screenshot.caption = record.caption;
    }

    return [screenshot];
  });
}

export function parseDocumentDraft(value: unknown): DraftDocument {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { source: "link", url: "" };
  }

  const record = value as Record<string, unknown>;
  const url = typeof record.url === "string" ? record.url : "";
  const source = record.source === "upload" ? "upload" : "link";
  const key = typeof record.key === "string" && record.key ? record.key : undefined;

  return { source, url, ...(key ? { key } : {}) };
}
