'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardBody } from '@/components/ui/card';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Não foi possível enviar o e-mail.');
      }
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <Card>
        <CardBody className="text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-brand" />
          <h2 className="font-display text-lg font-semibold text-fg">Verifique seu e-mail</h2>
          <p className="mt-2 text-sm text-fg-muted">
            Se <span className="text-fg">{email}</span> estiver cadastrado, você receberá um link
            para redefinir a senha em alguns minutos. Confira também a caixa de spam.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-fg">
              E-mail
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="voce@clinica.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {status === 'error' && error ? (
            <div className="flex items-start gap-2 rounded-md border border-border bg-surface/70 p-3 text-sm text-fg">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
              <span>{error}</span>
            </div>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Enviando...' : 'Enviar link de redefinição'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
