/**
 * Terapkan konfigurasi CORS ke bucket Neon Object Storage.
 *
 * Jalankan setelah .env.local berisi kredensial storage:
 *   npm run storage:cors
 *
 * Origin tambahan (mis. domain produksi) lewat env CORS_ORIGINS,
 * dipisahkan koma:
 *   CORS_ORIGINS="https://etalase.vercel.app" npm run storage:cors
 */
import { existsSync, readFileSync } from "node:fs";

import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Muat `.env.local` (gaya Next.js) lalu `.env` sebagai fallback.
 * Variabel yang sudah ada di process.env tidak ditimpa, sehingga override dari
 * shell (mis. CORS_ORIGINS) tetap berlaku seperti di Next.js.
 */
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;

  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim().replace(/^export\s+/, "");
    if (!key || process.env[key] !== undefined) continue;

    let value = trimmed.slice(separator + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted) value = value.slice(1, -1);

    process.env[key] = value;
  }
}

const REQUIRED = [
  "AWS_REGION",
  "AWS_ENDPOINT_URL_S3",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "NEON_STORAGE_BUCKET",
];

const missing = REQUIRED.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  console.error(
    `Variabel lingkungan belum lengkap: ${missing.join(", ")}\n` +
      "Isi dulu .env.local (lihat .env.example), lalu jalankan ulang.",
  );
  process.exit(1);
}

const defaults = ["http://localhost:3000", "http://127.0.0.1:3000"];
const extra = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaults, ...extra]));

const client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
});

await client.send(
  new PutBucketCorsCommand({
    Bucket: process.env.NEON_STORAGE_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: allowedOrigins,
          AllowedMethods: ["PUT", "GET", "HEAD"],
          AllowedHeaders: ["*"],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }),
);

console.log(
  `CORS bucket "${process.env.NEON_STORAGE_BUCKET}" diperbarui untuk:\n` +
    allowedOrigins.map((origin) => `  - ${origin}`).join("\n"),
);
