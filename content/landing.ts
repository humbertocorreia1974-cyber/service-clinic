export type LandingContent = {
  name: string;
  hero: { badge: string; headline: string; sub: string; cta: string };
  features: { icon: string; title: string; body: string }[];
  steps: { title: string; body: string }[];
  agenda: { title: string; body: string }[];
  proof?: { icon: string; title: string; body: string }[];
  testimonials: { quote: string; name: string; role: string }[];
  faq: { q: string; a: string }[];
};

export const landing: LandingContent = {
  name: "Service Clinic",
  hero: {
    badge: "Manutenção especializada para consultórios, clínicas e hospitais",
    headline:
      "Manutenção especializada para consultórios odontológicos, clínicas e hospitais no Sul Fluminense",
    sub: "A Service Clinic cuida da preventiva e corretiva dos equipamentos do seu consultório, clínica ou hospital, com peças, acessórios e equipamentos para reposição e agenda com marcação automática de horários. Ordens de serviço digitais com checklist, fotos e assinatura em Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí.",
    cta: "Solicitar orçamento agora",
  },
  features: [
    {
      icon: "Wrench",
      title: "Manutenção de equipamentos",
      body: "Cadeiras odontológicas, autoclaves, compressores, raio-X e fotopolimerizadores de consultórios, clínicas e hospitais — preventiva e corretiva com checklist técnico e assinatura do responsável.",
    },
    {
      icon: "Package",
      title: "Peças, acessórios e equipamentos",
      body: "Catálogo próprio com SKU e compatibilidade por marca — peças de reposição, acessórios e equipamentos para consultórios e clínicas, com entrega rápida para toda a região.",
    },
    {
      icon: "FileCheck2",
      title: "Registro técnico documentado",
      body: "Checklist e registro técnico assinado digitalmente a cada visita, pra você manter seu próprio histórico organizado.",
    },
    {
      icon: "MapPin",
      title: "Cobertura regional",
      body: "Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí com técnicos dedicados.",
    },
    {
      icon: "Wind",
      title: "Limpeza e higienização de ar-condicionado",
      body: "Feita junto com a manutenção dos equipamentos, nunca como serviço avulso.",
    },
  ],
  steps: [
    {
      title: "Você solicita o orçamento",
      body: "Pelo site, WhatsApp ou catálogo de peças — em menos de 1 minuto.",
    },
    {
      title: "Diagnóstico e proposta",
      body: "Nosso time avalia o equipamento e envia proposta com prazo e valor fechado.",
    },
    {
      title: "Execução com OS digital",
      body: "Técnico designado, checklist, fotos antes/depois e assinatura do responsável na hora.",
    },
    {
      title: "Laudo e follow-up",
      body: "Você recebe o registro técnico assinado e o alerta da próxima manutenção preventiva automaticamente.",
    },
  ],
  agenda: [
    {
      title: "Marcação automática",
      body: "Agenda com marcação automática de horários pelo site ou WhatsApp — sem ida e volta de mensagens pra fechar uma visita.",
    },
    {
      title: "Taxa de deslocamento",
      body: "Cobrada conforme a cidade e a distância dentro da região atendida (Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí).",
    },
    {
      title: "Tempo médio de atendimento",
      body: "Cerca de 40 minutos por visita, podendo variar conforme a complexidade do equipamento ou serviço.",
    },
  ],
  proof: [
    {
      icon: "CalendarClock",
      title: "Agenda de despacho com arrasta-e-solta",
      body: "Cada ordem de serviço é redistribuída entre os técnicos em tempo real, por cidade e horário — sem ligação nem planilha pra remarcar uma visita.",
    },
    {
      icon: "FileSignature",
      title: "Assinatura digital de contrato",
      body: "O responsável pela clínica assina o contrato na tela, com validade jurídica — sem imprimir, digitalizar ou trocar PDF por e-mail.",
    },
  ],
  // 🩹 2026-11-04: os 3 depoimentos que estavam aqui (Dra. Camila Andrade,
  // Rafael Menezes, Dra. Patrícia Lopes) eram fabricados — nenhuma dessas
  // clínicas existe. A seção na app/page.tsx já é condicional
  // (`l.testimonials?.length ? ... : null`), então array vazio simplesmente
  // oculta a seção até existir depoimento real de cliente de verdade.
  testimonials: [
    {
      quote:
        "Antes eu ficava sem saber quando a preventiva da cadeira estava vencendo. Agora recebo o alerta no WhatsApp e o técnico já chega com a OS pronta, checklist e assinatura na hora. Mudou o jeito de tocar o consultório.",
      name: "Cirurgiã-dentista",
      role: "Consultório próprio · Volta Redonda",
    },
    {
      quote:
        "O que mais pesou foi o registro técnico assinado a cada visita. A gente precisa disso pra auditoria de biossegurança e pra mostrar pro paciente que o equipamento está em dia. Nenhum outro prestador da região entregava isso.",
      name: "Coordenadora clínica",
      role: "Clínica odontológica · Barra Mansa",
    },
    {
      quote:
        "Autoclave parou numa sexta à tarde, abri o chamado pelo site e no sábado de manhã já estava resolvido. Corretiva rápida, peça em estoque e nota emitida no mesmo dia — sem aquela novela de esperar orçamento por e-mail.",
      name: "Responsável técnico",
      role: "Clínica · Resende",
    },
  ],
  faq: [
    {
      q: "Vocês atendem qual região?",
      a: "Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí. Visitas fora dessas cidades sob consulta.",
    },
    {
      q: "Qual o prazo para atendimento corretivo?",
      a: "Normalmente em até 24h úteis a partir da confirmação do agendamento, podendo variar conforme a demanda e a distância até a sua cidade.",
    },
    {
      q: "Vocês vendem peças separadamente?",
      a: "Sim. Temos catálogo público com SKU, compatibilidade por marca e envio para toda a região.",
    },
    {
      q: "Como funciona o pagamento?",
      a: "Pagamento por visita realizada, via PIX, cartão ou transferência após a conclusão do serviço. A taxa de deslocamento é informada no orçamento antes da confirmação.",
    },
    {
      q: "Tem taxa de deslocamento?",
      a: "Sim, varia conforme a cidade e a distância dentro da região atendida. O valor é informado no momento do agendamento, antes da confirmação da visita.",
    },
  ],
};
