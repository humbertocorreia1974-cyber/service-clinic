import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso | Service Clinic',
  robots: { index: false },
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border py-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-xl font-semibold text-fg">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-fg-muted">{children}</div>
    </section>
  );
}

export default function TermosPage() {
  const atualizadoEm = '02 de outubro de 2026';

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">Service Clinic</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
        Termos de Uso
      </h1>
      <p className="mt-3 text-sm text-fg-muted">Última atualização: {atualizadoEm}</p>

      <p className="mt-6 text-sm leading-relaxed text-fg-muted">
        Estes termos regem o uso do aplicativo da Service Clinic por clínicas, consultórios,
        hospitais clientes, seus colaboradores e pela equipe técnica da Service Clinic. Ao criar
        uma conta ou usar este aplicativo, você concorda com o que está descrito abaixo.
      </p>

      <nav className="mt-8 rounded-lg border border-border bg-surface/70 p-5 text-sm">
        <p className="font-semibold text-fg">Nesta página</p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {[
            ['servico', 'O que é o serviço'],
            ['contas', 'Contas e acesso'],
            ['uso-aceitavel', 'Uso aceitável'],
            ['conteudo', 'Conteúdo enviado por você'],
            ['pagamento', 'Orçamentos e pagamento'],
            ['disponibilidade', 'Disponibilidade do serviço'],
            ['propriedade', 'Propriedade intelectual'],
            ['responsabilidade', 'Limitação de responsabilidade'],
            ['rescisao', 'Suspensão e encerramento'],
            ['alteracoes', 'Alterações nestes termos'],
            ['lei', 'Lei aplicável e foro'],
            ['contato', 'Contato'],
          ].map(([href, label]) => (
            <li key={href}>
              <a href={`#${href}`} className="text-brand hover:underline">{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4">
        <Section id="servico" title="1. O que é o serviço">
          <p>
            Este aplicativo é a plataforma de gestão de atendimento da Service Clinic: manutenção
            preventiva e corretiva de equipamentos odontológicos, clínicos e hospitalares, incluindo
            higienização de ar-condicionado como sub-serviço, e revenda de peças de reposição no Sul
            Fluminense (Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí).
          </p>
          <p>
            Pelo aplicativo, clientes acompanham ordens de serviço, aprovam orçamentos, recebem
            cobranças e avaliam o atendimento; técnicos registram execução e checklist; a equipe
            administrativa gerencia clientes, técnicos e usuários.
          </p>
        </Section>

        <Section id="contas" title="2. Contas e acesso">
          <p>
            O acesso a este aplicativo é por convite — contas são criadas pela administração da
            Service Clinic ou, no caso de clientes e técnicos, provisionadas automaticamente no
            cadastro vinculado (nova clínica ou novo técnico).
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Você é responsável por manter sua senha em sigilo e por tudo o que acontecer na sua conta.</li>
            <li>Avise-nos imediatamente se suspeitar de acesso não autorizado à sua conta.</li>
            <li>Cada conta é de uso individual — não compartilhe credenciais entre pessoas diferentes.</li>
          </ul>
        </Section>

        <Section id="uso-aceitavel" title="3. Uso aceitável">
          <p>Ao usar este aplicativo, você concorda em não:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Tentar acessar dados ou contas de outras clínicas, técnicos ou usuários;</li>
            <li>Enviar conteúdo ilegal, enganoso ou que viole direitos de terceiros;</li>
            <li>Interferir no funcionamento do aplicativo (ex.: automatizar requisições em volume anormal, tentar burlar limites de segurança);</li>
            <li>Usar o aplicativo para qualquer finalidade diferente da gestão do atendimento contratado com a Service Clinic.</li>
          </ul>
        </Section>

        <Section id="conteudo" title="4. Conteúdo enviado por você">
          <p>
            Fotos de evidência, checklist técnico, assinatura de aprovação e avaliações enviadas por
            você permanecem vinculadas à ordem de serviço correspondente e são usadas apenas para
            documentar o atendimento prestado — conforme descrito na{' '}
            <a href="/privacidade" className="text-brand hover:underline">Política de Privacidade</a>.
          </p>
          <p>Você garante que tem o direito de enviar o conteúdo que anexa (ex.: fotos do próprio equipamento/ambiente).</p>
        </Section>

        <Section id="pagamento" title="5. Orçamentos e pagamento">
          <p>
            Orçamentos ficam registrados na ordem de serviço e são considerados aprovados quando você
            confirma essa aprovação no aplicativo. A cobrança referente ao serviço executado é
            registrada e comunicada pelo aplicativo; as condições de pagamento (forma, prazo) são as
            combinadas diretamente com a Service Clinic no momento da contratação.
          </p>
        </Section>

        <Section id="disponibilidade" title="6. Disponibilidade do serviço">
          <p>
            Fazemos o possível para manter o aplicativo disponível, mas não garantimos operação
            ininterrupta — pode haver manutenções programadas ou instabilidades pontuais de
            infraestrutura (hospedagem, banco de dados) fora do nosso controle direto. Em caso de
            indisponibilidade, o atendimento técnico presencial segue sendo coordenado pelos canais
            diretos (WhatsApp/telefone).
          </p>
        </Section>

        <Section id="propriedade" title="7. Propriedade intelectual">
          <p>
            A marca, o layout e o software deste aplicativo pertencem à Service Clinic e/ou à
            plataforma JGNEXT, que o desenvolve e mantém. Você não adquire nenhum direito sobre eles
            além do uso para a finalidade descrita nestes termos.
          </p>
        </Section>

        <Section id="responsabilidade" title="8. Limitação de responsabilidade">
          <p>
            Este aplicativo é uma ferramenta de gestão e comunicação do atendimento — não substitui o
            julgamento técnico profissional do técnico responsável nem garante, por si só, o
            funcionamento do equipamento atendido além do que foi tecnicamente executado e descrito
            na ordem de serviço.
          </p>
          <p>
            Na máxima extensão permitida por lei, a Service Clinic não se responsabiliza por danos
            indiretos decorrentes do uso do aplicativo (ex.: perda de dados por falha de internet do
            usuário), sem prejuízo da responsabilidade pela qualidade do serviço técnico efetivamente
            prestado, essa sim regida pelo Código de Defesa do Consumidor quando aplicável.
          </p>
        </Section>

        <Section id="rescisao" title="9. Suspensão e encerramento">
          <p>
            Podemos suspender ou encerrar uma conta em caso de uso que viole estes termos, mediante
            aviso prévio sempre que possível. Você pode solicitar o encerramento da sua conta e a
            exclusão dos seus dados a qualquer momento, observados os prazos legais de guarda descritos
            na <a href="/privacidade" className="text-brand hover:underline">Política de Privacidade</a>.
          </p>
        </Section>

        <Section id="alteracoes" title="10. Alterações nestes termos">
          <p>
            Podemos atualizar estes termos para refletir mudanças no serviço ou na legislação.
            Mudanças relevantes serão comunicadas por e-mail ou aviso no aplicativo. O uso continuado
            após a atualização representa concordância com a nova versão.
          </p>
        </Section>

        <Section id="lei" title="11. Lei aplicável e foro">
          <p>
            Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro
            da comarca de Volta Redonda (RJ) para dirimir eventuais controvérsias, com renúncia a
            qualquer outro, por mais privilegiado que seja, ressalvado o foro do consumidor quando
            aplicável por lei.
          </p>
        </Section>

        <Section id="contato" title="12. Contato">
          <p>
            Dúvidas sobre estes termos podem ser enviadas para{' '}
            <a href="https://wa.me/5524999467392" className="text-brand hover:underline">
              (24) 99946-7392
            </a>{' '}
            (WhatsApp) ou pelo{' '}
            <a href="/contato" className="text-brand hover:underline">formulário de contato</a>.
          </p>
        </Section>
      </div>

      <p className="mt-10 rounded-md border border-border bg-surface/70 p-4 text-xs leading-relaxed text-fg-muted">
        Este documento foi elaborado com base nas práticas reais deste aplicativo e em cláusulas
        padrão do mercado para serviços B2B de field service, mas não substitui a revisão de um
        advogado antes da publicação definitiva — recomendação válida para qualquer termo de uso,
        independentemente de quem o redige.
      </p>
    </main>
  );
}
