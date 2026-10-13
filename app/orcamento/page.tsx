import type { Metadata } from "next";
import Image from "next/image";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { OrcamentoForm } from "./orcamento-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orçamento com foto | Service Clinic",
  description:
    "Envie uma foto do equipamento e descreva o problema — nosso time avalia e retorna com o orçamento em até 1 dia útil.",
  openGraph: {
    title: "Orçamento com foto | Service Clinic",
    description: "Avaliação rápida com foto real do problema, sem precisar agendar visita antes.",
    type: "website",
  },
};

export default function OrcamentoPage() {
  return (
    <main>
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <Image
            src="/photos/technician-hands-tools.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/80 to-bg" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Orçamento rápido</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-fg sm:text-5xl">
            Mande uma foto do problema e receba o orçamento
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-fg-muted">
            Tire uma foto do equipamento com defeito, descreva o que está acontecendo e nossa equipe técnica
            avalia antes mesmo de agendar a visita.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardBody>
                <CardTitle>Solicitar orçamento com foto</CardTitle>
                <p className="mt-1 text-sm text-fg-muted">
                  Quanto mais clara a foto e a descrição, mais preciso o retorno.
                </p>
                <div className="mt-6">
                  <OrcamentoForm />
                </div>
              </CardBody>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardBody>
                <CardTitle>Como funciona</CardTitle>
                <ol className="mt-3 space-y-3 text-sm text-fg-muted">
                  <li>
                    <span className="font-medium text-fg">1. Você envia</span> — foto do equipamento e
                    descrição do problema.
                  </li>
                  <li>
                    <span className="font-medium text-fg">2. Nosso técnico avalia</span> — em até 1 dia
                    útil.
                  </li>
                  <li>
                    <span className="font-medium text-fg">3. Você recebe o orçamento</span> — por
                    WhatsApp ou e-mail, com o valor estimado.
                  </li>
                </ol>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CardTitle>Prefere falar direto?</CardTitle>
                <p className="mt-2 text-sm text-fg-muted">Atendimento comercial pelo WhatsApp:</p>
                <a
                  href="https://wa.me/5524999467392"
                  className="mt-2 inline-block text-sm font-medium text-brand hover:text-accent transition-colors duration-150"
                >
                  (24) 99946-7392
                </a>
              </CardBody>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
