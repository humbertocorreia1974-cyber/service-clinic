import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clientes · Service Clinic" };

export default async function ClientesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/clientes");
  if (!["admin", "gerente"].includes(session.user.role ?? "")) redirect("/dashboard");

  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-fg-muted hover:text-brand transition-colors">
            ← Painel
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-fg">Clientes</h1>
        </div>
        <Link href="/clientes/novo">
          <Button size="sm">Novo cliente</Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <Card>
          <p className="text-sm text-fg-muted">Nenhum cliente cadastrado ainda.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {clients.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <div>
                <CardTitle>{c.nomeFantasia}</CardTitle>
                <p className="mt-1 text-xs text-fg-muted">
                  {c.razaoSocial} · {c.addressCity} · {c.phone}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  c.userId
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-border bg-bg text-fg-muted"
                }`}
              >
                {c.userId ? "Com acesso ao portal" : "Sem acesso"}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
