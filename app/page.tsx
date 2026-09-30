// SKELETON de landing page — o builder usa este arquivo como `app/page.tsx`
// quando o pedido é uma landing. O DeveloperAgent NÃO reescreve este arquivo:
// ele só reescreve `content/landing.ts` com o conteúdo real. Assim toda landing
// gerada sai com o MESMO layout premium, só o texto muda.
//
// 🩹 2026-09-30 (achado real, feedback direto do Humberto vendo o site publicado):
// esta cópia (só desta sessão, não o skeleton mestre) foi reescrita à mão porque
// o skeleton genérico não tem NENHUM slot de foto — vira sempre grid de ícone+texto,
// mesmo layout pra qualquer negócio. Pra um cliente B2B técnico de verdade isso lê
// como "SaaS genérico feito por IA", não como uma empresa real se profissionalizando.
// Composição aqui: hero com foto real do consultório, e os 3 pilares reais (Wrench/
// Wind/Package em content/landing.ts) emparelhados com fotos correspondentes em vez
// de ícone-em-caixinha. O gap estrutural (skeleton sem suporte a foto) fica registrado
// como pendência separada — ver task de correção do template golden do builder.
//
// 🩹 2026-09-30 (2ª rodada, mesmo dia): logo do header pequena demais, footer era
// só uma linha de copyright sem link nenhum pra /contato, /privacidade, /termos,
// /servicos, /area-atendida — páginas que EXISTEM no projeto mas ninguém encontrava.
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

  // os 3 pilares reais do negócio (primeiros 3 itens de features) ganham foto;
  // os secundários (laudos, agenda, cobertura) ficam como faixa compacta abaixo.
  const pillars = l.features.slice(0, 2);
  const secondary = l.features.slice(2);
  const pillarPhotos = ["/photos/dental-tools.jpg", "/photos/tools-tray.jpg"];
  const pillarAlt = [
    "Instrumental odontológico em manutenção",
    "Peças e instrumentos organizados para reposição",
  ];

  return (
    <div className="relative">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <img src="/logo.svg" alt={l.name} className="h-10 w-10 rounded-lg" />
          {l.name}
        </span>
        <nav className="flex items-center gap-1">
          <Link href="#pilares"><Button variant="ghost" size="sm">Serviços</Button></Link>
          {l.agenda?.length ? <Link href="#agenda"><Button variant="ghost" size="sm">Agenda</Button></Link> : null}
          <Link href={l.hero.ctaHref ?? "#contato"}><Button size="sm">{l.hero.cta || "Começar"}</Button></Link>
        </nav>
      </header>

      {/* HERO — foto real do consultório, não gradiente genérico */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
        <div>
          {l.hero.badge ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-fg-muted backdrop-blur-sm">
              <Icons.BadgeCheck className="h-3.5 w-3.5 text-brand" />
              {l.hero.badge}
            </span>
          ) : null}
          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            {l.hero.headline || l.hero.title || `${l.name}`}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-fg-muted">{l.hero.sub || l.hero.subtitle || l.hero.subheadline || l.hero.description}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={l.hero.ctaHref ?? "#contato"}>
              <Button size="lg" className="gap-2">{l.hero.cta || l.hero.ctaText || "Começar grátis"}<ArrowRight className="h-4 w-4" /></Button>
            </Link>
            {l.hero.ctaSecondary ? (
              <Link href={l.hero.ctaSecondaryHref ?? "#pilares"}>
                <Button variant="secondary" size="lg">{l.hero.ctaSecondary}</Button>
              </Link>
            ) : null}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 -z-10 rounded-3xl bg-brand/10 blur-2xl" aria-hidden />
          <img
            src="/photos/dental-chair.jpg"
            alt="Consultório odontológico equipado, atendido pela Service Clinic"
            className="h-[420px] w-full rounded-2xl border border-border object-cover shadow-2xl"
          />
          <div className="absolute -bottom-6 left-6 right-6 rounded-xl border border-border bg-surface/95 px-5 py-4 shadow-xl backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <Icons.MapPin className="h-4 w-4 text-brand" />
              Volta Redonda · Pinheiral · Barra Mansa · Resende · Barra do Piraí
            </div>
          </div>
        </div>
      </section>

      {/* PILARES — cada serviço real com a foto correspondente, blocos alternados */}
      <section id="pilares" className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        <div className="flex flex-col gap-16">
          {pillars.map((f: any, fi: number) => (
            <div
              key={f.title || fi}
              className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${fi % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <img
                src={pillarPhotos[fi] || pillarPhotos[0]}
                alt={pillarAlt[fi] || f.title}
                className="h-72 w-full rounded-2xl border border-border object-cover shadow-lg lg:h-80"
              />
              <div>
                <div className="inline-flex rounded-lg border border-border bg-bg p-2.5">
                  <Icon name={f.icon} className="h-5 w-5 text-brand" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-fg">{f.title || f.name}</h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-fg-muted">{f.body || f.description || f.text}</p>
              </div>
            </div>
          ))}
        </div>

        {secondary.length ? (
          <div className="mt-16 grid gap-4 border-t border-border pt-12 sm:grid-cols-3">
            {secondary.map((f: any, fi: number) => (
              <div key={f.title || fi} className="flex gap-3">
                <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-bg">
                  <Icon name={f.icon} className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-fg">{f.title || f.name}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-fg-muted">{f.body || f.description || f.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
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

      {/* AGENDA — marcação automática, taxa de deslocamento, tempo médio (não é "planos") */}
      {l.agenda?.length ? (
        <section id="agenda" className="mx-auto max-w-5xl px-6 pb-24">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Como funciona o atendimento</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {l.agenda.map((a: any, ai: number) => (
              <div key={a.title || ai} className="rounded-lg border border-border bg-surface/60 p-6">
                <div className="inline-flex rounded-lg border border-border bg-bg p-2.5">
                  <Icons.CalendarClock className="h-5 w-5 text-brand" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-fg">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{a.body}</p>
              </div>
            ))}
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

      {/* FOOTER — navegação real (antes era só copyright): serviços, páginas legais,
          WhatsApp e áreas atendidas, pra quem quiser achar sem rolar a home inteira */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <span className="flex items-center gap-2 text-base font-semibold tracking-tight text-fg">
                <img src="/logo.svg" alt={l.name} className="h-8 w-8 rounded-lg" />
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
                    <Link href={link.href} className="text-sm text-fg-muted transition-colors hover:text-fg">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Contato</h4>
              <ul className="mt-3 space-y-2 text-sm text-fg-muted">
                <li>
                  <a href="https://wa.me/5524999467392" className="transition-colors hover:text-fg">WhatsApp (24) 99946-7392</a>
                </li>
                <li>Volta Redonda · Pinheiral · Barra Mansa · Resende · Barra do Piraí</li>
              </ul>
              <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-fg-muted">Legal</h4>
              <ul className="mt-3 space-y-2">
                {FOOTER_LEGAL.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-fg-muted transition-colors hover:text-fg">{link.label}</Link>
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
