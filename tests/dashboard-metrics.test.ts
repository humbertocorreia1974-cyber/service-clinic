import { describe, it, expect } from 'vitest';
import {
  buildLeadFunnel,
  buildOsStatusBreakdown,
  buildTechnicianProductivity,
  formatCurrencyBRL,
} from '../lib/dashboard-metrics';

describe('buildLeadFunnel', () => {
  it('preenche com zero os status sem registro, mantendo a ordem do funil', () => {
    const rows = [
      { status: 'novo', _count: { _all: 3 } },
      { status: 'convertido', _count: { _all: 1 } },
    ];
    expect(buildLeadFunnel(rows)).toEqual([
      { key: 'Novo', count: 3 },
      { key: 'Contatado', count: 0 },
      { key: 'Qualificado', count: 0 },
      { key: 'Convertido', count: 1 },
      { key: 'Perdido', count: 0 },
    ]);
  });
});

describe('buildOsStatusBreakdown', () => {
  it('traduz o status tecnico pro label em portugues', () => {
    const rows = [{ status: 'em_andamento', _count: { _all: 2 } }];
    expect(buildOsStatusBreakdown(rows)).toEqual([{ key: 'Em andamento', count: 2 }]);
  });

  it('mantem o valor cru se nao tiver label mapeado (status novo/desconhecido)', () => {
    const rows = [{ status: 'orcamento_pendente', _count: { _all: 1 } }];
    expect(buildOsStatusBreakdown(rows)).toEqual([{ key: 'orcamento_pendente', count: 1 }]);
  });
});

describe('buildTechnicianProductivity', () => {
  it('ordena do mais produtivo pro menos, ignora OS sem tecnico atribuido', () => {
    const rows = [
      { technicianId: 't1', _count: { _all: 2 } },
      { technicianId: 't2', _count: { _all: 5 } },
      { technicianId: null, _count: { _all: 9 } },
    ];
    const names = { t1: 'Rodrigo', t2: 'Marina' };
    expect(buildTechnicianProductivity(rows, names)).toEqual([
      { key: 'Marina', count: 5 },
      { key: 'Rodrigo', count: 2 },
    ]);
  });

  it('usa "Desconhecido" se o id do tecnico nao bater com nenhum nome', () => {
    const rows = [{ technicianId: 'sumiu', _count: { _all: 1 } }];
    expect(buildTechnicianProductivity(rows, {})).toEqual([{ key: 'Desconhecido', count: 1 }]);
  });
});

describe('formatCurrencyBRL', () => {
  it('formata em real brasileiro', () => {
    expect(formatCurrencyBRL(1234.5)).toMatch(/R\$\s?1\.234,50/);
  });

  it('trata null/undefined como zero, nunca quebra', () => {
    expect(formatCurrencyBRL(null)).toMatch(/R\$\s?0,00/);
    expect(formatCurrencyBRL(undefined)).toMatch(/R\$\s?0,00/);
  });
});
