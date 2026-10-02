import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { decodeTokenEmail, verifyResetToken } from '@/lib/reset-token';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  try {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(`reset-password:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }, { status: 429 });
  }

  const { token, password } = await request.json().catch(() => ({}));
  if (!token || !password || String(password).length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `Token e senha (mín. ${MIN_PASSWORD_LENGTH} caracteres) são obrigatórios.` }, { status: 400 });
  }

  const email = decodeTokenEmail(token);
  if (!email) return NextResponse.json({ error: 'Link inválido ou expirado. Peça um novo.' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'Link inválido ou expirado. Peça um novo.' }, { status: 400 });

  const verified = verifyResetToken(token, user.passwordHash);
  if (!verified) return NextResponse.json({ error: 'Link inválido, expirado ou já utilizado. Peça um novo.' }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await prisma.user.update({ where: { email: verified.email }, data: { passwordHash } });
    return NextResponse.json({ message: 'Senha redefinida com sucesso.' });
  } catch (e) {
    return NextResponse.json({ error: 'Não foi possível redefinir a senha.' }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/auth/reset-password/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
