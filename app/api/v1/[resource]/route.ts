import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Mapa recurso-da-URL -> acessor Prisma (gerado do schema).
// "user" foi removido de propósito: o acessor do Prisma devolve o registro
// inteiro, incluindo passwordHash, sem nenhuma seleção de campos — expor
// isso atrás de uma chave de API genérica (ainda que hoje
// `APP_API_KEYS` não esteja configurada em produção) é uma porta pra
// vazar hash de senha de todo mundo caso a chave seja ativada no futuro
// pra alguma integração. Autenticação/usuário tem rota própria protegida
// por sessão (next-auth) — não deve passar por aqui.
const RESOURCES: Record<string, string> = {
  "project": "project",
  "client": "client",
  "technician": "technician",
  "equipment": "equipment",
  "service-order": "serviceOrder",
  "service-order-checklist": "serviceOrderChecklist",
  "service-order-photo": "serviceOrderPhoto",
  "service-order-signature": "serviceOrderSignature",
  "contract": "contract",
  "visit": "visit",
  "invoice": "invoice",
  "invoice-item": "invoiceItem",
  "payment": "payment",
  "part": "part",
  "stock-movement": "stockMovement",
  "lead": "lead",
  "laudo": "laudo",
  "notification": "notification",
  "audit-log": "auditLog",
  "medical-record": "medicalRecord",
  "medical-record-access": "medicalRecordAccess",
  "document": "document",
  "insurance-plan": "insurancePlan",
  "specialty": "specialty",
  "professional": "professional",
  "patient": "patient",
  "appointment": "appointment",
  "vaccination": "vaccination",
  "controlled-medication": "controlledMedication",
  "blog-post": "blogPost",
  "service": "service",
  "city": "city",
  "consent": "consent",
  "health-check": "healthCheck"
};

function authorized(req: Request) {
  const key = req.headers.get('x-api-key') || '';
  const allowed = (process.env.APP_API_KEYS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return allowed.length > 0 && allowed.includes(key);
}

export async function GET(req: Request, { params }: { params: { resource: string } }) {
  try {
  if (!authorized(req)) return NextResponse.json({ error: 'chave de API inválida ou ausente (header x-api-key)' }, { status: 401 });
  const accessor = RESOURCES[params.resource];
  if (!accessor || !(prisma as any)[accessor]) return NextResponse.json({ error: 'recurso não encontrado', recursos: Object.keys(RESOURCES) }, { status: 404 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const take = Math.min(Number(url.searchParams.get('limit') || 50), 100);
  const skip = Number(url.searchParams.get('offset') || 0);
  try {
    if (id) {
      const one = await (prisma as any)[accessor].findUnique({ where: { id } });
      return one ? NextResponse.json({ data: one }) : NextResponse.json({ error: 'não encontrado' }, { status: 404 });
    }
    const [data, total] = await Promise.all([
      (prisma as any)[accessor].findMany({ take, skip, orderBy: { createdAt: 'desc' } }).catch(() => (prisma as any)[accessor].findMany({ take, skip })),
      (prisma as any)[accessor].count(),
    ]);
    return NextResponse.json({ data, page: { total, limit: take, offset: skip } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/v1/[resource]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

function writeEnabled() { return String(process.env.APP_API_WRITE || '').toLowerCase() === 'true'; }

export async function POST(req: Request, { params }: { params: { resource: string } }) {
  try {
  if (!authorized(req)) return NextResponse.json({ error: 'chave de API inválida ou ausente' }, { status: 401 });
  if (!writeEnabled()) return NextResponse.json({ error: 'escrita desativada — defina APP_API_WRITE=true no ambiente' }, { status: 403 });
  const accessor = RESOURCES[params.resource];
  if (!accessor || !(prisma as any)[accessor]) return NextResponse.json({ error: 'recurso não encontrado', recursos: Object.keys(RESOURCES) }, { status: 404 });
  try {
    const body = await req.json();
    const created = await (prisma as any)[accessor].create({ data: body });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/v1/[resource]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function PATCH(req: Request, { params }: { params: { resource: string } }) {
  try {
  if (!authorized(req)) return NextResponse.json({ error: 'chave de API inválida ou ausente' }, { status: 401 });
  if (!writeEnabled()) return NextResponse.json({ error: 'escrita desativada — defina APP_API_WRITE=true no ambiente' }, { status: 403 });
  const accessor = RESOURCES[params.resource];
  if (!accessor || !(prisma as any)[accessor]) return NextResponse.json({ error: 'recurso não encontrado' }, { status: 404 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'informe ?id=' }, { status: 400 });
  try {
    const body = await req.json();
    const updated = await (prisma as any)[accessor].update({ where: { id }, data: body });
    return NextResponse.json({ data: updated });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/v1/[resource]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function DELETE(req: Request, { params }: { params: { resource: string } }) {
  try {
  if (!authorized(req)) return NextResponse.json({ error: 'chave de API inválida ou ausente' }, { status: 401 });
  if (!writeEnabled()) return NextResponse.json({ error: 'escrita desativada — defina APP_API_WRITE=true no ambiente' }, { status: 403 });
  const accessor = RESOURCES[params.resource];
  if (!accessor || !(prisma as any)[accessor]) return NextResponse.json({ error: 'recurso não encontrado' }, { status: 404 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'informe ?id=' }, { status: 400 });
  try {
    await (prisma as any)[accessor].delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/v1/[resource]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
