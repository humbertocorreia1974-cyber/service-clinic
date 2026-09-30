"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignatureClient({
  serviceOrderId,
  canEdit,
}: {
  serviceOrderId: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [signerName, setSignerName] = useState("");
  const [signerDocument, setSignerDocument] = useState("");
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

  async function submit() {
    setError(null);
    if (!signerName.trim()) {
      setError("Informe o nome do responsável que está assinando.");
      return;
    }
    const c = canvasRef.current;
    if (!c) return;
    const data = c.toDataURL("image/png");
    const res = await fetch(`/api/service-orders/${serviceOrderId}/signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signerName, signerDocument, signatureData: data }),
    });
    if (!res.ok) {
      setError("Não foi possível registrar a assinatura.");
      return;
    }
    startTransition(() => router.refresh());
  }

  if (!canEdit) {
    return <p className="text-sm text-fg-muted">Assinatura ainda não registrada.</p>;
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Nome do responsável"
        value={signerName}
        onChange={(e) => setSignerName(e.target.value)}
      />
      <Input
        placeholder="CPF / documento (opcional)"
        value={signerDocument}
        onChange={(e) => setSignerDocument(e.target.value)}
      />
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
        <Button size="sm" variant="ghost" onClick={clear} type="button">Limpar</Button>
        <Button size="sm" onClick={submit} disabled={pending} type="button">
          {pending ? "Registrando..." : "Registrar assinatura"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
