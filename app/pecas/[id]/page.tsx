import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as Icons from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { categoryMeta } from "@/lib/part-categories";
import { AddToCartButton } from "../add-to-cart-button";
import { CartIndicator } from "../cart-indicator";
import { ReviewFormClient } from "./review-form-client";

export const dynamic = "force-dynamic";

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as Record<string, any>)[name] ?? Icons.Package;
  return <C className={className} />;
}

function formatBRL(v: unknown) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const part = await prisma.part.findUnique({ where: { id: params.id }, select: { name: true, description: true } });
  return {
    title: part ? `${part.name} | Loja Service Clinic` : "Produto | Service Clinic",
    description: part?.description ?? "Peças, acessórios e equipamentos para clínicas odontológicas.",
  };
}

export default async function ProdutoPage({ params }: { params: { id: string } }) {
  const part = await prisma.part.findUnique({
    where: { id: params.id },
    include: {
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!part || !part.active || !part.publicVisible) notFound();

  const meta = categoryMeta(part.category);
  const accentBg = meta.accent === "brand" ? "bg-brand/10" : "bg-accent/10";
  const accentText = meta.accent === "brand" ? "text-brand" : "text-accent";
  const avgRating =
    part.reviews.length > 0
      ? part.reviews.reduce((acc, r) => acc + r.rating, 0) / part.reviews.length
      : 0;
  const lowStock = part.stockQty > 0 && part.stockQty <= 3;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <Link href="/pecas" className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-brand">
          <Icons.ArrowLeft className="h-3.5 w-3.5" /> Voltar ao catálogo
        </Link>
        <CartIndicator />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="relative">
          <div className={`flex h-72 items-center justify-center rounded-2xl border border-border sm:h-96 ${accentBg}`}>
            {part.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={part.imageUrl} alt={part.name} className="h-full w-full rounded-2xl object-cover" />
            ) : (
              <CategoryIcon name={meta.icon} className={`h-24 w-24 ${accentText} opacity-80`} />
            )}
          </div>
          <span className={`absolute left-4 top-4 rounded-full bg-bg/90 px-3 py-1 text-xs font-medium ${accentText} shadow-sm`}>
            {meta.label}
          </span>
        </div>

        <div>
          <p className="font-mono text-xs text-fg-muted">SKU: {part.sku}{part.brand ? ` · ${part.brand}` : ""}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-fg sm:text-3xl">{part.name}</h1>

          {part.reviews.length > 0 ? (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Icons.Star
                    key={n}
                    className={`h-4 w-4 ${n <= Math.round(avgRating) ? "fill-accent text-accent" : "text-fg-muted"}`}
                  />
                ))}
              </div>
              <span className="text-fg-muted">
                {avgRating.toFixed(1)} · {part.reviews.length} avaliaç{part.reviews.length === 1 ? "ão" : "ões"}
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-fg-muted">Ainda sem avaliações — seja o primeiro a avaliar.</p>
          )}

          <p className="mt-5 font-display text-3xl font-bold text-accent">{formatBRL(part.salePrice)}</p>

          <p className="mt-1 text-sm">
            {part.stockQty <= 0 ? (
              <span className="text-red-400">Sem estoque no momento</span>
            ) : lowStock ? (
              <span className="text-red-400">Últimas {part.stockQty} unidades</span>
            ) : (
              <span className="text-emerald-500">Em estoque</span>
            )}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <AddToCartButton
              partId={part.id}
              sku={part.sku}
              name={part.name}
              unitPrice={Number(part.salePrice)}
              imageUrl={part.imageUrl}
              stockQty={part.stockQty}
            />
            <Link
              href={`/contato?peca=${encodeURIComponent(part.sku)}&assunto=${encodeURIComponent(
                "Orçamento de peça: " + part.name
              )}`}
            >
              <Button variant="secondary">
                Solicitar orçamento <Icons.ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {part.description ? (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-fg">Descrição</h2>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{part.description}</p>
            </div>
          ) : null}

          {part.compatibleWith.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-fg">Compatível com</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {part.compatibleWith.map((c) => (
                  <span key={c} className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs text-fg-muted">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <section className="mt-16 border-t border-border pt-8">
        <h2 className="font-display text-xl font-semibold text-fg">Avaliações</h2>

        {part.reviews.length === 0 ? (
          <p className="mt-2 text-sm text-fg-muted">Nenhuma avaliação ainda.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {part.reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-fg">{r.authorName}</p>
                  <p className="text-xs text-fg-muted">
                    {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="mt-1 flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Icons.Star
                      key={n}
                      className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-accent text-accent" : "text-fg-muted"}`}
                    />
                  ))}
                </div>
                {r.comment ? <p className="mt-2 text-sm text-fg-muted">{r.comment}</p> : null}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <ReviewFormClient partId={part.id} />
        </div>
      </section>
    </main>
  );
}
