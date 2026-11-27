import { existsSync, readFileSync } from "node:fs";

import { defineConfig } from "prisma/config";

/**
 * Next.js membaca `.env.local`, sedangkan Prisma CLI hanya membaca `.env`.
 * Muat `.env.local` lebih dulu agar `db:migrate`, `db:seed`, dan `db:studio`
 * memakai kredensial yang sama tanpa menduplikasi variabel.
 *
 * Variabel yang sudah ada di process.env tidak ditimpa, sehingga override dari
 * shell (mis. `$env:DATABASE_URL="..."; npm run db:deploy`) tetap menang.
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

const databaseUrl = process.env.DATABASE_URL?.trim();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Saat DATABASE_URL belum diisi, biarkan schema memakai `env("DATABASE_URL")`
  // sendiri. Ini menjaga `prisma generate` (postinstall) tetap jalan tanpa
  // kredensial, sementara perintah yang butuh DB akan tetap melaporkan env hilang.
  ...(databaseUrl
    ? {
        datasource: {
          url: databaseUrl,
          // Neon: migrations need the direct (non-pooled) endpoint.
          ...(process.env.DATABASE_URL_UNPOOLED?.trim()
            ? { directUrl: process.env.DATABASE_URL_UNPOOLED.trim() }
            : {}),
        },
      }
    : {}),
});
