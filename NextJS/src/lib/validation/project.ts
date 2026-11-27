import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Tipe draft yang dipakai form, server action, dan data admin         */
/* ------------------------------------------------------------------ */

export type DraftMember = {
  name: string;
  nim: string;
};

export type DraftScreenshot = {
  url: string;
  key?: string;
  caption?: string;
};

export type DraftDocument = {
  source: "upload" | "link";
  url: string;
  key?: string;
};

export type DraftLogo = {
  url: string;
  key?: string;
};

export type ProjectDraft = {
  groupNumber: string;
  appName: string;
  shortDescription: string;
  fullDescription: string;
  targetUser: string;
  targetCompetency: string;
  learningProblem: string;
  learningSuccess: string;
  features: string[];
  aiEnabled: boolean;
  aiIntegration: string;
  websiteUrl: string;
  githubUrl: string;
  youtubeUrl: string;
  logo: DraftLogo | null;
  screenshots: DraftScreenshot[];
  documents: {
    presentation: DraftDocument;
    skpl: DraftDocument;
    userGuide: DraftDocument;
  };
  members: DraftMember[];
};

export const SECTION_IDS = {
  identitas: "section-identitas",
  aplikasi: "section-aplikasi",
  konteks: "section-konteks",
  fitur: "section-fitur",
  media: "section-media",
  tautan: "section-tautan",
  dokumen: "section-dokumen",
} as const;

export type SectionKey = keyof typeof SECTION_IDS;

export function createEmptyDraft(): ProjectDraft {
  return {
    groupNumber: "",
    appName: "",
    shortDescription: "",
    fullDescription: "",
    targetUser: "",
    targetCompetency: "",
    learningProblem: "",
    learningSuccess: "",
    features: [""],
    aiEnabled: false,
    aiIntegration: "",
    websiteUrl: "",
    githubUrl: "",
    youtubeUrl: "",
    logo: null,
    screenshots: [],
    documents: {
      presentation: { source: "link", url: "" },
      skpl: { source: "link", url: "" },
      userGuide: { source: "link", url: "" },
    },
    members: [{ name: "", nim: "" }],
  };
}

/* ------------------------------------------------------------------ */
/* Helper validasi                                                     */
/* ------------------------------------------------------------------ */

export function isHttpsUrl(value: string): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isGitHubUrl(value: string): boolean {
  if (!isHttpsUrl(value)) return false;

  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    return host === "github.com";
  } catch {
    return false;
  }
}

const optionalHttpsUrl = z
  .string()
  .trim()
  .max(500, "URL terlalu panjang (maks 500 karakter)")
  .refine((value) => value === "" || isHttpsUrl(value), {
    message: "Gunakan URL https:// yang valid",
  });

const optionalGitHubUrl = optionalHttpsUrl.refine(
  (value) => value === "" || isGitHubUrl(value),
  { message: "Gunakan URL repositori github.com" },
);

const documentSchema = z.object({
  source: z.enum(["upload", "link"]),
  url: optionalHttpsUrl,
  key: z.string().trim().max(500).optional(),
});

const memberSchema = z.object({
  name: z.string().trim().max(80, "Nama anggota maks 80 karakter"),
  nim: z.string().trim().max(20, "NIM maks 20 karakter"),
});

const screenshotSchema = z.object({
  url: z.string().trim().min(1, "URL gambar wajib ada").max(1000),
  key: z.string().trim().max(500).optional(),
  caption: z
    .string()
    .trim()
    .max(120, "Keterangan maks 120 karakter")
    .optional(),
});

/* ------------------------------------------------------------------ */
/* Schema dasar (longgar, untuk draft dan validasi format)             */
/* ------------------------------------------------------------------ */

export const projectDraftSchema = z.object({
  groupNumber: z
    .string()
    .trim()
    .regex(/^\d{1,2}$/, "Nomor kelompok wajib berupa angka 1–99")
    .refine((value) => {
      const number = Number(value);
      return number >= 1 && number <= 99;
    }, "Nomor kelompok harus 1–99"),
  appName: z
    .string()
    .trim()
    .min(1, "Nama aplikasi wajib diisi")
    .max(80, "Nama aplikasi maks 80 karakter"),
  shortDescription: z
    .string()
    .trim()
    .max(180, "Deskripsi singkat maks 180 karakter"),
  fullDescription: z
    .string()
    .trim()
    .max(3000, "Deskripsi lengkap maks 3000 karakter"),
  targetUser: z.string().trim().max(300, "Maks 300 karakter"),
  targetCompetency: z.string().trim().max(300, "Maks 300 karakter"),
  learningProblem: z.string().trim().max(300, "Maks 300 karakter"),
  learningSuccess: z.string().trim().max(300, "Maks 300 karakter"),
  features: z
    .array(z.string().trim().max(200, "Poin fitur maks 200 karakter"))
    .max(8, "Maksimal 8 poin fitur"),
  aiEnabled: z.boolean(),
  aiIntegration: z
    .string()
    .trim()
    .max(1000, "Penjelasan AI maks 1000 karakter"),
  websiteUrl: optionalHttpsUrl,
  githubUrl: optionalGitHubUrl,
  youtubeUrl: z
    .string()
    .trim()
    .max(500, "URL video terlalu panjang")
    .refine(
      (value) => value === "" || parseYouTubeId(value) !== null,
      "Gunakan tautan YouTube yang valid",
    ),
  logo: z
    .object({
      url: z.string().trim().min(1, "Logo wajib diunggah").max(1000),
      key: z.string().trim().max(500).optional(),
    })
    .nullable(),
  screenshots: z
    .array(screenshotSchema)
    .max(8, "Maksimal 8 screenshot"),
  documents: z.object({
    presentation: documentSchema,
    skpl: documentSchema,
    userGuide: documentSchema,
  }),
  members: z.array(memberSchema).max(10, "Maksimal 10 anggota"),
});

