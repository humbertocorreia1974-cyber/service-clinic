import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enqueueJob } from '@/lib/queue';
import { getErrorMessage, getErrorStack } from '@/lib/error-info';

export const dynamic = 'force-dynamic';

// Enfileira um job real pra processamento assincrono (worker separado, ver
// workers/backgroundWorker.ts e JOBS_SETUP.md). NAO processa nada aqui - so
// aceita e devolve o id do job.
//
// 🔒 Protegido: exige um usuario logado OU o header `x-jobs-secret` batendo
// com JOBS_API_SECRET (pra chamadas server-to-server / cron). Sem isso,
// qualquer visitante enfileirava jobs (abuso de recurso).
export async function POST(request: Request) {
  try {
  try {
    const secret = process.env.JOBS_API_SECRET;
    const headerSecret = request.headers.get('x-jobs-secret');
    const authedBySecret = !!secret && headerSecret === secret;
    if (!authedBySecret) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
      }
    }
    const { type, payload } = await request.json();
    if (!type) {
      return NextResponse.json({ error: 'type e\' obrigatorio' }, { status: 400 });
    }
    const job = await enqueueJob(type, payload || {});
    return NextResponse.json({ success: true, jobId: job.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/jobs/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
