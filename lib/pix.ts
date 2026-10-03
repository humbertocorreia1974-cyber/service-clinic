// Gera o payload "Pix copia e cola" (BR Code / EMV QRCPS) estático — o mesmo
// formato usado por qualquer QR code Pix de cobrança. Não depende de nenhum
// gateway/PSP: só precisa da própria chave Pix do negócio (CPF/CNPJ/e-mail/
// telefone/chave aleatória), que qualquer conta bancária já tem de graça.
// Confirmação de recebimento continua manual (como hoje) — isso aqui só
// poupa o cliente de digitar valor/chave na mão, reduzindo erro de digitação.
//
// Especificação: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

// CRC16-CCITT (false), polinômio 0x1021, valor inicial 0xFFFF — exigido pela
// especificação EMV como últimos 4 caracteres do payload.
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// O padrão exige apenas texto ASCII simples (sem acento) em nome/cidade, com
// limite de tamanho — removemos acentuação em vez de rejeitar, pra não travar
// cobrança por causa de um "ç" no nome da cidade.
function sanitize(value: string, max: number): string {
  const clean = value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
  return (clean || 'NA').slice(0, max);
}

export type PixPayloadInput = {
  key: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txid?: string;
};

export function buildPixPayload({ key, merchantName, merchantCity, amount, txid }: PixPayloadInput): string {
  const merchantAccountInfo = tlv('26', tlv('00', 'br.gov.bcb.pix') + tlv('01', key));
  const mcc = tlv('52', '0000');
  const currency = tlv('53', '986'); // BRL
  const amountField = amount && amount > 0 ? tlv('54', amount.toFixed(2)) : '';
  const country = tlv('58', 'BR');
  const name = tlv('59', sanitize(merchantName, 25));
  const city = tlv('60', sanitize(merchantCity, 15));
  const cleanTxid = (txid || '').replace(/[^0-9A-Za-z]/g, '').slice(0, 25) || '***';
  const additionalData = tlv('62', tlv('05', cleanTxid));

  const withoutCrc =
    tlv('00', '01') + merchantAccountInfo + mcc + currency + amountField + country + name + city + additionalData + '6304';

  return withoutCrc + crc16(withoutCrc);
}

// Lê a configuração da chave Pix do ambiente. Retorna null se não configurada
// (o app continua funcionando normalmente com as instruções manuais de hoje
// até alguém preencher essas 3 variáveis).
export function getPixConfig(): { key: string; merchantName: string; merchantCity: string } | null {
  const key = process.env.PIX_KEY?.trim();
  const merchantName = process.env.PIX_MERCHANT_NAME?.trim() || 'Service Clinic';
  const merchantCity = process.env.PIX_MERCHANT_CITY?.trim() || 'Volta Redonda';
  if (!key) return null;
  return { key, merchantName, merchantCity };
}
