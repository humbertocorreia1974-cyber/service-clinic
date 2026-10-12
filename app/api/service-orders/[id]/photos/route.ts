import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStack } from '@/lib/error-info';

export const dynamic = "force-dynamic";

const VALID_KINDS = ["antes", "depois", "laudo", "outro"];

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const role = session.user.role ?? "";
  if (!["admin", "gerente", "tecnico"].includes(role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const kind = typeof body?.kind === "string" ? body.kind.trim() : "outro";
  const caption = body?.caption ? String(body.caption).trim() : null;

  if (!url || !VALID_KINDS.includes(kind)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const os = await prisma.serviceOrder.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!os) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const photo = await prisma.serviceOrderPhoto.create({
    data: {
      serviceOrderId: os.id,
      url,
      kind,
      caption,
      uploadedById: session.user.id as string,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id as string,
      action: "create",
      entity: "ServiceOrderPhoto",
      entityId: photo.id,
      metadata: { serviceOrderId: os.id, kind },
    },
  });

  return NextResponse.json({ ok: true, photo }, { status: 201 });

  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/service-orders/[id]/photos/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch { /* relatar erro nunca pode gerar outro erro */ }
    console.error("[POST /api/service-orders/[id]/photos]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível salvar a foto." }, { status: 500 });
  }
}
