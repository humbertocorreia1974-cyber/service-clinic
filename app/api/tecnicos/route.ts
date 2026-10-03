import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/escape-html";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

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
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const cities = Array.isArray(body?.cities) ? body.cities.filter((c: unknown) => typeof c === "string") : [];
    const specialties = String(body?.specialties ?? "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const criarAcesso = Boolean(body?.criarAcesso);

    if (!name || !email || !phone || !cities.length) {
      return NextResponse.json(
        { error: "Preencha nome, e-mail, telefone e ao menos uma cidade atendida." },
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
        data: { email, name, passwordHash, role: "tecnico" },
        select: { id: true },
      });
      userId = user.id;
    }

    // Dois branches em vez de spread condicional (`...(userId ? {userId} : {})`):
    // o tipo de create do Prisma é uma união exclusiva (com ou sem userId), e o
    // TypeScript não consegue provar que um spread condicional respeita essa
    // união — precisa de duas chamadas literais, uma por branch, pra tipar certo.
    const technician = userId
      ? await prisma.technician.create({
          data: { name, email, phone, cities, specialties, userId },
        })
      : await prisma.technician.create({
          data: { name, email, phone, cities, specialties },
        });

    if (criarAcesso && generatedPassword) {
      try {
        await sendEmail({
          to: email,
          subject: "Acesso ao app de técnicos — Service Clinic",
          html: `<p>Olá, ${escapeHtml(name)}!</p><p>Seu acesso foi criado.</p><p>Login: ${escapeHtml(email)}<br/>Senha provisória: <strong>${escapeHtml(generatedPassword)}</strong></p><p>Recomendamos trocar a senha assim que possível.</p>`,
        });
      } catch {
        // falha de e-mail nao bloqueia a criacao do tecnico
      }
    }

    return NextResponse.json({ technician, temporaryPassword: generatedPassword }, { status: 201 });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/tecnicos/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    console.error("[POST /api/tecnicos]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível criar o técnico." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "gerente"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const technicians = await prisma.technician.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ technicians });
  } catch (err) {
    console.error("[GET /api/tecnicos]", err);
    return NextResponse.json({ error: "Erro ao listar técnicos." }, { status: 500 });
  }
}
