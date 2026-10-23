"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiError, api } from "@/lib/api";

/**
 * Quantidade de uma carta num portfólio, editada pelo contador — o mesmo
 * comportamento na tela da carta e nos cards do Explorar e das coleções.
 *
 * Otimista: o número muda na hora e UM request (add/update/remove) sai ~320ms
 * depois do último passo, então segurar o botão ou arrastar o número não vira
 * uma rajada de chamadas. Se a gravação falhar, volta ao que o servidor diz.
 *
 * O contador mexe só no item NM: com 3 NM + 2 LP, o total é 5 e o mínimo é
 * 2 — tirar abaixo disso apagaria cópias de outra condição. Antes a tela da
 * carta gravava o total inteiro na quantidade do NM e somava as outras duas
 * vezes (23/10).
 */
export function useQuantidadeNoPortfolio({
  cardId,
  portfolioId,
  quantidadeServidor,
  itemNm,
  logado,
  pedirLogin,
  aoGravar,
  nomePortfolio,
}: {
  cardId: string;
  portfolioId?: string;
  /** Total da carta no portfólio, somando todas as condições. */
  quantidadeServidor: number;
  /** O item NM da carta nesse portfólio, se existir. */
  itemNm: { id: string; quantity: number } | null;
  logado: boolean;
  /** Oferece entrar (sem sessão, ou sessão que expirou no meio). */
  pedirLogin: () => void;
  /** Depois de gravar: invalidar a coleção para tudo se atualizar. */
  aoGravar?: () => unknown;
  nomePortfolio?: string;
}) {
  const [quantidade, setQuantidade] = useState(quantidadeServidor);
  const pendente = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Confirmação visual no "+": o mesmo check animado de antes
  const [sucesso, setSucesso] = useState(false);
  const [sucessoId, setSucessoId] = useState(0);

  const outras = Math.max(0, quantidadeServidor - (itemNm?.quantity ?? 0));

  // Sem edição pendente, o número acompanha o servidor
  useEffect(() => {
    if (pendente.current === null) setQuantidade(quantidadeServidor);
  }, [quantidadeServidor]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function gravar(alvo: number) {
    pendente.current = null;
    const somou = alvo > quantidadeServidor;
    if (somou) {
      // Antes do await, de propósito: a confirmação acompanha o gesto, não a
      // latência da rede. Se a gravação falhar, o catch desfaz o número.
      setSucesso(true);
      setSucessoId((n) => n + 1);
      setTimeout(() => setSucesso(false), 1700);
    }
    const nm = alvo - outras;
    try {
      if (itemNm) {
        if (nm <= 0) await api.collection.remove(itemNm.id);
        else await api.collection.update(itemNm.id, { quantity: nm });
      } else if (nm > 0) {
        await api.collection.add({
          cardId,
          quantity: nm,
          condition: "NM",
          ...(portfolioId ? { portfolioId } : {}),
        });
      }
      await aoGravar?.();
      if (alvo <= 0) toast.success("Removido do portfólio");
      else
        toast.success(
          nomePortfolio
            ? `Atualizado em "${nomePortfolio}"`
            : "Atualizado no portfólio",
        );
    } catch (erro) {
      setSucesso(false);
      setQuantidade(quantidadeServidor);
      // Sessão que expirou no meio do uso: a saída é entrar, não "tente de
      // novo" — o botão faria exatamente o mesmo 401
      if (erro instanceof ApiError && erro.status === 401) pedirLogin();
      else toast.error("Erro ao atualizar o portfólio");
    }
  }

  /**
   * Recebe a quantidade FINAL (o contador pula vários de uma vez segurando
   * ou arrastando). `false` recusa, e o contador volta ao número de antes.
   */
  function definir(alvo: number) {
    if (!logado) {
      // Só faz sentido oferecer login para SOMAR — quem está deslogado não
      // tem o que remover
      if (alvo > quantidade) pedirLogin();
      return false;
    }
    const next = Math.max(outras, alvo);
    if (next === (pendente.current ?? quantidade)) return next === alvo;
    setQuantidade(next);
    pendente.current = next;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => gravar(next), 320);
    return next === alvo;
  }

  return { quantidade, definir, minimo: outras, sucesso, sucessoId };
}
