const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ativo: { label: "Ativo", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  suspenso: { label: "Suspenso", cls: "bg-accent/10 text-accent border-accent/30" },
  encerrado: { label: "Encerrado", cls: "bg-bg text-fg-muted border-border" },
};

export function ContractStatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: "bg-bg text-fg-muted border-border" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function SignatureStatusBadge({ signed }: { signed: boolean }) {
  return signed ? (
    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
      Assinado
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-accent/10 text-accent border-accent/30">
      Pendente de assinatura
    </span>
  );
}
