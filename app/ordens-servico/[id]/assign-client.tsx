"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Tech = { id: string; name: string; cities: string[]; specialties: string[] };

export function AssignClient({
  serviceOrderId,
  technicians,
  currentTechnicianId,
  canEdit,
}: {
  serviceOrderId: string;
  technicians: Tech[];
  currentTechnicianId: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState(currentTechnicianId ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setMsg(null);
    const res = await fetch(`/api/service-orders/${serviceOrderId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ technicianId: selected || null }),
    });
    if (!res.ok) {
      setError("Falha ao atribuir técnico.");
      return;
    }
    setMsg("Técnico atribuído. Notificação enviada.");
    startTransition(() => router.refresh());
  }

  if (!canEdit) {
    const t = technicians.find((x) => x.id === currentTechnicianId);
    return <p className="text-sm text-fg">{t ? t.name : "Não atribuído"}</p>;
  }

  return (
    <div className="space-y-3">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <option value="">— Não atribuído —</option>
        {technicians.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} {t.cities.length ? `· ${t.cities.join(", ")}` : ""}
          </option>
        ))}
      </select>
      <Button size="sm" onClick={submit} disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Atribuir técnico"}
      </Button>
      {msg && <p className="text-xs text-emerald-400">{msg}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
