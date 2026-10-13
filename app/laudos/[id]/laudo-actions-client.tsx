"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LaudoActionsClient({
  laudoId,
  canEdit,
  alreadySigned,
  signedAt,
  clientEmail,
  clientWhatsapp,
}: {
  laudoId: string;
  canEdit: boolean;
  alreadySigned: boolean;
  signedAt: string | null;
  clientEmail: string | null;
  clientWhatsapp: string | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [signerPending, setSignerPending] = useState(false);
  const [sendPending, setSendPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function end() {
    drawing.current = false;
  }

  function clear() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
  }

  async function sign() {
    setError(null);
    const c = canvasRef.current;
    if (!c) return;
    setSignerPending(true);
    const data = c.toDataURL("image/png");
    const res = await fetch(`/api/laudos/${laudoId}/signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signatureData: data }),
    });
    setSignerPending(false);
    if (!res.ok) {
      setError("Não foi possível registrar a assinatura.");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function send(channel: "email" | "whatsapp") {
    setError(null);
    setMessage(null);
    setSendPending(channel);
    const res = await fetch(`/api/laudos/${laudoId}/enviar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channels: [channel] }),
    });
    const data = await res.json().catch(() => ({}));
    setSendPending(null);
    if (!res.ok) {
      setError(data.error || "Não foi possível enviar.");
      return;
    }
    const r = data.results?.[channel];
    if (r?.ok) setMessage(channel === "email" ? "Laudo enviado por e-mail." : "Laudo enviado por WhatsApp.");
    else setError(r?.error || "Falha no envio.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
      {message && <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">{message}</p>}

      {alreadySigned ? (
        <p className="text-sm text-fg-muted">
          Assinado{signedAt ? ` em ${new Date(signedAt).toLocaleString("pt-BR")}` : ""}.
        </p>
      ) : canEdit ? (
        <div className="space-y-2">
          <p className="text-sm text-fg-muted">Assinatura do técnico responsável:</p>
          <div className="rounded-md border border-border bg-bg">
            <canvas
              ref={canvasRef}
              width={400}
              height={140}
              className="h-36 w-full touch-none"
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" type="button" onClick={clear}>
              Limpar
            </Button>
            <Button size="sm" type="button" onClick={sign} disabled={signerPending}>
              {signerPending ? "Registrando..." : "Assinar laudo"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-fg-muted">Laudo ainda não assinado.</p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <a href={`/api/laudos/${laudoId}/pdf`} target="_blank" rel="noreferrer">
          <Button size="sm" variant="secondary" type="button">
            Baixar PDF
          </Button>
        </a>
        {canEdit && (
          <>
            <Button size="sm" type="button" onClick={() => send("email")} disabled={sendPending !== null || !clientEmail}>
              {sendPending === "email" ? "Enviando..." : "Enviar por e-mail"}
            </Button>
            <Button
              size="sm"
              type="button"
              onClick={() => send("whatsapp")}
              disabled={sendPending !== null || !clientWhatsapp}
            >
              {sendPending === "whatsapp" ? "Enviando..." : "Enviar por WhatsApp"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
