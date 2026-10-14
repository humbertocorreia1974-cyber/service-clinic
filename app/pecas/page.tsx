import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wrench, Search, ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { CATEGORY_OPTIONS, categoryMeta } from '@/lib/part-categories';
import { AddToCartButton } from './add-to-cart-button';
import { CartIndicator } from './cart-indicator';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Loja de Peças, Acessórios e Equipamentos | Service Clinic',
  description:
    'Peças de reposição, acessórios e equipamentos para cadeiras odontológicas, autoclaves, compressores, raio-X e fotopolimerizadores. Entrega em Volta Redonda, Barra Mansa, Resende, Pinheiral e Barra do Piraí.',
  openGraph: {
    title: 'Loja de Peças, Acessórios e Equipamentos | Service Clinic',
    description:
      'Peças originais e compatíveis para equipamentos odontológicos com entrega no Sul Fluminense.',
    type: 'website',
  },
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as Record<string, any>)[name] ?? Icons.Package;
  return <C className={className} />;
}

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
          <Image
            src="/photos/tool-cart-organized.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/80 to-bg" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-dashed border-accent bg-accent/5 px-3 py-1 font-mono text-xs text-accent">
                <Icons.Package className="h-3.5 w-3.5" />
                Loja Service Clinic
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                Peças, acessórios e equipamentos para sua clínica
              </h1>
              <p className="mt-3 max-w-2xl text-fg-muted">
                Peças originais e compatíveis para cadeiras, autoclaves, compressores, raio-X e
                fotopolimerizadores. Compre direto pelo site ou solicite orçamento — atendemos todo o
                Sul Fluminense.
              </p>
            </div>
            <CartIndicator />
          </div>
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
            {CATEGORY_OPTIONS.map((c) => (
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {parts.map((p) => {
              const meta = categoryMeta(p.category);
              const accentBg = meta.accent === 'brand' ? 'bg-brand/10' : 'bg-accent/10';
              const accentText = meta.accent === 'brand' ? 'text-brand' : 'text-accent';
              const accentBorder = meta.accent === 'brand' ? 'border-t-brand' : 'border-t-accent';
              const lowStock = p.stockQty > 0 && p.stockQty <= 3;

              return (
                <div
                  key={p.id}
                  className={`flex flex-col overflow-hidden rounded-2xl border border-border border-t-2 ${accentBorder} bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md`}
                >
                  <div className={`relative flex h-36 items-center justify-center ${accentBg}`}>
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.name} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover" />
                    ) : (
                      <CategoryIcon name={meta.icon} className={`h-14 w-14 ${accentText} opacity-80`} />
                    )}
                    <span className={`absolute left-3 top-3 rounded-full bg-bg/90 px-2.5 py-0.5 text-xs font-medium ${accentText} shadow-sm`}>
                      {meta.label}
                    </span>
                    {lowStock ? (
                      <span className="absolute right-3 top-3 rounded-full border border-dashed border-red-400/60 bg-bg/90 px-2.5 py-0.5 text-xs font-medium text-red-400 shadow-sm">
                        Últimas {p.stockQty} unid.
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-mono text-[11px] text-fg-muted">{p.sku}</p>
                      {p.brand ? <span className="text-xs text-fg-muted">{p.brand}</span> : null}
                    </div>
                    <h2 className="mt-1 font-display text-base font-semibold text-fg">{p.name}</h2>
                    {p.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{p.description}</p>
                    ) : null}
                    <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
                      <div>
                        <p className="text-xs text-fg-muted">A partir de</p>
                        <p className="font-display text-lg font-bold text-accent">
                          {formatBRL(p.salePrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AddToCartButton
                          partId={p.id}
                          sku={p.sku}
                          name={p.name}
                          unitPrice={Number(p.salePrice)}
                          imageUrl={p.imageUrl}
                          stockQty={p.stockQty}
                        />
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
                    </div>
                  </div>
                </div>
              );
            })}
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
