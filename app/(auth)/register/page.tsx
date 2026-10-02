"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/login"), 4000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <img src="/logo.svg" alt="Service Clinic" className="h-16 w-16 rounded-xl" />
      <h1 className="text-2xl font-semibold tracking-tight">Cadastro por convite</h1>
      <p className="max-w-sm text-sm text-fg-muted">
        O Service Clinic é um sistema interno. Sua conta é criada por um administrador
        da empresa — procure o responsável para receber acesso, ou entre se já tiver uma conta.
      </p>
      <Link href="/login" className="mt-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-fg">
        Ir para o login
      </Link>
    </div>
  );
}
