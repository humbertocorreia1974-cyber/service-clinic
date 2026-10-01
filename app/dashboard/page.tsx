import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Painel · Service Clinic" };

const ATALHOS_ADMIN = [
  { href: "/ordens-servico", label: "Ordens de Serviço" },
  { href: "/clientes", label: "Clientes" },
  { href: "/tecnicos", label: "Técnicos" },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const role = session.user.role;
  // 🩹 2026-09-30: cliente e técnico têm área própria — o dashboard genérico
  // (atalhos administrativos) é só pra quem administra a operação.
  if (role === "cliente") redirect("/portal");
  if (role === "tecnico") redirect("/tecnico");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const atalhos = role === "admin" ? [...ATALHOS_ADMIN, { href: "/usuarios", label: "Usuários" }] : ATALHOS_ADMIN;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Olá, {user?.name ?? user?.email}</h1>
      <p className="mt-1 text-sm text-fg-muted">Bem-vindo de volta ao Service Clinic.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {atalhos.map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="h-full transition-transform hover:-translate-y-1">
              <CardTitle className="text-base">{a.label}</CardTitle>
              <CardBody>Abrir {a.label.toLowerCase()}</CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
