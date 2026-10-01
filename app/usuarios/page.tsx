import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsuariosClient } from "./usuarios-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Usuários · Service Clinic" };

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/usuarios");
  if (session.user.role !== "admin") redirect("/dashboard");

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-fg-muted hover:text-brand transition-colors">
        ← Painel
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-bold text-fg">Usuários</h1>
      <UsuariosClient
        currentUserId={session.user.id}
        initialUsers={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
