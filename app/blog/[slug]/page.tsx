import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) {
    return { title: 'Artigo não encontrado | Service Clinic' };
  }
  const title = post.metaTitle ?? `${post.title} | Service Clinic`;
  const description =
    post.metaDescription ??
    post.excerpt ??
    'Conteúdo técnico da Service Clinic sobre manutenção odontológica e PMOC.';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) notFound();

  const [service, city] = await Promise.all([
    post.serviceSlug
      ? prisma.service.findUnique({ where: { slug: post.serviceSlug } })
      : Promise.resolve(null),
    post.citySlug ? prisma.city.findUnique({ where: { slug: post.citySlug } }) : Promise.resolve(null),
  ]);

  const publishedLabel = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-1 text-sm text-fg-muted transition-colors duration-150 hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o blog
      </Link>

      <article>
        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
            {service ? (
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-brand">
                {service.name}
              </span>
            ) : null}
            {city ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {city.name}
              </span>
            ) : null}
            {publishedLabel ? (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {publishedLabel}
              </span>
            ) : null}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-3 text-lg text-fg-muted">{post.excerpt}</p>
          ) : null}
        </header>

        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="mb-8 w-full rounded-lg border border-border"
          />
        ) : null}

        <div className="prose prose-invert max-w-none whitespace-pre-wrap text-fg">
          {post.content}
        </div>
      </article>

      <Card className="mt-12">
        <CardBody>
          <h2 className="font-display text-xl font-semibold text-fg">
            Precisa de manutenção ou laudo PMOC?
          </h2>
          <p className="mt-2 text-sm text-fg-muted">
            Fale com a Service Clinic — atendemos Volta Redonda, Pinheiral, Barra Mansa, Resende e
            Barra do Piraí com ordens de serviço, laudos assinados e agenda por técnico.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/contato">
              <Button variant="primary">Solicitar orçamento</Button>
            </Link>
            <Link href="/servicos">
              <Button variant="secondary">Ver serviços</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
