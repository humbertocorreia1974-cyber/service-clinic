// roles de equipe interna — cliente e tecnico tem fluxo proprio (/clientes/novo,
// /tecnicos/novo) que cria o registro vinculado (Client/Technician); criar aqui
// sem esse vinculo quebraria o portal/aba do tecnico.
//
// Movido pra cá (fora de app/api/usuarios/route.ts) porque o Next.js 14 valida
// em build time que um arquivo route.ts só exporta handlers HTTP e um conjunto
// fixo de configs — qualquer outro export nomeado (como este array) quebra o
// type-check gerado automaticamente em .next/types.
export const STAFF_ROLES = [
    "admin",
    "gerente",
    "atendente",
    "comercial",
    "vendas",
    "compras",
    "financeiro",
    "engenheiro",
];
