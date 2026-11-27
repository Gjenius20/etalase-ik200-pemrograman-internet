"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { endSession, startSession, verifyPassword } from "@/lib/auth";
import {
  checkLoginRateLimit,
  loginRateLimitKey,
  recordLoginFailure,
  resetLoginAttempts,
} from "@/lib/rate-limit";

export type LoginState = {
  error: string | null;
};

function safeNextTarget(value: string): string {
  if (
    value.startsWith("/admin") &&
    !value.startsWith("//") &&
    !value.startsWith("/admin/login")
  ) {
    return value;
  }

  return "/admin";
}

async function getClientKey(): Promise<string> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";

  return loginRateLimitKey(ip);
}

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const nextTarget = safeNextTarget(String(formData.get("next") ?? "/admin"));
  const key = await getClientKey();

  const rateLimit = await checkLoginRateLimit(key);

  if (!rateLimit.allowed) {
    const minutes = Math.ceil(rateLimit.retryAfterSeconds / 60);
    return {
      error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${minutes} menit.`,
    };
  }

  if (!password) {
    return { error: "Password wajib diisi." };
  }

  if (!verifyPassword(password)) {
    await recordLoginFailure(key);
    return { error: "Password salah. Silakan coba lagi." };
  }

  await resetLoginAttempts(key);
  await startSession();

  redirect(nextTarget);
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
