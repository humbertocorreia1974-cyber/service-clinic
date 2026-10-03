// Helper pra extrair message/stack de um erro de tipo `unknown` (TypeScript
// estrito nunca tipa `catch (e)` como `Error` -- sempre `unknown`). Usado no
// bloco padrão de reparo automático (`__jgnextApiErrorReportErr`) repetido
// em toda rota de API, pra permitir ligar o type-check estrito no build sem
// reescrever cada arquivo manualmente.
export function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

export function getErrorStack(e: unknown): string | undefined {
  if (e instanceof Error) return e.stack;
  return undefined;
}
