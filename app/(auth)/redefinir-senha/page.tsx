'use client';
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthShell } from '@/components/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// 2026-09-05: next build (producao) exige que useSearchParams fique dentro
// de um Suspense, senao a geracao de paginas estaticas falha.
function RedefinirSenhaForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, password }) });
    const d = await r.json();
    setLoading(false);
    if (r.ok) { setMsg({ ok: true, text: 'Senha redefinida! Redirecionando para o login…' }); setTimeout(() => router.push('/login'), 1500); }
    else setMsg({ ok: false, text: d.error || 'Não foi possível redefinir.' });
  }

  if (!token) {
    return (
      <AuthShell title="Link inválido" subtitle="Este link de redefinição não é válido ou expirou.">
        <Link href="/esqueci-senha"><Button className="w-full">Pedir um novo link</Button></Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Nova senha" subtitle="Escolha uma senha com pelo menos 8 caracteres.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-fg">Nova senha</label>
          <Input id="password" type="password" required minLength={8} placeholder="Mínimo de 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Salvando…' : 'Redefinir senha'}</Button>
      </form>
      {msg ? (
        <p className={`mt-4 rounded-md border px-3 py-2 text-sm ${msg.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700' : 'border-red-500/30 bg-red-500/10 text-red-600'}`}>{msg.text}</p>
      ) : null}
    </AuthShell>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center text-sm text-fg-muted">Carregando…</main>}>
      <RedefinirSenhaForm />
    </Suspense>
  );
}
