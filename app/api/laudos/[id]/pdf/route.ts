import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { LaudoDocument } from "@/lib/pdf/laudo-document";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";
import React from "react";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const laudo = await prisma.laudo.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        equipment: true,
        serviceOrder: { select: { code: true } },
      },
    });
    if (!laudo) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const role = session.user.role ?? "";
    if (role === "cliente" && laudo.client.userId !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const buffer = await renderToBuffer(
      React.createElement(LaudoDocument, { laudo, companyName: "Service Clinic" }) as any
    );

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="laudo-${laudo.code}.pdf"`,
      },
    });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/laudos/[id]/pdf/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch { /* relatar erro nunca pode gerar outro erro */ }
    console.error("[GET /api/laudos/[id]/pdf]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível gerar o PDF do laudo." }, { status: 500 });
  }
}
