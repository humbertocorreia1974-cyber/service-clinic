'use client';

import { useEffect, useRef, useState } from 'react';

// Carrega "qrcode-generator" (Kazuhiko Arase, MIT) via CDN em vez de instalar
// no node_modules compartilhado da plataforma — mesmo padrão já usado em
// components/map-view.tsx pro Leaflet. unpkg.com já está liberado no CSP
// (next.config.js) por causa do mapa, então não precisa de mudança de
// política. 2026-10-03: o pacote "qrcode" (npm) NÃO publica um bundle
// pronto pro browser (só CommonJS, 404 real em unpkg) - "qrcode-generator"
// publica o arquivo plano `qrcode.js` que já expõe `window.qrcode` e tem
// `renderTo2dContext` embutido, então desenha direto no canvas sem precisar
// decodificar a bitmap manualmente.
const QRCODE_JS = 'https://unpkg.com/qrcode-generator@1.4.4/qrcode.js';

let qrLoadPromise: Promise<any> | null = null;

function loadQrLib(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if ((window as any).qrcode) return Promise.resolve((window as any).qrcode);
  if (qrLoadPromise) return qrLoadPromise;

  qrLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${QRCODE_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).qrcode));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = QRCODE_JS;
    script.async = true;
    script.onload = () => resolve((window as any).qrcode);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return qrLoadPromise;
}

const CELL_SIZE = 5;

export function PixQrCode({ payload, amountLabel }: { payload: string; amountLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadQrLib()
      .then((qrcodeLib) => {
        if (cancelled || !qrcodeLib || !canvasRef.current) return;
        // typeNumber 0 = a lib escolhe a menor versão de QR que cabe o payload;
        // nível M (15% de correção de erro) é o equilíbrio padrão pra Pix.
        const qr = qrcodeLib(0, 'M');
        qr.addData(payload);
        qr.make();
        const moduleCount = qr.getModuleCount();
        const canvas = canvasRef.current;
        canvas.width = moduleCount * CELL_SIZE;
        canvas.height = moduleCount * CELL_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) { setFailed(true); return; }
        qr.renderTo2dContext(ctx, CELL_SIZE);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [payload]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // clipboard pode falhar em contexto não seguro/sem permissão -- o
      // código ainda está visível pra copiar manualmente
    }
  }

  return (
    <div className="mt-3 flex flex-col items-center gap-2 rounded-md border border-border bg-surface p-4 sm:flex-row sm:items-start">
      {!failed ? (
        <canvas ref={canvasRef} className="h-44 w-44 shrink-0 rounded bg-white p-2" />
      ) : (
        <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded border border-dashed border-border text-center text-xs text-fg-muted">
          Não foi possível carregar o QR Code agora — use o código copia e cola abaixo.
        </div>
      )}
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className="text-sm font-medium text-fg">Pix — {amountLabel}</p>
        <p className="mt-1 text-xs text-fg-muted">Escaneie o QR Code ou copie o código Pix abaixo no app do seu banco.</p>
        <button
          type="button"
          onClick={copiar}
          className="mt-2 w-full truncate rounded-md border border-border bg-bg px-3 py-2 text-left font-mono text-xs text-fg-muted hover:border-brand sm:w-auto sm:max-w-xs"
          title={payload}
        >
          {copiado ? 'Copiado!' : payload}
        </button>
      </div>
    </div>
  );
}
