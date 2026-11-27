import "server-only";

import { Prisma, ProjectStatus, type Member, type Project } from "@prisma/client";

import { prisma } from "@/lib/db";
import type {
  CatalogProject,
  PublicDocument,
  PublicDocuments,
  PublicProject,
  PublicScreenshot,
} from "@/lib/types";

type ProjectWithMembers = Project & { members: Member[] };

export function groupLabel(groupNumber: number): string {
  return `Kelompok ${groupNumber}`;
}

export function parseScreenshots(value: Prisma.JsonValue): PublicScreenshot[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): PublicScreenshot[] => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return [];
    }

    const record = item as Record<string, unknown>;
    if (typeof record.url !== "string" || !record.url) return [];

    const screenshot: PublicScreenshot = { url: record.url };
    if (typeof record.caption === "string" && record.caption) {
      screenshot.caption = record.caption;
    }

    return [screenshot];
  });
}

function parseDocument(value: unknown, fallbackUrl = ""): PublicDocument {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { url: fallbackUrl, source: "link" };
  }

  const record = value as Record<string, unknown>;
  const url = typeof record.url === "string" ? record.url : fallbackUrl;
  const key = typeof record.key === "string" && record.key ? record.key : undefined;
  const source = record.source === "upload" ? "upload" : "link";

  return { url, source, ...(key ? { key } : {}) };
}

export function parseDocuments(value: Prisma.JsonValue): PublicDocuments {
  const source =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return {
    presentation: parseDocument(source.presentation),
    skpl: parseDocument(source.skpl),
    userGuide: parseDocument(source.userGuide),
  };
}

function toPublicProject(project: ProjectWithMembers): PublicProject {
  return {
    id: project.id,
    slug: project.slug,
    groupNumber: project.groupNumber,
    groupLabel: groupLabel(project.groupNumber),
    appName: project.appName,
    shortDescription: project.shortDescription,
    fullDescription: project.fullDescription,
    targetUser: project.targetUser,
    targetCompetency: project.targetCompetency,
    learningProblem: project.learningProblem,
    learningSuccess: project.learningSuccess,
    features: project.features,
    aiIntegration: project.aiIntegration,
    websiteUrl: project.websiteUrl,
    githubUrl: project.githubUrl,
    youtubeId: project.youtubeId,
    logoUrl: project.logoUrl,
    screenshots: parseScreenshots(project.screenshots),
    documents: parseDocuments(project.documents),
    members: project.members
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((member) => ({ name: member.name, nim: member.nim })),
  };
}

function toCatalogProject(project: PublicProject): CatalogProject {
  return {
    id: project.id,
    slug: project.slug,
    groupLabel: project.groupLabel,
    groupNumber: project.groupNumber,
    appName: project.appName,
    shortDescription: project.shortDescription,
    logoUrl: project.logoUrl,
    websiteUrl: project.websiteUrl,
    members: project.members,
    features: project.features,
    fullDescription: project.fullDescription,
  };
}

const projectInclude = {
  members: { orderBy: { order: "asc" as const } },
};

export async function getPublishedProjects(): Promise<PublicProject[]> {
  const rows = await prisma.project.findMany({
    where: { status: ProjectStatus.PUBLISHED },
    include: projectInclude,
    orderBy: { groupNumber: "asc" },
  });

  return rows.map(toPublicProject);
}

export async function getPublishedCatalog(): Promise<CatalogProject[]> {
  const projects = await getPublishedProjects();
  return projects.map(toCatalogProject);
}

export async function getPublishedProjectBySlug(
  slug: string,
): Promise<PublicProject | null> {
  const row = await prisma.project.findFirst({
    where: { slug, status: ProjectStatus.PUBLISHED },
    include: projectInclude,
  });

  return row ? toPublicProject(row) : null;
}

export async function getPublishedProjectSlugs(): Promise<string[]> {
  const rows = await prisma.project.findMany({
    where: { status: ProjectStatus.PUBLISHED },
    select: { slug: true },
  });

  return rows.map((row) => row.slug);
}

export async function getPublishedProjectCount(): Promise<number> {
  return prisma.project.count({
    where: { status: ProjectStatus.PUBLISHED },
  });
}
