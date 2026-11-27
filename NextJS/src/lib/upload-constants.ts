export type UploadKind = "logo" | "screenshot" | "pdf";

/** Kunci media selalu unik (UUID), jadi aman di-cache permanen. */
export const MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";

/** PDF selalu diunduh; gambar ditampilkan inline. */
export function contentDispositionFor(contentType: string): string {
  return contentType === "application/pdf" ? "attachment" : "inline";
}

export type UploadRule = {
  maxBytes: number;
  maxLabel: string;
  mimeTypes: string[];
  accept: string;
  label: string;
  helper: string;
};

const MB = 1024 * 1024;

export const UPLOAD_RULES: Record<UploadKind, UploadRule> = {
  logo: {
    maxBytes: 2 * MB,
    maxLabel: "2 MB",
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    accept: "image/png,image/jpeg,image/webp",
    label: "Logo aplikasi",
    helper: "PNG, JPG, atau WebP · maks 2 MB · disarankan berbentuk persegi",
  },
  screenshot: {
    maxBytes: 3 * MB,
    maxLabel: "3 MB",
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    accept: "image/png,image/jpeg,image/webp",
    label: "Screenshot aplikasi",
    helper:
      "PNG, JPG, atau WebP · maks 3 MB per gambar · ketentuan menyarankan .png",
  },
  pdf: {
    maxBytes: 20 * MB,
    maxLabel: "20 MB",
    mimeTypes: ["application/pdf"],
    accept: "application/pdf",
    label: "Dokumen PDF",
    helper: "Hanya file PDF · maks 20 MB",
  },
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}

export function validateFile(file: File, kind: UploadKind): string | null {
  const rule = UPLOAD_RULES[kind];

  if (!rule.mimeTypes.includes(file.type)) {
    return `Format file tidak didukung. Gunakan ${rule.accept.replaceAll(",", ", ")}.`;
  }

  if (file.size > rule.maxBytes) {
    return `Ukuran file melebihi batas ${rule.maxLabel}.`;
  }

  return null;
}

export function extensionFor(contentType: string, filename: string): string {
  const fromName = filename.split(".").pop()?.toLowerCase() ?? "";

  if (contentType === "image/png") return "png";
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/webp") return "webp";
  if (contentType === "application/pdf") return "pdf";

  return fromName.replace(/[^a-z0-9]/g, "") || "bin";
}
