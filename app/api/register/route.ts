export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getErrorMessage, getErrorStack } from '@/lib/error-info';

export async function POST() {
  try {
  return NextResponse.json(
    { error: "Cadastro público desabilitado. Peça acesso a um administrador do Service Clinic." },
    { status: 403 }
  );

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/register/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
