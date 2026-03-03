import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  // Keeps better-auth's Node.js-only code (crypto, oslo, arctic) out of
  // the client module graph so it never lands in a pnpm RSC boundary chunk.
  serverExternalPackages: ["better-auth", "@better-auth/core", "oslo", "arctic"],
  // @visx alpha packages lack stable "use client" directives; transpiling them
  // lets Next.js control where they land in the bundle graph.
  transpilePackages: [
    "@visx/curve",
    "@visx/event",
    "@visx/gradient",
    "@visx/grid",
    "@visx/responsive",
    "@visx/scale",
    "@visx/shape",
  ],
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
    ],
  },
};

export default nextConfig;
