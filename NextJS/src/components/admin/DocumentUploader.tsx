"use client";

import { useRef, useState } from "react";
import {
  CloudUpload,
  FileCheck2,
  FileX2,
  Link2,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { UPLOAD_RULES, validateFile } from "@/lib/upload-constants";
import { uploadFile } from "@/lib/upload-client";
import type { DraftDocument } from "@/lib/validation/project";

function fileNameFromUrl(url: string): string {
  if (!url) return "";

  try {
    const pathname = new URL(url).pathname;
    const last = pathname.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : url;
  } catch {
    return url;
  }
}

export default function DocumentUploader({
  id,
  label,
  document,
  onChange,
  disabled = false,
  error,
}: {
  id: string;
  label: string;
  document: DraftDocument;
  onChange: (document: DraftDocument) => void;
  disabled?: boolean;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const rule = UPLOAD_RULES.pdf;
  const isUploading = progress !== null;
  const hasFile = Boolean(document.url);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setUploadError(null);
    const localError = validateFile(file, "pdf");
    if (localError) {
      setUploadError(localError);
      return;
    }

    setProgress(0);
    try {
      const media = await uploadFile(file, "pdf", setProgress);
      onChange({ source: "upload", url: media.url, key: media.key });
    } catch (caught) {
      setUploadError(
        caught instanceof Error ? caught.message : "Gagal mengunggah dokumen.",
      );
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="min-w-0 rounded-xl border border-stone-200 bg-white p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={`${id}-url`} className="text-sm font-bold text-slate-800">
          {label}
        </label>

        <div
          role="group"
          aria-label={`Sumber ${label}`}
          className="inline-flex rounded-lg border border-stone-300 bg-cream p-0.5"
        >
          <button
            type="button"
            onClick={() =>
              onChange({ ...document, source: "upload", ...(document.source === "link" ? { url: "", key: undefined } : {}) })
            }
            aria-pressed={document.source === "upload"}
            className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
              document.source === "upload"
                ? "bg-brand text-white"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <CloudUpload className="h-3.5 w-3.5" aria-hidden="true" />
            Unggah
          </button>
          <button
            type="button"
            onClick={() => onChange({ source: "link", url: "", key: undefined })}
            aria-pressed={document.source === "link"}
            className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
              document.source === "link"
                ? "bg-brand text-white"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
            Tautan
          </button>
        </div>
      </div>

      {document.source === "link" ? (
        <div className="mt-2.5">
          <input
            id={`${id}-url`}
            type="url"
            inputMode="url"
            value={document.url}
            onChange={(event) =>
              onChange({ source: "link", url: event.target.value })
            }
            placeholder="https://drive.google.com/…"
            className="min-h-[44px] w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-600">
            Tempel tautan PDF yang dapat diakses publik (mis. Google Drive).
          </p>
        </div>
      ) : (
        <div className="mt-2.5">
          {hasFile ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand/20 bg-brand-soft px-3 py-2.5">
              <FileCheck2 className="h-4 w-4 shrink-0 text-brand-dark" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-brand-dark">
                {fileNameFromUrl(document.url)}
              </span>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || isUploading}
                className="inline-flex min-h-[34px] items-center gap-1 rounded-md border border-brand/30 bg-white px-2 py-1 text-xs font-bold text-brand-dark transition-colors hover:bg-brand-soft disabled:opacity-60"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Ganti
              </button>
              <button
                type="button"
                onClick={() => onChange({ source: "upload", url: "" })}
                disabled={disabled || isUploading}
                aria-label={`Hapus ${label}`}
                className="inline-flex min-h-[34px] items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || isUploading}
              className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-stone-300 bg-cream px-4 py-5 text-center transition-colors hover:border-brand hover:bg-brand-soft disabled:opacity-60"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden="true" />
              ) : (
                <FileX2 className="h-5 w-5 text-slate-400" aria-hidden="true" />
              )}
              <span className="text-xs font-bold text-slate-700">
                {isUploading ? "Mengunggah dokumen…" : "Pilih file PDF"}
              </span>
              <span className="text-[11px] text-slate-600">{rule.helper}</span>
            </button>
          )}

          {isUploading && (
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-200"
              role="progressbar"
              aria-valuenow={progress ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progres unggah ${label}`}
            >
              <div
                className="h-full rounded-full bg-brand transition-[width]"
                style={{ width: `${progress ?? 0}%` }}
              />
            </div>
          )}

          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={rule.accept}
            aria-label={`Pilih file PDF untuk ${label}`}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </div>
      )}

      {(uploadError || error) && (
        <p className="mt-1.5 text-xs font-semibold text-red-700" role="alert">
          {uploadError ?? error}
        </p>
      )}
    </div>
  );
}
