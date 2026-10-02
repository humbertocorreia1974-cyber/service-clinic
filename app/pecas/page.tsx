import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wrench, Package, Search, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catálogo de Peças Odontológicas | Service Clinic',
  description:
    'Peças de reposição para cadeiras odontológicas, autoclaves, compressores, raio-X e fotopolimerizadores. Entrega em Volta Redonda, Barra Mansa, Resende, Pinheiral e Barra do Piraí.',
  openGraph: {
    title: 'Catálogo de Peças Odontológicas | Service Clinic',
    description:
      'Peças originais e compatíveis para equipamentos odontológicos com entrega no Sul Fluminense.',
    type: 'website',
  },
};

const CATEGORIES = [
  { value: '', label: 'Todas as categorias' },
  { value: 'cadeira', label: 'Cadeira odontológica' },
  { value: 'autoclave', label: 'Autoclave' },
  { value: 'compressor', label: 'Compressor' },
  { value: 'raio_x', label: 'Raio-X' },
  { value: 'fotopolimerizador', label: 'Fotopolimerizador' },
  { value: 'geral', label: 'Geral' },
];

function formatBRL(v: unknown) {
  const n = typeof v === 'number' ? v : Number(v ?? 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function CatalogoPecasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const categoria = sp.categoria?.trim() || '';
  const q = sp.q?.trim() || '';

  const parts = await prisma.part.findMany({
    where: {
      active: true,
      publicVisible: true,
      ...(categoria ? { category: categoria } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { sku: { contains: q, mode: 'insensitive' } },
              { brand: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    take: 120,
  });

  return (
    <main>
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <img
            src="/photos/tool-cart-organized.png"
            alt=""
            className="h-full w-full object-cover opacity-[0.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/80 to-bg" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-fg-muted">
            <Package className="h-3.5 w-3.5 text-accent" />
            Catálogo público
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            Peças de reposição para equipamentos odontológicos
          </h1>
          <p className="mt-3 max-w-2xl text-fg-muted">
            Peças originais e compatíveis para cadeiras, autoclaves, compressores, raio-X e
            fotopolimerizadores. Consulte disponibilidade e solicite orçamento — atendemos todo o Sul
            Fluminense.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <form
          method="GET"
          className="mb-8 grid gap-3 rounded-lg border border-border bg-surface/70 p-4 backdrop-blur-sm sm:grid-cols-[1fr_240px_auto]"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome, SKU ou marca..."
              className="pl-9"
            />
          </div>
          <select
            name="categoria"
            defaultValue={categoria}
            className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="primary">
            Filtrar
          </Button>
        </form>

        {parts.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center">
              <Wrench className="mx-auto mb-3 h-8 w-8 text-fg-muted" />
              <p className="text-fg">Nenhuma peça encontrada com esses filtros.</p>
              <p className="mt-1 text-sm text-fg-muted">
                Tente outra categoria ou fale com nosso time — trabalhamos com encomenda.
              </p>
              <div className="mt-5">
                <Link href="/contato">
                  <Button variant="primary">Falar com um especialista</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {parts.map((p) => (
              <Card key={p.id} className="flex flex-col">
                <CardBody className="flex flex-1 flex-col">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                      {CATEGORIES.find((c) => c.value === p.category)?.label ?? p.category}
                    </span>
                    {p.brand ? (
                      <span className="text-xs text-fg-muted">{p.brand}</span>
                    ) : null}
                  </div>
                  <h2 className="font-display text-base font-semibold text-fg">{p.name}</h2>
                  <p className="mt-1 text-xs text-fg-muted">SKU: {p.sku}</p>
                  {p.description ? (
                    <p className="mt-2 line-clamp-3 text-sm text-fg-muted">{p.description}</p>
                  ) : null}
                  <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
                    <div>
                      <p className="text-xs text-fg-muted">A partir de</p>
                      <p className="font-display text-lg font-bold text-accent">
                        {formatBRL(p.salePrice)}
                      </p>
                    </div>
                    <Link
                      href={`/contato?peca=${encodeURIComponent(p.sku)}&assunto=${encodeURIComponent(
                        'Orçamento de peça: ' + p.name,
                      )}`}
                    >
                      <Button variant="secondary" size="sm">
                        Orçamento
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        <section className="mt-12 rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm">
          <h2 className="font-display text-xl font-semibold text-fg">
            Não encontrou a peça que precisa?
          </h2>
          <p className="mt-2 text-sm text-fg-muted">
            Trabalhamos com encomenda de peças específicas de qualquer marca. Envie o modelo do
            equipamento e a peça desejada — retornamos com prazo e valor.
          </p>
          <div className="mt-4">
            <Link href="/contato">
              <Button variant="primary">Solicitar peça sob encomenda</Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
