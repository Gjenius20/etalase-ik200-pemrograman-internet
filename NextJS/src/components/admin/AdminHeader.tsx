"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { logoutAction } from "@/actions/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects/new", label: "Tambah Project", icon: Plus },
];

export default function AdminHeader() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="h-1 w-full bg-brand" aria-hidden="true" />

      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="flex min-h-[44px] min-w-0 items-center gap-2.5 rounded-lg pr-1 text-ink transition-colors hover:text-brand"
        >
          <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gold bg-ink">
            <img
              src="/images/Logo_Kelas.jpg"
              alt="Logo Kelas CTRL-B"
              width={36}
              height={36}
              className="h-full w-full scale-[1.15] object-cover"
            />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-extrabold tracking-tight sm:text-base">
              Etalase IK200
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
              Panel Admin
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navigasi admin"
          className="order-3 -mx-1 w-full overflow-x-auto sm:order-none sm:mx-0 sm:w-auto"
        >
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-brand-soft text-brand-dark"
                        : "text-slate-700 hover:bg-stone-100 hover:text-ink"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Lihat Situs</span>
            <span className="sr-only sm:hidden">Lihat situs publik</span>
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Keluar</span>
              <span className="sr-only sm:hidden">Keluar dari panel admin</span>
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-stone-100 bg-cream/80">
        <p className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold text-slate-600 sm:px-6 lg:px-8">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
          Sesi admin aktif · perubahan langsung tampil di portal publik setelah disimpan
        </p>
      </div>
    </header>
  );
}
