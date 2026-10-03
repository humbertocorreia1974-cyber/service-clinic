import { NextResponse } from 'next/server';
import { getErrorMessage, getErrorStack } from '@/lib/error-info';

// Proxy pro Assistente de Atendimento JGNEXT. Se não estiver configurado,
// responde de forma amigável em vez de quebrar.
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
  const { message } = await request.json().catch(() => ({ message: '' }));
  const base = process.env.JGNEXT_API_BASE_URL;
  const token = process.env.JGNEXT_CHATBOT_TOKEN;
  if (!base || !token) {
    return NextResponse.json({ reply: 'O atendimento automático ainda não foi ativado. Fale com a gente pelos canais de contato.' });
  }
  try {
    const r = await fetch(base + '/api/v1/embedded-chatbot/message', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
      body: JSON.stringify({ message, channel: 'web' }),
    });
    const d = await r.json();
    return NextResponse.json({ reply: d.reply || 'Não consegui responder agora.' });
  } catch {
    return NextResponse.json({ reply: 'Estou com dificuldade de conexão. Tente novamente em instantes.' }, { status: 200 });
  }

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/assistant/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
