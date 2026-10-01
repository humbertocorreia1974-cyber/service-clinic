import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "../route";

export const dynamic = "force-dynamic";

// roles que tem fluxo proprio (criam registro vinculado) — permitido manter ao
// editar (nao quebra nada), mas nao e oferecido como opcao nova nesta tela.
const ALL_EDITABLE_ROLES = [...STAFF_ROLES, "cliente", "tecnico"];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const data: Record<string, unknown> = {};

        if (body?.role != null) {
            const role = String(body.role).trim();
            if (!ALL_EDITABLE_ROLES.includes(role)) {
                return NextResponse.json({ error: "Função inválida." }, { status: 400 });
            }
            data.role = role;
        }
        if (body?.name != null) {
            data.name = String(body.name).trim().slice(0, 200);
        }

        if (!Object.keys(data).length) {
            return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data,
            select: { id: true, name: true, email: true, role: true },
        });

        return NextResponse.json({ ok: true, user });
    } catch (__jgnextApiErrorReportErr) {
        try {
            const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
            await reportRuntimeError({
                type: "server",
                file: "app/api/usuarios/[id]/route.ts",
                message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
                stack: __jgnextApiErrorReportErr?.stack,
            });
        } catch {
            /* relatar erro nunca pode gerar outro erro */
        }
        console.error("[PATCH /api/usuarios/[id]]", __jgnextApiErrorReportErr);
        return NextResponse.json({ error: "Não foi possível atualizar o usuário." }, { status: 500 });
    }
}
