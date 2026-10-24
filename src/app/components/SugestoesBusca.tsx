"use client";

import { IconSearch, IconStack2 } from "@tabler/icons-react";
import {
  forwardRef,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { CardImage } from "@/app/components/CardImage";
import type { SugestoesBusca as Sugestoes } from "@/lib/api";
import { useSugestoesBusca } from "@/lib/queries";

type Nome = Sugestoes["nomes"][number];
type Colecao = Sugestoes["colecoes"][number];
type Carta = Sugestoes["cartas"][number];

type Item =
  | { tipo: "nome"; chave: string; nome: Nome }
  | { tipo: "colecao"; chave: string; colecao: Colecao }
  | { tipo: "carta"; chave: string; carta: Carta };

export interface SugestoesBuscaRef {
  /** Repasse do onKeyDown do campo. `true` = a tecla foi usada aqui. */
  teclado: (e: React.KeyboardEvent<HTMLInputElement>) => boolean;
}

/** Quanto esperar depois da última letra: curto, a lista é leve. */
const ESPERA_MS = 120;

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Sem acento e minúsculo, letra a letra — o texto dobrado tem o MESMO
 * comprimento do original, então a posição achada nele vale no original.
 */
function dobrar(texto: string) {
  return [...texto]
    .map((c) => c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()[0] ?? c)
    .join("");
}

/** O trecho digitado em negrito: "char" em "Charizard" → **Char**izard */
function destacar(texto: string, termo: string): ReactNode {
  const q = dobrar(termo.trim());
  const i = q ? dobrar(texto).indexOf(q) : -1;
  if (i < 0) return texto;
  return (
    <>
      {texto.slice(0, i)}
      <strong className="font-semibold text-foreground">
        {texto.slice(i, i + q.length)}
      </strong>
      {texto.slice(i + q.length)}
    </>
  );
}

/**
 * Autocomplete da busca do Explorar (23/10): nomes de carta, coleções e, com
 * número no termo, a carta exata pelo código — da rota /cards/sugestoes. Mora
 * no mesmo lugar e no mesmo estilo do histórico de buscas, que continua
 * aparecendo com o campo vazio.
 *
 * O teclado fica no campo (o foco não sai dele): ↑ ↓ andam pela lista, Enter
 * escolhe o item marcado e Esc fecha. Sem item marcado, Enter segue sendo
 * "buscar o que digitei".
 */
export const SugestoesBusca = forwardRef<
  SugestoesBuscaRef,
  {
    termo: string;
    tcg?: string;
    aberto: boolean;
    onFechar: () => void;
    /** Id da opção marcada, para o aria-activedescendant do campo. */
    onAtivo?: (id: string | undefined) => void;
    onNome: (nome: string) => void;
    onColecao: (colecao: Colecao) => void;
    onCarta: (carta: Carta) => void;
  }
>(function SugestoesBusca(
  { termo, tcg, aberto, onFechar, onAtivo, onNome, onColecao, onCarta },
  ref,
) {
  const [esperado, setEsperado] = useState(termo);
  useEffect(() => {
    const t = setTimeout(() => setEsperado(termo), ESPERA_MS);
    return () => clearTimeout(t);
  }, [termo]);

  const { data } = useSugestoesBusca(esperado, tcg);
  const itens = useMemo<Item[]>(
    () => [
      ...(data?.cartas ?? []).map((carta) => ({
        tipo: "carta" as const,
        chave: `carta:${carta.id}`,
        carta,
      })),
      ...(data?.nomes ?? []).map((nome) => ({
        tipo: "nome" as const,
        chave: `nome:${nome.tcg}:${nome.nome}`,
        nome,
      })),
      ...(data?.colecoes ?? []).map((colecao) => ({
        tipo: "colecao" as const,
        chave: `colecao:${colecao.id}`,
        colecao,
      })),
    ],
    [data],
  );

  // Lista nova = nada marcado (Enter volta a buscar o texto digitado)
  const [ativo, setAtivo] = useState(-1);
  // biome-ignore lint/correctness/useExhaustiveDependencies: zera só quando a lista muda
  useEffect(() => setAtivo(-1), [itens]);

  const visivel = aberto && termo.trim().length >= 2 && itens.length > 0;
  useEffect(() => {
    onAtivo?.(visivel && ativo >= 0 ? `sugestao-${ativo}` : undefined);
  }, [visivel, ativo, onAtivo]);

  const escolher = (item: Item) => {
    if (item.tipo === "nome") onNome(item.nome.nome);
    else if (item.tipo === "colecao") onColecao(item.colecao);
    else onCarta(item.carta);
  };

  useImperativeHandle(ref, () => ({
    teclado: (e) => {
      if (!visivel) return false;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const passo = e.key === "ArrowDown" ? 1 : -1;
        setAtivo((a) => {
          const n = a + passo;
          if (n < -1) return itens.length - 1;
          if (n >= itens.length) return -1;
          return n;
        });
        return true;
      }
      if (e.key === "Enter" && ativo >= 0 && itens[ativo]) {
        e.preventDefault();
        escolher(itens[ativo]);
        return true;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onFechar();
        return true;
      }
      return false;
    },
  }));

  if (!visivel) return null;

  const secao = (tipo: Item["tipo"], titulo: string) => {
    const daSecao = itens
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => item.tipo === tipo);
    if (daSecao.length === 0) return null;
    return (
      // biome-ignore lint/a11y/useSemanticElements: grupo de opções do listbox
      <div role="group" aria-label={titulo}>
        <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {titulo}
        </p>
        {daSecao.map(({ item, i }) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: o teclado mora no campo (aria-activedescendant)
          <div
            key={item.chave}
            id={`sugestao-${i}`}
            role="option"
            aria-selected={i === ativo}
            tabIndex={-1}
            // Sem perder o foco do campo (o histórico faz igual)
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => escolher(item)}
            className={`flex cursor-pointer items-center gap-3 px-4 py-2 text-sm ${
              // Rosa leve: o cinza do muted sumia contra a lista no escuro.
              // O hover é CSS puro, sem estado e sem transição (23/10): marcar
              // a opção por estado no mouseenter redesenhava a página inteira
              // do Explorar a cada linha cruzada e o destaque chegava
              // atrasado. O estado `ativo` fica só para as setas do teclado.
              i === ativo ? "bg-primary/10" : "hover:bg-primary/10"""
            }`}
          >
            <Linha item={item} termo={termo} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      id="sugestoes-busca"
      role="listbox"
      aria-label="Sugestões"
      className="absolute inset-x-0 top-full z-20 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-popover pb-2 shadow-lg"
    >
      {secao("carta", "Carta")}
      {secao("nome", "Cartas")}
      {secao("colecao", "Coleções")}
    </div>
  );
});

function Linha({ item, termo }: { item: Item; termo: string }) {
  if (item.tipo === "nome") {
    const { nome } = item;
    return (
      <>
        <IconSearch className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-muted-foreground">
          {destacar(nome.nome, termo)}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground/70">
          {nome.tcgNome}
          {nome.impressoes > 1 && ` · ${nome.impressoes}+ versões`}
        </span>
      </>
    );
  }
  if (item.tipo === "colecao") {
    const { colecao } = item;
    const capa = colecao.imageUrl ?? colecao.coverFallbackUrl;
    return (
      <>
        <span className="flex h-7 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/40">
          {capa ? (
            // Capa de coleção vem de hosts variados; <img> evita liberar um
            // por um no next.config (o otimizador está desligado mesmo)
            // biome-ignore lint/performance/noImgElement: miniatura da coleção
            <img
              src={capa}
              alt=""
              className="size-full object-contain"
              loading="lazy"
            />
          ) : (
            <IconStack2 className="size-4 text-muted-foreground" />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-muted-foreground">
          {destacar(colecao.name, termo)}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground/70">
          {colecao.tcg.name}
          {colecao.totalCards ? ` · ${colecao.totalCards} cartas` : ""}
        </span>
      </>
    );
  }
  const { carta } = item;
  return (
    <>
      <span className="w-7 shrink-0 overflow-hidden rounded">
        <CardImage
          carta={carta}
          tamanho="grade"
          alt=""
          width={28}
          height={39}
          rotulo={false}
          className="aspect-[5/7] w-full object-cover"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">
          {carta.namePt?.trim() || carta.name}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {carta.setName}
          {carta.collectorNumber && (
            <span className="font-mono">
              {" "}
              · {destacar(carta.collectorNumber, termo)}
            </span>
          )}
        </span>
      </span>
      {carta.latestPriceBrl != null && (
        <span className="shrink-0 font-mono text-xs font-semibold text-foreground">
          R$ {formatPrice(carta.latestPriceBrl)}
        </span>
      )}
    </>
  );
}
