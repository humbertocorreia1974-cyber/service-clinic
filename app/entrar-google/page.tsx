"use client";
// jgnext-google: volta do Google — recebe a asserção do broker e abre a sessão
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function Entrando() {
  const sp = useSearchParams();
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => {
    const assertion = sp.get("assertion");
    const rawNext = sp.get("next") || "/dashboard";
    const next = /^\/(?!\/)/.test(rawNext) ? rawNext : "/dashboard";
    if (!assertion) {
      setErro(sp.get("error") === "email" ? "O Google não confirmou o seu e-mail." : "Não foi possível entrar com o Google.");
      return;
    }
    signIn("jgnext-google", { assertion, redirect: false }).then((res) => {
      if (res?.error) setErro("Esta conta Google não tem acesso a este app. Peça um convite ao administrador.");
      else { router.replace(next); router.refresh(); }
    });
  }, [sp, router]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-center">
      {erro ? (
        <div className="max-w-sm">
          <p className="text-sm text-fg">{erro}</p>
          <Link href="/login" className="mt-4 inline-block text-sm text-brand underline">Voltar para o login</Link>
        </div>
      ) : (
        <p className="text-sm text-fg-muted">Entrando com o Google…</p>
      )}
    </main>
  );
}

export default function EntrarGooglePage() {
  return (
    <Suspense fallback={null}>
      <Entrando />
    </Suspense>
  );
}
