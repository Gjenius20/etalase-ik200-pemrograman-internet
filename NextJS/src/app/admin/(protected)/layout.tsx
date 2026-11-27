import AdminHeader from "@/components/admin/AdminHeader";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AdminHeader />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-stone-200 bg-white">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-slate-600 sm:px-6 lg:px-8">
          Panel Admin Etalase IK200 · Kelas CTRL-B, Pendidikan Ilmu Komputer
          2025, FPMIPA UPI
        </p>
      </footer>
    </div>
  );
}
