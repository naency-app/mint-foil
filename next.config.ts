import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["oslo", "arctic"],
  // O scan é exclusivo do app nativo. A web tem tudo o mais (busca, explore,
  // portfólio), mas quem chega em /scan — link antigo, QR code, resultado de
  // busca — vai pro download em vez de escanear pelo navegador.
  async redirects() {
    return [
      { source: "/scan", destination: "/download", permanent: false },
      { source: "/scan/:path*", destination: "/download", permanent: false },
      // Termos e privacidade têm uma versão só (as de julho/2026, com a Ltda).
      // As de março viviam em /terms e /privacy e divergiam das novas; os
      // endereços antigos continuam valendo para links já espalhados.
      { source: "/privacy", destination: "/privacidade", permanent: true },
      { source: "/terms", destination: "/termos", permanent: true },
    ];
  },
  transpilePackages: [
    "@visx/curve",
    "@visx/event",
    "@visx/gradient",
    "@visx/grid",
    "@visx/responsive",
    "@visx/scale",
    "@visx/shape",
  ],
  // Force all packages to share the same React instance (prevents the
  // "Cannot read properties of null (reading 'useRef')" dual-React bug).
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    };
    // Impede webpack de traversar para a raiz do monorepo ao resolver módulos
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      "node_modules",
    ];
    return config;
  },
  turbopack: {
    resolveAlias: {
      react: "./node_modules/react",
      "react-dom": "./node_modules/react-dom",
    },
  },
  images: {
    // Os logos de set do Magic vêm do Scryfall em SVG. Sem isto o otimizador
    // recusa com 400 ("image type is not allowed") e toda capa de Magic cai no
    // fallback. SVG remoto é servido em sandbox e sem script, como manda a doc.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline'",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "repositorio.sbrauble.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "public.getcollectr.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.ygoprodeck.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tcgplayer-cdn.tcgplayer.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pokemontcg.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "svgs.scryfall.io",
        pathname: "/**",
      },
      // Foto de perfil e fundo próprio (Pro) enviados pelo app ficam no R2
      // (pub-<id>.r2.dev, sem domínio próprio). Sem isto o next/image recusa e
      // o avatar vira o texto alternativo.
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
