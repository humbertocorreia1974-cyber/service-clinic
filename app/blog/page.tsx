import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog — Manutenção odontológica no Sul Fluminense | Service Clinic',
  description:
    'Artigos técnicos sobre manutenção preventiva de equipamentos odontológicos no Sul Fluminense.',
  openGraph: {
    title: 'Blog Service Clinic — Manutenção odontológica',
    description:
      'Conteúdo técnico sobre manutenção de equipamentos odontológicos e higienização de ar-condicionado em clínicas.',
    type: 'website',
  },
};

function formatDate(d: Date | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ servico?: string; cidade?: string }>;
}) {
  const sp = await searchParams;
  const servico = sp.servico?.trim() || '';
  const cidade = sp.cidade?.trim() || '';

  const [posts, services, cities] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        published: true,
        ...(servico ? { serviceSlug: servico } : {}),
        ...(cidade ? { citySlug: cidade } : {}),
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 60,
    }),
    prisma.service.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.city.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-fg-muted">
          <BookOpen className="h-3.5 w-3.5 text-accent" />
          Blog técnico
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          Conteúdo técnico para clínicas do Sul Fluminense
        </h1>
        <p className="mt-3 max-w-2xl text-fg-muted">
          Guias sobre manutenção preventiva e boas práticas para manter seus
          equipamentos odontológicos funcionando sem parar.
        </p>
      </header>

      <form
        method="GET"
        className="mb-8 grid gap-3 rounded-lg border border-border bg-surface/70 p-4 backdrop-blur-sm sm:grid-cols-[1fr_1fr_auto]"
      >
        <select
          name="servico"
          defaultValue={servico}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand"
        >
          <option value="">Todos os serviços</option>
          {services.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          name="cidade"
          defaultValue={cidade}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand"
        >
          <option value="">Todas as cidades</option>
          {cities.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="primary">
          Filtrar
        </Button>
      </form>

      {posts.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-fg-muted" />
            <p className="text-fg">Nenhum artigo publicado com esses filtros ainda.</p>
            <p className="mt-1 text-sm text-fg-muted">
              Estamos preparando conteúdo novo toda semana. Volte em breve.
            </p>
            <div className="mt-5">
              <Link href="/contato">
                <Button variant="primary">Falar com o time técnico</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="group">
              <Card className="flex h-full flex-col transition-all duration-150 hover:border-brand/50">
                <CardBody className="flex flex-1 flex-col">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                    {p.serviceSlug ? (
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-brand">
                        {services.find((s) => s.slug === p.serviceSlug)?.name ?? p.serviceSlug}
                      </span>
                    ) : null}
                    {p.citySlug ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {cities.find((c) => c.slug === p.citySlug)?.name ?? p.citySlug}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="font-display text-lg font-semibold text-fg group-hover:text-brand">
                    {p.title}
                  </h2>
                  {p.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm text-fg-muted">{p.excerpt}</p>
                  ) : null}
                  <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-fg-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(p.publishedAt ?? p.createdAt)}
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
