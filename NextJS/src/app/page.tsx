import Catalog from "@/components/public/Catalog";
import Footer from "@/components/public/Footer";
import HeroSection from "@/components/public/HeroSection";
import Navbar from "@/components/public/Navbar";
import SetupNotice from "@/components/public/SetupNotice";
import { isDatabaseConfigured } from "@/lib/env";
import { getPublishedCatalog } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const configured = isDatabaseConfigured();
  const projects = configured ? await getPublishedCatalog() : [];

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <Navbar totalProjects={projects.length} />

      <main className="flex-1">
        <HeroSection />

        <section
          id="katalog"
          aria-labelledby="katalog-heading"
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
        >
          <div className="mb-5 sm:mb-6">
            <h2
              id="katalog-heading"
              className="text-xl font-extrabold tracking-tight text-ink sm:text-3xl"
            >
              Etalase Aplikasi Pembelajaran
            </h2>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              Pilih kartu aplikasi untuk melihat detail, demo video, screenshot,
              dan dokumen proyek.
            </p>
          </div>

          {!configured ? (
            <SetupNotice />
          ) : projects.length > 0 ? (
            <Catalog projects={projects} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Belum ada project yang terbit
              </h3>
              <p className="mt-1 max-w-md text-sm text-slate-600">
                Admin belum menerbitkan karya apa pun. Silakan kembali lagi
                nanti.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
