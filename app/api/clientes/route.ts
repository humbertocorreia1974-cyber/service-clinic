import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getErrorMessage, getErrorStack } from '@/lib/error-info';

export const dynamic = "force-dynamic";

function randomPassword() {
  return (
    Math.random().toString(36).slice(-8) +
    Math.random().toString(36).slice(-2).toUpperCase()
  );
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!["admin", "gerente"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const razaoSocial = String(body?.razaoSocial ?? "").trim();
    const nomeFantasia = String(body?.nomeFantasia ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const whatsapp = body?.whatsapp ? String(body.whatsapp).trim() : null;
    const cnpj = body?.cnpj ? String(body.cnpj).trim() : null;
    const addressCity = String(body?.addressCity ?? "").trim();
    const addressStreet = body?.addressStreet ? String(body.addressStreet).trim() : null;
    const addressNumber = body?.addressNumber ? String(body.addressNumber).trim() : null;
    const criarAcesso = Boolean(body?.criarAcesso);

    if (!razaoSocial || !nomeFantasia || !email || !phone || !addressCity) {
      return NextResponse.json(
        { error: "Preencha razão social, nome fantasia, e-mail, telefone e cidade." },
        { status: 400 }
      );
    }

    let generatedPassword: string | null = null;
    let userId: string | undefined;

    if (criarAcesso) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json(
          { error: "Já existe um usuário cadastrado com este e-mail." },
          { status: 409 }
        );
      }
      generatedPassword = randomPassword();
      const passwordHash = await bcrypt.hash(generatedPassword, 10);
      const user = await prisma.user.create({
        data: { email, name: nomeFantasia, passwordHash, role: "cliente" },
        select: { id: true },
      });
      userId = user.id;
    }

    const client = await prisma.client.create({
      data: {
        razaoSocial,
        nomeFantasia,
        email,
        phone,
        whatsapp,
        cnpj,
        addressCity,
        addressStreet,
        addressNumber,
        userId,
      },
    });

    if (criarAcesso && generatedPassword) {
      try {
        await sendEmail({
          to: email,
          subject: "Acesso ao portal — Service Clinic",
          html: `<p>Olá, ${nomeFantasia}!</p><p>Seu acesso ao portal da Service Clinic foi criado.</p><p>Login: ${email}<br/>Senha provisória: <strong>${generatedPassword}</strong></p><p>Recomendamos trocar a senha assim que possível.</p>`,
        });
      } catch {
        // falha de e-mail nao bloqueia a criacao do cliente
      }
    }

    return NextResponse.json({ client, temporaryPassword: generatedPassword }, { status: 201 });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/clientes/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    console.error("[POST /api/clientes]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível criar o cliente." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "gerente"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ clients });
  } catch (err) {
    console.error("[GET /api/clientes]", err);
    return NextResponse.json({ error: "Erro ao listar clientes." }, { status: 500 });
  }
}
