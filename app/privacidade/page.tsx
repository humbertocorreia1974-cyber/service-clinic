import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Service Clinic',
  robots: { index: false },
};

type SectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border py-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-xl font-semibold text-fg">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-fg-muted">{children}</div>
    </section>
  );
}

export default function PrivacidadePage() {
  const atualizadoEm = '02 de outubro de 2026';

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">Service Clinic</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
        Política de Privacidade
      </h1>
      <p className="mt-3 text-sm text-fg-muted">Última atualização: {atualizadoEm}</p>

      <p className="mt-6 text-sm leading-relaxed text-fg-muted">
        Esta política explica, em linguagem direta, quais dados a Service Clinic coleta através
        deste aplicativo, por quê, por quanto tempo, com quem compartilha e quais direitos você
        tem sobre eles — em conformidade com a Lei Geral de Proteção de Dados Pessoais
        (LGPD — Lei nº 13.709/2018).
      </p>

      <nav className="mt-8 rounded-lg border border-border bg-surface/70 p-5 text-sm">
        <p className="font-semibold text-fg">Nesta página</p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {[
            ['quem-somos', 'Quem trata seus dados'],
            ['dados-coletados', 'Quais dados coletamos'],
            ['finalidade', 'Por que coletamos'],
            ['base-legal', 'Base legal'],
            ['compartilhamento', 'Com quem compartilhamos'],
            ['retencao', 'Por quanto tempo guardamos'],
            ['seguranca', 'Como protegemos'],
            ['cookies', 'Cookies'],
            ['direitos', 'Seus direitos'],
            ['criancas', 'Dados de crianças'],
            ['alteracoes', 'Alterações nesta política'],
            ['contato', 'Contato'],
          ].map(([href, label]) => (
            <li key={href}>
              <a href={`#${href}`} className="text-brand hover:underline">{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4">
        <Section id="quem-somos" title="1. Quem trata os seus dados">
          <p>
            A <strong>Service Clinic</strong> (&quot;nós&quot;) é a <strong>controladora</strong> dos
            dados pessoais tratados através deste aplicativo: decide o que é coletado e para quê.
          </p>
          <p>
            A infraestrutura técnica (hospedagem, banco de dados e o próprio software deste
            aplicativo) é operada pela plataforma <strong>JGNEXT</strong>, que atua como
            <strong> operadora</strong> — trata os dados apenas seguindo as instruções da Service
            Clinic, nunca por conta própria.
          </p>
        </Section>

        <Section id="dados-coletados" title="2. Quais dados coletamos">
          <p>Coletamos apenas o que é necessário para prestar o serviço de manutenção contratado:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Dados de cadastro e login:</strong> nome, e-mail e senha (armazenada apenas de forma criptografada — nunca em texto legível).</li>
            <li><strong>Dados da clínica/cliente:</strong> razão social ou nome fantasia, endereço, cidade e telefone de contato.</li>
            <li><strong>Dados de orçamento/contato (formulário público):</strong> nome, telefone, cidade, e-mail (opcional), assunto e mensagem de quem solicita um orçamento, mesmo sem ainda ser cliente.</li>
            <li><strong>Dados da ordem de serviço:</strong> equipamento atendido, checklist técnico preenchido pelo técnico, fotos de evidência (antes/depois), assinatura digital de aprovação do responsável pela clínica, materiais usados e status do atendimento.</li>
            <li><strong>Dados financeiros do atendimento:</strong> valor cobrado e status de pagamento da ordem de serviço (não processamos cartão de crédito diretamente neste aplicativo).</li>
            <li><strong>Avaliações:</strong> nota e comentário deixados pelo cliente após o atendimento.</li>
            <li><strong>Dados técnicos de uso:</strong> endereço IP e registros de acesso, usados apenas para segurança (ex.: limitar tentativas de login) — nunca para perfilamento de marketing.</li>
          </ul>
          <p>
            Não coletamos dados sensíveis na acepção do art. 5º, II da LGPD (origem racial, convicção
            religiosa, opinião política, dado de saúde do titular, biometria, etc.). A assinatura
            digital de aprovação registrada na ordem de serviço é uma assinatura eletrônica simples
            (traço/confirmação), não um dado biométrico.
          </p>
        </Section>

        <Section id="finalidade" title="3. Por que coletamos cada dado">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Viabilizar login e controle de acesso por função (administrativo, técnico, cliente).</li>
            <li>Agendar, executar e documentar visitas técnicas e ordens de serviço.</li>
            <li>Emitir cobrança referente ao serviço prestado.</li>
            <li>Responder pedidos de orçamento enviados pelo formulário público do site.</li>
            <li>Notificar o cliente sobre o andamento do atendimento (ex.: técnico a caminho, serviço concluído).</li>
            <li>Cumprir obrigações legais e fiscais (ex.: guarda de registros de faturamento).</li>
            <li>Proteger a conta contra acesso indevido (ex.: limitar tentativas de login e redefinição de senha).</li>
          </ul>
        </Section>

        <Section id="base-legal" title="4. Base legal (LGPD, art. 7º)">
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Execução de contrato</strong> (art. 7º, V): dados de clientes e ordens de serviço, necessários para prestar o serviço contratado.</li>
            <li><strong>Legítimo interesse</strong> (art. 7º, IX): resposta a pedidos de orçamento de quem ainda não é cliente, e registros de segurança de acesso.</li>
            <li><strong>Cumprimento de obrigação legal</strong> (art. 7º, II): guarda de documentos fiscais pelo prazo exigido por lei.</li>
          </ul>
          <p>Não usamos consentimento como base para finalidades que podem ser atendidas por essas hipóteses — isso evita pedir &quot;aceite&quot; de algo que já é necessário pra te atender.</p>
        </Section>

        <Section id="compartilhamento" title="5. Com quem compartilhamos">
          <p>Não vendemos dados pessoais. Compartilhamos apenas com:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>JGNEXT</strong> (operadora técnica) — hospedagem e funcionamento do aplicativo.</li>
            <li><strong>Vercel Inc.</strong — hospedagem da aplicação (infraestrutura nos EUA).</li>
            <li><strong>Neon Database</strong — banco de dados gerenciado (infraestrutura nos EUA).</li>
            <li><strong>Provedor de e-mail</strong — envio de notificações e redefinição de senha.</li>
            <li><strong>WhatsApp/Meta</strong — quando o contato é feito ou respondido por esse canal.</li>
            <li>Autoridades públicas, quando exigido por lei ou ordem judicial.</li>
          </ul>
          <p>
            Como Vercel e Neon ficam fora do Brasil, pode haver transferência internacional de
            dados (LGPD, art. 33). Ambos os fornecedores mantêm compromissos contratuais de
            segurança e privacidade equivalentes aos exigidos pela LGPD.
          </p>
        </Section>

        <Section id="retencao" title="6. Por quanto tempo guardamos os dados">
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Conta de usuário:</strong> enquanto estiver ativa; removida mediante solicitação, respeitado o item abaixo.</li>
            <li><strong>Ordens de serviço e documentos fiscais:</strong> pelo prazo exigido pela legislação fiscal e civil brasileira (em regra, até 5 anos).</li>
            <li><strong>Pedido de orçamento não convertido em cliente:</strong> até 12 meses, depois excluído se não houver contato.</li>
            <li><strong>Registros de acesso/segurança:</strong> até 6 meses, prazo mínimo técnico recomendado.</li>
          </ul>
        </Section>

        <Section id="seguranca" title="7. Como protegemos os seus dados">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Conexão sempre criptografada (HTTPS/TLS).</li>
            <li>Senhas armazenadas com hash criptográfico (bcrypt) — nunca em texto legível, nem por nós.</li>
            <li>Acesso ao sistema segmentado por função: cliente, técnico e equipe administrativa só veem os dados relevantes ao seu papel.</li>
            <li>Cabeçalhos de segurança (CSP, proteção contra clickjacking) e limite de tentativas em formulários sensíveis (login, redefinição de senha).</li>
          </ul>
          <p>Nenhum sistema é 100% imune a incidentes. Em caso de incidente de segurança relevante, comunicaremos os titulares afetados e a ANPD conforme exigido pela LGPD (art. 48).</p>
        </Section>

        <Section id="cookies" title="8. Cookies">
          <p>
            Usamos apenas o cookie essencial de sessão (login) — necessário para você continuar
            autenticado durante o uso do aplicativo. Não usamos cookies de publicidade, rastreamento
            de terceiros ou analytics de comportamento.
          </p>
        </Section>

        <Section id="direitos" title="9. Seus direitos (LGPD, art. 18)">
          <p>Você pode solicitar, a qualquer momento:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Confirmação de que tratamos seus dados, e acesso a eles;</li>
            <li>Correção de dados incompletos, imprecisos ou desatualizados;</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a lei;</li>
            <li>Portabilidade dos dados a outro fornecedor, mediante requisição expressa;</li>
            <li>Eliminação dos dados tratados com base no seu consentimento;</li>
            <li>Informação sobre com quem compartilhamos seus dados;</li>
            <li>Informação sobre a possibilidade de não fornecer consentimento e suas consequências;</li>
            <li>Revogação do consentimento, quando essa for a base de tratamento;</li>
            <li>Oposição a tratamento realizado com base em hipótese de dispensa de consentimento, em caso de descumprimento da lei.</li>
          </ul>
          <p>Para exercer qualquer um desses direitos, use o canal indicado em &quot;Contato&quot; abaixo. Respondemos em até 15 dias.</p>
        </Section>

        <Section id="criancas" title="10. Dados de crianças e adolescentes">
          <p>
            Este aplicativo é destinado a uso profissional B2B (clínicas, consultórios e hospitais) e
            não é direcionado a crianças ou adolescentes. Não coletamos intencionalmente dados de
            menores de idade.
          </p>
        </Section>

        <Section id="alteracoes" title="11. Alterações nesta política">
          <p>
            Podemos atualizar este texto para refletir mudanças no aplicativo ou na legislação.
            Alterações relevantes serão comunicadas por e-mail ou aviso no próprio aplicativo. A
            data no topo desta página sempre indica a versão vigente.
          </p>
        </Section>

        <Section id="contato" title="12. Contato">
          <p>
            Dúvidas, solicitações sobre seus dados ou qualquer questão de privacidade podem ser
            enviadas para{' '}
            <a href="https://wa.me/5524999467392" className="text-brand hover:underline">
              (24) 99946-7392
            </a>{' '}
            (WhatsApp) ou pelo{' '}
            <a href="/contato" className="text-brand hover:underline">formulário de contato</a>.
          </p>
          <p>
            Como pequena empresa, a Service Clinic está dispensada da indicação formal de um
            Encarregado de Proteção de Dados (DPO) nos termos da Resolução CD/ANPD nº 2/2022, mas
            mantém este canal de comunicação direto para qualquer assunto de privacidade.
          </p>
        </Section>
      </div>

      <p className="mt-10 rounded-md border border-border bg-surface/70 p-4 text-xs leading-relaxed text-fg-muted">
        Este documento foi elaborado com base nos dados realmente tratados por este aplicativo e
        nos requisitos da LGPD (Lei nº 13.709/2018), mas não substitui a revisão de um advogado
        antes da publicação definitiva — recomendação válida para qualquer política de privacidade,
        independentemente de quem a redige.
      </p>
    </main>
  );
}
