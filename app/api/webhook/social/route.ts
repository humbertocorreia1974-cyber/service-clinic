import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Verificação do webhook (Meta exige isso no cadastro da URL).
export async function GET(request: Request) {
  try {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'verificação inválida' }, { status: 403 });

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/webhook/social/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

// Confere a assinatura HMAC-SHA256 que a Meta envia no header
// X-Hub-Signature-256 (calculada sobre o corpo cru, com o App Secret).
// Sem isso, qualquer um pode forjar um POST fingindo ser o Instagram/
// Facebook. Se META_APP_SECRET não estiver configurado, falha fechado
// (rejeita) em vez de aceitar sem checagem.
function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Uint8Array.from(Buffer.from(signatureHeader));
  const b = Uint8Array.from(Buffer.from(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Mensagem recebida (Instagram/Facebook DM) -> encaminha pro cérebro
// unificado do Assistente JGNEXT (mesmo endpoint do chat embutido/WhatsApp).
export async function POST(request: Request) {
  try {
  const rawBody = await request.text();

  if (!isValidSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    console.warn('[social webhook] assinatura inválida ou META_APP_SECRET ausente — requisição rejeitada');
    return NextResponse.json({ error: 'assinatura inválida' }, { status: 401 });
  }

  const body = (() => { try { return JSON.parse(rawBody); } catch { return null; } })();
  const base = process.env.JGNEXT_API_BASE_URL;
  const token = process.env.JGNEXT_CHATBOT_TOKEN;
  if (!base || !token || !body) return NextResponse.json({ received: true });
  try {
    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0] || entry?.changes?.[0]?.value?.messages?.[0];
    const text = messaging?.message?.text || messaging?.text?.body;
    const from = messaging?.sender?.id || messaging?.from;
    if (text && from) {
      await fetch(base + '/api/v1/embedded-chatbot/message', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
        body: JSON.stringify({ message: text, channel: 'social', customerContact: String(from) }),
      }).catch(() => {});
    }
  } catch (e) {
    console.error('[social webhook]', (e as Error).message);
  }
  return NextResponse.json({ received: true });

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/webhook/social/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
