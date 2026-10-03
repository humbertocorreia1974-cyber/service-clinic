import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/staff-roles";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

const MIN_PASSWORD_LENGTH = 8;

function randomPassword() {
    return (
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-2).toUpperCase()
    );
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        }
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ users });
    } catch (err) {
        console.error("[GET /api/usuarios]", err);
        return NextResponse.json({ error: "Erro ao listar usuários." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const name = String(body?.name ?? "").trim();
        const email = String(body?.email ?? "").trim().toLowerCase();
        const role = String(body?.role ?? "").trim();
        const passwordInput = body?.password ? String(body.password) : null;

        if (!name || !email || !STAFF_ROLES.includes(role)) {
            return NextResponse.json(
                { error: "Preencha nome, e-mail e selecione uma função válida." },
                { status: 400 }
            );
        }
        if (passwordInput && passwordInput.length < MIN_PASSWORD_LENGTH) {
            return NextResponse.json(
                { error: `Senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` },
                { status: 400 }
            );
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: "Já existe um usuário cadastrado com este e-mail." },
                { status: 409 }
            );
        }

        const password = passwordInput && passwordInput.length >= MIN_PASSWORD_LENGTH ? passwordInput : randomPassword();
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, passwordHash, role },
            select: { id: true, name: true, email: true, role: true },
        });

        return NextResponse.json(
            { user, temporaryPassword: passwordInput ? null : password },
            { status: 201 }
        );
    } catch (__jgnextApiErrorReportErr) {
        try {
            const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
            await reportRuntimeError({
                type: "server",
                file: "app/api/usuarios/route.ts",
                message: getErrorMessage(__jgnextApiErrorReportErr),
                stack: getErrorStack(__jgnextApiErrorReportErr),
            });
        } catch {
            /* relatar erro nunca pode gerar outro erro */
        }
        console.error("[POST /api/usuarios]", __jgnextApiErrorReportErr);
        return NextResponse.json({ error: "Não foi possível criar o usuário." }, { status: 500 });
    }
}
