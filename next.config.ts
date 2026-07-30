import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["oslo", "arctic"],
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
    ],
  },
};

export default nextConfig;
