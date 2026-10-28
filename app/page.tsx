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
//
// 🩹 2026-10-02 (auditoria): fotos reais convertidas de <img> pra next/image
// (otimização ligada em next.config.js) — ganho de performance real, sem mudar
// nenhum layout visual.
//
// 🩹 2026-10-13 (achado visual real, viewport 390px): header nunca colapsava
// em mobile — logo de 64px + 4 itens de nav em justify-between sempre
// estourava a tela (scrollWidth 417 > clientWidth 390), cortando o CTA na
// borda. Logo menor + "Serviços"/"Agenda" (scroll-anchor redundante com o
// resto da página) escondidos abaixo de sm; "Entrar" e o CTA real continuam
// sempre visíveis.
//
// 🩹 2026-10-13 (2ª rodada, mesmo dia — feedback real): o fix acima encolheu
// demais o logo (h-10/40px) pra abrir espaço. Rebalanceado: logo sobe pra
// h-11/44px (mais perto do tamanho de marca original), e quem cede espaço
// agora é o texto do CTA (abrevia pra "Orçamento" só no mobile) em vez da
// logo. "Entrar" continua sempre por extenso.
//
// 🩹 2026-10-13 (3ª rodada, mesmo dia — diferenciação visual): Humberto notou
// que este app e o TennisPlay "soam parecidos" e pediu mais criatividade. A
// causa raiz é estrutural: ESTE arquivo é o skeleton partilhado por todo app
// JGNEXT gerado como landing — só content/landing.ts muda. Em vez de mexer no
// molde compartilhado (risco pra todo app futuro), esta cópia própria do
// Service Clinic (este arquivo, só deste repo) ganhou uma identidade visual
// amarrada ao negócio real: motivo "OS" (ordem de serviço) — tags monospace
// tracejadas "OS·0X" substituindo os círculos numerados genéricos nos pilares
// e no "como funciona", e um chip de estatística real do catálogo (nunca dado
// de cliente específico) no hero. O molde mestre em TEMPLATE_DIR não foi
// tocado.
//
// 🩹 2026-10-14 (pedido direto do Humberto): a loja de peças/acessórios/
// equipamentos ganhou uma vitrine própria e destacada (seção "Loja", com
// produtos reais do catálogo) — antes só existia como texto num pilar. Em
// paralelo, a higienização de ar-condicionado perdeu a foto de destaque que
// tinha (sempre era o 1º card secundário) e virou um card igual aos outros,
// no fim da lista — ainda citada, sem chamar atenção. Nenhuma peça real tem
// foto cadastrada ainda (ver lib/part-categories.ts) — os cards da vitrine
// usam selo colorido por categoria em vez de inventar uma imagem.
import Link from "next/link";
import Image from "next/image";
import * as Icons from "lucide-react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landing } from "@/content/landing";
import { prisma } from "@/lib/prisma";
import { categoryMeta } from "@/lib/part-categories";
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

