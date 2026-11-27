"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";

import { UPLOAD_RULES, validateFile } from "@/lib/upload-constants";
import { uploadFile } from "@/lib/upload-client";
import type { DraftLogo } from "@/lib/validation/project";

export default function LogoUploader({
  value,
  onChange,
  disabled = false,
  error,
}: {
  value: DraftLogo | null;
  onChange: (logo: DraftLogo | null) => void;
  disabled?: boolean;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const rule = UPLOAD_RULES.logo;
  const isUploading = progress !== null;

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setUploadError(null);
    const localError = validateFile(file, "logo");
    if (localError) {
      setUploadError(localError);
      return;
    }

    setProgress(0);
    try {
      const media = await uploadFile(file, "logo", setProgress);
      onChange({ url: media.url, key: media.key });
    } catch (caught) {
      setUploadError(
        caught instanceof Error ? caught.message : "Gagal mengunggah logo.",
      );
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
          {value?.url ? (
            <img
              src={value.url}
              alt="Pratinjau logo aplikasi"
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus className="h-7 w-7 text-slate-400" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || isUploading}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : value?.url ? (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
              )}
              {isUploading ? "Mengunggah…" : value?.url ? "Ganti Logo" : "Unggah Logo"}
            </button>

            {value?.url && !isUploading && (
              <button
                type="button"
                onClick={() => onChange(null)}
                disabled={disabled}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Hapus
              </button>
            )}
          </div>

          <p className="mt-1.5 text-xs text-slate-600">{rule.helper}</p>

          {isUploading && (
            <div className="mt-2">
              <div
                className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-stone-200"
                role="progressbar"
                aria-valuenow={progress ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progres unggah logo"
              >
                <div
                  className="h-full rounded-full bg-brand transition-[width]"
                  style={{ width: `${progress ?? 0}%` }}
                />
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={rule.accept}
            aria-label="Pilih file logo aplikasi"
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </div>
      </div>

      {(uploadError || error) && (
        <p className="mt-2 text-xs font-semibold text-red-700" role="alert">
          {uploadError ?? error}
        </p>
      )}
    </div>
  );
}
