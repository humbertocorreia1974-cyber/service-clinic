export type LandingContent = {
  name: string;
  hero: { badge: string; headline: string; sub: string; cta: string };
  features: { icon: string; title: string; body: string }[];
  steps: { title: string; body: string }[];
  agenda: { title: string; body: string }[];
  testimonials: { quote: string; name: string; role: string }[];
  faq: { q: string; a: string }[];
};

export const landing: LandingContent = {
  name: "Service Clinic",
  hero: {
    badge: "Manutenção especializada para consultórios, clínicas e hospitais",
    headline:
      "Manutenção especializada para consultórios odontológicos, clínicas e hospitais no Sul Fluminense",
    sub: "A Service Clinic cuida da preventiva e corretiva dos equipamentos do seu consultório, clínica ou hospital, com higienização técnica de ar-condicionado (laudo PMOC) como parte do pacote de manutenção clínica, além de peças de reposição. Agenda com marcação automática de horários e ordens de serviço digitais em Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí.",
    cta: "Solicitar orçamento agora",
  },
  features: [
    {
      icon: "Wrench",
      title: "Manutenção de equipamentos",
      body: "Cadeiras odontológicas, autoclaves, compressores, raio-X e fotopolimerizadores de consultórios, clínicas e hospitais — preventiva e corretiva com checklist técnico e assinatura do responsável. Inclui, como sub-serviço, a higienização técnica de ar-condicionado em ambiente clínico com laudo PMOC.",
    },
    {
      icon: "Package",
      title: "Peças de reposição",
      body: "Catálogo com SKU, compatibilidade por marca e entrega rápida para toda a região.",
    },
    {
      icon: "Wind",
      title: "Higienização com PMOC (sub-serviço)",
      body: "Limpeza técnica de ar-condicionado em ambiente clínico, com laudo assinado — realizada junto com a manutenção dos equipamentos, nunca como serviço avulso de ar-condicionado comum.",
    },
    {
      icon: "FileCheck2",
      title: "Laudos e conformidade",
      body: "PMOC, biossegurança e laudo técnico assinado digitalmente — pronto para a vigilância sanitária.",
    },
    {
      icon: "MapPin",
      title: "Cobertura regional",
      body: "Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí com técnicos dedicados.",
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
      body: "Você recebe o laudo assinado e o alerta da próxima manutenção preventiva automaticamente.",
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
  testimonials: [
    {
      quote:
        "Trocamos três fornecedores por um só. A manutenção preventiva acabou com as paradas de cadeira em plena agenda cheia.",
      name: "Dra. Camila Andrade",
      role: "Clínica OdontoVida — Volta Redonda",
    },
    {
      quote:
        "O laudo PMOC assinado digitalmente resolveu nossa pendência na vigilância sanitária em uma semana.",
      name: "Rafael Menezes",
      role: "Clínica Sorriso Real — Barra Mansa",
    },
    {
      quote:
        "Peça chegou no mesmo dia e o técnico instalou com OS digital. Nunca mais perdi paciente por equipamento parado.",
      name: "Dra. Patrícia Lopes",
      role: "OdontoCenter — Resende",
    },
  ],
  faq: [
    {
      q: "Vocês atendem qual região?",
      a: "Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí. Visitas fora dessas cidades sob consulta.",
    },
    {
      q: "O laudo PMOC tem validade legal?",
      a: "Sim. Emitimos laudo técnico assinado digitalmente, com validade de 12 meses, conforme a Lei 13.589/2018 e a RE 09/2003 da Anvisa.",
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
