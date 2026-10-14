'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const LINKS = [{"href":"/servicos","label":"Serviços"},{"href":"/area-atendida","label":"Área Atendida"},{"href":"/pecas","label":"Peças"},{"href":"/blog","label":"Blog"}];
const HIDE = [/^\/$/, /^\/login/, /^\/register/, /^\/redefinir-senha/, /^\/esqueci-senha/, /^\/recuperar/, /^\/termos/, /^\/privacidade/, /^\/cookies/, /^\/verificar/];

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    fetch('/api/notifications')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) {
          setItems(data.notifications ?? []);
          setUnread(data.unreadCount ?? 0);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function markAllRead() {
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
  }

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-fg-muted hover:bg-surface-2 hover:text-fg"
        aria-label="Notificações"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-sm font-semibold text-fg">Notificações</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-brand hover:underline">
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-fg-muted">Nenhuma notificação ainda.</p>
              ) : (
                items.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? '#'}
                    onClick={() => setOpen(false)}
                    className={`block border-b border-border px-3 py-2 last:border-0 hover:bg-surface-2 ${!n.readAt ? 'bg-brand/5' : ''}`}
                  >
                    <p className="text-sm font-medium text-fg">{n.title}</p>
                    <p className="mt-0.5 text-xs text-fg-muted">{n.body}</p>
                    <p className="mt-0.5 text-[11px] text-fg-muted/70">
                      {new Date(n.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function AppNav() {
  const pathname = usePathname() || '/';
  const { data: sessionData, status } = useSession();
  // 2026-10-09 (auditoria de lançamento): HIDE por rota não cobre páginas
  // públicas de marketing (ex: /servicos, /contato, /sobre) - visitante
  // anônimo via essas rotas via menu autenticado com 'Sair'. Checar a
  // SESSÃO de verdade, não a rota, fecha a lacuna pra qualquer página.
  if (HIDE.some((re) => re.test(pathname)) || status !== 'authenticated') return null;
  const role = (sessionData?.user as any)?.role;
  const showBell = role === 'admin' || role === 'gerente';
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
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {showBell && <NotificationBell />}
          <button onClick={() => signOut({ callbackUrl: '/' })} className="shrink-0 rounded-md px-3 py-1.5 text-sm text-fg-muted hover:text-fg">
            Sair
          </button>
        </div>
      </nav>
    </header>
  );
}
