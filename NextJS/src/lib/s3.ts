import "server-only";

import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { logEvent } from "@/lib/logger";

type StorageConfig = {
  region: string;
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
};

let cachedClient: S3Client | null = null;
let cachedSignature = "";

export function getStorageConfig(): StorageConfig {
  const region = process.env.AWS_REGION;
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const bucket = process.env.NEON_STORAGE_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Konfigurasi Neon Object Storage belum lengkap. Periksa AWS_REGION, AWS_ENDPOINT_URL_S3, NEON_STORAGE_BUCKET, AWS_ACCESS_KEY_ID, dan AWS_SECRET_ACCESS_KEY.",
    );
  }

  const publicBaseUrl = (
    process.env.NEON_STORAGE_PUBLIC_BASE_URL || `${endpoint}/${bucket}`
  ).replace(/\/+$/, "");

  return {
    region,
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl,
  };
}

export function isStorageConfigured(): boolean {
  try {
    getStorageConfig();
    return true;
  } catch {
    return false;
  }
}

function getClient(): S3Client {
  const config = getStorageConfig();
  const signature = `${config.endpoint}|${config.region}|${config.accessKeyId}`;

  if (cachedClient && cachedSignature === signature) {
    return cachedClient;
  }

  cachedClient = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
    // Neon membutuhkan ini agar presigned PUT dengan body nyata tidak ditolak.
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
  cachedSignature = signature;

  return cachedClient;
}

/** Dipakai endpoint /api/health; tidak mengembalikan URL atau kredensial. */
export async function checkStorageConnection(): Promise<boolean> {
  try {
    const { bucket } = getStorageConfig();
    await getClient().send(new HeadBucketCommand({ Bucket: bucket }));
    return true;
  } catch (error) {
    logEvent("error", "storage_health_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return false;
  }
}

function encodeKey(key: string): string {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function buildPublicUrl(key: string): string {
  const { publicBaseUrl } = getStorageConfig();
  return `${publicBaseUrl}/${encodeKey(key)}`;
}

export async function createPresignedUpload(
  key: string,
  contentType: string,
  contentDisposition: string,
  cacheControl: string,
): Promise<string> {
  const { bucket } = getStorageConfig();

  // Header ini ikut ditandatangani, jadi browser harus mengirimnya persis
  // sama seperti yang dikembalikan endpoint presign.
  return getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ContentDisposition: contentDisposition,
      CacheControl: cacheControl,
    }),
    { expiresIn: 300 },
  );
}

const MEDIA_SIGNATURES: Array<{
  mime: string;
  matches: (bytes: Uint8Array) => boolean;
}> = [
  {
    mime: "image/png",
    matches: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    mime: "image/jpeg",
    matches: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/webp",
    matches: (b) =>
      b.length >= 12 &&
      String.fromCharCode(...b.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...b.slice(8, 12)) === "WEBP",
  },
  {
    mime: "application/pdf",
    matches: (b) =>
      b.length >= 5 &&
      b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 &&
      b[3] === 0x46 && b[4] === 0x2d, // "%PDF-"
  },
];

/**
 * Periksa byte awal objek di storage terhadap MIME yang diharapkan dari
 * ekstensi kunci. Mengembalikan kunci yang tidak cocok (atau gagal dibaca).
 * Dipanggil sebelum data disimpan ke DB, jadi bukan sekadar validasi klien.
 */
export async function findMismatchedMedia(keys: string[]): Promise<string[]> {
  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
  if (uniqueKeys.length === 0) return [];

  const { bucket } = getStorageConfig();
  const mismatched: string[] = [];

  for (const key of uniqueKeys) {
    const extension = key.split(".").pop()?.toLowerCase() ?? "";
    const expected =
      extension === "png"
        ? "image/png"
        : extension === "jpg" || extension === "jpeg"
          ? "image/jpeg"
          : extension === "webp"
            ? "image/webp"
            : extension === "pdf"
              ? "application/pdf"
              : null;
    const signature = MEDIA_SIGNATURES.find((item) => item.mime === expected);

    try {
      const response = await getClient().send(
        new GetObjectCommand({ Bucket: bucket, Key: key, Range: "bytes=0-15" }),
      );
      const bytes = new Uint8Array(await response.Body!.transformToByteArray());
      if (!signature || !signature.matches(bytes)) mismatched.push(key);
    } catch (error) {
      logEvent("error", "media_check_failed", {
        key,
        message: error instanceof Error ? error.message : "unknown",
      });
      mismatched.push(key);
    }
  }

  return mismatched;
}

/** Best-effort: kegagalan menghapus objek tidak boleh menggagalkan simpan/hapus. */
export async function deleteObjectsBestEffort(keys: string[]): Promise<void> {
  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
  if (uniqueKeys.length === 0) return;

  try {
    const { bucket } = getStorageConfig();

    await getClient().send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: uniqueKeys.map((key) => ({ Key: key })),
        },
      }),
    );
  } catch (error) {
    logEvent("warn", "media_delete_failed", {
      count: uniqueKeys.length,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}
