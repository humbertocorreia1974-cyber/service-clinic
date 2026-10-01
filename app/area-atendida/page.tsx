import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MapView, { type MapPoint } from '@/components/map-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Área Atendida | Service Clinic — Sul Fluminense (RJ)',
  description:
    'Atendemos Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí com manutenção de equipamentos odontológicos, higienização de ar-condicionado clínico e revenda de peças.',
  openGraph: {
    title: 'Área Atendida | Service Clinic',
    description:
      'Cobertura técnica no Sul Fluminense: Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí.',
    type: 'website',
  },
};

export default async function AreaAtendidaPage() {
  const cidades = await prisma.city.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });

  const pontos: MapPoint[] = cidades
    .filter((c) => c.latitude != null && c.longitude != null)
    .map((c) => ({
      id: c.id,
      lat: c.latitude as number,
      lng: c.longitude as number,
      title: c.name,
      subtitle: `${c.state} — atendimento técnico Service Clinic`,
    }));

  const center: [number, number] =
    pontos.length > 0
      ? [pontos[0].lat, pontos[0].lng]
      : [-22.5231, -44.1041];

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">
          Área atendida
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-fg sm:text-5xl">
          Técnico na sua cidade, no mesmo dia
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-fg-muted">
          Cobrimos as cinco principais cidades do Sul Fluminense com equipe
          própria. Se a sua clínica fica em uma delas, a visita técnica é
          agendada com prioridade — sem intermediário, sem terceirização.
        </p>
      </header>

      <section className="mt-12">
        <Card>
          <CardBody>
            <CardTitle>Mapa de cobertura</CardTitle>
            <p className="mt-1 text-sm text-fg-muted">
              Pontos marcados são as cidades com atendimento ativo.
            </p>
            <div className="mt-4 overflow-hidden rounded-md border border-border">
              {pontos.length === 0 ? (
                <div className="flex h-72 items-center justify-center bg-surface/50 text-sm text-fg-muted">
                  Mapa indisponível — nenhuma cidade com coordenadas cadastradas.
                </div>
              ) : (
                <MapView points={pontos} center={center} zoom={9} height={420} />
              )}
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-fg">Cidades cobertas</h2>
        {cidades.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-sm text-fg-muted">
                Nenhuma cidade cadastrada ainda. Fale com a gente pelo formulário
                de contato — provavelmente atendemos a sua região.
              </p>
              <Link href="/contato" className="mt-3 inline-block">
                <Button variant="primary" size="sm">Falar com a equipe</Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cidades.map((c) => (
              <Card key={c.id}>
                <CardBody>
                  <CardTitle>{c.name}</CardTitle>
                  <p className="mt-1 text-sm text-fg-muted">
                    {c.state} · atendimento técnico agendado
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-fg-muted">
                    <li>• Manutenção preventiva e corretiva</li>
                    <li>• Higienização de AC clínico (sub-serviço)</li>
                    <li>• Entrega de peças de reposição</li>
                  </ul>
                  <Link
                    href={`/contato?cidade=${encodeURIComponent(c.name)}`}
                    className="mt-4 inline-block text-sm font-medium text-brand hover:text-accent transition-colors duration-150"
                  >
                    Solicitar visita em {c.name} →
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 rounded-lg border border-border bg-surface/70 p-8 backdrop-blur-sm">
        <h2 className="font-display text-2xl font-bold text-fg">
          Sua cidade não está na lista?
        </h2>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Atendemos também cidades vizinhas sob consulta. Manda o endereço da
          clínica que a gente confirma cobertura e prazo.
        </p>
        <div className="mt-6">
          <Link href="/contato">
            <Button variant="primary" size="lg">Consultar cobertura</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
