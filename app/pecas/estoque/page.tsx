import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EstoqueClient } from "./estoque-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Estoque de peças · Service Clinic" };

export default async function EstoquePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/pecas/estoque");
  if (!["admin", "gerente"].includes(session.user.role ?? "")) redirect("/dashboard");

  const parts = await prisma.part.findMany({
    where: { active: true },
    select: { id: true, sku: true, name: true, category: true, stockQty: true, minStockQty: true, unit: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-fg-muted hover:text-brand transition-colors">
        ← Painel
      </Link>
      <h1 className="mt-2 mb-1 font-display text-2xl font-bold text-fg">Estoque de peças</h1>
      <p className="mb-6 text-sm text-fg-muted">
        {parts.length} peça(s) ativa(s). Itens em vermelho estão no ou abaixo do estoque mínimo.
      </p>
      <EstoqueClient initialParts={parts} />
    </div>
  );
}
