import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Técnicos · Service Clinic" };

export default async function TecnicosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/tecnicos");
  if (!["admin", "gerente"].includes(session.user.role)) redirect("/dashboard");

  const technicians = await prisma.technician.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-fg-muted hover:text-brand transition-colors">
            ← Painel
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-fg">Técnicos</h1>
        </div>
        <Link href="/tecnicos/novo">
          <Button size="sm">Novo técnico</Button>
        </Link>
      </div>

      {technicians.length === 0 ? (
        <Card>
          <p className="text-sm text-fg-muted">Nenhum técnico cadastrado ainda.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {technicians.map((t) => (
            <Card key={t.id} className="flex items-center justify-between">
              <div>
                <CardTitle>{t.name}</CardTitle>
                <p className="mt-1 text-xs text-fg-muted">
                  {t.cities.join(", ")} {t.specialties.length ? `· ${t.specialties.join(", ")}` : ""}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  t.userId
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-border bg-bg text-fg-muted"
                }`}
              >
                {t.userId ? "Com acesso" : "Sem acesso"}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
