/**
 * Verifikasi alur admin lewat browser sungguhan (Edge/Chrome via playwright-core).
 *
 * Prasyarat: server berjalan di http://localhost:3000 dan .env.local berisi
 * ADMIN_PASSWORD. Jalankan: node scripts/verify-admin-ui.mjs
 */
import { readFileSync } from "node:fs";

import { PrismaClient } from "@prisma/client";
import { launchBrowser } from "./browser.mjs";

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
  process.env[key] = value;
}

// Bersihkan sisa draft dari run sebelumnya agar nomor kelompok 99 bebas.
const prisma = new PrismaClient();
await prisma.project.deleteMany({
  where: { appName: { startsWith: "E2E Draft" } },
});
await prisma.$disconnect();

const base = process.env.APP_URL ?? "http://localhost:3000";
const browser = await launchBrowser();
const page = await browser.newPage({ baseURL: base });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

const testName = `E2E Draft ${Date.now()}`;
const goDashboard = async () => {
  await page.getByRole("link", { name: "Dashboard" }).first().click();
  await page.waitForURL("**/admin", { timeout: 20000 });
};

try {
  // 1. Login form: password salah harus ditolak.
  await page.goto("/admin/login");
  await page.getByLabel("Password Admin").fill("password-yang-salah");
  await page.getByRole("button", { name: "Masuk ke Panel Admin" }).click();
  const alertText = "Password salah. Silakan coba lagi.";
  await page.getByText(alertText).waitFor({ timeout: 15000 });
  console.log(`Login password salah -> error: "${alertText}"`);
  console.log(`  tetap di halaman login: ${page.url().endsWith("/admin/login")}`);

  // 2. Login form: password dari env harus masuk ke dashboard.
  await page.getByLabel("Password Admin").fill(env.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Masuk ke Panel Admin" }).click();
  await page.waitForURL("**/admin", { timeout: 20000 });
  console.log(`Login password benar -> ${page.url()}`);

  // 3. CREATE draft lewat form.
  await page.getByRole("link", { name: "Tambah Project" }).first().click();
  await page.waitForURL("**/admin/projects/new", { timeout: 20000 });
  await page.locator("#groupNumber").fill("99");
  await page.locator("#appName").fill(testName);
  await page.getByRole("button", { name: "Simpan sebagai Draft" }).click();
  await page.waitForURL(/\/admin\/projects\/[^?]+\?created=1/, { timeout: 20000 });
  console.log(`CREATE draft -> ${page.url().split("/").pop()}`);

  // 4. EDIT draft dari dashboard.
  await goDashboard();
  console.log(`  muncul di dashboard: ${await page.getByText(testName, { exact: true }).count() > 0}`);
  await page.getByRole("link", { name: `Edit ${testName}` }).click();
  await page.waitForURL(/\/admin\/projects\/[^?]+$/, { timeout: 20000 });
  const renamed = `${testName} Diubah`;
  await page.locator("#appName").fill(renamed);
  await page.getByRole("button", { name: "Simpan sebagai Draft" }).click();
  await page.getByText("Tersimpan ke server").waitFor({ timeout: 20000 });
  console.log(`EDIT draft -> tersimpan: ${await page.getByText("Tersimpan ke server").count() > 0}`);

  // 5. Unpublish + publish project seed lewat dashboard.
  await goDashboard();
  console.log(`  nama baru muncul: ${await page.getByText(renamed, { exact: true }).count() > 0}`);
  await page.getByRole("button", { name: "Tarik AlgoBlock SD menjadi draft" }).click();
  await page.getByRole("button", { name: "Terbitkan AlgoBlock SD" }).waitFor({ timeout: 20000 });
  console.log("UNPUBLISH AlgoBlock SD -> status berubah menjadi draft");
  await page.getByRole("button", { name: "Terbitkan AlgoBlock SD" }).click();
  await page.getByRole("button", { name: "Tarik AlgoBlock SD menjadi draft" }).waitFor({ timeout: 20000 });
  console.log("PUBLISH AlgoBlock SD -> status kembali terbit");

  // 6. DELETE draft hasil test.
  await page.getByRole("button", { name: `Hapus ${renamed}` }).click();
  await page.getByRole("button", { name: "Hapus Permanen" }).click();
  await page
    .getByRole("button", { name: `Hapus ${renamed}` })
    .waitFor({ state: "detached", timeout: 20000 });
  console.log(`DELETE draft -> baris hilang dari dashboard: true`);

  // 7. Logout.
  await page.getByRole("button", { name: "Keluar", exact: true }).click();
  await page.waitForURL("**/admin/login", { timeout: 20000 });
  console.log(`Logout -> ${page.url()}`);

  console.log(`Page errors: ${pageErrors.length === 0 ? "none" : pageErrors.join(" | ")}`);
  if (pageErrors.length > 0) process.exitCode = 1;
} finally {
  await browser.close();
}