function formatBRL(v: unknown) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const FOOTER_LINKS = [
  { label: "Serviços", href: "/servicos" },
  { label: "Orçamento com foto", href: "/orcamento" },
  { label: "Área atendida", href: "/area-atendida" },
  { label: "Loja de peças e equipamentos", href: "/pecas" },
  { label: "Sobre", href: "/sobre" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
];

const FOOTER_LEGAL = [
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Termos de Uso", href: "/termos" },
];

const TRUST_CHIPS = [
  { icon: "FileCheck2", label: "Registro técnico assinado a cada visita" },
  { icon: "ClipboardCheck", label: "Checklist técnico documentado" },
  { icon: "Receipt", label: "Taxa de deslocamento sem surpresa" },
];

export const revalidate = 3600;

export default async function Home() {
  const l: any = {
    name: L.name || "Produto",
    hero: L.hero || {},
    features: Array.isArray(L.features) ? L.features : [],
    steps: Array.isArray(L.steps) ? L.steps : [],
    agenda: Array.isArray(L.agenda) ? L.agenda : [],
    proof: Array.isArray(L.proof) ? L.proof : [],
    testimonials: Array.isArray(L.testimonials) ? L.testimonials : [],
    faq: Array.isArray(L.faq) ? L.faq : [],
    cta: L.cta || {},
  };

  // os 2 pilares reais do negócio (primeiros itens de features) ganham foto;
  // os secundários ficam como faixa compacta abaixo, todos no mesmo nível de
  // destaque (nenhum item specifico — ex. AC — ganha card/foto maior).
  const pillars = l.features.slice(0, 2);
  const secondary = l.features.slice(2);
  const pillarPhotos = ["/photos/dental-tools.jpg", "/photos/tools-tray.jpg"];
  const pillarAlt = [
    "Instrumental odontológico em manutenção",
    "Peças e instrumentos organizados para reposição",
  ];

  // Selo "OS" (ordem de serviço) é a identidade real do negócio - estatística
  // agregada do catálogo (nunca dado de cliente específico) reforça isso no
  // hero sem depender de nenhum registro individual exibido publicamente.
  // A mesma consulta já serve pra montar a vitrine da loja (1 peça real por
  // categoria distinta, até 4) — uma query só, sem duplicar acesso ao banco.
  let partsCount = 0;
  let categoriesCount = 0;
  let featuredParts: { id: string; sku: string; name: string; category: string; salePrice: unknown }[] = [];
  try {
    const allParts = await prisma.part.findMany({
      where: { active: true, publicVisible: true },
      orderBy: { name: "asc" },
      select: { id: true, sku: true, name: true, category: true, salePrice: true },
    });
    partsCount = allParts.length;
    const seenCategories = new Set<string>();
    for (const p of allParts) {
      if (seenCategories.has(p.category)) continue;
      seenCategories.add(p.category);
      featuredParts.push(p);
    }
    categoriesCount = seenCategories.size;
    featuredParts = featuredParts.slice(0, 4);
  } catch {
    // catálogo indisponível não pode derrubar a landing
  }

  return (
    <div className="relative">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-5">
          <span className="flex min-w-0 flex-1 items-center gap-2 text-base font-bold tracking-tight sm:flex-none sm:gap-3 sm:text-2xl">
            <img src="/logo.svg" alt={l.name} className="h-11 w-11 shrink-0 rounded-xl shadow-lg shadow-brand/20 sm:h-16 sm:w-16" />
            <span className="truncate">{l.name}</span>
          </span>
          <nav className="flex shrink-0 items-center gap-1">
            <Link href="#pilares" className="hidden sm:inline-flex"><Button variant="ghost" size="sm">Serviços</Button></Link>
            {featuredParts.length ? <Link href="#loja" className="hidden sm:inline-flex"><Button variant="ghost" size="sm">Loja</Button></Link> : null}
            {l.agenda?.length ? <Link href="#agenda" className="hidden sm:inline-flex"><Button variant="ghost" size="sm">Agenda</Button></Link> : null}
            <Link href="/login"><Button variant="ghost" size="sm" className="px-2.5 sm:px-3">Entrar</Button></Link>
            <Link href={l.hero.ctaHref ?? "#contato"}>
              <Button size="sm" className="px-3 sm:px-4">
                <span className="sm:hidden">Orçamento</span>
                <span className="hidden sm:inline">{l.hero.cta || "Começar"}</span>
              </Button>
            </Link>
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
            {featuredParts.length ? (
              <Link href="#loja">
                <Button variant="secondary" size="lg">Ver loja de peças</Button>
              </Link>
            ) : l.hero.ctaSecondary ? (
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
          {partsCount > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-brand/40 bg-brand/5 px-3 py-1.5 font-mono text-xs text-brand">
                <Icon name="Package" className="h-3.5 w-3.5" />
                {partsCount} peças, acessórios e equipamentos{categoriesCount ? ` · ${categoriesCount} categorias` : ""}
              </span>
            </div>
          ) : null}
        </div>
        <div className="relative">
          <div
            className="absolute -inset-4 -z-10 rounded-[2rem] blur-2xl"
            style={{ background: "linear-gradient(135deg, hsl(var(--brand) / 0.35), hsl(var(--accent) / 0.25))" }}
            aria-hidden
          />
          <div className="relative h-[440px] w-full overflow-hidden rounded-2xl border border-border shadow-2xl">
            <Image
              src="/photos/dental-chair.jpg"
              alt="Consultório odontológico equipado, atendido pela Service Clinic"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          </div>
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
                <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-border shadow-lg lg:h-80">
                  <Image
                    src={pillarPhotos[fi] || pillarPhotos[0]}
                    alt={pillarAlt[fi] || f.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <span className="absolute -left-3 -top-3 -rotate-3 rounded-lg border-2 border-dashed border-accent bg-bg px-3 py-1.5 font-mono text-xs font-bold text-accent shadow-lg">
                  OS·{String(fi + 1).padStart(2, "0")}
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
            {secondary.map((f: any, fi: number) => (
              <div key={f.title || fi} className="rounded-2xl border border-border border-t-2 border-t-accent bg-surface-2 p-5 shadow-sm">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg">
                  <Icon name={f.icon} className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-sm font-semibold text-fg">{f.title || f.name}</h4>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{f.body || f.description || f.text}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* LOJA — vitrine real do catálogo (peças, acessórios e equipamentos),
          pedido direto do Humberto pra dar destaque de verdade a essa área
          na primeira tela. Produtos reais do banco, não mockup. */}
      {featuredParts.length ? (
        <section id="loja" className="border-y border-border bg-surface-2">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-accent">Loja Service Clinic</span>
                <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight text-fg">
                  Peças, acessórios e equipamentos pra sua clínica, com entrega rápida
                </h2>
                <p className="mt-3 max-w-lg text-fg-muted">
                  Catálogo próprio com SKU e compatibilidade por marca — compre direto pelo site, sem
                  precisar esperar uma visita técnica.
                </p>
              </div>
              <Link href="/pecas">
                <Button size="lg" className="gap-2 shadow-lg shadow-brand/30">
                  Ver catálogo completo<ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredParts.map((p) => {
                const meta = categoryMeta(p.category);
                const badgeCls = meta.accent === "brand" ? "bg-brand/10 text-brand" : "bg-accent/10 text-accent";
                const borderCls = meta.accent === "brand" ? "border-t-brand" : "border-t-accent";
                return (
                  <Link
                    key={p.id}
                    href={`/pecas/${p.id}`}
                    className={`group overflow-hidden rounded-2xl border border-border border-t-2 ${borderCls} bg-surface shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md`}
                  >
                    <div className={`flex h-28 items-center justify-center ${badgeCls}`}>
                      <Icon name={meta.icon} className="h-10 w-10" />
                    </div>
                    <div className="p-4">
                      <p className="font-mono text-[11px] text-fg-muted">{p.sku}</p>
                      <h3 className="mt-1 text-sm font-semibold leading-snug text-fg">{p.name}</h3>
                      <p className="mt-2 font-display text-base font-bold text-accent">{formatBRL(p.salePrice)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* STEPS — foto real de fundo (consultório) com véu escuro, não é mais cor chapada */}
      {l.steps?.length ? (
        <section className="relative overflow-hidden border-y border-border">
          <Image
            src="/photos/clinic-reception.png"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover"
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
              <div className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-border sm:block" aria-hidden />
              {l.steps.map((s: any, i: number) => (
                <div key={s.title || i} className="relative">
                  <div className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-dashed border-accent bg-bg px-3 font-mono text-sm font-bold text-accent">
                    OS·{String(i + 1).padStart(2, "0")}
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
          <Image
            src="/photos/tool-cart-organized.png"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover opacity-10"
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

      {/* POR DENTRO DO SISTEMA — prova de produto real: calendario de dispatch
          (drag-and-drop) e assinatura digital de contrato, construidos e em
          uso, nunca mostrados na landing ate esta rodada. */}
      {l.proof.length ? (
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Por dentro do sistema</span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg">Tecnologia real, nao promessa</h2>
            <p className="mx-auto mt-3 max-w-lg text-fg-muted">
              O mesmo sistema que organiza nossa operacao tecnica e o que garante prazo e registro pra voce.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {l.proof.map((p: any, pi: number) => (
              <div key={p.title || pi} className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon name={p.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-fg">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* FAIXA DE FOTO — técnico em ação, quebra o ritmo entre agenda e depoimentos */}
      <section className="relative h-64 overflow-hidden sm:h-80">
        <Image
          src="/photos/technician-hands-tools.png"
          alt="Técnico realizando manutenção de precisão em equipamento odontológico"
          fill
          sizes="100vw"
          className="object-cover"
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
