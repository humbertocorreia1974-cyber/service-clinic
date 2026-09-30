import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { copy } from '@/content/copy';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sobre a Service Clinic | Manutenção odontológica e PMOC no Sul Fluminense',
  description:
    'Conheça a Service Clinic: equipe técnica especializada em manutenção de equipamentos odontológicos, higienização de ar-condicionado em ambiente clínico com laudo PMOC e revenda de peças no Sul Fluminense.',
  openGraph: {
    title: 'Sobre a Service Clinic',
    description:
      'Equipe técnica especializada em manutenção odontológica, higienização de AC clínico com laudo PMOC e revenda de peças no Sul Fluminense.',
    type: 'website',
  },
};

const valores = [
  {
    titulo: 'Biossegurança em primeiro lugar',
    corpo:
      'Todo serviço em ambiente clínico segue protocolo de biossegurança, com laudo técnico assinado e rastreável.',
  },
  {
    titulo: 'Técnico na sua cidade',
    corpo:
      'Equipe distribuída entre Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí — resposta rápida, sem deslocamento longo.',
  },
  {
    titulo: 'Preventiva que evita parada',
    corpo:
      'Contratos de preventiva com alerta automático de vencimento. Sua cadeira não para no meio do atendimento.',
  },
  {
    titulo: 'Peça original, pronta entrega',
    corpo:
      'Estoque próprio das peças mais críticas de cadeira, autoclave, compressor, raio-X e fotopolimerizador.',
  },
];

export default async function SobrePage() {
  const [cidades, servicos, clientesAtivos] = await Promise.all([
    prisma.city.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.service.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.client.count({ where: { active: true } }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">
          Sobre a Service Clinic
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-fg sm:text-5xl">
          {copy.marketing.headline}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-fg-muted">
          {copy.marketing.subheadline}
        </p>
      </header>

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="font-display text-3xl font-bold text-brand">{clientesAtivos}</p>
            <p className="mt-1 text-sm text-fg-muted">Clínicas ativas atendidas</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="font-display text-3xl font-bold text-brand">{cidades.length}</p>
            <p className="mt-1 text-sm text-fg-muted">Cidades cobertas no Sul Fluminense</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="font-display text-3xl font-bold text-brand">{servicos.length}</p>
            <p className="mt-1 text-sm text-fg-muted">Frentes de serviço especializadas</p>
          </CardBody>
        </Card>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-fg">Como trabalhamos</h2>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Somos uma operação de field service enxuta e técnica. Cada ordem de serviço
          tem checklist por tipo de equipamento, fotos antes/depois, assinatura do
          responsável da clínica e laudo quando aplicável.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {valores.map((v) => (
            <Card key={v.titulo}>
              <CardBody>
                <CardTitle>{v.titulo}</CardTitle>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{v.corpo}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-fg">O que fazemos</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {servicos.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-sm text-fg-muted">
                  Catálogo de serviços em atualização. Fale com a gente pra saber como
                  podemos atender sua clínica.
                </p>
                <Link href="/contato" className="mt-3 inline-block">
                  <Button variant="primary" size="sm">Falar com especialista</Button>
                </Link>
              </CardBody>
            </Card>
          ) : (
            servicos.map((s) => (
              <Card key={s.id}>
                <CardBody>
                  <CardTitle>{s.name}</CardTitle>
                  {s.shortDescription && (
                    <p className="mt-2 text-sm text-fg-muted">{s.shortDescription}</p>
                  )}
                  <Link
                    href={`/servicos#${s.slug}`}
                    className="mt-3 inline-block text-sm font-medium text-brand hover:text-accent transition-colors duration-150"
                  >
                    Ver detalhes →
                  </Link>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="mt-16 rounded-lg border border-border bg-surface/70 p-8 backdrop-blur-sm">
        <h2 className="font-display text-2xl font-bold text-fg">
          Precisa de manutenção ou laudo PMOC?
        </h2>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Peça um orçamento sem compromisso. Respondemos em até 1 dia útil com
          diagnóstico inicial e valor da visita.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/contato">
            <Button variant="primary" size="lg">Solicitar orçamento</Button>
          </Link>
          <Link href="/area-atendida">
            <Button variant="secondary" size="lg">Ver área atendida</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
