import "server-only";

import { prisma } from "@/lib/db";

export function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "project";
}

export async function generateUniqueSlug(
  appName: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(appName);
  let candidate = base;
  let counter = 2;

  for (;;) {
    const existing = await prisma.project.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;

    candidate = `${base}-${counter}`;
    counter += 1;
  }
}
