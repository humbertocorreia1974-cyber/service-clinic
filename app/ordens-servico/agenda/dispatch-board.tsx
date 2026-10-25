"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { StatusBadge } from "../[id]/status-badge";

const TYPE_LABEL: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  higienizacao_ac: "Higienização de AC",
  instalacao: "Instalação",
  venda_peca: "Venda de peça",
};

const WORK_START_HOUR = 8;
const WORK_END_HOUR = 18;
const HOURS = Array.from({ length: WORK_END_HOUR - WORK_START_HOUR }, (_, i) => WORK_START_HOUR + i);

const UNASSIGNED = "sem-tecnico";

type Technician = { id: string; name: string };
type Order = {
  id: string;
  code: string;
  scheduledAt: Date | string | null;
  status: string;
  type: string;
  city: string;
  technicianId: string | null;
  client: { nomeFantasia: string };
};

function cellKey(technicianId: string, hour: number) {
  return `${technicianId}__${hour}`;
}

function OrderCard({ order }: { order: Order }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: order.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-md border border-border bg-surface p-2 text-xs shadow-sm transition-opacity active:cursor-grabbing ${
        isDragging ? "opacity-30" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <Link
          href={`/ordens-servico/${order.id}`}
          onPointerDown={(e) => e.stopPropagation()}
          className="font-medium text-fg hover:text-brand"
        >
          {order.code}
        </Link>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 truncate text-fg-muted">{order.client.nomeFantasia}</p>
      <p className="mt-0.5 text-fg-muted">
        {TYPE_LABEL[order.type] ?? order.type} · {order.city}
      </p>
    </div>
  );
}

function DispatchCell({
  technicianId,
  hour,
  orders,
}: {
  technicianId: string;
  hour: number;
  orders: Order[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: cellKey(technicianId, hour) });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[64px] space-y-1.5 rounded-md border p-1.5 transition-colors ${
        isOver ? "border-brand bg-brand/10" : "border-border/60 bg-bg/40"
      }`}
    >
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
    </div>
  );
}

export function DispatchBoard({
  day,
  technicians,
  initialOrders,
}: {
  day: string;
  technicians: Technician[];
  initialOrders: Order[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const columns = useMemo(() => [{ id: UNASSIGNED, name: "Sem técnico" }, ...technicians], [technicians]);

  const grid = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const col of columns) {
      for (const hour of HOURS) map.set(cellKey(col.id, hour), []);
    }
    for (const order of orders) {
      if (!order.scheduledAt) continue;
      const dt = new Date(order.scheduledAt);
      const hour = dt.getHours();
      if (hour < WORK_START_HOUR || hour >= WORK_END_HOUR) continue;
      const techId = order.technicianId ?? UNASSIGNED;
      const key = cellKey(techId, hour);
      if (!map.has(key)) continue;
      map.get(key)!.push(order);
    }
    return map;
  }, [orders, columns]);

  const activeOrder = orders.find((o) => o.id === activeId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const orderId = String(active.id);
    const [targetTechRaw, hourRaw] = String(over.id).split("__");
    const hour = Number(hourRaw);
    const targetTechnicianId = targetTechRaw === UNASSIGNED ? null : targetTechRaw;

    const current = orders.find((o) => o.id === orderId);
    if (!current) return;

    const [y, m, d] = day.split("-").map(Number);
    const newScheduledAt = new Date(y, m - 1, d, hour, 0, 0, 0);

    const sameSpot =
      (current.technicianId ?? null) === targetTechnicianId &&
      current.scheduledAt &&
      new Date(current.scheduledAt).getHours() === hour;
    if (sameSpot) return;

    const previous = orders;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, technicianId: targetTechnicianId, scheduledAt: newScheduledAt } : o
      )
    );
    setPending((p) => new Set(p).add(orderId));

    try {
      const res = await fetch(`/api/service-orders/${orderId}/dispatch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technicianId: targetTechnicianId,
          scheduledAt: newScheduledAt.toISOString(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOrders(previous);
        if (res.status === 409) {
          toast.error(
            `Conflito de horário: técnico já tem a OS ${data?.conflict?.code ?? ""} nesse horário.`
          );
        } else {
          toast.error(data?.error ?? "Não foi possível mover a OS.");
        }
        return;
      }
      toast.success(`${current.code} redespachada.`);
      router.refresh();
    } catch {
      setOrders(previous);
      toast.error("Erro de rede ao mover a OS.");
    } finally {
      setPending((p) => {
        const next = new Set(p);
        next.delete(orderId);
        return next;
      });
    }
  }

  if (technicians.length === 0) {
    return (
      <p className="text-sm text-fg-muted">Nenhum técnico ativo cadastrado para montar a agenda.</p>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `72px repeat(${columns.length}, minmax(180px, 1fr))` }}
        >
          <div />
          {columns.map((col) => (
            <div key={col.id} className="px-1 pb-2 text-sm font-semibold text-fg">
              {col.name}
            </div>
          ))}

          {HOURS.map((hour) => (
            <Fragment key={hour}>
              <div className="pt-1.5 text-right text-xs text-fg-muted">
                {String(hour).padStart(2, "0")}:00
              </div>
              {columns.map((col) => (
                <DispatchCell
                  key={cellKey(col.id, hour)}
                  technicianId={col.id}
                  hour={hour}
                  orders={grid.get(cellKey(col.id, hour)) ?? []}
                />
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      <DragOverlay>{activeOrder ? <OrderCard order={activeOrder} /> : null}</DragOverlay>

      {pending.size > 0 && (
        <p className="mt-3 text-xs text-fg-muted">Salvando alteração...</p>
      )}
    </DndContext>
  );
}
