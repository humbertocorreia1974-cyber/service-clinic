import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardBody, CardTitle } from '@/components/ui/card';
import { ContatoForm } from './contato-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contato | Service Clinic — Orçamento de manutenção odontológica',
  description:
    'Fale com a Service Clinic: orçamento de manutenção preventiva e corretiva de equipamentos odontológicos, higienização de ar-condicionado clínico e revenda de peças no Sul Fluminense.',
  openGraph: {
    title: 'Contato | Service Clinic',
    description:
      'Solicite orçamento de manutenção odontológica, higienização de AC clínico ou peças de reposição.',
    type: 'website',
  },
};

export default async function ContatoPage({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string }>;
}) {
  const params = await searchParams;
  const cidadePreferida = params.cidade ?? '';

  const cidades = await prisma.city.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, state: true },
  });

  return (
    <main>
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <img
            src="/photos/dental-chair.jpg"
            alt=""
            className="h-full w-full object-cover opacity-[0.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/80 to-bg" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            Contato
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-fg sm:text-5xl">
            Peça seu orçamento sem compromisso
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-fg-muted">
            Conta o que sua clínica precisa — manutenção de cadeira, autoclave,
            compressor, higienização de ar-condicionado ou peças de reposição.
            Respondemos em até 1 dia útil.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardBody>
                <CardTitle>Solicitar orçamento</CardTitle>
                <p className="mt-1 text-sm text-fg-muted">
                  Preencha os dados abaixo. Quanto mais detalhe, mais preciso o
                  retorno.
                </p>
                <div className="mt-6">
                  <ContatoForm
                    cidades={cidades}
                    cidadePreferida={cidadePreferida}
                  />
                </div>
              </CardBody>
            </Card>
          </div>

          <aside className="space-y-4">
            <div className="relative h-40 overflow-hidden rounded-lg border border-border">
              <img
                src="/photos/ac-tech.jpg"
                alt="Técnico Service Clinic em atendimento"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <Card>
              <CardBody>
                <CardTitle>Atendimento direto</CardTitle>
                <ul className="mt-3 space-y-3 text-sm text-fg-muted">
                  <li>
                    <span className="block text-fg">WhatsApp</span>
                    <a href="https://wa.me/5524999467392" className="text-brand hover:text-accent transition-colors duration-150">
                      (24) 99946-7392
                    </a>
                  </li>
                  <li>
                    <span className="block text-fg">Horário</span>
                    Segunda a sexta, 8h às 18h. Emergência em clínica ativa sob
                    consulta.
                  </li>
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CardTitle>Já é cliente?</CardTitle>
                <p className="mt-2 text-sm text-fg-muted">
                  Acesse o portal da clínica pra ver suas OS, registros técnicos e próximas
                  visitas.
                </p>
                <Link
                  href="/login"
                  className="mt-3 inline-block text-sm font-medium text-brand hover:text-accent transition-colors duration-150"
                >
                  Entrar no portal →
                </Link>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CardTitle>Área atendida</CardTitle>
                <p className="mt-2 text-sm text-fg-muted">
                  Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do
                  Piraí.
                </p>
                <Link
                  href="/area-atendida"
                  className="mt-3 inline-block text-sm font-medium text-brand hover:text-accent transition-colors duration-150"
                >
                  Ver mapa de cobertura →
                </Link>
              </CardBody>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
