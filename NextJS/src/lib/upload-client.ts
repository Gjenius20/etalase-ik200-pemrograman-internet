import {
  UPLOAD_RULES,
  validateFile,
  type UploadKind,
} from "@/lib/upload-constants";

export type UploadedMedia = {
  url: string;
  key: string;
};

type PresignResponse = {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  contentType: string;
  contentDisposition: string;
  cacheControl: string;
};

/**
 * Upload langsung dari browser ke Neon Object Storage memakai presigned PUT.
 * `XMLHttpRequest` dipakai agar progres upload bisa ditampilkan.
 */
export async function uploadFile(
  file: File,
  kind: UploadKind,
  onProgress?: (percent: number) => void,
): Promise<UploadedMedia> {
  const localError = validateFile(file, kind);
  if (localError) throw new Error(localError);

  const contentType =
    file.type || (kind === "pdf" ? "application/pdf" : "application/octet-stream");

  const presignResponse = await fetch("/api/admin/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      filename: file.name,
      contentType,
      size: file.size,
    }),
  });

  if (!presignResponse.ok) {
    const payload = (await presignResponse
      .json()
      .catch(() => null)) as { error?: string } | null;
    throw new Error(
      payload?.error ?? `Gagal menyiapkan upload (${presignResponse.status}).`,
    );
  }

  const presign = (await presignResponse.json()) as PresignResponse;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", presign.uploadUrl, true);
    // Header ini ikut ditandatangani di server; harus persis sama.
    xhr.setRequestHeader("Content-Type", presign.contentType);
    xhr.setRequestHeader("Content-Disposition", presign.contentDisposition);
    xhr.setRequestHeader("Cache-Control", presign.cacheControl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(
          new Error(
            `Upload ke storage gagal (${xhr.status}). Periksa CORS bucket Neon.`,
          ),
        );
      }
    };

    xhr.onerror = () =>
      reject(
        new Error(
          "Upload ke storage gagal. Periksa koneksi dan CORS bucket Neon.",
        ),
      );

    xhr.send(file);
  });

  return { url: presign.publicUrl, key: presign.key };
}

export { UPLOAD_RULES };
