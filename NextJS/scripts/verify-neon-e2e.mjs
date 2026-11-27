/**
 * Verifikasi end-to-end untuk Object Storage yang sudah di-wire ke aplikasi.
 *
 * Jalankan saat server produksi berjalan di http://localhost:3000:
 *   node scripts/verify-neon-e2e.mjs
 *
 * Alur: JWT admin -> POST /api/admin/uploads/presign -> PUT langsung ke Neon
 * -> GET URL publik -> hapus objek uji.
 */
import { readFileSync } from "node:fs";

import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SignJWT } from "jose";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const at = trimmed.indexOf("=");
  if (at === -1) continue;
  const key = trimmed.slice(0, at).trim();
  let value = trimmed.slice(at + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

const token = await new SignJWT({ role: "admin" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("1h")
  .sign(new TextEncoder().encode(env.AUTH_SECRET));

// PNG 1x1 transparan, sama seperti yang dikirim browser lewat XHR.
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const base = process.env.APP_URL ?? "http://localhost:3000";
const presignResponse = await fetch(`${base}/api/admin/uploads/presign`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Cookie: `ik200_admin=${token}`,
  },
  body: JSON.stringify({
    kind: "screenshot",
    filename: "neon-e2e.png",
    contentType: "image/png",
    size: png.length,
  }),
});
const presign = await presignResponse.json();
console.log(`POST /api/admin/uploads/presign -> ${presignResponse.status}`);
if (!presignResponse.ok) throw new Error(JSON.stringify(presign));
console.log(`  key: ${presign.key}`);
console.log(`  publicUrl: ${presign.publicUrl}`);

const put = await fetch(presign.uploadUrl, {
  method: "PUT",
  headers: {
    "Content-Type": presign.contentType,
    "Content-Disposition": presign.contentDisposition,
    "Cache-Control": presign.cacheControl,
  },
  body: png,
});
console.log(`PUT presigned URL -> ${put.status}`);
if (!put.ok) throw new Error(await put.text());

const get = await fetch(presign.publicUrl);
const downloaded = Buffer.from(await get.arrayBuffer());
console.log(`GET public URL -> ${get.status}, ${downloaded.length} bytes`);
if (!get.ok || !downloaded.equals(png)) {
  throw new Error("Objek yang diunduh tidak sama dengan yang diunggah.");
}
console.log("  byte-for-byte match: true");

const head = await fetch(presign.publicUrl, { method: "HEAD" });
console.log(
  `HEAD -> disposition: ${head.headers.get("content-disposition")}, cache: ${head.headers.get("cache-control")}`,
);
if (
  head.headers.get("content-disposition") !== presign.contentDisposition ||
  head.headers.get("cache-control") !== presign.cacheControl
) {
  throw new Error("Header media tidak tersimpan sesuai yang ditandatangani.");
}

const s3 = new S3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
});
await s3.send(
  new DeleteObjectCommand({ Bucket: env.NEON_STORAGE_BUCKET, Key: presign.key }),
);
console.log(`Cleanup DeleteObject -> ok (${presign.key})`);
