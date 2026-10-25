'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardTitle, CardBody } from '@/components/ui/card';

type GroupCount = { key: string; count: number };
type Metrics = {
  faturamentoMes: number;
  osPorStatus: GroupCount[];
  leadsFunil: GroupCount[];
  produtividadeTecnicos: GroupCount[];
  geradoEm: string;
};

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function MetricsClient({ initial }: { initial: Metrics }) {
  const [data, setData] = useState<Metrics>(initial);
  const [loading, setLoading] = useState(false);
  // 'Atualizado em' só é formatado no client, depois da hidratação: toLocaleString
  // depende do timezone/locale do runtime, que difere entre servidor e navegador
  // e causava erro de hidratação (#418/#425) quando formatado direto no JSX.
  const [updatedLabel, setUpdatedLabel] = useState<string | null>(null);

  useEffect(() => {
    setUpdatedLabel(new Date(data.geradoEm).toLocaleString('pt-BR'));
  }, [data.geradoEm]);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/metrics');
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-fg-muted">
          Atualizado em {updatedLabel ?? '—'}
        </p>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-md border border-border bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/20 disabled:opacity-60"
        >
          {loading ? 'Atualizando…' : 'Atualizar'}
        </button>
      </div>

      <Card>
        <CardTitle>Faturamento do mês</CardTitle>
        <CardBody>
          <p className="text-3xl font-bold text-fg">{formatBRL(data.faturamentoMes)}</p>
          <p className="mt-1 text-xs text-fg-muted">Soma de faturas pagas neste mês.</p>
        </CardBody>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>Ordens de serviço por status</CardTitle>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.osPorStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="key" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardTitle>Funil de leads</CardTitle>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.leadsFunil}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="key" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardTitle>Produtividade por técnico (OS concluídas este mês)</CardTitle>
        <CardBody>
          {data.produtividadeTecnicos.length === 0 ? (
            <p className="text-sm text-fg-muted">Nenhuma OS concluída neste mês ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.produtividadeTecnicos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="key" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f766e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
