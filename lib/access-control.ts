// 2026-10-14: regra de IDOR ("tecnico so mexe na OS/laudo atribuido a ele")
// estava duplicada em 5 rotas de API, cada uma com a mesma condicao inline
// escrita a mao - risco real de uma rota nova esquecer a checagem (foi
// exatamente o que aconteceu na auditoria de seguranca de 14/10, 6 rotas
// sem essa checagem). Fonte unica + testada, pra nao depender so de revisao
// manual de codigo pra pegar esse padrao de novo.
export function isTechnicianForbidden(
  role: string | null | undefined,
  assignedToId: string | null | undefined,
  userId: string | null | undefined
): boolean {
  return role === "tecnico" && assignedToId !== userId;
}
