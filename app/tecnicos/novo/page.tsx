import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { NovoTecnicoForm } from "./novo-tecnico-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo técnico · Service Clinic" };

const CIDADES = ["Volta Redonda", "Pinheiral", "Barra Mansa", "Resende", "Barra do Piraí"];

export default async function NovoTecnicoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/tecnicos/novo");
  if (!["admin", "gerente"].includes(session.user.role ?? "")) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/tecnicos" className="text-sm text-fg-muted hover:text-brand transition-colors">
        ← Técnicos
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold text-fg">Novo técnico</h1>
      <Card className="mt-6">
        <NovoTecnicoForm cidades={CIDADES} />
      </Card>
    </div>
  );
}
