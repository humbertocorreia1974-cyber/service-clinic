import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    "https://serviceclinic.com.br";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/servicos`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/sobre`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/area-atendida`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contato`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/catalogo`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/termos`, changeFrequency: "yearly", priority: 0.3 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [services, cities, posts] = await Promise.all([
      prisma.service.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.city.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    dynamicRoutes = [
      ...services.map((s) => ({
        url: `${base}/servicos/${s.slug}`,
        lastModified: s.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...cities.map((c) => ({
        url: `${base}/area-atendida/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...posts.map((p) => ({
        url: `${base}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // banco indisponível no build — devolve só as rotas estáticas
  }

  return [...staticRoutes, ...dynamicRoutes];
}
