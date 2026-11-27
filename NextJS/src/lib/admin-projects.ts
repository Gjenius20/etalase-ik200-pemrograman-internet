import "server-only";

import type { Member, Project } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  parseDocumentDraft,
  parseScreenshotDrafts,
} from "@/lib/media";
import {
  computeCompleteness,
  toYouTubeWatchUrl,
  type ProjectDraft,
} from "@/lib/validation/project";

export type ProjectWithMembers = Project & { members: Member[] };

export function projectToDraft(project: ProjectWithMembers): ProjectDraft {
  const documents =
    project.documents &&
    typeof project.documents === "object" &&
    !Array.isArray(project.documents)
      ? (project.documents as Record<string, unknown>)
      : {};

  return {
    groupNumber: String(project.groupNumber),
    appName: project.appName,
    shortDescription: project.shortDescription,
    fullDescription: project.fullDescription,
    targetUser: project.targetUser,
    targetCompetency: project.targetCompetency,
    learningProblem: project.learningProblem,
    learningSuccess: project.learningSuccess,
    features: project.features.length > 0 ? project.features : [""],
    aiEnabled: Boolean(project.aiIntegration?.trim()),
    aiIntegration: project.aiIntegration ?? "",
    websiteUrl: project.websiteUrl,
    githubUrl: project.githubUrl,
    youtubeUrl: toYouTubeWatchUrl(project.youtubeId),
    logo: project.logoUrl
      ? {
          url: project.logoUrl,
          ...(project.logoKey ? { key: project.logoKey } : {}),
        }
      : null,
    screenshots: parseScreenshotDrafts(project.screenshots),
    documents: {
      presentation: parseDocumentDraft(documents.presentation),
      skpl: parseDocumentDraft(documents.skpl),
      userGuide: parseDocumentDraft(documents.userGuide),
    },
    members:
      project.members.length > 0
        ? project.members
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((member) => ({ name: member.name, nim: member.nim }))
        : [{ name: "", nim: "" }],
  };
}

export type AdminProjectSummary = {
  id: string;
  slug: string;
  groupNumber: number;
  groupLabel: string;
  appName: string;
  logoUrl: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
  updatedAtLabel: string;
  memberCount: number;
  completeness: number;
};

export type AdminStats = {
  total: number;
  published: number;
  draft: number;
  incomplete: number;
};

export function summarizeProject(project: ProjectWithMembers): AdminProjectSummary {
  const completeness = computeCompleteness(projectToDraft(project));

  return {
    id: project.id,
    slug: project.slug,
    groupNumber: project.groupNumber,
    groupLabel: `Kelompok ${project.groupNumber}`,
    appName: project.appName,
    logoUrl: project.logoUrl,
    status: project.status,
    updatedAt: project.updatedAt.toISOString(),
    updatedAtLabel: project.updatedAt.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    memberCount: project.members.length,
    completeness: completeness.percent,
  };
}

export function buildAdminStats(
  projects: Pick<AdminProjectSummary, "status" | "completeness">[],
): AdminStats {
  return {
    total: projects.length,
    published: projects.filter((project) => project.status === "PUBLISHED")
      .length,
    draft: projects.filter((project) => project.status === "DRAFT").length,
    incomplete: projects.filter((project) => project.completeness < 100).length,
  };
}

export async function getAdminProjects(): Promise<{
  projects: AdminProjectSummary[];
  stats: AdminStats;
}> {
  const rows = await prisma.project.findMany({
    include: { members: { orderBy: { order: "asc" } } },
    orderBy: { groupNumber: "asc" },
  });

  const projects = rows.map(summarizeProject);

  return { projects, stats: buildAdminStats(projects) };
}

export async function getAdminProjectForEdit(id: string): Promise<{
  id: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  draft: ProjectDraft;
} | null> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: { orderBy: { order: "asc" } } },
  });

  if (!project) return null;

  return {
    id: project.id,
    slug: project.slug,
    status: project.status,
    draft: projectToDraft(project),
  };
}
