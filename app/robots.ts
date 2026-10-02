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
        // Rotas internas reais deste app — exigem login, mas também não
        // devem ser oferecidas pra indexação/crawling.
        disallow: [
          "/api/",
          "/dashboard",
          "/portal",
          "/tecnico",
          "/clientes",
          "/tecnicos",
          "/ordens-servico",
          "/usuarios",
          "/admin",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
