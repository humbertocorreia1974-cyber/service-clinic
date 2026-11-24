// Frete da loja de peças — tabela própria da Service Clinic (sem depender de chave de transportadora).
// Zonas pelo 1º dígito/prefixo do CEP: 27xxx = Sul Fluminense (entrega própria), 0–3 = Sudeste, demais = Brasil.
export type ShippingMethodId = "retirada" | "entrega_local" | "transportadora";
export type ShippingOption = {
  id: ShippingMethodId;
  label: string;
  cost: number;
  etaDays: [number, number];
  note: string;
};

const FREE_LOCAL_ABOVE = 500; // entrega própria grátis acima deste subtotal

export function normalizeZip(zip: string): string {
  return String(zip ?? "").replace(/\D/g, "").slice(0, 8);
}

export function zoneOf(zip: string): "local" | "sudeste" | "brasil" | null {
  const z = normalizeZip(zip);
  if (z.length !== 8) return null;
  if (z.startsWith("27")) return "local";
  return Number(z[0]) <= 3 ? "sudeste" : "brasil";
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function quoteShipping(zip: string, subtotal: number, totalGrams: number): ShippingOption[] {
  const zone = zoneOf(zip);
  if (!zone) return [];
  const kg = Math.max(1, Math.ceil(totalGrams / 1000));
  const options: ShippingOption[] = [
    { id: "retirada", label: "Retirar na Service Clinic", cost: 0, etaDays: [0, 1], note: "Avisamos quando estiver pronto para retirada." },
  ];
  if (zone === "local") {
    const free = subtotal >= FREE_LOCAL_ABOVE;
    options.push({
      id: "entrega_local",
      label: "Entrega Service Clinic",
      cost: free ? 0 : 25,
      etaDays: [1, 2],
      note: free ? "Frete grátis acima de R$ 500 na sua região." : "Frete grátis acima de R$ 500.",
    });
  } else if (zone === "sudeste") {
    options.push({ id: "transportadora", label: "Transportadora (Sudeste)", cost: round2(29.9 + 6 * (kg - 1)), etaDays: [3, 6], note: "Enviamos com código de rastreio." });
  } else {
    options.push({ id: "transportadora", label: "Transportadora (Brasil)", cost: round2(49.9 + 9 * (kg - 1)), etaDays: [6, 12], note: "Enviamos com código de rastreio." });
  }
  return options;
}

export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) left--;
  }
  return d;
}
