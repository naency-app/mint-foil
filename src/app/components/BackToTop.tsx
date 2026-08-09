"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/** A partir de quanto scroll o botão aparece (≈ uma tela). */
const LIMIAR = 600;

/**
 * Volta ao topo. Mora no layout, então vale para todas as páginas — as listas
 * do Explore, Sets e Portfólio ficam com milhares de pixels depois do scroll
 * infinito, e rolar de volta na mão é longo demais.
 *
 * Fica montado o tempo todo e só troca opacidade: entrar e sair do DOM mataria
 * a transição de saída. `pointer-events-none` garante que, invisível, ele não
 * rouba clique de nada embaixo.
 */
export function BackToTop() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > LIMIAR);
    aoRolar(); // já entra na tela certa se a página abriu rolada (voltar do histórico)
    // passive: o listener não cancela o scroll, e sem isto o navegador precisa
    // esperar para saber disso — trava a rolagem em lista grande.
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  function subir() {
    // Quem pediu menos animação no sistema não recebe o scroll animado.
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    window.scrollTo({ top: 0, behavior: suave ? "smooth" : "auto" });
  }

  return (
    <button
      type="button"
      onClick={subir}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      // z-40 fica acima do conteúdo e abaixo de modais; à direita para não
      // disputar espaço com a barra de seleção do portfólio, que é centralizada.
      className={`fixed right-5 bottom-5 z-40 flex size-11 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-lg backdrop-blur transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        visivel
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
