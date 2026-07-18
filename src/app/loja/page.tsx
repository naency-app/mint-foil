import { cookies } from "next/headers";
import { LojaClient } from "./loja-client";

// Tema salvo em cookie: o servidor renderiza a loja já no tema certo
export default async function LojaPage() {
  const jar = await cookies();
  const initialDark = jar.get("mf-theme")?.value === "dark";
  return <LojaClient initialDark={initialDark} />;
}
