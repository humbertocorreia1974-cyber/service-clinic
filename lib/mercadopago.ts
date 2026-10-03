// Integração com o Checkout Pro do Mercado Pago: página hospedada por eles
// que já cobre cartão, boleto e Pix automático numa única tela — nenhum dado
// de cartão passa pelo nosso servidor (PCI compliance fica do lado do MP).
// BYOK: usa o MERCADOPAGO_ACCESS_TOKEN do próprio cliente, injetado no
// deploy pela plataforma JGNEXT (mesmo padrão do Stripe/Pix em lib/pix.ts).

const MP_API = 'https://api.mercadopago.com';

export function isMercadoPagoConfigured(): boolean {
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
}

export type CreatePreferenceInput = {
  invoiceId: string;
  title: string;
  amount: number;
  payerEmail: string;
  baseUrl: string;
};

export async function createPreference({
  invoiceId,
  title,
  amount,
  payerEmail,
  baseUrl,
}: CreatePreferenceInput): Promise<{ id: string; initPoint: string }> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error('Mercado Pago não configurado.');

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ title, quantity: 1, unit_price: amount, currency_id: 'BRL' }],
      payer: { email: payerEmail },
      external_reference: invoiceId,
      back_urls: {
        success: `${baseUrl}/portal?pagamento=sucesso`,
        pending: `${baseUrl}/portal?pagamento=pendente`,
        failure: `${baseUrl}/portal?pagamento=falhou`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Falha ao criar cobrança no Mercado Pago.');
  return { id: data.id as string, initPoint: data.init_point as string };
}

export async function getPayment(paymentId: string): Promise<any> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error('Mercado Pago não configurado.');
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Falha ao consultar pagamento ${paymentId} no Mercado Pago.`);
  return res.json();
}

// Mapeia o payment_type_id do Mercado Pago pro enum de método já usado em
// Payment.method (pix | boleto | cartao | dinheiro | transferencia).
export function mapPaymentMethod(paymentTypeId: string | undefined | null): string {
  switch (paymentTypeId) {
    case 'credit_card':
    case 'debit_card':
      return 'cartao';
    case 'ticket':
      return 'boleto';
    case 'bank_transfer':
    case 'account_money':
      return 'pix';
    default:
      return 'transferencia';
  }
}
