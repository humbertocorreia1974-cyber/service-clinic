// Default de app/api/contact/route.ts — grava o lead no banco. O DeveloperAgent
// só precisa garantir que o model `Lead` existe no schema (id, name, email,
// message, createdAt). Se ele não gerar essa rota, o skeleton usa esta.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`contact:${ip}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Muitas solicitações. Tente novamente em alguns minutos." }, { status: 429 });
    }

    const { name, email, message } = await request.json();
    if (!email || typeof email !== "string" || email.length > 200) {
      return NextResponse.json({ error: "Email é obrigatório." }, { status: 400 });
    }
    // @ts-ignore - o model Lead vem do schema gerado pelo Architect/Developer
    await prisma.lead.create({
      data: { name: String(name ?? "").slice(0, 200), email, message: String(message ?? "").slice(0, 4000) },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Não foi possível registrar agora." }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/contact/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
