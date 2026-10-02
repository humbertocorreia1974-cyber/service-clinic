import { describe, it, expect, vi } from 'vitest';
import { checkRateLimit } from '../lib/rate-limit';

describe('checkRateLimit', () => {
  it('permite até o limite e bloqueia a partir daí, na mesma janela', () => {
    const key = 'teste:' + Math.random();
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(false); // 4ª tentativa na mesma janela
  });

  it('libera de novo depois que a janela expira', () => {
    vi.useFakeTimers();
    const key = 'teste-janela:' + Math.random();
    expect(checkRateLimit(key, 1, 1000)).toBe(true);
    expect(checkRateLimit(key, 1, 1000)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(checkRateLimit(key, 1, 1000)).toBe(true);
    vi.useRealTimers();
  });

  it('chaves diferentes têm contadores independentes', () => {
    const a = 'chave-a:' + Math.random();
    const b = 'chave-b:' + Math.random();
    expect(checkRateLimit(a, 1, 60_000)).toBe(true);
    expect(checkRateLimit(b, 1, 60_000)).toBe(true);
    expect(checkRateLimit(a, 1, 60_000)).toBe(false);
  });
});
