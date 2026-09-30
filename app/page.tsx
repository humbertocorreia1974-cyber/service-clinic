// SKELETON de landing page — o builder usa este arquivo como `app/page.tsx`
// quando o pedido é uma landing. O DeveloperAgent NÃO reescreve este arquivo:
// ele só reescreve `content/landing.ts` com o conteúdo real. Assim toda landing
// gerada sai com o MESMO layout premium, só o texto muda.
import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landing } from "@/content/landing";
import ContactForm from "./contact-form";

// O DeveloperAgent reescreve `content/landing.ts` e às vezes muda a forma dos
// objetos (ex: pricing sem `cta`, sem `period`). O skeleton é DEFENSIVO: lê tudo
// como `any` e tem fallback pra todo campo. Assim a landing nunca quebra nem
// mostra botão vazio.
/* eslint-disable @typescript-eslint/no-explicit-any */
const L: any = landing || {};

function Icon({ name, className }: { name?: string; className?: string }) {
  const C = (Icons as Record<string, any>)[name || "Sparkles"] ?? Icons.Sparkles;
  return <C className={className} />;
}

export default function Home() {
  const l: any = {
    name: L.name || "Produto",
    hero: L.hero || {},
    features: Array.isArray(L.features) ? L.features : [],
    steps: Array.isArray(L.steps) ? L.steps : [],
    pricing: Array.isArray(L.pricing) ? L.pricing : [],
    testimonials: Array.isArray(L.testimonials) ? L.testimonials : [],
    faq: Array.isArray(L.faq) ? L.faq : [],
    cta: L.cta || {},
  };
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--brand)/0.16),transparent_70%)]"
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <img src="/logo.svg" alt={l.name} className="h-7 w-7 rounded" />
          {l.name}
        </span>
        <nav className="flex items-center gap-1">
          <Link href="#features"><Button variant="ghost" size="sm">Recursos</Button></Link>
          {l.pricing?.length ? <Link href="#pricing"><Button variant="ghost" size="sm">Preços</Button></Link> : null}
          <Link href={l.hero.ctaHref ?? "#contato"}><Button size="sm">{l.hero.cta || "Começar"}</Button></Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="animate-fade-up mx-auto max-w-3xl px-6 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
        {l.hero.badge ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-fg-muted backdrop-blur-sm">
            <Icons.Sparkles className="h-3 w-3 text-brand" />
            {l.hero.badge}
          </span>
        ) : null}
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
          {l.hero.headline || l.hero.title || `${l.name}`}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">{l.hero.sub || l.hero.subtitle || l.hero.subheadline || l.hero.description}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href={l.hero.ctaHref ?? "#contato"}>
            <Button size="lg" className="gap-2">{l.hero.cta || l.hero.ctaText || "Começar grátis"}<ArrowRight className="h-4 w-4" /></Button>
          </Link>
          {l.hero.ctaSecondary ? (
            <Link href={l.hero.ctaSecondaryHref ?? "#features"}>
              <Button variant="secondary" size="lg">{l.hero.ctaSecondary}</Button>
            </Link>
          ) : null}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {l.features.map((f: any, fi: number) => (
            <div
              key={f.title || fi}
              className="group rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:bg-surface"
            >
              <div className="inline-flex rounded-lg border border-border bg-bg p-2.5 transition-colors group-hover:border-brand/40">
                <Icon name={f.icon} className="h-5 w-5 text-brand" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-fg">{f.title || f.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{f.body || f.description || f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STEPS */}
      {l.steps?.length ? (
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="grid gap-8 sm:grid-cols-3">
            {l.steps.map((s: any, i: number) => (
              <div key={s.title || i}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">{i + 1}</div>
                <h3 className="mt-4 text-sm font-semibold text-fg">{s.title || s.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{s.body || s.description || s.text}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* PRICING */}
      {l.pricing?.length ? (
        <section id="pricing" className="mx-auto max-w-5xl px-6 pb-24">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Planos</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {l.pricing.map((p: any, pi: number) => {
              const highlight = p.highlight ?? pi === 1; // 2º plano em destaque por padrão
              return (
                <div
                  key={p.name || pi}
                  className={`rounded-lg border p-6 ${highlight ? "border-brand bg-surface" : "border-border bg-surface/60"}`}
                >
                  <h3 className="text-sm font-semibold text-fg">{p.name || `Plano ${pi + 1}`}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-fg">{p.price ?? ""}</span>
                    {p.period ? <span className="text-sm text-fg-muted">{p.period}</span> : null}
                  </div>
                  {p.description ? <p className="mt-2 text-sm text-fg-muted">{p.description}</p> : null}
                  <ul className="mt-5 space-y-2">
                    {(Array.isArray(p.features) ? p.features : []).map((feat: string, fi: number) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-fg-muted">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link href={p.href ?? "#contato"} className="mt-6 block">
                    <Button variant={highlight ? "primary" : "secondary"} className="w-full">
                      {p.cta || p.button || `Escolher ${p.name || "plano"}`}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* TESTIMONIALS */}
      {l.testimonials?.length ? (
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="grid gap-4 sm:grid-cols-2">
            {l.testimonials.map((t: any, ti: number) => (
              <figure key={t.name || ti} className="rounded-lg border border-border bg-surface/60 p-6">
                <blockquote className="text-sm leading-relaxed text-fg">&ldquo;{t.quote || t.text || t.body}&rdquo;</blockquote>
                <figcaption className="mt-4 text-xs text-fg-muted">
                  <span className="font-medium text-fg">{t.name || t.author}</span>
                  {t.role || t.title ? ` · ${t.role || t.title}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {l.faq?.length ? (
        <section className="mx-auto max-w-3xl px-6 pb-24">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Perguntas frequentes</h2>
          <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-surface/60">
            {l.faq.map((item: any, qi: number) => (
              <details key={item.q || qi} className="group px-5 py-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-fg">{item.q || item.question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.a || item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* CTA final + contato */}
      <section id="contato" className="mx-auto max-w-2xl px-6 pb-24 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{l.cta?.headline ?? "Vamos começar?"}</h2>
        {l.cta?.sub ? <p className="mx-auto mt-3 max-w-md text-fg-muted">{l.cta.sub}</p> : null}
        <div className="mt-8">
          <ContactForm />
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-fg-muted">
        {l.name} · Construído com Service Clinic.
      </footer>
    </div>
  );
}
