const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  aberta: { label: "Aberta", cls: "bg-brand/10 text-brand border-brand/30" },
  a_caminho: { label: "A caminho", cls: "bg-accent/10 text-accent border-accent/30" },
  em_andamento: { label: "Em andamento", cls: "bg-accent/10 text-accent border-accent/30" },
  concluida: { label: "Concluída", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  cancelada: { label: "Cancelada", cls: "bg-red-500/10 text-red-400 border-red-500/30" },
  baixa: { label: "Baixa", cls: "bg-bg text-fg-muted border-border" },
  normal: { label: "Normal", cls: "bg-brand/10 text-brand border-brand/30" },
  alta: { label: "Alta", cls: "bg-accent/10 text-accent border-accent/30" },
  urgente: { label: "Urgente", cls: "bg-red-500/10 text-red-400 border-red-500/30" },
};

export function StatusBadge({ status, kind = "status" }: { status: string; kind?: "status" | "priority" }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: "bg-bg text-fg-muted border-border" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {kind === "priority" ? "Prioridade: " : ""}{s.label}
    </span>
  );
}
