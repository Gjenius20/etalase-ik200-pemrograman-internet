/**
 * Verifikasi validasi isi file di server.
 *
 * Mengunggah objek .png yang isinya teks, lalu membuat draft yang
 * mereferensikan key tersebut, lalu mencoba menyimpan lewat form admin.
 * Server harus menolak dengan pesan "Isi file tidak sesuai ...".
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import { PutObjectCommand, S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { launchBrowser } from "./browser.mjs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const at = line.indexOf("=");
  if (at > 0 && !line.trim().startsWith("#")) {
    let v = line.slice(at + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[line.slice(0, at).trim()] = v;
    process.env[line.slice(0, at).trim()] = v;
  }
}

const key = `projects/e2e-${randomUUID()}/fake.png`;
const publicUrl = `${env.AWS_ENDPOINT_URL_S3}/${env.NEON_STORAGE_BUCKET}/${key}`;
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
const prisma = new PrismaClient();
let projectId;

try {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.NEON_STORAGE_BUCKET,
      Key: key,
      Body: Buffer.from("ini bukan file PNG, hanya teks biasa"),
      ContentType: "image/png",
    }),
  );

  const project = await prisma.project.create({
    data: {
      slug: `e2e-fake-media-${Date.now()}`,
      groupNumber: 97,
      appName: "E2E Fake Media",
      shortDescription: "Project uji validasi isi media di server",
      fullDescription: "Project uji untuk memastikan file yang isinya tidak sesuai ditolak sebelum disimpan ke database.",
      targetUser: "Mahasiswa uji",
      targetCompetency: "Keamanan upload",
      learningProblem: "File palsu disamarkan sebagai PNG",
      learningSuccess: "File ditolak oleh server",
      features: ["Fitur uji"],
      websiteUrl: "https://example.com",
      githubUrl: "https://github.com/example/e2e",
      youtubeId: "dQw4w9WgXcQ",
      logoUrl: publicUrl,
      screenshots: [{ url: publicUrl, key }],
      documents: {
        presentation: { source: "link", url: "https://example.com/a.pdf" },
        skpl: { source: "link", url: "https://example.com/b.pdf" },
        userGuide: { source: "link", url: "https://example.com/c.pdf" },
      },
      status: "DRAFT",
      members: { create: [{ name: "Uji Coba", nim: "1234567", order: 0 }] },
    },
    select: { id: true },
  });
  projectId = project.id;

  const browser = await launchBrowser();
  const page = await browser.newPage({ baseURL: "http://localhost:3000" });
  await page.goto("/admin/login");
  await page.getByLabel("Password Admin").fill(env.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Masuk ke Panel Admin" }).click();
  await page.waitForURL("**/admin", { timeout: 20000 });
  await page.goto(`/admin/projects/${project.id}`);

  await page.getByRole("button", { name: "Simpan sebagai Draft" }).click();
  await page.getByText("Isi file tidak sesuai dengan jenis media yang diunggah.").waitFor({ timeout: 20000 });
  console.log("Simpan draft dengan file .png palsu -> DITOLAK oleh server");

  const stillDraft = await prisma.project.findUnique({
    where: { id: project.id },
    select: { appName: true, status: true },
  });
  console.log(`Data di DB tidak berubah: ${stillDraft?.appName === "E2E Fake Media"}`);
  await browser.close();
} finally {
  if (projectId) await prisma.project.delete({ where: { id: projectId } }).catch(() => {});
  await s3.send(new DeleteObjectCommand({ Bucket: env.NEON_STORAGE_BUCKET, Key: key })).catch(() => {});
  await prisma.$disconnect();
}
