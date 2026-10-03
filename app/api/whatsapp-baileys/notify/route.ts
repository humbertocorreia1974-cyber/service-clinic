import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp-baileys';

export const dynamic = 'force-dynamic';

function hasValidInternalToken(request: Request): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) return false;
  const provided = request.headers.get('x-internal-token') || '';
  try {
    const a = Uint8Array.from(Buffer.from(provided));
    const b = Uint8Array.from(Buffer.from(expected));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Rota INTERNA - a lógica do app (ex: pedido ficou pronto) chama isso pra
// notificar o cliente final via WhatsApp. Não é um webhook inbound da Meta -
// é o equivalente Baileys da rota app/api/whatsapp/webhook/route.ts.
export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'admin';
  if (!isAdmin && !hasValidInternalToken(request)) {
    return NextResponse.json({ error: 'nao autorizado' }, { status: 401 });
  }
  const { to, message } = await request.json();
  if (!to || !message) {
    return NextResponse.json({ error: 'to e message são obrigatórios.' }, { status: 400 });
  }
  try {
    await sendWhatsAppMessage(to, message);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 502 });
  }

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/whatsapp-baileys/notify/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
