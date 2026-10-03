/** @type {import('next').NextConfig} */
// SANDBOX_BASE_PATH só é definido no preview do sandbox (docker run -e ...) — pro
// app ser servível atrás do proxy HTTPS `/sbx/<hash>` sem DNS curinga. Vazio na
// Vercel/produção — não muda nada.
const sandboxBasePath = process.env.SANDBOX_BASE_PATH || '';

// CSP pragmático, não o mais restrito tecnicamente possível: 'unsafe-inline'
// em script/style porque o app usa estilo inline (style={{...}}) em várias
// páginas e o Next injeta script de hidratação inline — fazer isso sem
// nonce quebraria a renderização. unpkg.com liberado porque o mapa de
// cobertura carrega Leaflet via CDN (sem instalar dependência nova no
// node_modules compartilhado da plataforma). Mesmo pragmático, fecha a
// maior lacuna real: a ausência total de CSP.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://unpkg.com",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://unpkg.com",
  "connect-src 'self' https://*.tile.openstreetmap.org",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

const nextConfig = {
  // Otimização de imagem do Next ligada: as fotos reais do app (public/photos)
  // são locais, sem domínio externo, então não precisa de remotePatterns.
  images: { unoptimized: false },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
      { key: 'Content-Security-Policy', value: csp },
    ] }];
  },
  reactStrictMode: true,
  // 2026-10-03 (auditoria, item concluído): type-check estrito LIGADO de
  // verdade — os 94 erros reais que existiam (catch(error) sem tipo, role
  // opcional sem tratar, 2 bugs reais de forma do Prisma) foram corrigidos
  // um por um e verificados com `tsc --noEmit` numa instalação limpa (0
  // erros). Não é mais "não travamos o deploy por isso" — agora trava, e
  // deveria: é a rede de segurança que faltava.
  typescript: { ignoreBuildErrors: false },
  // ESLint permanece ignorado no build porque este projeto nunca teve uma
  // configuração de lint instalada (sem eslint-config-next, sem .eslintrc) —
  // ligar a flag sem isso não reforça nenhuma regra real e arrisca travar o
  // build num prompt interativo de setup. Ligar de verdade exigiria primeiro
  // instalar e configurar o ESLint, o que é um projeto à parte, não uma
  // continuação deste.
  eslint: { ignoreDuringBuilds: true },
  ...(sandboxBasePath ? { basePath: sandboxBasePath } : {}),
};

module.exports = nextConfig;
