// 🚨 Cliente do gateway de erro de runtime do JGNEXT — reporta erro real de
// PRODUÇÃO de volta pro motor (fora do sandbox de geração). Chame no catch
// de uma rota de API ou Server Component, sempre passando `file` com o
// caminho do PRÓPRIO arquivo que capturou o erro — é isso que permite
// reparo automático confiável depois (sem `file`, o erro fica só
// registrado/visível, nunca vira reparo, porque adivinhar o arquivo certo
// a partir da rota sozinha não é confiável pra rotas dinâmicas).
//
// SÓ SERVIDOR: usa env vars sem prefixo NEXT_PUBLIC_ — não funciona (nem
// deve ser chamado) direto de um componente "use client".
const GATEWAY_URL = process.env.RUNTIME_ERROR_GATEWAY_URL;
const GATEWAY_KEY = process.env.RUNTIME_ERROR_GATEWAY_KEY;
const WORKSPACE_ID = process.env.RUNTIME_ERROR_WORKSPACE_ID;

function configured() {
  return !!(GATEWAY_URL && GATEWAY_KEY && WORKSPACE_ID);
}

type RuntimeErrorReport = {
  type: 'server' | 'client' | 'unhandledrejection';
  route?: string;
  file?: string;
  message: string;
  stack?: string;
};

/** Nunca lança — reportar erro não pode virar um segundo erro. */
export async function reportRuntimeError(report: RuntimeErrorReport): Promise<void> {
  if (!configured()) return;
  try {
    await fetch(`${GATEWAY_URL}/${WORKSPACE_ID}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': GATEWAY_KEY as string },
      body: JSON.stringify(report),
    });
  } catch {
    // best-effort — se o próprio report falhar (rede, gateway fora), não derruba o app
  }
}
