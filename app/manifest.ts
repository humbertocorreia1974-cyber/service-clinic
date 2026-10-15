import type { MetadataRoute } from "next";

// 2026-10-15: app instalavel pro tecnico de campo - "adicionar a tela
// inicial" abre direto em /tecnico, em tela cheia (sem barra do navegador).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Service Clinic — Painel do Técnico",
    short_name: "Service Clinic",
    description: "OS, checklist, fotos e assinatura em campo — continua funcionando com sinal ruim.",
    start_url: "/tecnico",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f766e",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
