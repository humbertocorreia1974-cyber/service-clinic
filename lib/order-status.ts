// Constantes puras do pedido (sem banco): podem ser importadas por telas "use client".
export const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  aguardando_pagamento: { label: "Aguardando pagamento", tone: "text-amber-600" },
  pago: { label: "Pago", tone: "text-green-600" },
  preparando: { label: "Preparando envio", tone: "text-brand" },
  enviado: { label: "Enviado", tone: "text-brand" },
  entregue: { label: "Entregue", tone: "text-green-600" },
  cancelado: { label: "Cancelado", tone: "text-red-500" },
};

export const NEXT_STATUS: Record<string, string[]> = {
  aguardando_pagamento: ["pago", "cancelado"],
  pago: ["preparando", "cancelado"],
  preparando: ["enviado", "cancelado"],
  enviado: ["entregue"],
  entregue: [],
  cancelado: [],
};

export const CARRIERS = [
  { id: "entrega_propria", label: "Entrega própria Service Clinic" },
  { id: "correios", label: "Correios" },
  { id: "jadlog", label: "Jadlog" },
  { id: "transportadora", label: "Outra transportadora" },
];

export const RESERVATION_HOURS = 48;
export const STAFF_ORDER_ROLES = ["admin", "gerente", "vendas", "atendente", "compras"];

export function trackingUrl(carrier: string | null | undefined, code: string | null | undefined): string | null {
  if (!code) return null;
  const c = encodeURIComponent(code);
  if (carrier === "correios") return `https://rastreamento.correios.com.br/app/index.php?objetos=${c}`;
  if (carrier === "jadlog") return `https://www.jadlog.com.br/jadlog/tracking?cte=${c}`;
  return null;
}
