/**
 * Jalankan npm audit dan gagal hanya bila ada temuan BARU di luar allowlist.
 * Allowlist berisi temuan yang sudah di-triage di progress.md.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const allowlist = JSON.parse(readFileSync("security-audit-allowlist.json", "utf8")).allowed;
const rank = { low: 1, moderate: 2, high: 3, critical: 4 };

let raw;
try {
  raw = execSync("npm audit --json", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (error) {
  raw = error.stdout ?? "{}";
}

const report = JSON.parse(raw || "{}");
const entries = Object.entries(report.vulnerabilities ?? {});
const unexpected = [];

for (const [name, vulnerability] of entries) {
  const allowedSeverity = allowlist[name];
  if (!allowedSeverity) {
    unexpected.push(`${name} (${vulnerability.severity}) — tidak ada di allowlist`);
    continue;
  }
  if ((rank[vulnerability.severity] ?? 0) > (rank[allowedSeverity] ?? 0)) {
    unexpected.push(
      `${name}: ${vulnerability.severity} lebih tinggi dari allowlist ${allowedSeverity}`,
    );
  }
}

console.log(`npm audit: ${entries.length} temuan, ${Object.keys(allowlist).length} entry di allowlist.`);
if (unexpected.length > 0) {
  for (const item of unexpected) console.error(`  ${item}`);
  process.exit(1);
}
console.log("Semua temuan sesuai triage yang terdokumentasi.");
