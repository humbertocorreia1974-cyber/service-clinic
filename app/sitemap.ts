import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    "https://serviceclinic.com.br";

  // Só rotas que existem de verdade como página — nada de slug de
  // detalhe que nunca foi implementado (ex.: /servicos/[slug],
  // /area-atendida/[slug] não existem, só /servicos e /area-atendida
  // como página única com todos os itens).
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/servicos`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/sobre`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/area-atendida`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contato`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/pecas`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/termos`, changeFrequency: "yearly", priority: 0.3 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });

    dynamicRoutes = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // banco indisponível no build — devolve só as rotas estáticas
  }

  return [...staticRoutes, ...dynamicRoutes];
}
