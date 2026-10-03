import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/escape-html";
import { checkRateLimit } from "@/lib/rate-limit";
import { getErrorMessage, getErrorStack } from '@/lib/error-info';

export const dynamic = "force-dynamic";

const VALID_SOURCES = [
  "site_home",
  "servico",
  "catalogo_pecas",
  "contato",
  "blog",
  "whatsapp",
];

export async function POST(request: Request) {
  try {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`leads:${ip}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Muitas solicitações. Tente novamente em alguns minutos." }, { status: 429 });
    }

    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const city = String(body?.city ?? "").trim();
    const email = body?.email ? String(body.email).trim() : null;
    const subject = body?.subject ? String(body.subject).trim() : null;
    const message = body?.message ? String(body.message).trim() : null;
    const source = VALID_SOURCES.includes(body?.source)
      ? String(body.source)
      : "site_home";
    let preferredAt: Date | null = null;
    if (body?.preferredAt) {
      const parsed = new Date(String(body.preferredAt));
      if (!Number.isNaN(parsed.getTime())) preferredAt = parsed;
    }

    if (!name || !phone || !city) {
      return NextResponse.json(
        { error: "Nome, telefone e cidade são obrigatórios." },
        { status: 400 }
      );
    }
    if (name.length > 200 || phone.length > 40 || city.length > 120) {
      return NextResponse.json(
        { error: "Algum campo excedeu o tamanho permitido." },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        city,
        email,
        subject,
        message,
        source,
        status: "novo",
        preferredAt,
      },
    });

    // Notifica o time comercial (falha silenciosa — não bloqueia o lead)
    try {
      const to =
        process.env.LEADS_NOTIFY_EMAIL ?? "comercial@serviceclinic.com.br";
      await sendEmail({
        to,
        subject: `Novo lead: ${subject ?? "Orçamento"} — ${name}`,
        html: `
          <h2>Novo pedido de orçamento</h2>
          <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
          <p><strong>Telefone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Cidade:</strong> ${escapeHtml(city)}</p>
          ${email ? `<p><strong>E-mail:</strong> ${escapeHtml(email)}</p>` : ""}
          ${subject ? `<p><strong>Assunto:</strong> ${escapeHtml(subject)}</p>` : ""}
          ${message ? `<p><strong>Mensagem:</strong><br/>${escapeHtml(message)}</p>` : ""}
          <p><strong>Origem:</strong> ${escapeHtml(source)}</p>
          <p><a href="${process.env.NEXTAUTH_URL ?? ""}/leads">Ver no painel</a></p>
        `,
      });
    } catch {
      // ignora erro de e-mail — o lead já está salvo
    }

    return NextResponse.json({ id: lead.id, ok: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/leads]", err);
    return NextResponse.json(
      { error: "Não foi possível registrar o lead." },
      { status: 500 }
    );
  }

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/leads/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function GET() {
  try {
  // Listagem pública desabilitada — use /api/leads autenticado no painel.
  return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/leads/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
