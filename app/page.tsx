// SKELETON de landing page — o builder usa este arquivo como `app/page.tsx`
// quando o pedido é uma landing. O DeveloperAgent NÃO reescreve este arquivo:
// ele só reescreve `content/landing.ts` com o conteúdo real. Assim toda landing
// gerada sai com o MESMO layout premium, só o texto muda.
//
// 🩹 2026-10-01 (4ª rodada — redesign real, não patch): Humberto repetiu a mesma
// queixa duas vezes ("página preta, sem design, sem criatividade"). Causa raiz
// encontrada em globals.css: --surface é só 3 pontos mais claro que --bg (11%
// vs 8% de luminosidade) — qualquer banda de contraste em cima disso era
// matematicamente quase invisível. Esta versão usa --surface-2 (16%, já existia
// no token mas nunca era usado) pra contraste real, dá presença de verdade pro
// âmbar (--accent) como segunda cor (não só ícone de 16px), e dá mais caráter
// a steps/depoimentos/CTA em vez de repetir o mesmo cartão em todo lugar.
import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landing } from "@/content/landing";
import ContactForm from "./contact-form";

/* eslint-disable @typescript-eslint/no-explicit-any */
const L: any = landing || {};

function Icon({ name, className }: { name?: string; className?: string }) {
  const C = (Icons as Record<string, any>)[name || "Sparkles"] ?? Icons.Sparkles;
  return <C className={className} />;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const FOOTER_LINKS = [
  { label: "Serviços", href: "/servicos" },
  { label: "Área atendida", href: "/area-atendida" },
  { label: "Catálogo de peças", href: "/pecas" },
  { label: "Sobre", href: "/sobre" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
];

const FOOTER_LEGAL = [
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Termos de Uso", href: "/termos" },
];

const TRUST_CHIPS = [
  { icon: "FileCheck2", label: "Laudo PMOC assinado digitalmente" },
  { icon: "ClipboardCheck", label: "Checklist técnico documentado" },
  { icon: "Receipt", label: "Taxa de deslocamento sem surpresa" },
];

export default function Home() {
  const l: any = {
    name: L.name || "Produto",
    hero: L.hero || {},
    features: Array.isArray(L.features) ? L.features : [],
    steps: Array.isArray(L.steps) ? L.steps : [],
    agenda: Array.isArray(L.agenda) ? L.agenda : [],
    testimonials: Array.isArray(L.testimonials) ? L.testimonials : [],
    faq: Array.isArray(L.faq) ? L.faq : [],
    cta: L.cta || {},
  };

  // os 2 pilares reais do negócio (primeiros itens de features) ganham foto;
  // os secundários (PMOC, laudos, cobertura) ficam como faixa compacta abaixo.
  const pillars = l.features.slice(0, 2);
  const secondary = l.features.slice(2);
  const pillarPhotos = ["/photos/dental-tools.jpg", "/photos/tools-tray.jpg"];
  const pillarAlt = [
    "Instrumental odontológico em manutenção",
    "Peças e instrumentos organizados para reposição",
  ];

  return (
    <div className="relative">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <img src="/logo.svg" alt={l.name} className="h-16 w-16 rounded-xl shadow-lg shadow-brand/20" />
            {l.name}
          </span>
          <nav className="flex items-center gap-1">
            <Link href="#pilares"><Button variant="ghost" size="sm">Serviços</Button></Link>
            {l.agenda?.length ? <Link href="#agenda"><Button variant="ghost" size="sm">Agenda</Button></Link> : null}
            <Link href="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
            <Link href={l.hero.ctaHref ?? "#contato"}><Button size="sm">{l.hero.cta || "Começar"}</Button></Link>
          </nav>
        </div>
      </header>

      {/* HERO — foto real do consultório + faixa de confiança com diferenciais reais */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
        <div>
          {l.hero.badge ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <Icons.Sparkles className="h-3 w-3" />
              {l.hero.badge}
            </span>
          ) : null}
          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">
            {l.hero.headline || l.hero.title || `${l.name}`}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-fg-muted">{l.hero.sub || l.hero.subtitle || l.hero.subheadline || l.hero.description}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={l.hero.ctaHref ?? "#contato"}>
              <Button size="lg" className="gap-2 shadow-lg shadow-brand/30">{l.hero.cta || l.hero.ctaText || "Começar grátis"}<ArrowRight className="h-4 w-4" /></Button>
            </Link>
            {l.hero.ctaSecondary ? (
              <Link href={l.hero.ctaSecondaryHref ?? "#pilares"}>
                <Button variant="secondary" size="lg">{l.hero.ctaSecondary}</Button>
              </Link>
            ) : null}
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:flex-wrap sm:gap-6">
            {TRUST_CHIPS.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm text-fg-muted">
                <Icon name={c.icon} className="h-4 w-4 shrink-0 text-accent" />
                {c.label}
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div
            className="absolute -inset-4 -z-10 rounded-[2rem] blur-2xl"
            style={{ background: "linear-gradient(135deg, hsl(var(--brand) / 0.35), hsl(var(--accent) / 0.25))" }}
            aria-hidden
          />
          <img
            src="/photos/dental-chair.jpg"
            alt="Consultório odontológico equipado, atendido pela Service Clinic"
            className="h-[440px] w-full rounded-2xl border border-border object-cover shadow-2xl"
          />
          <div className="absolute -bottom-6 left-6 right-6 rounded-xl border border-border bg-surface-2/95 px-5 py-4 shadow-xl backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <Icons.MapPin className="h-4 w-4 text-accent" />
              Volta Redonda · Pinheiral · Barra Mansa · Resende · Barra do Piraí
            </div>
          </div>
        </div>
      </section>

      {/* PILARES — cada serviço real com a foto correspondente, blocos alternados */}
      <section id="pilares" className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <div className="flex flex-col gap-20">
          {pillars.map((f: any, fi: number) => (
            <div
              key={f.title || fi}
              className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${fi % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div className="relative">
                <img
                  src={pillarPhotos[fi] || pillarPhotos[0]}
                  alt={pillarAlt[fi] || f.title}
                  className="h-72 w-full rounded-2xl border border-border object-cover shadow-lg lg:h-80"
                />
                <span className="absolute -left-3 -top-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-base font-bold text-accent-fg shadow-lg">
                  {String(fi + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-accent">Pilar {fi + 1}</span>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-fg">{f.title || f.name}</h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-fg-muted">{f.body || f.description || f.text}</p>
              </div>
            </div>
          ))}
        </div>

        {secondary.length ? (
          <div className="mt-20 grid gap-6 lg:grid-cols-3">
            {secondary.map((f: any, fi: number) =>
              fi === 0 ? (
                <div key={f.title || fi} className="overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-sm">
                  <img
                    src="/photos/ac-tech.jpg"
                    alt="Técnico realizando higienização de ar-condicionado em ambiente clínico"
                    className="h-36 w-full object-cover"
                  />
                  <div className="border-t-2 border-accent p-5">
                    <h4 className="text-sm font-semibold text-fg">{f.title || f.name}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-fg-muted">{f.body || f.description || f.text}</p>
                  </div>
                </div>
              ) : (
                <div key={f.title || fi} className="rounded-2xl border border-border border-t-2 border-t-accent bg-surface-2 p-5 shadow-sm">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg">
                    <Icon name={f.icon} className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 text-sm font-semibold text-fg">{f.title || f.name}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-fg-muted">{f.body || f.description || f.text}</p>
                </div>
              )
            )}
          </div>
        ) : null}
      </section>

      {/* STEPS — foto real de fundo (consultório) com véu escuro, não é mais cor chapada */}
      {l.steps?.length ? (
        <section className="relative overflow-hidden border-y border-border">
          <img
            src="/photos/clinic-reception.png"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, hsl(var(--bg) / 0.94), hsl(var(--bg) / 0.88) 40%, hsl(var(--surface-2) / 0.95))" }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-5xl px-6 py-24">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Como funciona</span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Do primeiro contato ao registro final</h2>
            <div className="relative mt-14 grid gap-10 sm:grid-cols-4">
              <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent sm:block" aria-hidden />
              {l.steps.map((s: any, i: number) => (
                <div key={s.title || i} className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-bg text-lg font-bold text-accent">
                    {i + 1}
                  </div>
                  <h3 className="mt-5 text-sm font-semibold text-fg">{s.title || s.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{s.body || s.description || s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* AGENDA — marcação automática, taxa de deslocamento, tempo médio (não é "planos") */}
      {l.agenda?.length ? (
        <section id="agenda" className="relative overflow-hidden">
          <img
            src="/photos/tool-cart-organized.png"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-10"
          />
          <div className="relative mx-auto max-w-5xl px-6 py-24">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Agenda</span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Como funciona o atendimento</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {l.agenda.map((a: any, ai: number) => (
              <div key={a.title || ai} className="rounded-2xl border border-border border-l-4 border-l-brand bg-surface p-6 shadow-sm">
                <div className="inline-flex rounded-lg bg-brand/15 p-2.5">
                  <Icons.CalendarClock className="h-5 w-5 text-brand" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-fg">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{a.body}</p>
              </div>
            ))}
          </div>
          </div>
        </section>
      ) : null}

      {/* FAIXA DE FOTO — técnico em ação, quebra o ritmo entre agenda e depoimentos */}
      <section className="relative h-64 overflow-hidden sm:h-80">
        <img
          src="/photos/technician-hands-tools.png"
          alt="Técnico realizando manutenção de precisão em equipamento odontológico"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 flex items-end"
          style={{ background: "linear-gradient(180deg, transparent 40%, hsl(var(--bg) / 0.9))" }}
        >
          <p className="px-6 pb-6 text-sm font-medium text-fg sm:px-10 sm:pb-8 sm:text-base">
            Precisão técnica em cada visita, não serviço de ocasião.
          </p>
        </div>
      </section>

      {/* TESTIMONIALS — gradiente real petróleo→âmbar, avatares com iniciais */}
      {l.testimonials?.length ? (
        <section
          className="border-y border-border"
          style={{ background: "linear-gradient(135deg, hsl(var(--brand) / 0.18), hsl(var(--bg)) 55%, hsl(var(--accent) / 0.1))" }}
        >
          <div className="mx-auto max-w-4xl px-6 py-24">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Quem já usa</span>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {l.testimonials.map((t: any, ti: number) => (
                <figure key={t.name || ti} className="rounded-2xl border border-border bg-surface-2/90 p-6 shadow-sm backdrop-blur-sm">
                  <blockquote className="text-sm leading-relaxed text-fg">&ldquo;{t.quote || t.text || t.body}&rdquo;</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-fg">
                      {initials(t.name || t.author || "?")}
                    </span>
                    <span className="text-xs text-fg-muted">
                      <span className="block font-medium text-fg">{t.name || t.author}</span>
                      {t.role || t.title ? (t.role || t.title) : null}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {l.faq?.length ? (
        <section className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Dúvidas</span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Perguntas frequentes</h2>
          </div>
          <div className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            {l.faq.map((item: any, qi: number) => (
              <details key={item.q || qi} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-fg">
                  {item.q || item.question}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent transition-transform group-open:rotate-45">
                    <Icons.Plus className="h-3.5 w-3.5" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{item.a || item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* CTA final + contato */}
      <section id="contato" className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{l.cta?.headline ?? "Vamos começar?"}</h2>
          {l.cta?.sub ? <p className="mx-auto mt-3 max-w-md text-fg-muted">{l.cta.sub}</p> : null}
          <div className="mt-10 rounded-2xl border border-border bg-bg p-6 text-left shadow-xl sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FOOTER — navegação real: serviços, páginas legais, WhatsApp e áreas atendidas */}
      <footer className="border-t border-border bg-bg">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-fg">
                <img src="/logo.svg" alt={l.name} className="h-11 w-11 rounded-lg" />
                {l.name}
              </span>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-muted">
                Manutenção especializada para consultórios odontológicos, clínicas e hospitais no Sul Fluminense.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Empresa</h4>
              <ul className="mt-3 space-y-2">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-fg-muted transition-colors hover:text-accent">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Contato</h4>
              <ul className="mt-3 space-y-2 text-sm text-fg-muted">
                <li>
                  <a href="https://wa.me/5524999467392" className="transition-colors hover:text-accent">WhatsApp (24) 99946-7392</a>
                </li>
                <li>Volta Redonda · Pinheiral · Barra Mansa · Resende · Barra do Piraí</li>
              </ul>
              <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-fg-muted">Legal</h4>
              <ul className="mt-3 space-y-2">
                {FOOTER_LEGAL.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-fg-muted transition-colors hover:text-accent">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center text-sm text-fg-muted">
            {l.name} · Construído com JGNEXT.
          </div>
        </div>
      </footer>
    </div>
  );
}
