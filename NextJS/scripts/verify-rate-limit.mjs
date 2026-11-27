/**
 * Verifikasi rate limit login yang tersimpan di Postgres.
 *
 * Memakai IP uji lewat header x-forwarded-for supaya IP asli tidak ikut
 * terkenal limit. Prasyarat: server berjalan di http://localhost:3000.
 */
import { randomInt } from "node:crypto";
import { readFileSync } from "node:fs";

import { PrismaClient } from "@prisma/client";
import { launchBrowser } from "./browser.mjs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const at = line.indexOf("=");
  if (at > 0 && !line.trim().startsWith("#")) {
    let v = line.slice(at + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    process.env[line.slice(0, at).trim()] = v;
  }
}

const ip = `203.0.113.${randomInt(2, 250)}`;
const key = `login:${ip}`;
const prisma = new PrismaClient();

// Bersihkan kemungkinan sisa dari run sebelumnya.
await prisma.loginAttempt.deleteMany({ where: { key } });

const browser = await launchBrowser();
const context = await browser.newContext({
  baseURL: process.env.APP_URL ?? "http://localhost:3000",
  extraHTTPHeaders: { "x-forwarded-for": ip },
});
const page = await context.newPage();

try {
  const messages = [];
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    await page.goto("/admin/login");
    await page.getByLabel("Password Admin").fill("password-salah");
    await page.getByRole("button", { name: "Masuk ke Panel Admin" }).click();
    await page.waitForFunction(
      () =>
        document.body.innerText.includes("Password salah") ||
        document.body.innerText.includes("Terlalu banyak percobaan gagal"),
      { timeout: 20000 },
    );
    const alerts = (await page.locator('[role="alert"]').allInnerTexts()).filter(Boolean);
    messages.push(alerts.at(-1) ?? "(tidak ada pesan)");
  }

  messages.forEach((message, index) => {
    console.log(`percobaan ${index + 1}: ${message}`);
  });

  const row = await prisma.loginAttempt.findUnique({ where: { key } });
  console.log(`baris DB -> count=${row?.count ?? 0}, windowEnd=${row?.windowEnd.toISOString() ?? "-"}`);

  const firstFiveOk = messages
    .slice(0, 5)
    .every((m) => m.includes("Password salah"));
  const sixthBlocked = messages[5]?.includes("Terlalu banyak percobaan gagal");
  console.log(`5 percobaan pertama ditolak normal: ${firstFiveOk}`);
  console.log(`percobaan ke-6 diblokir rate limit: ${Boolean(sixthBlocked)}`);
  console.log(`hitungan tersimpan di DB lintas request: ${row?.count === 5}`);

  if (!firstFiveOk || !sixthBlocked || row?.count !== 5) process.exitCode = 1;
} finally {
  await prisma.loginAttempt.deleteMany({ where: { key } });
  await prisma.$disconnect();
  await browser.close();
}
