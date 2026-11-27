/**
 * Audit aksesibilitas (axe-core) pada halaman publik dan admin.
 * Jalankan: node scripts/verify-a11y.mjs
 */
import { readFileSync } from "node:fs";

import AxeBuilder from "@axe-core/playwright";
import { launchBrowser } from "./browser.mjs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const at = line.indexOf("=");
  if (at > 0 && !line.trim().startsWith("#")) {
    let v = line.slice(at + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[line.slice(0, at).trim()] = v;
  }
}

const browser = await launchBrowser();
const context = await browser.newContext({ baseURL: "http://localhost:3000" });
const page = await context.newPage();
const targets = [
  { path: "/", name: "katalog publik" },
  { path: "/proyek/algoblock-sd", name: "detail project" },
  { path: "/admin/login", name: "login admin" },
];

try {
  await page.goto("/admin/login");
  await page.getByLabel("Password Admin").fill(env.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Masuk ke Panel Admin" }).click();
  await page.waitForURL("**/admin", { timeout: 20000 });
  targets.push(
    { path: "/admin", name: "dashboard admin" },
    { path: "/admin/projects/new", name: "form project" },
  );

  let total = 0;
  for (const target of targets) {
    await page.goto(target.path);
    const builder = new AxeBuilder({ page });
    // Iframe YouTube membawa DOM pihak ketiga yang tidak bisa kita ubah.
    if (target.path.startsWith("/proyek/")) builder.exclude("iframe");
    const results = await builder.analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );
    total += serious.length;
    console.log(`${target.name} (${target.path}): ${serious.length} temuan serius/kritis`);
    for (const violation of serious) {
      console.log(`  [${violation.impact}] ${violation.id}: ${violation.help}`);
      for (const node of violation.nodes.slice(0, 3)) {
        console.log(`    ${node.target.join(" ")}`);
        console.log(`    html: ${node.html.slice(0, 300)}`);
        console.log(`    ${(node.failureSummary ?? "").replace(/\n/g, " | ").slice(0, 300)}`);
      }
    }
    if (serious.length === 0 && results.violations.length > 0) {
      console.log(`  (${results.violations.length} temuan minor)`);
    }
  }

  console.log(`Total serius/kritis: ${total}`);
  if (total > 0) process.exitCode = 1;
} finally {
  await browser.close();
}
