"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, PackageSearch } from "lucide-react";

export default function RastreioPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/pecas/rastreio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fd.get("code"), email: fd.get("email") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Não foi possível consultar agora.");
        setLoading(false);
        return;
      }
      router.push(`/pecas/pedido/${data.orderId}`);
    } catch {
      setError("Não foi possível consultar agora.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Link href="/pecas" className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-brand">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao catálogo
      </Link>
      <Card className="mt-4">
        <CardBody>
          <div className="flex items-center gap-2 text-brand">
            <PackageSearch className="h-5 w-5" />
            <h1 className="font-display text-xl font-bold text-fg">Acompanhar pedido</h1>
          </div>
          <p className="mt-1 text-sm text-fg-muted">Digite o código do pedido (ex.: PED-ABC123) e o e-mail usado na compra.</p>
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            {error && <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
            <Input name="code" required placeholder="Código do pedido" autoCapitalize="characters" />
            <Input name="email" type="email" required placeholder="E-mail da compra" />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Consultando..." : "Ver andamento"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
