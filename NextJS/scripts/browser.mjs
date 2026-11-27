import { chromium } from "playwright-core";

/**
 * Launcher bersama untuk script verifikasi.
 * - Windows: pakai Edge yang sudah terpasang.
 * - CI/Linux: pakai browser Playwright yang di-install via `npx playwright install`.
 * - Bisa dioverride lewat CHROME_PATH atau PLAYWRIGHT_CHANNEL.
 */
export async function launchBrowser() {
  if (process.env.CHROME_PATH) {
    return chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
  }
  if (process.env.PLAYWRIGHT_CHANNEL) {
    return chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL, headless: true });
  }
  if (process.platform === "win32") {
    return chromium.launch({
      executablePath:
        process.env.EDGE_PATH ??
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      headless: true,
    });
  }
  return chromium.launch({ headless: true });
}
