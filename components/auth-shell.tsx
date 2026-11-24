import Link from "next/link";
import type { ReactNode } from "react";

/** Moldura das telas de acesso (esqueci/redefinir senha): logo, título e cartão no padrão do app. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-base font-semibold tracking-tight text-fg">
          <img src="/logo.svg" alt="Service Clinic" className="h-9 w-9 rounded-lg shadow-md shadow-brand/20" />
          Service Clinic
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-fg-muted">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
