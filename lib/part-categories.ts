// Nenhuma peça real no catálogo tem foto cadastrada ainda (fotografar o
// estoque é tarefa do Humberto/equipe, não algo que dá pra fabricar aqui).
// Em vez de deixar o card vazio ou inventar imagem, cada categoria ganha um
// selo colorido com ícone — visual consistente, honesto, e que já funciona
// hoje. Quando uma peça ganhar uma foto real (Part.imageUrl), o componente
// que consome este mapa deve preferir a foto e só cair pro selo quando
// `imageUrl` for nulo.
//
// 🩹 2026-10-14: catálogo ampliado de "peça de manutenção de equipamento"
// pra loja geral de consumíveis/acessórios/equipamentos odontológicos
// (pedido direto do Humberto, "estilo Mercado Livre/Shopee") — luvas,
// sugadores, pontas e brocas, canetas de alta rotação, contra-ângulos,
// dentes/materiais de prótese, equipamento de implante, ortodontia.
// Deliberadamente SEM categoria de medicamento — fora do escopo pedido.
export const CATEGORY_META: Record<string, { label: string; icon: string; accent: "brand" | "accent" }> = {
  cadeira: { label: "Cadeira odontológica", icon: "Armchair", accent: "brand" },
  autoclave: { label: "Autoclave", icon: "Flame", accent: "accent" },
  compressor: { label: "Compressor", icon: "Gauge", accent: "brand" },
  raio_x: { label: "Raio-X", icon: "Radiation", accent: "accent" },
  fotopolimerizador: { label: "Fotopolimerizador", icon: "Lightbulb", accent: "brand" },
  epi: { label: "EPI e descartáveis", icon: "Hand", accent: "accent" },
  sugadores: { label: "Sugadores e aspiração", icon: "Wind", accent: "brand" },
  pontas_brocas: { label: "Pontas e brocas", icon: "Zap", accent: "accent" },
  canetas: { label: "Canetas de alta rotação", icon: "Syringe", accent: "brand" },
  contra_angulo: { label: "Contra-ângulos", icon: "RotateCw", accent: "accent" },
  protese: { label: "Prótese e dentes", icon: "Smile", accent: "brand" },
  implante: { label: "Equipamentos para implante", icon: "Anchor", accent: "accent" },
  ortodontia: { label: "Ortodontia", icon: "Grid3x3", accent: "brand" },
  geral: { label: "Peças e acessórios", icon: "Package", accent: "accent" },
};

export function categoryMeta(category: string) {
  return CATEGORY_META[category] ?? { label: category, icon: "Package", accent: "accent" as const };
}

export const CATEGORY_OPTIONS = [
  { value: "", label: "Todas as categorias" },
  ...Object.entries(CATEGORY_META).map(([value, m]) => ({ value, label: m.label })),
];
