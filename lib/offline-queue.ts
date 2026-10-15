// 2026-10-15: tecnico em campo com sinal ruim - POST de checklist/materiais/
// assinatura nao pode se perder so porque a rede caiu no meio do toque.
// Fila em IndexedDB: se offline (ou o fetch falha de verdade por rede), guarda
// a requisicao localmente e devolve sucesso otimista; sincroniza sozinha
// quando a conexao volta (ver components/offline-sync-banner.tsx).
//
// Escopo: so corpo JSON (checklist, materiais, assinatura). Upload de FOTO
// fica de fora de proposito - precisaria guardar o arquivo em si (blob), nao
// so o JSON, e e um fluxo em 2 passos (upload -> vincular na OS). Fica pra
// uma proxima rodada, registrado aqui pra nao fingir que esta coberto.

const DB_NAME = "service-clinic-offline";
const STORE_NAME = "queue";
const DB_VERSION = 1;

export type QueuedRequest = {
  id?: number;
  url: string;
  method: string;
  body: string;
  label: string;
  createdAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueRequest(entry: Omit<QueuedRequest, "id" | "createdAt">): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add({ ...entry, createdAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQueue(): Promise<QueuedRequest[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as QueuedRequest[]);
    req.onerror = () => reject(req.error);
  });
}

async function removeFromQueue(id: number): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Sincroniza tudo que esta na fila, na ordem que foi criado. Para no primeiro
// erro de REDE (provavelmente ainda sem sinal de verdade) - erro de
// SERVIDOR (4xx/5xx) descarta o item (nao fica preso pra sempre repetindo
// algo que o servidor ja rejeitou).
export async function flushQueue(): Promise<{ synced: number; failed: number }> {
  const items = await getQueue();
  items.sort((a, b) => a.createdAt - b.createdAt);
  let synced = 0;
  let failed = 0;
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: item.body,
      });
      if (res.ok) {
        await removeFromQueue(item.id!);
        synced++;
      } else {
        await removeFromQueue(item.id!);
        failed++;
      }
    } catch {
      break; // ainda sem rede de verdade - para aqui, tenta de novo depois
    }
  }
  return { synced, failed };
}

// Decisao pura (testavel sem IndexedDB real).
export function shouldQueueImmediately(isOnline: boolean): boolean {
  return !isOnline;
}

export async function postJsonResilient(
  url: string,
  body: unknown,
  label: string,
  deps: {
    onlineNow?: boolean;
    fetchImpl?: typeof fetch;
    enqueue?: typeof enqueueRequest;
  } = {}
): Promise<{ ok: boolean; queued: boolean }> {
  const onlineNow = deps.onlineNow ?? (typeof navigator !== "undefined" ? navigator.onLine : true);
  const fetchImpl = deps.fetchImpl ?? fetch;
  const enqueue = deps.enqueue ?? enqueueRequest;
  const bodyStr = JSON.stringify(body);

  if (shouldQueueImmediately(onlineNow)) {
    await enqueue({ url, method: "POST", body: bodyStr, label });
    return { ok: true, queued: true };
  }
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyStr,
    });
    if (res.ok) return { ok: true, queued: false };
    return { ok: false, queued: false };
  } catch {
    // fetch falhou de verdade (rede caiu no meio do toque, navigator.onLine
    // as vezes demora a atualizar) - enfileira em vez de perder a acao.
    await enqueue({ url, method: "POST", body: bodyStr, label });
    return { ok: true, queued: true };
  }
}
