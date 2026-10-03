import { describe, it, expect } from 'vitest';
import { mapPaymentMethod, isMercadoPagoConfigured } from '../lib/mercadopago';

describe('mapPaymentMethod', () => {
  it('mapeia cartão de crédito e débito para "cartao"', () => {
    expect(mapPaymentMethod('credit_card')).toBe('cartao');
    expect(mapPaymentMethod('debit_card')).toBe('cartao');
  });

  it('mapeia boleto ("ticket" no Mercado Pago) para "boleto"', () => {
    expect(mapPaymentMethod('ticket')).toBe('boleto');
  });

  it('mapeia transferência bancária/saldo em conta para "pix"', () => {
    expect(mapPaymentMethod('bank_transfer')).toBe('pix');
    expect(mapPaymentMethod('account_money')).toBe('pix');
  });

  it('cai em "transferencia" para tipos desconhecidos ou ausentes', () => {
    expect(mapPaymentMethod('prepaid_card')).toBe('transferencia');
    expect(mapPaymentMethod(null)).toBe('transferencia');
    expect(mapPaymentMethod(undefined)).toBe('transferencia');
  });
});

describe('isMercadoPagoConfigured', () => {
  it('reflete a presença de MERCADOPAGO_ACCESS_TOKEN no ambiente', () => {
    const original = process.env.MERCADOPAGO_ACCESS_TOKEN;
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;
    expect(isMercadoPagoConfigured()).toBe(false);
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'APP_USR-teste';
    expect(isMercadoPagoConfigured()).toBe(true);
    if (original === undefined) delete process.env.MERCADOPAGO_ACCESS_TOKEN;
    else process.env.MERCADOPAGO_ACCESS_TOKEN = original;
  });
});
