import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (!["admin", "gerente", "tecnico"].includes(role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.signerName !== "string" || typeof body.signatureData !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const os = await prisma.serviceOrder.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!os) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const ip = request.headers.get("x-forwarded-for") ?? null;
  const ua = request.headers.get("user-agent") ?? null;

  const sig = await prisma.serviceOrderSignature.create({
    data: {
      serviceOrderId: os.id,
      signerName: body.signerName,
      signerDocument: body.signerDocument ?? null,
      signatureData: body.signatureData,
      ipAddress: ip,
      userAgent: ua,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "create",
      entity: "ServiceOrderSignature",
      entityId: sig.id,
      ipAddress: ip,
      userAgent: ua,
      metadata: { serviceOrderId: os.id, signerName: body.signerName },
    },
  });

  return NextResponse.json({ ok: true, signature: { id: sig.id, signedAt: sig.signedAt } });

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/service-orders/[id]/signature/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
