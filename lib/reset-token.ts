import crypto from 'crypto';

// Token de redefinição de senha assinado (HMAC) — sem precisar de tabela no
// banco. Expira em 1h. `email:expiraEm:impressãoDaSenhaAtual:assinatura`
// em base64url. A impressão digital da senha atual (hash do passwordHash)
// amarra o token ao estado da senha no momento da emissão: depois que a
// senha é trocada, o fingerprint embutido no token não bate mais com o
// novo passwordHash, então o mesmo link não pode ser reaproveitado — token
// de uso único sem precisar persistir nada.
const SECRET = process.env.NEXTAUTH_SECRET || process.env.RESET_TOKEN_SECRET || 'dev-secret-troque-em-producao';

function fingerprint(passwordHash: string): string {
  return crypto.createHash('sha256').update(passwordHash).digest('hex').slice(0, 16);
}

export function createResetToken(email: string, currentPasswordHash: string): string {
  const exp = Date.now() + 60 * 60 * 1000;
  const fp = fingerprint(currentPasswordHash);
  const payload = `${email}:${exp}:${fp}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

// Extrai o e-mail do token SEM validar assinatura — só pra saber qual
// usuário buscar no banco antes da verificação completa. Nunca confiar
// nesse valor sozinho; sempre seguido de verifyResetToken.
export function decodeTokenEmail(token: string): string | null {
  try {
    const [email] = Buffer.from(token, 'base64url').toString('utf8').split(':');
    return email || null;
  } catch {
    return null;
  }
}

export function verifyResetToken(token: string, currentPasswordHash: string): { email: string } | null {
  try {
    const [email, expStr, fp, sig] = Buffer.from(token, 'base64url').toString('utf8').split(':');
    const exp = Number(expStr);
    if (!email || !exp || !fp || !sig) return null;
    if (Date.now() > exp) return null;

    const payload = `${email}:${exp}:${fp}`;
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

    if (fp !== fingerprint(currentPasswordHash)) return null; // senha já foi trocada — link usado

    return { email };
  } catch {
    return null;
  }
}
