import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    "https://serviceclinic.com.br";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/painel",
          "/ordens",
          "/agenda",
          "/clientes",
          "/equipamentos",
          "/contratos",
          "/financeiro",
          "/faturas",
          "/estoque",
          "/leads",
          "/admin",
          "/portal",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
