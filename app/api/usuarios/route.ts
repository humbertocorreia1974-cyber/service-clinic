import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// roles de equipe interna — cliente e tecnico tem fluxo proprio (/clientes/novo,
// /tecnicos/novo) que cria o registro vinculado (Client/Technician); criar aqui
// sem esse vinculo quebraria o portal/aba do tecnico.
export const STAFF_ROLES = [
    "admin",
    "gerente",
    "atendente",
    "comercial",
    "vendas",
    "compras",
    "financeiro",
    "engenheiro",
];

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

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: "Já existe um usuário cadastrado com este e-mail." },
                { status: 409 }
            );
        }

        const password = passwordInput && passwordInput.length >= 6 ? passwordInput : randomPassword();
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
                message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
                stack: __jgnextApiErrorReportErr?.stack,
            });
        } catch {
            /* relatar erro nunca pode gerar outro erro */
        }
        console.error("[POST /api/usuarios]", __jgnextApiErrorReportErr);
        return NextResponse.json({ error: "Não foi possível criar o usuário." }, { status: 500 });
    }
}
