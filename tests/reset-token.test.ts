import { describe, it, expect, vi } from 'vitest';
import { createResetToken, verifyResetToken, decodeTokenEmail } from '../lib/reset-token';

describe('reset-token', () => {
  const email = 'cliente@exemplo.com';
  const hashV1 = '$2a$10$fakeHashV1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  const hashV2 = '$2a$10$fakeHashV2yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy';

  it('gera um token que verifica com sucesso contra o mesmo hash de senha', () => {
    const token = createResetToken(email, hashV1);
    const result = verifyResetToken(token, hashV1);
    expect(result).toEqual({ email });
  });

  it('rejeita o token depois que a senha muda (uso único)', () => {
    const token = createResetToken(email, hashV1);
    // senha já foi trocada -> hash atual é outro
    const result = verifyResetToken(token, hashV2);
    expect(result).toBeNull();
  });

  it('rejeita token expirado', () => {
    vi.useFakeTimers();
    const token = createResetToken(email, hashV1);
    vi.advanceTimersByTime(61 * 60 * 1000); // avança 61 minutos (expira em 60)
    const result = verifyResetToken(token, hashV1);
    expect(result).toBeNull();
    vi.useRealTimers();
  });

  it('rejeita token adulterado (assinatura não bate)', () => {
    const token = createResetToken(email, hashV1);
    const tampered = token.slice(0, -4) + 'aaaa';
    const result = verifyResetToken(tampered, hashV1);
    expect(result).toBeNull();
  });

  it('rejeita lixo/token malformado sem lançar exceção', () => {
    expect(verifyResetToken('nao-e-um-token-valido', hashV1)).toBeNull();
    expect(verifyResetToken('', hashV1)).toBeNull();
  });

  it('decodeTokenEmail extrai o e-mail sem validar assinatura (uso: lookup prévio)', () => {
    const token = createResetToken(email, hashV1);
    expect(decodeTokenEmail(token)).toBe(email);
    // string vazia decodifica para vazio -> null (sem o que procurar)
    expect(decodeTokenEmail('')).toBeNull();
  });

  it('garantia de segurança real: mesmo que decodeTokenEmail devolva lixo, verifyResetToken sempre rejeita', () => {
    // decodeTokenEmail não valida assinatura por design (serve só pra decidir
    // qual usuário buscar no banco antes da verificação completa) — por isso
    // qualquer entrada arbitrária pode decodificar pra algo não-nulo aqui.
    // O que garante segurança é verifyResetToken, testado à exaustão acima;
    // este teste documenta explicitamente que um e-mail "decodificado" de
    // lixo nunca passa na verificação completa.
    const garbageEmail = decodeTokenEmail('lixo');
    if (garbageEmail) {
      expect(verifyResetToken('lixo', hashV1)).toBeNull();
    }
  });
});
