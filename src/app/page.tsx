import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { LandingPage } from "@/app/components/LandingPage";
import { detectarPlataforma } from "@/lib/app-links";

export const metadata: Metadata = {
  title: "Mint Foil — Escaneie, Colete e Domine o Mercado TCG",
  description:
    "Escaneie cartas com IA, veja quanto valem em reais e acompanhe sua coleção. Pokémon, Magic, Yu-Gi-Oh!, One Piece, Lorcana e Digimon.",
};

// Tema salvo em cookie: o SERVIDOR já renderiza no tema certo — reload no
// dark fica idêntico ao light (sem re-render de flip na hidratação)
export default async function Page() {
  const jar = await cookies();
  const initialDark = jar.get("mf-theme")?.value === "dark";
  // Celular decide o botão do hero ("Comece a escanear" x "Explorar agora")
  const plataforma = detectarPlataforma(
    (await headers()).get("user-agent") ?? "",
  );
  return (
    <LandingPage initialDark={initialDark} noCelular={plataforma !== "outra"} />
  );
}
