import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { logEvent } from "@/lib/logger";
import { checkStorageConnection, isStorageConfigured } from "@/lib/s3";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Health check tanpa informasi sensitif. Dipakai monitoring/Vercel dan smoke test.
 * 200 = semua siap; 503 = ada layanan yang gagal.
 */
export async function GET() {
  let database = "error";
  if (isDatabaseConfigured()) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "ok";
    } catch (error) {
      logEvent("error", "health_database_failed", {
        message: error instanceof Error ? error.message.slice(0, 200) : "unknown",
      });
    }
  }

  let storage = "error";
  if (isStorageConfigured()) {
    storage = (await checkStorageConnection()) ? "ok" : "error";
    if (storage === "error") {
      logEvent("error", "health_storage_failed", {});
    }
  }

  const healthy = database === "ok" && storage === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks: { database, storage },
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
