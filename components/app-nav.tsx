'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const LINKS = [{"href":"/servicos","label":"Serviços"},{"href":"/area-atendida","label":"Área Atendida"},{"href":"/pecas","label":"Peças"},{"href":"/blog","label":"Blog"}];
const HIDE = [/^\/$/, /^\/login/, /^\/register/, /^\/redefinir-senha/, /^\/esqueci-senha/, /^\/recuperar/, /^\/termos/, /^\/privacidade/, /^\/cookies/, /^\/verificar/];

export function AppNav() {
  const pathname = usePathname() || '/';
  const { status } = useSession();
  // 2026-10-09 (auditoria de lançamento): HIDE por rota não cobre páginas
  // públicas de marketing (ex: /servicos, /contato, /sobre) - visitante
  // anônimo via essas rotas via menu autenticado com 'Sair'. Checar a
  // SESSÃO de verdade, não a rota, fecha a lacuna pra qualquer página.
  if (HIDE.some((re) => re.test(pathname)) || status !== 'authenticated') return null;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-6xl items-center gap-1 overflow-x-auto px-4">
        <Link href="/dashboard" className="mr-4 flex shrink-0 items-center gap-3 text-lg font-bold tracking-tight">
          <img src="/logo.svg" alt="Service Clinic" className="h-12 w-12 rounded-xl shadow-md shadow-brand/20" />
          Service Clinic
        </Link>
        {LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + '/');
          return (
            <Link key={l.href} href={l.href} className={`shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors ${active ? 'bg-brand/10 font-semibold text-brand' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'}`}>
              {l.label}
            </Link>
          );
        })}
        <button onClick={() => signOut({ callbackUrl: '/' })} className="ml-auto shrink-0 rounded-md px-3 py-1.5 text-sm text-fg-muted hover:text-fg">
          Sair
        </button>
      </nav>
    </header>
  );
}
