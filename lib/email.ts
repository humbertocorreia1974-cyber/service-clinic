// Envio de e-mail transacional — provider-agnóstico, nunca quebra o app se
// não estiver configurado (loga e segue). Ordem: Resend (se RESEND_API_KEY) →
// SMTP via nodemailer (se SMTP_HOST) → console (dev).
type EmailAttachment = { filename: string; contentBase64: string };

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}) {
  const from = process.env.EMAIL_FROM || 'no-reply@example.com';
  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
          ...(attachments?.length
            ? { attachments: attachments.map((a) => ({ filename: a.filename, content: a.contentBase64 })) }
            : {}),
        }),
      });
      if (!r.ok) console.error('[email] Resend falhou:', await r.text());
      return;
    }
    if (process.env.SMTP_HOST) {
      const nodemailer = await import('nodemailer').catch(() => null);
      if (!nodemailer) { console.warn('[email] SMTP_HOST configurado mas "nodemailer" não instalado.'); return; }
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
      await transporter.sendMail({
        from,
        to,
        subject,
        html,
        ...(attachments?.length
          ? { attachments: attachments.map((a) => ({ filename: a.filename, content: Buffer.from(a.contentBase64, 'base64') })) }
          : {}),
      });
      return;
    }
    console.log(`[email] (sem provider configurado — RESEND_API_KEY ou SMTP_HOST) Para: ${to} | Assunto: ${subject}${attachments?.length ? ` | ${attachments.length} anexo(s)` : ''}`);
  } catch (e) {
    console.error('[email] envio falhou:', (e as Error).message);
  }
}

export async function sendWelcomeEmail(to: string, name?: string) {
  await sendEmail({
    to,
    subject: `Bem-vindo(a)${name ? ', ' + name : ''}!`,
    html: `<p>Olá${name ? ' ' + name : ''}, sua conta foi criada com sucesso. Bom uso!</p>`,
  });
}
