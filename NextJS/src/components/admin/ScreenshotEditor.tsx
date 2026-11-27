"use client";

import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImageOff,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { UPLOAD_RULES, validateFile } from "@/lib/upload-constants";
import { uploadFile } from "@/lib/upload-client";
import type { DraftScreenshot } from "@/lib/validation/project";

const MAX_SCREENSHOTS = 8;

export default function ScreenshotEditor({
  value,
  onChange,
  disabled = false,
  error,
}: {
  value: DraftScreenshot[];
  onChange: (screenshots: DraftScreenshot[]) => void;
  disabled?: boolean;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const rule = UPLOAD_RULES.screenshot;
  const remaining = MAX_SCREENSHOTS - value.length;

  function updateAt(index: number, patch: Partial<DraftScreenshot>) {
    onChange(
      value.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function removeAt(index: number) {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;

    const next = value.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploadError(null);
    setWarning(null);
    const accepted: File[] = [];

    for (const file of Array.from(files)) {
      const localError = validateFile(file, "screenshot");

      if (localError) {
        setUploadError(`${file.name}: ${localError}`);
        continue;
      }

      if (value.length + accepted.length >= MAX_SCREENSHOTS) {
        setUploadError(`Maksimal ${MAX_SCREENSHOTS} screenshot per project.`);
        break;
      }

      accepted.push(file);
    }

    if (accepted.length === 0) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const nonPngCount = accepted.filter(
      (file) => file.type !== "image/png",
    ).length;
    if (nonPngCount > 0) {
      setWarning(
        `${nonPngCount} dari ${accepted.length} gambar bukan PNG. Tetap diunggah, tetapi PNG disarankan agar tampilan lebih tajam.`,
      );
    }

    setUploading(true);
    const uploaded: DraftScreenshot[] = [];

    try {
      for (let index = 0; index < accepted.length; index += 1) {
        setProgress({ current: index + 1, total: accepted.length });

        const media = await uploadFile(accepted[index], "screenshot");
        uploaded.push({ url: media.url, key: media.key });
      }

      onChange([...value, ...uploaded]);
    } catch (caught) {
      if (uploaded.length > 0) onChange([...value, ...uploaded]);
      setUploadError(
        caught instanceof Error
          ? caught.message
          : "Gagal mengunggah screenshot.",
      );
    } finally {
      setUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function addManualUrl() {
    const url = manualUrl.trim();

    if (!/^https:\/\//i.test(url)) {
      setManualError("Gunakan URL https:// yang valid.");
      return;
    }

    if (value.length >= MAX_SCREENSHOTS) {
      setManualError(`Maksimal ${MAX_SCREENSHOTS} screenshot per project.`);
      return;
    }

    setManualError(null);
    onChange([...value, { url }]);
    setManualUrl("");
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading || remaining <= 0}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
          )}
          {uploading
            ? `Mengunggah ${progress?.current ?? 1}/${progress?.total ?? 1}…`
            : "Unggah Screenshot"}
        </button>

        <span className="text-xs font-semibold text-slate-600">
          {value.length}/{MAX_SCREENSHOTS} gambar
        </span>

        <input
          ref={inputRef}
          type="file"
          accept={rule.accept}
          multiple
          aria-label="Pilih beberapa file screenshot"
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      <p className="text-xs text-slate-600">{rule.helper}</p>

      <div className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-cream p-3 sm:flex-row sm:items-center">
        <label htmlFor="screenshot-manual-url" className="sr-only">
          URL screenshot manual
        </label>
        <input
          id="screenshot-manual-url"
          type="url"
          inputMode="url"
          value={manualUrl}
          onChange={(event) => {
            setManualUrl(event.target.value);
            setManualError(null);
          }}
          placeholder="https://… (alternatif: tempel URL gambar)"
          className="min-h-[44px] w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none"
        />
        <button
          type="button"
          onClick={addManualUrl}
          disabled={disabled || !manualUrl.trim() || value.length >= MAX_SCREENSHOTS}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah URL
        </button>
      </div>

      {manualError && (
        <p className="text-xs font-semibold text-red-700" role="alert">
          {manualError}
        </p>
      )}
      {uploadError && (
        <p className="text-xs font-semibold text-red-700" role="alert">
          {uploadError}
        </p>
      )}
      {warning && (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800"
          role="status"
        >
          {warning}
        </p>
      )}

      {value.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-cream px-4 py-8 text-center">
          <ImageOff className="h-7 w-7 text-slate-400" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-600">
            Belum ada screenshot
          </p>
          <p className="text-xs text-slate-600">
            Minimal 2 screenshot diperlukan sebelum project bisa diterbitkan.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {value.map((screenshot, index) => (
            <li
              key={`${screenshot.url}-${index}`}
              className="rounded-xl border border-stone-200 bg-white p-2.5"
            >
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <img
                  src={screenshot.url}
                  alt={`Screenshot ${index + 1}`}
                  className="h-24 w-full shrink-0 rounded-lg border border-stone-200 bg-stone-100 object-cover sm:h-20 sm:w-32"
                />

                <div className="min-w-0 flex-1 space-y-1.5">
                  <label
                    htmlFor={`screenshot-caption-${index}`}
                    className="text-[11px] font-bold uppercase tracking-wide text-slate-600"
                  >
                    Keterangan (opsional)
                  </label>
                  <input
                    id={`screenshot-caption-${index}`}
                    type="text"
                    value={screenshot.caption ?? ""}
                    maxLength={120}
                    onChange={(event) =>
                      updateAt(index, { caption: event.target.value })
                    }
                    placeholder={`Contoh: Halaman kuis interaktif`}
                    className="min-h-[40px] w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none"
                  />
                  <p className="truncate text-[11px] text-slate-400">
                    {screenshot.url}
                  </p>
                </div>

                <div className="flex shrink-0 items-start gap-1 sm:flex-col">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Naikkan screenshot ${index + 1}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 bg-white text-slate-600 transition-colors hover:bg-stone-100 disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    aria-label={`Turunkan screenshot ${index + 1}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 bg-white text-slate-600 transition-colors hover:bg-stone-100 disabled:opacity-40"
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    aria-label={`Hapus screenshot ${index + 1}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition-colors hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
