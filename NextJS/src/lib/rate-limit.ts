import "server-only";

import { prisma } from "@/lib/db";

/**
 * Rate limit login yang dibagi antar instance.
 *
 * Tabel LoginAttempt dipakai supaya hitungan tidak hilang saat Vercel membuat
 * instance baru / cold start. Hanya percobaan GAGAL yang dihitung; login sukses
 * menghapus barisnya. Jendela 15 menit dihitung dari kegagalan pertama.
 */
const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function loginRateLimitKey(ip: string): string {
  // Batasi panjang agar kunci tidak dipakai sebagai vektor penyimpanan besar.
  return `login:${ip.slice(0, 128)}`;
}

export async function checkLoginRateLimit(
  key: string,
  limit = DEFAULT_LIMIT,
): Promise<RateLimitResult> {
  const row = await prisma.loginAttempt.findUnique({ where: { key } });
  const now = Date.now();

  if (!row || row.windowEnd.getTime() <= now || row.count < limit) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((row.windowEnd.getTime() - now) / 1000),
    ),
  };
}

export async function recordLoginFailure(
  key: string,
  windowMs = DEFAULT_WINDOW_MS,
): Promise<void> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMs);

  // Satu statement atomik: mulai jendela baru bila yang lama sudah lewat,
  // jika tidak, tambah hitungan tanpa menggeser jendela.
  await prisma.$executeRaw`
    INSERT INTO "LoginAttempt" ("key", "count", "windowEnd", "updatedAt")
    VALUES (${key}, 1, ${windowEnd}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "LoginAttempt"."windowEnd" <= ${now}
        THEN 1 ELSE "LoginAttempt"."count" + 1 END,
      "windowEnd" = CASE WHEN "LoginAttempt"."windowEnd" <= ${now}
        THEN ${windowEnd} ELSE "LoginAttempt"."windowEnd" END,
      "updatedAt" = ${now}
  `;
}

export async function resetLoginAttempts(key: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { key } });
}
