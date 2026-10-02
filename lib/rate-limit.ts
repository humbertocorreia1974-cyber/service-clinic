// Rate limiter simples, em memória, por instância do processo.
//
// Limitação honesta: em ambiente serverless (Vercel), cada instância/
// cold-start tem sua própria memória — isso NÃO é um limite global
// perfeito entre instâncias concorrentes. Mesmo assim, reduz de forma real
// o abuso mais comum (força bruta de senha, flood de formulário) numa
// mesma instância quente, sem precisar de infra paga nova (Redis/Upstash).
// Se o volume de tráfego justificar, trocar por um rate-limit distribuído
// (ex. @upstash/ratelimit) é o próximo passo natural — não feito aqui pra
// não introduzir uma dependência paga sem necessidade comprovada.
const buckets = new Map<string, { count: number; resetAt: number }>();

const MAX_BUCKETS = 5000; // teto defensivo de memória — evita leak indefinido

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
