import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { LaudoDocument } from "@/lib/pdf/laudo-document";
import { sendEmail } from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/whatsapp-baileys";
import { uploadFile } from "@/lib/storage";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";
import React from "react";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!["admin", "gerente", "tecnico"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const channels: string[] = Array.isArray(body?.channels) && body.channels.length ? body.channels : ["email"];

    const laudo = await prisma.laudo.findUnique({
      where: { id: params.id },
      include: { client: true, equipment: true, serviceOrder: { select: { code: true } } },
    });
    if (!laudo) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const buffer = await renderToBuffer(
      React.createElement(LaudoDocument, { laudo, companyName: "Service Clinic" }) as any
    );
    const base64 = buffer.toString("base64");

    let pdfUrl: string | null = laudo.pdfUrl;
    try {
      const up = await uploadFile(`laudo-${laudo.code}.pdf`, base64);
      pdfUrl = up.url;
    } catch (e) {
      console.error("[laudos/enviar] upload do PDF falhou, seguindo sem link público:", (e as Error).message);
    }

    const results: Record<string, { ok: boolean; error?: string }> = {};

    if (channels.includes("email")) {
      if (!laudo.client.email) {
        results.email = { ok: false, error: "Cliente sem e-mail cadastrado." };
      } else {
        try {
          await sendEmail({
            to: laudo.client.email,
            subject: `Laudo técnico ${laudo.code} — Service Clinic`,
            html: `<p>Olá, ${laudo.client.nomeFantasia}.</p><p>Segue em anexo o laudo técnico <strong>${laudo.code}</strong> referente ao atendimento realizado.</p>${pdfUrl ? `<p>Você também pode acessar pelo link: <a href="${pdfUrl}">${pdfUrl}</a></p>` : ""}<p>Service Clinic — manutenção especializada.</p>`,
            attachments: [{ filename: `laudo-${laudo.code}.pdf`, contentBase64: base64 }],
          });
          results.email = { ok: true };
        } catch (e) {
          results.email = { ok: false, error: getErrorMessage(e) };
        }
      }
    }

    if (channels.includes("whatsapp")) {
      const to = laudo.client.whatsapp || laudo.client.phone;
      if (!to) {
        results.whatsapp = { ok: false, error: "Cliente sem WhatsApp/telefone cadastrado." };
      } else if (!pdfUrl) {
        results.whatsapp = { ok: false, error: "Não foi possível gerar o link público do PDF." };
      } else {
        try {
          await sendWhatsAppMessage(
            to,
            `Olá, ${laudo.client.nomeFantasia}! Segue o laudo técnico ${laudo.code} da Service Clinic: ${pdfUrl}`
          );
          results.whatsapp = { ok: true };
        } catch (e) {
          results.whatsapp = { ok: false, error: getErrorMessage(e) };
        }
      }
    }

    await prisma.laudo.update({
      where: { id: laudo.id },
      data: { pdfUrl: pdfUrl ?? laudo.pdfUrl, status: laudo.status === "rascunho" ? "emitido" : laudo.status },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: "send",
        entity: "Laudo",
        entityId: laudo.id,
        metadata: { channels, results },
      },
    });

    return NextResponse.json({ ok: true, results, pdfUrl });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/laudos/[id]/enviar/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch { /* relatar erro nunca pode gerar outro erro */ }
    console.error("[POST /api/laudos/[id]/enviar]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível enviar o laudo." }, { status: 500 });
  }
}
