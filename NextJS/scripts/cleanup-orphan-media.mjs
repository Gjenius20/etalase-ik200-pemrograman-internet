/**
 * Bersihkan objek Neon Object Storage yang tidak lagi direferensikan project.
 *
 * Default: DRY RUN — hanya mencetak yang akan dihapus.
 *   npm run media:cleanup
 *   npm run media:cleanup:apply     # benar-benar menghapus
 *
 * Ambang umur default 24 jam (ORPHAN_MAX_AGE_HOURS) agar upload yang sedang
 * dikerjakan admin tidak ikut terhapus.
 */
import { readFileSync } from "node:fs";

import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const at = line.indexOf("=");
  if (at > 0 && !line.trim().startsWith("#")) {
    let value = line.slice(at + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    process.env[line.slice(0, at).trim()] = value;
  }
}

const required = [
  "AWS_REGION",
  "AWS_ENDPOINT_URL_S3",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "NEON_STORAGE_BUCKET",
];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length > 0) {
  console.error(`Env belum lengkap: ${missing.join(", ")}`);
  process.exit(1);
}

const apply = process.argv.includes("--apply");
const prefixIndex = process.argv.indexOf("--prefix");
const prefix = prefixIndex >= 0 ? process.argv[prefixIndex + 1] : "projects/";
const maxAgeHours = Number(process.env.ORPHAN_MAX_AGE_HOURS ?? "24");
const maxAgeMs = (Number.isFinite(maxAgeHours) ? maxAgeHours : 24) * 3600_000;

const prisma = new PrismaClient();
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
});

try {
  const projects = await prisma.project.findMany({
    select: { logoKey: true, screenshots: true, documents: true },
  });
  const referenced = new Set();
  for (const project of projects) {
    if (project.logoKey) referenced.add(project.logoKey);
    for (const shot of (project.screenshots ?? [])) {
      if (shot?.key) referenced.add(shot.key);
    }
    for (const document of Object.values(project.documents ?? {})) {
      if (document?.key) referenced.add(document.key);
    }
  }

  const orphans = [];
  let token;
  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.NEON_STORAGE_BUCKET,
        Prefix: prefix,
        ContinuationToken: token,
      }),
    );
    for (const object of page.Contents ?? []) {
      if (!object.Key || referenced.has(object.Key)) continue;
      const age = Date.now() - (object.LastModified?.getTime() ?? Date.now());
      if (age < maxAgeMs) continue;
      orphans.push({ Key: object.Key, Size: object.Size ?? 0, ageHours: Math.round(age / 3600_000) });
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);

  console.log(`Prefix: ${prefix}`);
  console.log(`Direferensikan DB: ${referenced.size} objek`);
  console.log(`Kandidat yatim (lebih tua dari ${maxAgeHours} jam): ${orphans.length}`);
  for (const object of orphans.slice(0, 20)) {
    console.log(`  ${object.Key} (${object.Size} byte, ${object.ageHours} jam)`);
  }
  if (orphans.length > 20) console.log(`  ... dan ${orphans.length - 20} objek lagi`);

  if (!apply) {
    console.log("DRY RUN — tidak ada yang dihapus. Gunakan --apply untuk menghapus.");
  } else if (orphans.length > 0) {
    for (let index = 0; index < orphans.length; index += 1000) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: process.env.NEON_STORAGE_BUCKET,
          Delete: {
            Objects: orphans.slice(index, index + 1000).map(({ Key }) => ({ Key })),
          },
        }),
      );
    }
    console.log(`Menghapus ${orphans.length} objek yatim.`);
  }
} finally {
  await prisma.$disconnect();
}
