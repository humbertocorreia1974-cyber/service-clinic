import Link from 'next/link';

export const metadata = { title: "Primeiros passos | Service Clinic", description: "Como usar o Service Clinic passo a passo." };

export default function GuiaPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wider text-brand">Primeiros passos</p>
      <h1 className="mt-1 font-display text-3xl text-fg sm:text-4xl">Como usar o Service Clinic</h1>
      <p className="mt-3 text-fg-muted">Este guia mostra, na ordem, o que fazer. Você não precisa entender de tecnologia.</p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-fg">Para você, dono do negócio</h2>
        <ol className="mt-3 space-y-3">
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">1</span>
            <div>
              <p className="font-medium text-fg">Entre na plataforma</p>
              <p className="mt-1 text-sm text-fg-muted">Use o e-mail e a senha que a Service Clinic cadastrou para você. Quem tem papel de gerente ou administrador vê todos os módulos.</p>
              <Link href="/login" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">2</span>
            <div>
              <p className="font-medium text-fg">Veja o painel do negócio</p>
              <p className="mt-1 text-sm text-fg-muted">Resumo de ordens de serviço abertas, clientes e peças em baixa.</p>
              <Link href="/dashboard" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">3</span>
            <div>
              <p className="font-medium text-fg">Cadastre seus clientes</p>
              <p className="mt-1 text-sm text-fg-muted">Consultórios, clínicas e hospitais atendidos, com endereço e contato.</p>
              <Link href="/clientes" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">4</span>
            <div>
              <p className="font-medium text-fg">Cadastre seus técnicos</p>
              <p className="mt-1 text-sm text-fg-muted">Cada técnico recebe as ordens de serviço da própria agenda.</p>
              <Link href="/tecnicos" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">5</span>
            <div>
              <p className="font-medium text-fg">Abra e acompanhe ordens de serviço</p>
              <p className="mt-1 text-sm text-fg-muted">Checklist por tipo de serviço, fotos antes e depois e assinatura do cliente.</p>
              <Link href="/ordens-servico" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">6</span>
            <div>
              <p className="font-medium text-fg">Emita laudos técnicos</p>
              <p className="mt-1 text-sm text-fg-muted">Laudo técnico, higienização de ar-condicionado, PMOC e biossegurança, ligados à ordem de serviço.</p>
              <Link href="/laudos" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">7</span>
            <div>
              <p className="font-medium text-fg">Controle o estoque de peças</p>
              <p className="mt-1 text-sm text-fg-muted">Veja a quantidade de cada peça, o mínimo desejado e ajuste entradas e saídas.</p>
              <Link href="/pecas/estoque" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-fg">Para o seu cliente</h2>
        <ol className="mt-3 space-y-3">
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">1</span>
            <div>
              <p className="font-medium text-fg">Peça um orçamento</p>
              <p className="mt-1 text-sm text-fg-muted">Descreva o problema do equipamento e, se quiser, envie uma foto.</p>
              <Link href="/orcamento" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">2</span>
            <div>
              <p className="font-medium text-fg">Compre peças e acessórios</p>
              <p className="mt-1 text-sm text-fg-muted">A loja tem catálogo com código, marca e compatibilidade. Adicione ao carrinho e finalize o pedido.</p>
              <Link href="/pecas" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">3</span>
            <div>
              <p className="font-medium text-fg">Acompanhe tudo no portal do cliente</p>
              <p className="mt-1 text-sm text-fg-muted">Ordens de serviço, laudos e histórico dos seus equipamentos.</p>
              <Link href="/portal" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">4</span>
            <div>
              <p className="font-medium text-fg">Fale com a equipe</p>
              <p className="mt-1 text-sm text-fg-muted">WhatsApp e formulário de contato para dúvidas e urgências.</p>
              <Link href="/contato" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
        </ol>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-lg font-semibold text-fg">Quer mudar alguma coisa?</h2>
        <p className="mt-1 text-sm text-fg-muted">Volte ao chat do JGNEXT e escreva o que quer, por exemplo: &quot;troque o preço do meu produto principal&quot; ou &quot;coloque meu telefone no rodapé&quot;. Quando estiver satisfeito, peça: &quot;publique meu app&quot;.</p>
      </section>
    </main>
  );
}
