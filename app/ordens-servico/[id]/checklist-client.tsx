"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  itemKey: string;
  itemLabel: string;
  itemGroup: string | null;
  done: boolean;
  notes: string | null;
};

export function ChecklistClient({
  serviceOrderId,
  items,
  canEdit,
}: {
  serviceOrderId: string;
  items: Item[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [local, setLocal] = useState(items);
  const [error, setError] = useState<string | null>(null);

  const groups = local.reduce<Record<string, Item[]>>((acc, i) => {
    const g = i.itemGroup ?? "Geral";
    (acc[g] ||= []).push(i);
    return acc;
  }, {});

  async function toggle(item: Item) {
    if (!canEdit) return;
    setError(null);
    const next = !item.done;
    setLocal((prev) => prev.map((i) => (i.id === item.id ? { ...i, done: next } : i)));
    const res = await fetch(`/api/service-orders/${serviceOrderId}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, done: next }),
    });
    if (!res.ok) {
      setError("Não foi possível atualizar o item. Tente novamente.");
      setLocal((prev) => prev.map((i) => (i.id === item.id ? { ...i, done: item.done } : i)));
      return;
    }
    startTransition(() => router.refresh());
  }

  if (local.length === 0) {
    return <p className="text-sm text-fg-muted">Nenhum item de checklist cadastrado para esta OS.</p>;
  }

  const total = local.length;
  const done = local.filter((i) => i.done).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-fg-muted">
          <span>{done} de {total} itens concluídos</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-bg">
          <div className="h-full bg-brand transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {Object.entries(groups).map(([group, list]) => (
        <div key={group}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">{group}</p>
          <ul className="space-y-1">
            {list.map((item) => (
              <li key={item.id}>
                <label className={`flex cursor-pointer items-start gap-3 rounded-md border border-border bg-bg/30 p-2.5 transition-colors duration-150 ${canEdit ? "hover:bg-white/5" : "cursor-not-allowed opacity-80"}`}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    disabled={!canEdit || pending}
                    onChange={() => toggle(item)}
                    className="mt-0.5 h-4 w-4 accent-[color:var(--brand)]"
                  />
                  <span className={`text-sm ${item.done ? "text-fg-muted line-through" : "text-fg"}`}>
                    {item.itemLabel}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
