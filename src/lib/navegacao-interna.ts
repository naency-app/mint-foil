"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Caminho percorrido dentro do site nesta aba, para o "Voltar" saber se a
 * tela anterior é nossa. `history.length` não serve: conta as páginas de
 * antes (Google, WhatsApp), e o voltar tirava a pessoa do site.
 *
 * Vive na memória da página: um recarregar zera, e aí o "Voltar" cai no
 * destino padrão de cada tela, que é o comportamento seguro.
 */
const caminho: string[] = [];

/**
 * Há uma tela do próprio site antes desta?
 *
 * `atual` é a tela de quem pergunta. O rastro só registra a troca no efeito
 * dos Providers, que roda DEPOIS do efeito dos filhos: uma tela que já chega
 * pronta do servidor (a carta) perguntava antes do registro e ouvia "não"
 * (30/10). Se a tela atual ainda não está no rastro, a última anotada é a
 * anterior.
 */
export function veioDeDentroDoSite(atual?: string): boolean {
  if (atual && caminho.at(-1) !== atual) return caminho.length > 0;
  return caminho.length > 1;
}

/** Registra cada troca de página. Montado uma vez, nos Providers. */
export function useRastroDeNavegacao() {
  const pathname = usePathname();
  useEffect(() => {
    if (caminho.at(-1) === pathname) return;
    // Voltou para a tela anterior (botão do navegador ou o nosso "Voltar"):
    // desempilha em vez de empilhar, senão o voltar seguinte iria para a
    // tela de onde a pessoa acabou de sair
    if (caminho.at(-2) === pathname) caminho.pop();
    else caminho.push(pathname);
  }, [pathname]);
}
