// 🛡️🔧 2026-09-14 (achado real de auditoria, app "Plataforma de Monitoramento"): a versao anterior deste arquivo rodava um cliente Baileys completo DENTRO da funcao serverless da Vercel - nunca funcionou em producao de verdade (filesystem efemero/somente-leitura, sem processo persistente pra manter WebSocket vivo entre invocacoes; erro real reproduzido: "ENOENT: no such file or directory, mkdir '/var/task/data'"). Reescrito como cliente do gateway multi-tenant de WhatsApp do motor JGNEXT (api.jgnext.com/api/v1/whatsapp-gateway, mesma infra Baileys que ja roda de verdade na VPS pro TennisPlay) - mantem a MESMA assinatura de funcao (ensureStarted/getQrCodeDataUrl/getConnectionStatus/sendWhatsAppMessage) pra nao precisar tocar nas rotas que ja usam este modulo.
//
// LIMITACAO CONHECIDA: o recebimento de mensagem -> resposta automatica via AssistantEngine NAO esta coberto por este cliente - o gateway hoje so expoe envio (send) e status, nao webhook de mensagem recebida. Alertas de incidente/notificacao SAINDO por WhatsApp (o uso principal) funcionam; chat bidirecional pelo WhatsApp e uma limitacao conhecida.
const GATEWAY_URL = process.env.WHATSAPP_GATEWAY_URL;
const GATEWAY_KEY = process.env.WHATSAPP_GATEWAY_KEY;
const WORKSPACE_ID = process.env.WHATSAPP_WORKSPACE_ID;

function configured() {
  return !!(GATEWAY_URL && GATEWAY_KEY && WORKSPACE_ID);
}

function base() {
  return GATEWAY_URL + '/' + WORKSPACE_ID;
}

export async function ensureStarted(): Promise<void> {
  if (!configured()) return;
  await fetch(base() + '/connect', {
    method: 'POST',
    headers: { 'x-api-key': GATEWAY_KEY as string },
  }).catch(() => {});
}

export async function getQrCodeDataUrl(): Promise<string | null> {
  if (!configured()) return null;
  try {
    const res = await fetch(base() + '/status', {
      headers: { 'x-api-key': GATEWAY_KEY as string },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.qr ?? null;
  } catch {
    return null;
  }
}

export async function getConnectionStatus(): Promise<'disconnected' | 'connecting' | 'connected'> {
  if (!configured()) return 'disconnected';
  try {
    const res = await fetch(base() + '/status', {
      headers: { 'x-api-key': GATEWAY_KEY as string },
      cache: 'no-store',
    });
    if (!res.ok) return 'disconnected';
    const data = await res.json();
    if (data?.connected) return 'connected';
    if (data?.state === 'WAITING_QR' || data?.state === 'CONNECTING') return 'connecting';
    return 'disconnected';
  } catch {
    return 'disconnected';
  }
}

export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  if (!configured()) {
    throw new Error('WhatsApp não configurado neste deploy (gateway não injetado).');
  }
  const res = await fetch(base() + '/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': GATEWAY_KEY as string },
    body: JSON.stringify({ to, message: text }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Falha ao enviar mensagem pelo gateway de WhatsApp.');
  }
}
