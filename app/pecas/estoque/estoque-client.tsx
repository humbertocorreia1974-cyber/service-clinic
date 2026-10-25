"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PartRow = {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockQty: number;
  minStockQty: number;
  unit: string;
};

function PartStockRow({ part }: { part: PartRow }) {
  const [stockQty, setStockQty] = useState(part.stockQty);
  const [minStockQty, setMinStockQty] = useState(part.minStockQty);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const low = stockQty <= minStockQty;

  async function salvar() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/pecas/${part.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQty, minStockQty }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className={low ? "border-red-400/60 bg-red-500/5" : undefined}>
      <CardBody className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className={`truncate font-medium ${low ? "text-red-400" : "text-fg"}`}>
            {part.name}
            {low ? <span className="ml-2 text-xs font-semibold">⚠ estoque baixo</span> : null}
          </p>
          <p className="truncate text-xs text-fg-muted">
            {part.sku} · {part.category}
          </p>
        </div>
        <div className="flex shrink-0 items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-fg-muted">Em estoque ({part.unit})</label>
            <Input
              type="number"
              min={0}
              value={stockQty}
              onChange={(e) => setStockQty(Math.max(0, Number(e.target.value) || 0))}
              className="w-24"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-fg-muted">Mínimo</label>
            <Input
              type="number"
              min={0}
              value={minStockQty}
              onChange={(e) => setMinStockQty(Math.max(0, Number(e.target.value) || 0))}
              className="w-20"
            />
          </div>
          <Button size="sm" variant="secondary" onClick={salvar} disabled={saving}>
            {saving ? "Salvando…" : saved ? "Salvo ✓" : "Salvar"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export function EstoqueClient({ initialParts }: { initialParts: PartRow[] }) {
  const [filter, setFilter] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);

  const filtered = initialParts.filter((p) => {
    if (onlyLow && p.stockQty > p.minStockQty) return false;
    if (!filter.trim()) return true;
    const q = filter.trim().toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="text"
          placeholder="Buscar por nome ou SKU"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
          Só estoque baixo
        </label>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardBody className="py-10 text-center text-fg-muted">Nenhuma peça encontrada.</CardBody>
          </Card>
        ) : (
          filtered.map((part) => <PartStockRow key={part.id} part={part} />)
        )}
      </div>
    </div>
  );
}
