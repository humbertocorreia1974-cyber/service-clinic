// 📦 Upload público dedicado ao fluxo de "orçamento com foto" (app/orcamento).
// app/api/upload/route.ts exige sessão de propósito (upload anônimo aberto é
// vetor de abuso) — aqui o caso de uso É legitimamente anônimo (prospect sem
// conta ainda), então em vez de afrouxar a rota autenticada existente, esta
// rota nova e dedicada troca "sessão obrigatória" por rate limit por IP.
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"]);

function hasAllowedExtension(name: string): boolean {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return false;
  return ALLOWED_EXT.has(name.slice(dot).toLowerCase());
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`leads-upload:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Muitos envios. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: 'Arquivo obrigatório (campo "file").' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `Arquivo maior que ${MAX_BYTES / (1024 * 1024)}MB.` }, { status: 413 });
    }
    const mimeOk = !file.type || ALLOWED_MIME.has(file.type);
    const extOk = hasAllowedExtension(file.name || "");
    if (!mimeOk || !extOk) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Envie uma imagem (jpg, png, webp, heic)." },
        { status: 415 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile(file.name, buffer.toString("base64"));
    return NextResponse.json({ url: result.url });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/leads/upload/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch { /* relatar erro nunca pode gerar outro erro */ }
    console.error("[POST /api/leads/upload]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível subir o arquivo." }, { status: 500 });
  }
}
