export type LandingContent = {
  name: string;
  hero: { badge: string; headline: string; sub: string; cta: string };
  features: { icon: string; title: string; body: string }[];
  steps: { title: string; body: string }[];
  pricing: {
    name: string;
    price: string;
    period: string;
    features: string[];
    cta: string;
    highlight?: boolean;
  }[];
  testimonials: { quote: string; name: string; role: string }[];
  faq: { q: string; a: string }[];
};

export const landing: LandingContent = {
  name: "Service Clinic",
  hero: {
    badge: "Manutenção odontológica + PMOC no Sul Fluminense",
    headline:
      "Manutenção odontológica e higienização de ar-condicionado com laudo PMOC no Sul Fluminense",
    sub: "A Service Clinic cuida da preventiva e corretiva dos seus equipamentos odontológicos, da higienização técnica do ar-condicionado em ambiente clínico e ainda fornece peças de reposição — com ordens de serviço, laudos assinados e agenda por técnico em Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí.",
    cta: "Solicitar orçamento agora",
  },
  features: [
    {
      icon: "Wrench",
      title: "Preventiva e corretiva",
      body: "Cadeiras, autoclaves, compressores, raio-X e fotopolimerizadores com checklist técnico e assinatura do responsável.",
    },
    {
      icon: "Wind",
      title: "Higienização com PMOC",
      body: "Limpeza técnica de ar-condicionado em ambiente clínico com laudo assinado e validade documentada.",
    },
    {
      icon: "Package",
      title: "Peças de reposição",
      body: "Catálogo com SKU, compatibilidade por marca e entrega rápida para toda a região.",
    },
    {
      icon: "FileCheck2",
      title: "Laudos e conformidade",
      body: "PMOC, biossegurança e laudo técnico assinado digitalmente — pronto para a vigilância sanitária.",
    },
    {
      icon: "CalendarClock",
      title: "Agenda por técnico",
      body: "Visitas confirmadas por WhatsApp com histórico completo por clínica e por equipamento.",
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
      body: "Você recebe o laudo assinado e o alerta da próxima preventiva automaticamente.",
    },
  ],
  pricing: [
    {
      name: "Avulso",
      price: "R$ 380",
      period: "/visita",
      features: [
        "1 equipamento por visita",
        "Checklist técnico completo",
        "Relatório digital da OS",
        "Garantia de 90 dias no serviço",
      ],
      cta: "Agendar visita",
    },
    {
      name: "Preventiva Anual",
      price: "R$ 1.290",
      period: "/mês",
      features: [
        "Até 6 equipamentos cobertos",
        "Visitas trimestrais programadas",
        "Laudo PMOC do ar-condicionado incluso",
        "Prioridade em chamados corretivos",
        "Desconto de 15% em peças",
      ],
      cta: "Assinar preventiva",
      highlight: true,
    },
    {
      name: "Clínica Completa",
      price: "R$ 2.490",
      period: "/mês",
      features: [
        "Equipamentos ilimitados da unidade",
        "Visitas mensais + corretiva ilimitada",
        "PMOC, biossegurança e laudos assinados",
        "Portal do cliente com histórico completo",
        "Gestor de conta dedicado",
      ],
      cta: "Falar com especialista",
    },
  ],
  testimonials: [
    {
      quote:
        "Trocamos três fornecedores por um só. A preventiva trimestral acabou com as paradas de cadeira em plena agenda cheia.",
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
      a: "Clientes com contrato de preventiva têm prioridade: até 24h úteis. Chamados avulsos entram na fila em até 72h.",
    },
    {
      q: "Vocês vendem peças separadamente?",
      a: "Sim. Temos catálogo público com SKU, compatibilidade por marca e envio para toda a região.",
    },
    {
      q: "Como funciona o pagamento?",
      a: "Contratos mensais via boleto ou PIX. Serviços avulsos podem ser pagos por cartão, PIX ou transferência após a conclusão.",
    },
  ],
};
