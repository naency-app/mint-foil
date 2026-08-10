"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Memória do último Explore visitado.
 *
 * Os filtros do Explore moram na query string, então a URL já descreve o estado
 * inteiro. O que faltava era a navbar: ela aponta para `/explore` pelado, e
 * clicar em "Explorar" depois de passar pelo Portfólio jogava o usuário numa
 * página sem parâmetro nenhum — o nuqs lia vazio e caía nos defaults. Do ponto
 * de vista de quem usa, "o filtro sumiu ao trocar de aba".
 *
 * `sessionStorage` e não `localStorage` de propósito: faz sentido voltar para a
 * mesma busca durante a visita, não ressuscitar um filtro de três dias atrás
 * numa aba nova.
 */
const CHAVE = "explore:ultima-query";

/** Guarda a query string atual do Explore (chamado pela própria página). */
export function lembrarExplore(search: string) {
  try {
    sessionStorage.setItem(CHAVE, search);
  } catch {
    // Modo privado / storage bloqueado: perder a memória é aceitável, quebrar não.
  }
}

/**
 * Href do Explore com os últimos filtros. Começa em `/explore` e só incorpora a
 * memória depois de montado — ler `sessionStorage` durante o render faria o
 * HTML do servidor divergir do cliente e quebrar a hidratação.
 *
 * Reler a cada mudança de rota é o ponto todo: a navbar mora no layout e NÃO
 * remonta ao navegar. Com `[]` a leitura acontecia uma única vez, na primeira
 * carga, quando ainda não havia nada salvo — e o link ficava em `/explore`
 * pelado para sempre, que é exatamente o bug que este módulo existe para
 * resolver. `pathname` muda a cada navegação e força a releitura.
 */
export function useExploreHref(): string {
  const pathname = usePathname();
  const [href, setHref] = useState("/explore");

  // biome-ignore lint/correctness/useExhaustiveDependencies: `pathname` é o gatilho da releitura, não um valor lido aqui — a navbar não remonta ao navegar
  useEffect(() => {
    try {
      const salvo = sessionStorage.getItem(CHAVE);
      setHref(salvo ? `/explore${salvo}` : "/explore");
    } catch {
      // idem
    }
  }, [pathname]);

  return href;
}
