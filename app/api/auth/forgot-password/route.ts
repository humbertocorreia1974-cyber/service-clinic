import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { createResetToken } from '@/lib/reset-token';
import { escapeHtml } from '@/lib/escape-html';
import { checkRateLimit } from '@/lib/rate-limit';
import { getErrorMessage, getErrorStack } from '@/lib/error-info';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }, { status: 429 });
  }

  const { email } = await request.json().catch(() => ({ email: '' }));
  const generic = NextResponse.json({ message: 'Se o e-mail existir, enviamos um link de redefinição.' });
  if (!email) return generic;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = createResetToken(email, user.passwordHash);
      const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const link = `${base}/redefinir-senha?token=${token}`;
      const safeEmail = escapeHtml(email);
      await sendEmail({
        to: email,
        subject: 'Redefinição de senha',
        html: `<p>Recebemos um pedido para redefinir a senha da conta <strong>${safeEmail}</strong>.</p><p><a href="${link}">Clique aqui para criar uma nova senha</a> (expira em 1 hora, uso único).</p><p>Se não foi você, ignore este e-mail.</p>`,
      });
    }
  } catch (e) {
    console.error('[forgot-password]', (e as Error).message);
  }
  return generic; // nunca revela se o e-mail existe (anti-enumeração)

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/auth/forgot-password/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
