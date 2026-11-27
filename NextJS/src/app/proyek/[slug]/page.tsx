import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  ArrowLeft,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  PlayCircle,
  Presentation,
  Target,
  Users,
} from "lucide-react";

import AppLogo from "@/components/public/AppLogo";
import Footer from "@/components/public/Footer";
import Navbar from "@/components/public/Navbar";
import ScreenshotGallery from "@/components/public/ScreenshotGallery";
import SetupNotice from "@/components/public/SetupNotice";
import { isDatabaseConfigured } from "@/lib/env";
import {
  getPublishedProjectBySlug,
  getPublishedProjectCount,
} from "@/lib/projects";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

const getProject = cache(getPublishedProjectBySlug);

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  if (!isDatabaseConfigured()) {
    return { title: "Database belum dikonfigurasi" };
  }

  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return { title: "Project tidak ditemukan" };
  }

  return {
    title: `${project.appName} — ${project.groupLabel}`,
    description: project.shortDescription,
    openGraph: {
      title: `${project.appName} — ${project.groupLabel}`,
      description: project.shortDescription,
      images: project.logoUrl ? [{ url: project.logoUrl }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  if (!isDatabaseConfigured()) {
    return (
      <div className="flex min-h-screen flex-col bg-cream text-ink">
        <div className="h-1 w-full bg-brand" aria-hidden="true" />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
          <SetupNotice />
        </main>
      </div>
    );
  }

  const [project, totalProjects] = await Promise.all([
    getProject(slug),
    getPublishedProjectCount(),
  ]);

  if (!project) notFound();

  const learningContextItems = [
    { label: "Pengguna Utama", value: project.targetUser },
    { label: "Kompetensi yang Dituju", value: project.targetCompetency },
    { label: "Masalah Belajar yang Dibantu", value: project.learningProblem },
    {
      label: "Indikator Keberhasilan Belajar",
      value: project.learningSuccess,
    },
  ];

  const documentItems = [
    {
      title: "Slide Presentasi (PDF)",
      description:
        "Ringkasan masalah, tujuan, desain, implementasi, demo, dan hasil.",
      document: project.documents.presentation,
      icon: Presentation,
    },
    {
      title: "Dokumen SKPL (PDF)",
      description:
        "Spesifikasi Kebutuhan Perangkat Lunak: fungsional, non-fungsional, dan diagram.",
      document: project.documents.skpl,
      icon: FileText,
    },
    {
      title: "Panduan Pengguna (PDF)",
      description:
        "Petunjuk penggunaan aplikasi secara runtut beserta tangkapan layar.",
      document: project.documents.userGuide,
      icon: BookOpen,
    },
  ];

  return (
    <div id="top" className="flex min-h-screen flex-col bg-cream text-ink">
      <Navbar totalProjects={totalProjects} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-600 sm:text-sm">
            <li>
              <Link
                href="/#katalog"
                className="rounded transition-colors hover:text-brand"
              >
                Katalog
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="text-slate-600">{project.groupLabel}</li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="min-w-0 truncate text-ink" aria-current="page">
              {project.appName}
            </li>
          </ol>
        </nav>

        <article className="mt-4 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <header className="border-t-4 border-gold p-5 sm:p-8">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <AppLogo
                src={project.logoUrl}
                appName={project.appName}
                sizeClass="h-16 w-16 sm:h-20 sm:w-20"
                textClass="text-xl sm:text-2xl"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-brand">
                  {project.groupLabel}
                </span>
                <h1 className="mt-1 text-xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  {project.appName}
                </h1>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
              {project.shortDescription}
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark active:bg-brand-darker sm:w-auto"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Buka Website Aktif
              </a>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-100 sm:w-auto"
              >
                <Code2 className="h-4 w-4" aria-hidden="true" />
                Source Code GitHub
              </a>
            </div>

            {project.members.length > 0 && (
              <div className="mt-5 rounded-2xl border border-stone-200 bg-cream p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Users className="h-4 w-4 text-brand" aria-hidden="true" />
                  Anggota {project.groupLabel}
                </div>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {project.members.map((member) => (
                    <li
                      key={`${member.nim}-${member.name}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      {member.name} ({member.nim})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </header>

          <div className="space-y-7 border-t border-stone-100 p-5 sm:space-y-9 sm:p-8">
            <section aria-labelledby="section-screenshots">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2
                  id="section-screenshots"
                  className="text-base font-bold text-slate-900 sm:text-lg"
                >
                  Galeri Screenshot Aplikasi
                </h2>
                <span className="text-xs font-medium text-slate-600">
                  Klik gambar untuk memperbesar
                </span>
              </div>
              <ScreenshotGallery
                images={project.screenshots}
                appName={project.appName}
              />
            </section>

            <section
              aria-labelledby="section-deskripsi"
              className="space-y-5 border-t border-stone-100 pt-6 sm:pt-8"
            >
              <div>
                <h2
                  id="section-deskripsi"
                  className="text-base font-bold text-slate-900 sm:text-lg"
                >
                  Deskripsi &amp; Alur Penggunaan
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">
                  {project.fullDescription}
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800">
                  <Target className="h-4 w-4 text-brand" aria-hidden="true" />
                  Konteks &amp; Sasaran Pembelajaran
                </h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {learningContextItems.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <dt className="text-xs font-bold uppercase tracking-wide text-slate-600">
                        {item.label}
                      </dt>
                      <dd className="mt-1.5 text-sm leading-relaxed text-slate-800">
                        {item.value || "-"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="grid gap-4 lg:grid-cols-12">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:col-span-7">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Fitur Pembelajaran
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {project.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-slate-700"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-gold/40 bg-ink p-4 text-white sm:p-5 lg:col-span-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold-light">
                    <Bot className="h-4 w-4" aria-hidden="true" />
                    Integrasi Kecerdasan Artifisial
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-100">
                    {project.aiIntegration ||
                      "Belum ada integrasi AI pada aplikasi ini."}
                  </p>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="section-video"
              className="border-t border-stone-100 pt-6 sm:pt-8"
            >
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-brand" aria-hidden="true" />
                <h2
                  id="section-video"
                  className="text-base font-bold text-slate-900 sm:text-lg"
                >
                  Video Demo Aplikasi (Sekitar 10 Menit)
                </h2>
              </div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                <iframe
                  src={`https://www.youtube.com/embed/${project.youtubeId}`}
                  title={`Video Demo ${project.appName}`}
                  className="aspect-video w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>

            <section
              aria-labelledby="section-dokumen"
              className="border-t border-stone-100 pt-6 sm:pt-8"
            >
              <h2
                id="section-dokumen"
                className="text-base font-bold text-slate-900 sm:text-lg"
              >
                Pusat Unduhan Dokumen Proyek (Format PDF)
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Tautan akses publik untuk seluruh berkas dokumentasi kelompok.
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {documentItems.map((doc) => {
                  const Icon = doc.icon;
                  const hasUrl = Boolean(doc.document.url);

                  const content = (
                    <>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-ink">
                          <Icon
                            className="h-4 w-4 shrink-0 text-brand"
                            aria-hidden="true"
                          />
                          <span>{doc.title}</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                          {doc.description}
                        </p>
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand">
                        {hasUrl ? "Buka / Unduh PDF" : "Belum tersedia"}
                        {hasUrl && (
                          <ExternalLink
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </>
                  );

                  return hasUrl ? (
                    <a
                      key={doc.title}
                      href={doc.document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[44px] flex-col justify-between rounded-2xl border border-stone-200 bg-cream p-4 transition-colors hover:border-brand hover:bg-brand-soft"
                    >
                      {content}
                    </a>
                  ) : (
                    <div
                      key={doc.title}
                      className="flex min-h-[44px] flex-col justify-between rounded-2xl border border-dashed border-stone-300 bg-cream p-4 opacity-70"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </article>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/#katalog"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke Katalog
          </Link>
          <p className="text-xs text-slate-600">
            {project.groupLabel} · IK200 Pemrograman Internet, Kelas CTRL-B
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