export type ParsedProjectDraft = z.infer<typeof projectDraftSchema>;

/* ------------------------------------------------------------------ */
/* Persyaratan terbit & kelengkapan                                    */
/* ------------------------------------------------------------------ */

export type PublishProblem = {
  key: string;
  label: string;
  section: SectionKey;
};

export function getPublishProblems(draft: ProjectDraft): PublishProblem[] {
  const problems: PublishProblem[] = [];

  const require = (
    condition: boolean,
    key: string,
    label: string,
    section: SectionKey,
  ) => {
    if (!condition) problems.push({ key, label, section });
  };

  require(draft.groupNumber.trim() !== "", "groupNumber", "Nomor kelompok", "identitas");

  const validMembers = draft.members.filter(
    (member) =>
      member.name.trim().length >= 3 && /^\d{6,20}$/.test(member.nim.trim()),
  );
  require(validMembers.length > 0, "members", "Minimal 1 anggota dengan nama dan NIM valid", "identitas");

  require(draft.appName.trim().length >= 3, "appName", "Nama aplikasi (min. 3 karakter)", "aplikasi");
  require(
    draft.shortDescription.trim().length >= 20,
    "shortDescription",
    "Deskripsi singkat (min. 20 karakter)",
    "aplikasi",
  );
  require(
    draft.fullDescription.trim().length >= 100,
    "fullDescription",
    "Deskripsi lengkap (min. 100 karakter)",
    "aplikasi",
  );
  require(Boolean(draft.logo?.url), "logo", "Logo aplikasi", "aplikasi");

  const contextFields: Array<[keyof ProjectDraft, string, string]> = [
    ["targetUser", "targetUser", "Target pengguna"],
    ["targetCompetency", "targetCompetency", "Target kompetensi"],
    ["learningProblem", "learningProblem", "Masalah belajar"],
    ["learningSuccess", "learningSuccess", "Indikator keberhasilan"],
  ];

  for (const [field, key, label] of contextFields) {
    require(
      String(draft[field]).trim().length >= 10,
      key,
      `${label} (min. 10 karakter)`,
      "konteks",
    );
  }

  const validFeatures = draft.features.filter(
    (feature) => feature.trim().length >= 5,
  );
  require(validFeatures.length > 0, "features", "Minimal 1 fitur utama", "fitur");

  if (draft.aiEnabled) {
    require(
      draft.aiIntegration.trim().length >= 10,
      "aiIntegration",
      "Penjelasan integrasi AI",
      "fitur",
    );
  }

  require(
    draft.screenshots.filter((shot) => shot.url.trim() !== "").length >= 2,
    "screenshots",
    "Minimal 2 screenshot",
    "media",
  );

  require(isHttpsUrl(draft.websiteUrl), "websiteUrl", "Link website aplikasi", "tautan");
  require(isGitHubUrl(draft.githubUrl), "githubUrl", "Link repositori GitHub", "tautan");
  require(
    parseYouTubeId(draft.youtubeUrl) !== null,
    "youtubeUrl",
    "Link video demo YouTube",
    "tautan",
  );

  const documentFields: Array<["presentation" | "skpl" | "userGuide", string]> = [
    ["presentation", "File Slide Presentasi"],
    ["skpl", "File Dokumen SKPL"],
    ["userGuide", "File Panduan Pengguna"],
  ];

  for (const [key, label] of documentFields) {
    const document = draft.documents[key];
    require(
      isHttpsUrl(document.url),
      `documents.${key}`,
      label,
      "dokumen",
    );
  }

  return problems;
}

export const TOTAL_REQUIREMENTS = 19;

export function computeCompleteness(draft: ProjectDraft) {
  const problems = getPublishProblems(draft);
  const missingKeys = new Set(problems.map((problem) => problem.key));
  const completed = TOTAL_REQUIREMENTS - missingKeys.size;
  const percent = Math.max(
    0,
    Math.min(100, Math.round((completed / TOTAL_REQUIREMENTS) * 100)),
  );

  return {
    percent,
    completed,
    total: TOTAL_REQUIREMENTS,
    problems,
    isComplete: problems.length === 0,
  };
}

/* ------------------------------------------------------------------ */
/* Utilitas error                                                      */
/* ------------------------------------------------------------------ */

export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) errors[key] = issue.message;
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/* YouTube                                                             */
/* ------------------------------------------------------------------ */

export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;

  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function toYouTubeWatchUrl(youtubeId: string): string {
  return youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : "";
}
