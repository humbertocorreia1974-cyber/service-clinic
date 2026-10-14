import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.notification.count({ where: { userId: session.user.id, readAt: null } }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error("[GET /api/notifications]", getErrorMessage(err));
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/notifications/route.ts",
        message: getErrorMessage(err),
        stack: getErrorStack(err),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    return NextResponse.json({ error: "Não foi possível carregar notificações." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    if (body?.all) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, readAt: null },
        data: { readAt: new Date() },
      });
      return NextResponse.json({ ok: true });
    }

    const id = String(body?.id ?? "");
    if (!id) {
      return NextResponse.json({ error: "id obrigatório." }, { status: 400 });
    }
    // IDOR: só marca como lida a notificação do próprio usuário logado.
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== session.user.id) {
      return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
    }
    await prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/notifications]", getErrorMessage(err));
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/notifications/route.ts",
        message: getErrorMessage(err),
        stack: getErrorStack(err),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    return NextResponse.json({ error: "Não foi possível atualizar a notificação." }, { status: 500 });
  }
}
