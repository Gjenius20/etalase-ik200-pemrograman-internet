import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import { logEvent } from "@/lib/logger";
import { createPresignedUpload, buildPublicUrl } from "@/lib/s3";
import {
  contentDispositionFor,
  extensionFor,
  MEDIA_CACHE_CONTROL,
  UPLOAD_RULES,
  type UploadKind,
} from "@/lib/upload-constants";

export const runtime = "nodejs";

type PresignBody = {
  kind?: UploadKind;
  filename?: string;
  contentType?: string;
  size?: number;
};

const KINDS = Object.keys(UPLOAD_RULES) as UploadKind[];

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: "Sesi admin tidak valid. Silakan masuk kembali." },
      { status: 401 },
    );
  }

  let body: PresignBody;

  try {
    body = (await request.json()) as PresignBody;
  } catch {
    return NextResponse.json({ error: "Body request tidak valid." }, { status: 400 });
  }

  const kind = body.kind;
  const filename = typeof body.filename === "string" ? body.filename : "";
  const contentType =
    typeof body.contentType === "string" ? body.contentType : "";
  const size = typeof body.size === "number" ? body.size : 0;

  if (!kind || !KINDS.includes(kind)) {
    return NextResponse.json({ error: "Jenis upload tidak dikenal." }, { status: 400 });
  }

  const rule = UPLOAD_RULES[kind];

  if (!rule.mimeTypes.includes(contentType)) {
    return NextResponse.json(
      { error: `Format file tidak didukung. Gunakan ${rule.accept}.` },
      { status: 400 },
    );
  }

  if (size <= 0 || size > rule.maxBytes) {
    return NextResponse.json(
      { error: `Ukuran file harus lebih dari 0 dan maksimal ${rule.maxLabel}.` },
      { status: 400 },
    );
  }

  try {
    const extension = extensionFor(contentType, filename);
    const key = `projects/${randomUUID()}/${kind}/${randomUUID()}.${extension}`;
    const contentDisposition = contentDispositionFor(contentType);

    const [uploadUrl, publicUrl] = [
      await createPresignedUpload(
        key,
        contentType,
        contentDisposition,
        MEDIA_CACHE_CONTROL,
      ),
      buildPublicUrl(key),
    ];

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl,
      contentType,
      contentDisposition,
      cacheControl: MEDIA_CACHE_CONTROL,
      kind,
    });
  } catch (error) {
    logEvent("error", "presign_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });

    return NextResponse.json(
      {
        error:
          "Gagal menyiapkan upload. Periksa konfigurasi Neon Object Storage.",
      },
      { status: 500 },
    );
  }
}
