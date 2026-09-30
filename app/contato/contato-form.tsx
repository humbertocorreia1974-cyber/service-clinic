'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Cidade = { id: string; name: string; state: string };

export function ContatoForm({
  cidades,
  cidadePreferida,
}: {
  cidades: Cidade[];
  cidadePreferida: string;
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErro(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim() || null,
      phone: String(fd.get('phone') ?? '').trim(),
      city: String(fd.get('city') ?? '').trim(),
      subject: String(fd.get('subject') ?? '').trim() || null,
      message: String(fd.get('message') ?? '').trim() || null,
      source: 'contato',
    };

    if (!payload.name || !payload.phone || !payload.city) {
      setStatus('error');
      setErro('Preencha nome, telefone e cidade.');
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Falha ao enviar');
      }
      setStatus('ok');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus('error');
      setErro(err instanceof Error ? err.message : 'Erro inesperado');
    }
  }

  if (status === 'ok') {
    return (
      <div className="rounded-md border border-border bg-brand/10 p-6">
        <p className="font-display text-lg font-semibold text-fg">
          Recebemos seu pedido.
        </p>
        <p className="mt-2 text-sm text-fg-muted">
          Nossa equipe entra em contato em até 1 dia útil. Se for urgência,
          chame no WhatsApp.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm font-medium text-brand hover:text-accent transition-colors duration-150"
        >
          Enviar outro pedido
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm text-fg-muted">
            Nome do responsável *
          </label>
          <Input id="name" name="name" required placeholder="Ex.: Dra. Marina" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm text-fg-muted">
            WhatsApp *
          </label>
          <Input
            id="phone"
            name="phone"
            required
            placeholder="(24) 9 9999-9999"
            inputMode="tel"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-fg-muted">
            E-mail
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="contato@clinica.com.br"
          />
        </div>
        <div>
          <label htmlFor="city" className="mb-1 block text-sm text-fg-muted">
            Cidade *
          </label>
          <select
            id="city"
            name="city"
            required
            defaultValue={cidadePreferida}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand"
          >
            <option value="">Selecione…</option>
            {cidades.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} — {c.state}
              </option>
            ))}
            <option value="Outra">Outra cidade</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="mb-1 block text-sm text-fg-muted">
          Assunto
        </label>
        <select
          id="subject"
          name="subject"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand"
        >
          <option value="">Selecione…</option>
          <option value="Manutenção preventiva">Manutenção preventiva</option>
          <option value="Manutenção corretiva">Manutenção corretiva</option>
          <option value="Higienização de AC / PMOC">Higienização de AC / PMOC</option>
          <option value="Peças de reposição">Peças de reposição</option>
          <option value="Contrato de preventiva">Contrato de preventiva</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm text-fg-muted">
          Detalhes
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Ex.: Cadeira odontológica modelo X, autoclave não está pressurizando. Preciso de visita esta semana."
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand"
        />
      </div>

      {status === 'error' && erro && (
        <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-accent">
          {erro}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'}>
          {status === 'loading' ? 'Enviando…' : 'Enviar pedido'}
        </Button>
        <p className="text-xs text-fg-muted">
          Ao enviar, você concorda com nossa{' '}
          <a href="/privacidade" className="underline hover:text-fg">Política de Privacidade</a>.
        </p>
      </div>
    </form>
  );
}
