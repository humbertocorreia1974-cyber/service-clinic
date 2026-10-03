// 🚨 Proxy server-side pro gateway de erro de runtime — necessário porque
// error.tsx/global-error.tsx rodam no CLIENTE ('use client'), onde as env
// vars do gateway (sem prefixo NEXT_PUBLIC_) não existem. O componente de
// erro chama esta rota; esta rota (server) chama reportRuntimeError.
//
// `file` NUNCA vem do cliente — mesmo que o body inclua um, é ignorado.
// Erro de cliente vem de bundle minificado sem source map: não dá pra
// confiar num caminho de arquivo vindo do navegador, e sem `file` o erro
// fica só registrado/visível (nunca elegível a reparo automático).
import { NextResponse } from 'next/server';
import { reportRuntimeError } from '@/lib/runtime-error-reporter';
import { getErrorMessage, getErrorStack } from '@/lib/error-info';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
  try {
    const { message, stack, route } = await request.json();
    if (typeof message === 'string' && message.length > 0) {
      await reportRuntimeError({
        type: 'client',
        route: typeof route === 'string' ? route : undefined,
        message,
        stack: typeof stack === 'string' ? stack : undefined,
      });
    }
  } catch {
    // best-effort — reportar erro de cliente nunca deve gerar erro novo
  }
  return NextResponse.json({ ok: true });

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/report-client-error/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
