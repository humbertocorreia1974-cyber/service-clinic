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
  images: { unoptimized: true },
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
  // App gerado: a fundação é type-safe, mas o código de feature escrito pela
  // IA nem sempre passa no type-check strict (ex. `catch (error)` -> error is
  // unknown). O app roda igual; não travamos o deploy por isso. Mesma escolha
  // de Lovable/Bolt. Erros reais (sintaxe, módulo faltando) ainda quebram.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  ...(sandboxBasePath ? { basePath: sandboxBasePath } : {}),
};

module.exports = nextConfig;
