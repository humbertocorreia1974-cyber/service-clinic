// 2026-10-14: shaping/formatacao PURA das metricas de negocio - separado
// da query do Prisma de proposito, pra dar pra testar sem precisar de banco
// (mesmo padrao dos outros arquivos em tests/: testa a logica, nao a infra).
export type GroupCount = { key: string; count: number };

type PrismaGroupByCount = { _count: { _all: number } };

const LEAD_STATUS_LABEL: Record<string, string> = {
  novo: "Novo",
  contatado: "Contatado",
  qualificado: "Qualificado",
  convertido: "Convertido",
  perdido: "Perdido",
};
const LEAD_STATUS_ORDER = ["novo", "contatado", "qualificado", "convertido", "perdido"];

export function buildLeadFunnel(rows: ({ status: string } & PrismaGroupByCount)[]): GroupCount[] {
  const map = new Map(rows.map((r) => [r.status, r._count._all]));
  return LEAD_STATUS_ORDER.map((status) => ({
    key: LEAD_STATUS_LABEL[status] ?? status,
    count: map.get(status) ?? 0,
  }));
}

const OS_STATUS_LABEL: Record<string, string> = {
  aberta: "Aberta",
  a_caminho: "A caminho",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export function buildOsStatusBreakdown(rows: ({ status: string } & PrismaGroupByCount)[]): GroupCount[] {
  return rows.map((r) => ({ key: OS_STATUS_LABEL[r.status] ?? r.status, count: r._count._all }));
}

export function buildTechnicianProductivity(
  rows: ({ technicianId: string | null } & PrismaGroupByCount)[],
  technicianNames: Record<string, string>
): GroupCount[] {
  return rows
    .filter((r): r is { technicianId: string } & PrismaGroupByCount => !!r.technicianId)
    .map((r) => ({ key: technicianNames[r.technicianId] ?? "Desconhecido", count: r._count._all }))
    .sort((a, b) => b.count - a.count);
}

export function formatCurrencyBRL(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
