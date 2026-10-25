// Backfill de PartOrder.clientId casando por e-mail com Client existente.
//
// Uso:
//   node scripts/backfill-partorder-clientid.mjs            -> dry-run (so relatorio, nao grava nada)
//   node scripts/backfill-partorder-clientid.mjs --apply     -> grava de verdade os casos sem ambiguidade
//
// Requer DATABASE_URL (e NEON_SCHEMA se o projeto usar schema isolado) no
// ambiente apontando pro banco certo. So atualiza PartOrder cujo e-mail casa
// com EXATAMENTE UM Client (case-insensitive) — pedidos sem match ou com
// e-mail usado por mais de um Client ficam de fora, sem clientId, com o
// customerEmail preservado como estava (nenhum dado e perdido ou sobrescrito
// "no escuro").

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function main() {
  const orders = await prisma.partOrder.findMany({
    where: { clientId: null },
    select: { id: true, code: true, customerEmail: true },
    orderBy: { createdAt: "asc" },
  });

  const toUpdate = [];
  const noMatch = [];
  const ambiguous = [];

  for (const order of orders) {
    const candidates = await prisma.client.findMany({
      where: { email: { equals: order.customerEmail, mode: "insensitive" } },
      select: { id: true, email: true, nomeFantasia: true },
    });
    if (candidates.length === 1) {
      toUpdate.push({ order, client: candidates[0] });
    } else if (candidates.length === 0) {
      noMatch.push(order);
    } else {
      ambiguous.push({ order, candidates });
    }
  }

  console.log(`\nTotal PartOrder sem clientId: ${orders.length}`);
  console.log(`  -> match unico (seriam atualizados): ${toUpdate.length}`);
  console.log(`  -> sem nenhum Client com esse e-mail: ${noMatch.length}`);
  console.log(`  -> ambiguo (mais de 1 Client com o mesmo e-mail, NAO tocado): ${ambiguous.length}`);

  if (toUpdate.length) {
    console.log("\nSeriam atualizados:");
    for (const { order, client } of toUpdate) {
      console.log(`  ${order.code} (${order.customerEmail}) -> Client ${client.id} (${client.nomeFantasia})`);
    }
  }
  if (noMatch.length) {
    console.log("\nSem match (ficam com customerEmail apenas, clientId continua null):");
    for (const order of noMatch) {
      console.log(`  ${order.code} (${order.customerEmail})`);
    }
  }
  if (ambiguous.length) {
    console.log("\nAmbiguos (revisar manualmente, não resolvidos automaticamente):");
    for (const { order, candidates } of ambiguous) {
      console.log(`  ${order.code} (${order.customerEmail}) -> ${candidates.map((c) => c.id).join(", ")}`);
    }
  }

  if (!apply) {
    console.log("\nDry-run (nenhuma escrita feita). Rode com --apply para gravar os casos de match único.");
    return;
  }

  if (toUpdate.length === 0) {
    console.log("\nNada para aplicar (0 matches únicos).");
    return;
  }

  console.log(`\nAplicando ${toUpdate.length} atualização(ões)...`);
  await prisma.$transaction(
    toUpdate.map(({ order, client }) =>
      prisma.partOrder.update({ where: { id: order.id }, data: { clientId: client.id } })
    )
  );
  console.log("Concluído.");
}

main()
  .catch((err) => {
    console.error("Erro no backfill:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
