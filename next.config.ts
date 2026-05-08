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
    ],
  },
};

export default nextConfig;
