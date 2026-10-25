-- Service Clinic: PartOrder <-> Client FK real (antes: vinculo por e-mail em string).
-- Projeto usa `prisma db push` (sem pasta prisma/migrations) — este SQL fica
-- documentado aqui pra revisao/aplicacao manual, nao e consumido automaticamente
-- por `prisma migrate deploy`.
--
-- Ordem de aplicacao:
--   1. Este arquivo (DDL: coluna + FK + indice, tudo NULLABLE — nao quebra
--      nenhum pedido existente nem checkout publico sem Client).
--   2. scripts/backfill-partorder-clientid.mjs (dry-run por padrao; --apply
--      pra gravar de verdade).
--
-- NAO aplicar direto em producao sem autorizacao explicita do lead.

ALTER TABLE "PartOrder" ADD COLUMN IF NOT EXISTS "clientId" TEXT;

ALTER TABLE "PartOrder"
  ADD CONSTRAINT "PartOrder_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "PartOrder_clientId_idx" ON "PartOrder"("clientId");
