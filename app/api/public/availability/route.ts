// Disponibilidade real de horários — cruza Technician (quais cidades cada
// técnico atende) com Visit e ServiceOrder já agendados pra saber quando um
// técnico está livre. NAO e uma agenda decorativa: se nao houver tecnico
// cadastrado cobrindo a cidade, retorna vazio (o formulario cai pro campo de
// texto livre de sempre — nunca finge ter horario que nao foi calculado).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const WORK_START_HOUR = 8;
const WORK_END_HOUR = 18; // ultima visita pode comecar ate 1h antes, ver abaixo
const SLOT_STEP_MIN = 60;
const DAYS_AHEAD = 14;
const MAX_DAYS_RETURNED = 8;
const DEFAULT_DURATION_MIN = 40;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = (searchParams.get("city") || "").trim();
    if (!city) {
      return NextResponse.json({ error: "Informe a cidade." }, { status: 400 });
    }

    const technicians = await prisma.technician.findMany({
      where: { active: true, cities: { has: city } },
      select: { id: true },
    });

    if (!technicians.length) {
      return NextResponse.json({ city, days: [] });
    }

    const technicianIds = technicians.map((t) => t.id);

    const today = startOfDay(new Date());
    const rangeEnd = new Date(today);
    rangeEnd.setDate(rangeEnd.getDate() + DAYS_AHEAD);

    const [visits, orders] = await Promise.all([
      prisma.visit.findMany({
        where: {
          technicianId: { in: technicianIds },
          status: { in: ["agendada", "confirmada"] },
          scheduledAt: { gte: today, lt: rangeEnd },
        },
        select: { technicianId: true, scheduledAt: true, durationMin: true },
      }),
      prisma.serviceOrder.findMany({
        where: {
          technicianId: { in: technicianIds },
          status: { in: ["aberta", "em_andamento"] },
          scheduledAt: { gte: today, lt: rangeEnd },
        },
        select: { technicianId: true, scheduledAt: true },
      }),
    ]);

    // intervalos ocupados por tecnico, em minutos desde epoch (pra comparar rapido)
    const busyByTech = new Map<string, Array<[number, number]>>();
    for (const t of technicianIds) busyByTech.set(t, []);

    for (const v of visits) {
      if (!v.technicianId || !v.scheduledAt) continue;
      const startMs = new Date(v.scheduledAt).getTime();
      const endMs = startMs + (v.durationMin || DEFAULT_DURATION_MIN) * 60000;
      busyByTech.get(v.technicianId)?.push([startMs, endMs]);
    }
    for (const o of orders) {
      if (!o.technicianId || !o.scheduledAt) continue;
      const startMs = new Date(o.scheduledAt).getTime();
      const endMs = startMs + DEFAULT_DURATION_MIN * 60000;
      busyByTech.get(o.technicianId)?.push([startMs, endMs]);
    }

    const days: { date: string; slots: string[] }[] = [];

    for (let offset = 0; offset < DAYS_AHEAD && days.length < MAX_DAYS_RETURNED; offset++) {
      const day = new Date(today);
      day.setDate(day.getDate() + offset);
      const dow = day.getDay();
      if (dow === 0 || dow === 6) continue; // fim de semana — sem atendimento

      const slots: string[] = [];
      for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour += SLOT_STEP_MIN / 60) {
        const slotStart = new Date(day);
        slotStart.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
        if (slotStart.getTime() < Date.now()) continue; // nao oferece horario que ja passou

        const slotStartMs = slotStart.getTime();
        const slotEndMs = slotStartMs + DEFAULT_DURATION_MIN * 60000;

        const someTechFree = technicianIds.some((techId) => {
          const busy = busyByTech.get(techId) || [];
          return !busy.some(([bStart, bEnd]) => overlaps(slotStartMs, slotEndMs, bStart, bEnd));
        });

        if (someTechFree) {
          slots.push(
            slotStart.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          );
        }
      }

      if (slots.length) {
        days.push({ date: day.toISOString().slice(0, 10), slots });
      }
    }

    return NextResponse.json({ city, days });
  } catch (err) {
    console.error("[GET /api/public/availability]", err);
    return NextResponse.json({ city: "", days: [] });
  }
}
