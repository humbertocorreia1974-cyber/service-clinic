import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

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
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Telefone:</strong> ${phone}</p>
          <p><strong>Cidade:</strong> ${city}</p>
          ${email ? `<p><strong>E-mail:</strong> ${email}</p>` : ""}
          ${subject ? `<p><strong>Assunto:</strong> ${subject}</p>` : ""}
          ${message ? `<p><strong>Mensagem:</strong><br/>${message}</p>` : ""}
          <p><strong>Origem:</strong> ${source}</p>
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
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
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
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
