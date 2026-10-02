// Escapa texto vindo do usuário antes de interpolar em corpo de e-mail HTML
// (notificação de lead, redefinição de senha etc.) — evita que um campo
// livre (nome, mensagem...) injete marcação/HTML no e-mail renderizado.
export function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
