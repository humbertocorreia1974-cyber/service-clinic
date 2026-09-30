// 📦 Rota interna de upload — recebe o arquivo do formulário (FormData,
// campo "file") direto do navegador e repassa pro gateway de storage do
// JGNEXT via lib/storage.ts. Existe pra o client NUNCA precisar da chave do
// gateway (fica só no servidor) — o browser só conversa com esta rota, no
// MESMO domínio do app.
//
// Exige sessão autenticada sempre - upload anônimo aberto é vetor de abuso
// (encher a quota de storage/servir conteúdo arbitrário). lib/auth.ts é
// FOUNDATION (sempre presente em todo app, needsAuth ou não), então esta
// checagem nunca quebra a compilação mesmo num app que não pediu auth -
// se um caso legítimo de upload anônimo aparecer, é decisão explícita pra
// tirar essa checagem, não o padrão.
//
// Referenciada no prompt de geração (DeveloperAgent.js, needsFileUpload):
// "lib/storage.ts e app/api/upload/route.ts JÁ EXISTEM" — a IA nunca deve
// regenerar nenhum dos dois, só montar o FormData no formulário e chamar
// fetch('/api/upload', { method: 'POST', body: formData }).
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024 * 1024; // mesmo limite do gateway (appStorageGatewayRoutes.js)

export async function POST(request: Request) {
  try {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Arquivo obrigatório (campo "file").' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `Arquivo maior que ${MAX_BYTES / (1024 * 1024)}MB.` }, { status: 413 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile(file.name, buffer.toString('base64'));
    return NextResponse.json({ url: result.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Falha ao subir arquivo.' }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/upload/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
