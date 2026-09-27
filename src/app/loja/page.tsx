import { notFound } from "next/navigation";

// Loja fora do ar por enquanto: a rota responde 404 e sumiu do nav/rodapé.
// Para religar, trocar o notFound() de volta por <LojaClient initialDark={...} />
// (tema lido do cookie "mf-theme", ver histórico do git).
export default function LojaPage() {
  notFound();
}
