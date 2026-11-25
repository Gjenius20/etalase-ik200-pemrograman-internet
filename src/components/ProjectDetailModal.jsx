import { useEffect, useState } from 'react';
import {
  BookOpen,
  Bot,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileText,
  ImageOff,
  Maximize2,
  PlayCircle,
  Presentation,
  Target,
  Users,
  X,
} from 'lucide-react';
import AppLogo from './AppLogo';
import Lightbox from './Lightbox';

export default function ProjectDetailModal({ project, onClose }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [brokenShots, setBrokenShots] = useState({});

  useEffect(() => {
    setLightboxIndex(null);
    setBrokenShots({});
  }, [project]);

  useEffect(() => {
    if (!project) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && lightboxIndex === null) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, lightboxIndex, onClose]);

  if (!project) return null;

  const screenshots = project.screenshots || [];
  const learningContextItems = [
    {
      label: 'Pengguna Utama',
      value: project.learningContext?.targetUser,
    },
    {
      label: 'Kompetensi yang Dituju',
      value: project.learningContext?.targetCompetency,
    },
    {
      label: 'Masalah Belajar yang Dibantu',
      value: project.learningContext?.learningProblem,
    },
    {
      label: 'Indikator Keberhasilan Belajar',
      value: project.learningContext?.learningSuccess,
    },
  ];

  const documentItems = [
    {
      title: 'Slide Presentasi (PDF)',
      description: 'Ringkasan masalah, tujuan, desain, implementasi, demo, dan hasil.',
      url: project.documents?.presentationPdf,
      icon: Presentation,
    },
    {
      title: 'Dokumen SKPL (PDF)',
      description: 'Spesifikasi Kebutuhan Perangkat Lunak: fungsional, non-fungsional, dan diagram.',
      url: project.documents?.skplPdf,
      icon: FileText,
    },
    {
      title: 'Panduan Pengguna (PDF)',
      description: 'Petunjuk penggunaan aplikasi secara runtut beserta tangkapan layar.',
      url: project.documents?.userGuidePdf,
      icon: BookOpen,
    },
  ];

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-app-title"
        className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4 lg:p-6"
        onClick={onClose}
      >
        <div
          className="relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Modal Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
            <div className="flex min-w-0 items-center gap-3.5">
              <AppLogo
                src={project.logoUrl}
                appName={project.appName}
                sizeClass="h-14 w-14 sm:h-16 sm:w-16"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">
                    {project.groupName}
                  </span>
                  <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-900">
                    Jenjang {project.level}
                  </span>
                </div>
                <h2
                  id="modal-app-title"
                  className="mt-0.5 truncate text-xl font-extrabold text-slate-900 sm:text-2xl"
                >
                  {project.appName}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail proyek"
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6 sm:px-7">
            {/* 1. Identitas, Anggota & CTA */}
            <section aria-labelledby="section-identitas">
              <h3 id="section-identitas" className="sr-only">
                Identitas Proyek dan Tautan Utama
              </h3>
              <p className="text-base leading-relaxed text-slate-700">
                {project.shortDescription}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#01875F] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#016e4d] active:bg-[#01593f]"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Buka Website Aktif
                </a>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-100"
                >
                  <Code2 className="h-4 w-4" aria-hidden="true" />
                  Source Code GitHub
                </a>
              </div>

              {project.members?.length > 0 && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <Users className="h-4 w-4 text-[#1E3A5F]" aria-hidden="true" />
                    Anggota {project.groupName}
                  </div>
                  <ul className="mt-2.5 flex flex-wrap gap-2">
                    {project.members.map((member, idx) => (
                      <li
                        key={idx}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
                      >
                        {member}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* 2. Galeri Screenshot & Lightbox (Artefak #1) */}
            <section aria-labelledby="section-screenshots">
              <div className="flex items-center justify-between gap-2">
                <h3
                  id="section-screenshots"
                  className="text-base font-bold text-slate-900 sm:text-lg"
                >
                  Galeri Screenshot Aplikasi
                </h3>
                <span className="text-xs font-medium text-slate-500">
                  Klik gambar untuk memperbesar
                </span>
              </div>

              {screenshots.length > 0 ? (
                <div className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
                  {screenshots.map((shotUrl, idx) => {
                    const isBroken = Boolean(brokenShots[idx]);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLightboxIndex(idx)}
                        aria-label={`Perbesar screenshot ${idx + 1} ${project.appName}`}
                        className="group relative aspect-video w-[82%] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left sm:w-[62%] md:w-[48%]"
                      >
                        {isBroken ? (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-4 text-center text-slate-500">
                            <ImageOff className="h-6 w-6" aria-hidden="true" />
                            <span className="text-xs font-semibold">
                              Gambar {idx + 1} gagal dimuat
                            </span>
                          </div>
                        ) : (
                          <img
                            src={shotUrl}
                            alt={`Screenshot ${idx + 1} ${project.appName}`}
                            loading="lazy"
                            onError={() =>
                              setBrokenShots((prev) => ({ ...prev, [idx]: true }))
                            }
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                          />
                        )}
                        <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white">
                          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Perbesar
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Belum ada screenshot yang ditambahkan.
                </p>
              )}
            </section>

            {/* 3. Deskripsi Lengkap & Konteks Pembelajaran */}
            <section aria-labelledby="section-deskripsi" className="space-y-5">
              <div>
                <h3
                  id="section-deskripsi"
                  className="text-base font-bold text-slate-900 sm:text-lg"
                >
                  Deskripsi &amp; Alur Penggunaan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
                  {project.fullDescription}
                </p>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800">
                  <Target className="h-4 w-4 text-[#01875F]" aria-hidden="true" />
                  Konteks &amp; Sasaran Pembelajaran
                </h4>
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
                        {item.value || '-'}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="grid gap-4 lg:grid-cols-12">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:col-span-7">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Fitur Pembelajaran
                  </h4>
                  <ul className="mt-3 space-y-2.5">
                    {(project.features || []).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#01875F]"
                          aria-hidden="true"
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-[#1E3A5F] p-4 text-white sm:p-5 lg:col-span-5">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-300">
                    <Bot className="h-4 w-4" aria-hidden="true" />
                    Integrasi Kecerdasan Artifisial
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-slate-100">
                    {project.aiIntegration}
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Video Demo Aplikasi (Artefak #2) */}
            <section aria-labelledby="section-video">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-[#01875F]" aria-hidden="true" />
                <h3
                  id="section-video"
                  className="text-base font-bold text-slate-900 sm:text-lg"
                >
                  Video Demo Aplikasi (Sekitar 10 Menit)
                </h3>
              </div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                <iframe
                  src={project.videoEmbedUrl}
                  title={`Video Demo ${project.appName}`}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>

            {/* 5. Pusat Unduhan Dokumen PDF (Artefak #5, #6, #7) */}
            <section aria-labelledby="section-dokumen">
              <h3
                id="section-dokumen"
                className="text-base font-bold text-slate-900 sm:text-lg"
              >
                Pusat Unduhan Dokumen Proyek (Format PDF)
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Tautan akses publik untuk seluruh berkas dokumentasi kelompok.
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {documentItems.map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <a
                      key={doc.title}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[44px] flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-[#01875F] hover:bg-emerald-50/40"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <Icon className="h-4 w-4 shrink-0 text-[#1E3A5F]" aria-hidden="true" />
                          <span>{doc.title}</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                          {doc.description}
                        </p>
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#01875F]">
                        Buka / Unduh PDF
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={screenshots}
          currentIndex={lightboxIndex}
          appName={project.appName}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
