import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Wind, Package, FileCheck2, CalendarClock, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Serviços | Service Clinic — Manutenção odontológica",
  description:
    "Manutenção preventiva e corretiva de equipamentos odontológicos e revenda de peças no Sul Fluminense.",
  openGraph: {
    title: "Serviços | Service Clinic",
    description:
      "Preventiva, corretiva e peças de reposição para clínicas odontológicas no Sul Fluminense.",
    type: "website",
  },
};

const ICONS: Record<string, any> = {
  Wrench,
  Wind,
  Package,
  FileCheck2,
  CalendarClock,
  MapPin,
};

export default async function ServicosPage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  const fallback = [
    {
      id: "1",
      slug: "manutencao-preventiva",
      name: "Manutenção preventiva",
      shortDescription:
        "Visitas programadas com checklist técnico por equipamento e relatório digital.",
      icon: "Wrench",
    },
    {
      id: "2",
      slug: "manutencao-corretiva",
      name: "Manutenção corretiva",
      shortDescription:
        "Atendimento prioritário para clínicas com contrato. Diagnóstico, peça e reparo com OS digital.",
      icon: "Wrench",
    },
    {
      id: "3",
      slug: "higienizacao-pmoc",
      name: "Higienização de ar-condicionado (sub-serviço)",
      shortDescription:
        "Limpeza técnica em ambiente clínico, registrada na ordem de serviço — realizada junto com a manutenção dos equipamentos.",
      icon: "Wind",
    },
    {
      id: "4",
      slug: "revenda-pecas",
      name: "Revenda de peças",
      shortDescription:
        "Catálogo com SKU, compatibilidade por marca e entrega rápida em toda a região.",
      icon: "Package",
    },
  ];

  const list = services.length > 0 ? services : fallback;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">
          Nossos serviços
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-fg md:text-5xl">
          Tudo que sua clínica precisa em um só fornecedor
        </h1>
        <p className="mt-4 text-fg-muted">
          Da cadeira odontológica ao ar-condicionado da recepção — com ordens de serviço
          digitais, laudos assinados e agenda por técnico.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((s: any) => {
          const Icon = ICONS[s.icon ?? "Wrench"] ?? Wrench;
          return (
            <Card key={s.id} className="flex flex-col">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle>{s.name}</CardTitle>
              <CardBody className="flex-1">{s.shortDescription}</CardBody>
              <Link
                href={`/contato?servico=${s.slug}`}
                className="mt-4 text-sm font-semibold text-brand hover:underline"
              >
                Solicitar orçamento →
              </Link>
            </Card>
          );
        })}
      </div>

      <div className="mt-16 rounded-lg border border-border bg-surface/70 p-8 backdrop-blur-sm">
        <h2 className="font-display text-2xl font-bold text-fg">
          Precisa de manutenção urgente?
        </h2>
        <p className="mt-2 text-fg-muted">
          Fale com a gente e receba diagnóstico inicial e prazo de atendimento.
        </p>
        <Link href="/contato" className="mt-6 inline-block">
          <Button variant="primary" size="lg">
            Falar com especialista
          </Button>
        </Link>
      </div>
    </main>
  );
}
