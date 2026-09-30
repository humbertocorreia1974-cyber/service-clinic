// 📦 Cliente do gateway de storage do JGNEXT — sobe arquivo (foto de produto,
// avatar, anexo, PDF curto) sem precisar contratar S3/Blob/Cloudflare R2 por
// conta própria. Mesma convenção de env var do runtime-error-reporter (sem
// prefixo NEXT_PUBLIC_ — só server, nunca chame direto de "use client").
//
// Configurado automaticamente pelo JGNEXT quando o app é publicado (ver
// buildDeployEnv em deployPrep.js) — sem nenhuma env var pra configurar à
// mão. Sem elas, `uploadFile` lança erro explícito em vez de falhar em
// silêncio (melhor um 500 claro do que um upload que "funciona" e some).
const GATEWAY_URL = process.env.STORAGE_GATEWAY_URL;
const GATEWAY_KEY = process.env.STORAGE_GATEWAY_KEY;
const WORKSPACE_ID = process.env.STORAGE_WORKSPACE_ID;

function configured() {
  return !!(GATEWAY_URL && GATEWAY_KEY && WORKSPACE_ID);
}

type UploadResult = { url: string };

/**
 * Sobe um arquivo (imagem, PDF, áudio, vídeo curto — até 8MB) e devolve a
 * URL pública já pronta pra salvar no banco/exibir na UI.
 */
export async function uploadFile(filename: string, base64Content: string): Promise<UploadResult> {
  if (!configured()) {
    throw new Error('Storage não configurado neste ambiente (STORAGE_GATEWAY_URL/KEY/WORKSPACE_ID ausentes).');
  }
  const res = await fetch(`${GATEWAY_URL}/${WORKSPACE_ID}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': GATEWAY_KEY as string },
    body: JSON.stringify({ filename, contentBase64: base64Content }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Falha ao subir arquivo (HTTP ${res.status}): ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return { url: data.url };
}
