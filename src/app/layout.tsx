import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { DM_Mono, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
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

// Display geométrica pro wordmark "Mint Foil" (combina com o M facetado)
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
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

// Resolve o tema ANTES do primeiro paint (mata o flash branco ao navegar/
// recarregar no dark): define --mf-bg/--mf-fg e, nas rotas da landing,
// pinta html/body direto (o body ganha bg claro do globals.css antes do
// React chegar). Guarda de rota pra não brigar com o next-themes do app.
const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("mf-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var bg=d?"#020617":"#FFFFFF";var r=document.documentElement;r.style.setProperty("--mf-bg",bg);r.style.setProperty("--mf-fg",d?"#FFFFFF":"#020617");r.style.setProperty("--mf-wash",d?"0":"1");r.style.setProperty("--mf-primary",d?"#B50D57":"#F856A7");r.style.setProperty("--mf-body",d?"rgba(255,255,255,0.82)":"#4a4a68");r.style.setProperty("--mf-ghost-bg",d?"rgba(2,6,23,0.3)":"rgba(255,255,255,0.35)");r.style.setProperty("--mf-primary-bg",d?"rgba(181,13,87,0.07)":"rgba(248,86,167,0.07)");r.style.setProperty("--mf-primary-border",d?"rgba(181,13,87,0.22)":"rgba(248,86,167,0.2)");r.style.setProperty("--mf-nav-fg",d?"#FFFFFF":"#020617");r.style.setProperty("--mf-nav-muted",d?"rgba(255,255,255,0.55)":"rgba(2,6,23,0.5)");r.style.setProperty("--mf-nav-border",d?"rgba(255,255,255,0.12)":"rgba(2,6,23,0.08)");r.style.setProperty("--mf-nav-rgb",d?"2,6,23":"255,255,255");r.style.setProperty("--mf-nav-pill",d?"rgba(255,255,255,0.10)":"rgba(2,6,23,0.06)");var p=location.pathname;if(p==="/"||p==="/loja"||p==="/privacidade"||p==="/termos"){r.style.backgroundColor=bg;if(document.body)document.body.style.backgroundColor=bg;try{history.scrollRestoration="manual";}catch(e){}}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${circularStd.variable} ${dmMono.variable} ${spaceGrotesk.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: script estático de tema, sem input de usuário */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
