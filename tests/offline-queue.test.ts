import { describe, it, expect, vi } from 'vitest';
import { shouldQueueImmediately, postJsonResilient } from '../lib/offline-queue';

describe('shouldQueueImmediately', () => {
  it('enfileira quando offline', () => {
    expect(shouldQueueImmediately(false)).toBe(true);
  });

  it('nao enfileira quando online', () => {
    expect(shouldQueueImmediately(true)).toBe(false);
  });
});

describe('postJsonResilient', () => {
  it('enfileira direto sem tentar fetch quando ja esta offline', async () => {
    const enqueue = vi.fn().mockResolvedValue(undefined);
    const fetchImpl = vi.fn();
    const result = await postJsonResilient('/api/x', { a: 1 }, 'Teste', { onlineNow: false, fetchImpl, enqueue });
    expect(result).toEqual({ ok: true, queued: true });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(enqueue).toHaveBeenCalledOnce();
  });

  it('usa fetch quando online e o servidor responde ok - nao enfileira', async () => {
    const enqueue = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const result = await postJsonResilient('/api/x', { a: 1 }, 'Teste', { onlineNow: true, fetchImpl, enqueue });
    expect(result).toEqual({ ok: true, queued: false });
    expect(enqueue).not.toHaveBeenCalled();
  });

  it('nao enfileira erro real do servidor (4xx/5xx) - so problema de rede deve enfileirar', async () => {
    const enqueue = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false });
    const result = await postJsonResilient('/api/x', { a: 1 }, 'Teste', { onlineNow: true, fetchImpl, enqueue });
    expect(result).toEqual({ ok: false, queued: false });
    expect(enqueue).not.toHaveBeenCalled();
  });

  it('enfileira quando o fetch lanca excecao de rede mesmo com navigator dizendo que esta online', async () => {
    const enqueue = vi.fn().mockResolvedValue(undefined);
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const result = await postJsonResilient('/api/x', { a: 1 }, 'Teste', { onlineNow: true, fetchImpl, enqueue });
    expect(result).toEqual({ ok: true, queued: true });
    expect(enqueue).toHaveBeenCalledOnce();
  });
});
