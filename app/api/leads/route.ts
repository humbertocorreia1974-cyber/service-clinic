import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  "orcamento_foto",
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
    const photoUrl = body?.photoUrl ? String(body.photoUrl).trim() : null;
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
        photoUrl,
        source,
        status: "novo",
        preferredAt,
      },
    });

    // Notifica o time comercial por e-mail (falha silenciosa — não bloqueia o lead).
    // 2026-10-14: o fallback antigo ("comercial@serviceclinic.com.br") era um
    // domínio que nunca existiu de verdade — nenhum alerta chegava a ninguém.
    // LEADS_NOTIFY_EMAIL continua podendo sobrescrever quando configurado.
    try {
      const to =
        process.env.LEADS_NOTIFY_EMAIL ?? "humbertocorreia1974@gmail.com";
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
          ${preferredAt ? `<p><strong>Horário preferido pelo cliente:</strong> ${escapeHtml(preferredAt.toLocaleString("pt-BR"))}</p>` : ""}
          ${photoUrl ? `<p><strong>Foto do problema:</strong><br/><img src="${escapeHtml(photoUrl)}" alt="Foto enviada pelo cliente" style="max-width:320px;border-radius:8px;" /></p>` : ""}
          <p><strong>Origem:</strong> ${escapeHtml(source)}</p>
          <p><a href="${process.env.NEXTAUTH_URL ?? ""}/leads">Ver no painel</a></p>
        `,
      });
    } catch {
      // ignora erro de e-mail — o lead já está salvo
    }

    // Notificação in-app pro time (admin/gerente) — o kind "lead_novo" já
    // existia no schema de Notification mas nunca era usado em lugar nenhum;
    // sem isso o único rastro de um lead novo era um e-mail que ninguém via.
    try {
      const staff = await prisma.user.findMany({
        where: { role: { in: ["admin", "gerente"] } },
        select: { id: true },
      });
      if (staff.length) {
        const horario = preferredAt
          ? ` · prefere ${preferredAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`
          : "";
        await prisma.notification.createMany({
          data: staff.map((u) => ({
            userId: u.id,
            title: "Novo lead recebido",
            body: `${name} · ${city} · ${subject ?? "Orçamento"}${horario}`,
            kind: "lead_novo",
            link: "/leads",
          })),
        });
      }
    } catch {
      // notificação interna não pode bloquear o lead
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
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "gerente"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ leads });

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
