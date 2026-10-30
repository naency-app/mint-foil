import type { Metadata } from "next";
import { Suspense } from "react";
import { TrocaClient } from "./troca-client";

/**
 * Analisador de troca (30/10): "Você dá" × "Você recebe", com o veredito.
 * Pública: montar e abrir uma troca compartilhada não exigem conta; só
 * confirmar (mexer no portfólio) exige.
 */
export const metadata: Metadata = {
  title: "Troca justa | Mint Foil",
  description:
    "Monte os dois lados da troca e veja na hora se ela vale a pena, com o preço em real de cada carta.",
  openGraph: {
    title: "Essa troca é justa? | Mint Foil",
    description:
      "Veja os dois lados da troca com o preço em real de cada carta no Mint Foil.",
    siteName: "Mint Foil",
    locale: "pt_BR",
    type: "website",
  },
};

export default function TrocaPage() {
  return (
    <Suspense>
      <TrocaClient />
    </Suspense>
  );
}
