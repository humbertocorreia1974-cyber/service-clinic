'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) }).catch(() => {});
    setLoading(false);
    setSent(true);
  }

  return (
    <AuthShell title="Esqueci minha senha" subtitle="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.">
      {sent ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-3 text-sm text-fg">
          Se esse e-mail existir na nossa base, você vai receber um link para redefinir a senha. Confira também a caixa de spam.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-fg">E-mail</label>
            <Input id="email" type="email" required placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Enviando…' : 'Enviar link de redefinição'}</Button>
        </form>
      )}
      <p className="mt-6 text-sm"><Link href="/login" className="text-fg-muted transition-colors hover:text-brand">← Voltar para o login</Link></p>
    </AuthShell>
  );
}
