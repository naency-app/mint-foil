import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Outfit, DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";

const circularStd = localFont({
  src: [
    {
      path: "../../public/fonts/CircularStd-Book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/CircularStd-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/CircularStd-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const outfit = Outfit({
  weight: ["700", "800", "900"],
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mint Foil — Gerencie sua Coleção de TCG",
  description:
    "Escaneie cartas, acompanhe preços do mercado brasileiro e gerencie seu portfólio de TCG. Pokémon, Magic, Yu-Gi-Oh!, One Piece e mais.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${circularStd.variable} ${dmMono.variable} ${outfit.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
