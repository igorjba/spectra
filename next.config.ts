import type { NextConfig } from "next";

/*
  Política de segurança de conteúdo.

  O site é estático e não fala com nenhum serviço: as fontes são auto-hospedadas
  pelo next/font, não há imagens remotas, analytics nem chamadas de rede em
  runtime. Por isso `default-src 'self'` já cobre quase tudo, e o que resta é
  fechar as portas que não são usadas — objetos, base href, envio de formulário,
  enquadramento em outro site.

  `script-src` precisa de 'unsafe-inline' enquanto as páginas forem
  pré-renderizadas: tanto o script anti-FOUC do tema quanto os blocos de
  hidratação do Next são inline, e a alternativa (nonce por requisição via
  middleware) obrigaria toda rota a virar dinâmica — custo alto para um site sem
  entrada de terceiros por onde injetar script. `style-src` carrega
  'unsafe-inline' pelo mesmo motivo, somado aos atributos style que as peças
  escrevem a cada quadro.

  `img-src` aceita data: por causa do grão, que é um SVG embutido em background.
*/
const isDev = process.env.NODE_ENV !== "production";

/*
  Em desenvolvimento a política precisa de duas concessões que nunca chegam à
  produção: o React em modo dev usa eval() para reconstruir pilhas de chamada, e
  o HMR conversa por websocket. Ambas ficam atrás do isDev para que a política
  publicada continue sendo a estrita.
*/
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    // O microfone é opcional e existe só na peça de áudio; o resto fica desligado.
    key: "Permissions-Policy",
    value:
      "microphone=(self), camera=(), geolocation=(), payment=(), usb=(), midi=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["motion"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
