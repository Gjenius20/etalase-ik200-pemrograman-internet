/** Tipe data yang aman dikirim dari Server Component ke Client Component. */

export type PublicMember = {
  name: string;
  nim: string;
};

export type PublicScreenshot = {
  url: string;
  caption?: string;
};

export type PublicDocument = {
  url: string;
  key?: string;
  source: "upload" | "link";
};

export type PublicDocuments = {
  presentation: PublicDocument;
  skpl: PublicDocument;
  userGuide: PublicDocument;
};

export type PublicProject = {
  id: string;
  slug: string;
  groupNumber: number;
  groupLabel: string;
  appName: string;
  shortDescription: string;
  fullDescription: string;
  targetUser: string;
  targetCompetency: string;
  learningProblem: string;
  learningSuccess: string;
  features: string[];
  aiIntegration: string | null;
  websiteUrl: string;
  githubUrl: string;
  youtubeId: string;
  logoUrl: string;
  screenshots: PublicScreenshot[];
  documents: PublicDocuments;
  members: PublicMember[];
};

export type CatalogProject = Pick<
  PublicProject,
  | "id"
  | "slug"
  | "groupLabel"
  | "groupNumber"
  | "appName"
  | "shortDescription"
  | "logoUrl"
  | "websiteUrl"
  | "members"
  | "features"
  | "fullDescription"
>;
