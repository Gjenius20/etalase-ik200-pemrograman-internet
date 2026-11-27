"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { loginAction, type LoginState } from "@/actions/auth";

const initialState: LoginState = { error: null };

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <input type="hidden" name="next" value={next ?? "/admin"} />

      <div>
        <label
          htmlFor="admin-password"
          className="block text-sm font-bold text-ink"
        >
          Password Admin
        </label>
        <div className="relative mt-2">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
            aria-hidden="true"
          />
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            autoFocus
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "login-error" : undefined}
            className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-cream py-2.5 pl-10 pr-12 text-sm text-ink transition-colors placeholder:text-slate-600 focus:border-brand focus:bg-white focus:outline-none"
            placeholder="Masukkan password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword ? "Sembunyikan password" : "Tampilkan password"
            }
            className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-stone-200 hover:text-ink"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {state.error && (
        <p
          id="login-error"
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-brand-dark active:bg-brand-darker disabled:opacity-70"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        )}
        {pending ? "Memeriksa..." : "Masuk ke Panel Admin"}
      </button>

      <Link
        href="/"
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Portal
      </Link>
    </form>
  );
}
