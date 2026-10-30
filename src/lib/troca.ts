import { precoDaSugestao } from "@/lib/api";

/**
 * Analisador de troca (30/10): dois lados, "Você entrega" e "Você recebe", e o
 * veredito. Funções puras, sem tela: a página da web usa, e o app segue as
 * mesmas regras.
 */

/** O que a troca precisa saber de uma carta (busca, portfólio ou link). */
export interface CartaDaTroca {
  id: string;
  name: string;
  namePt?: string | null;
  imageUrl: string;
  images?: { thumb: string; grid: string; full: string } | null;
  hasImage?: boolean;
  setName: string | null;
  collectorNumber?: string | null;
  latestPriceBrl?: number | null;
  mypMenor?: number | null;
  productType?: "SINGLE" | "SEALED";
}

export interface ItemDaTroca {
  carta: CartaDaTroca;
  quantidade: number;
  /**
   * Veio do portfólio: o item que sai dele ao confirmar a troca, e quantas
   * cópias a pessoa tem (o teto do contador).
   */
  itemId?: string;
  maximo?: number;
}

export type Lado = "dar" | "receber";

export interface Troca {
  dar: ItemDaTroca[];
  receber: ItemDaTroca[];
}

export const TROCA_VAZIA: Troca = { dar: [], receber: [] };

/**
 * Até 10% de diferença entre os lados é "troca equilibrada": preço de
 * referência não é preço de balcão, e brigar por R$ 2 numa troca de R$ 100
 * não faz sentido. Ajustável aqui.
 */
export const LIMITE_EQUILIBRIO = 0.1;

/** O preço da tela da carta: o da MyP quando ela tem, senão o internacional. */
export function precoUnitario(carta: CartaDaTroca): number {
  return (
    precoDaSugestao({
      latestPriceBrl: carta.latestPriceBrl ?? null,
      mypMenor: carta.mypMenor,
    }) ?? 0
  );
}

export function totalDoLado(itens: ItemDaTroca[]): number {
  return itens.reduce((s, i) => s + precoUnitario(i.carta) * i.quantidade, 0);
}

export type Veredito = "vazia" | "equilibrada" | "ganha" | "perde";

export function resumoDaTroca(troca: Troca) {
  const dar = totalDoLado(troca.dar);
  const receber = totalDoLado(troca.receber);
  const diferenca = receber - dar;
  const base = Math.max(dar, receber);
  const pct = base > 0 ? diferenca / base : 0;
  let veredito: Veredito;
  if (troca.dar.length === 0 && troca.receber.length === 0) veredito = "vazia";
  else if (Math.abs(pct) <= LIMITE_EQUILIBRIO) veredito = "equilibrada";
  else veredito = diferenca > 0 ? "ganha" : "perde";
  return { dar, receber, diferenca, pct, veredito };
}

/**
 * Põe uma carta num lado. A mesma carta (e, no "dar", o mesmo item do
 * portfólio) soma na linha que já existe em vez de virar outra.
 */
export function adicionarNaTroca(
  troca: Troca,
  lado: Lado,
  carta: CartaDaTroca,
  opcoes: { quantidade?: number; itemId?: string; maximo?: number } = {},
): Troca {
  const quantidade = opcoes.quantidade ?? 1;
  const lista = troca[lado];
  const i = lista.findIndex(
    (x) => x.carta.id === carta.id && x.itemId === opcoes.itemId,
  );
  if (i >= 0) {
    const atual = lista[i];
    const teto = atual.maximo ?? Number.POSITIVE_INFINITY;
    const nova = [...lista];
    nova[i] = {
      ...atual,
      quantidade: Math.min(teto, atual.quantidade + quantidade),
    };
    return { ...troca, [lado]: nova };
  }
  return {
    ...troca,
    [lado]: [
      ...lista,
      { carta, quantidade, itemId: opcoes.itemId, maximo: opcoes.maximo },
    ],
  };
}

/** Quantidade nova de uma linha; 0 tira a linha. */
export function mudarQuantidade(
  troca: Troca,
  lado: Lado,
  indice: number,
  quantidade: number,
): Troca {
  const lista = [...troca[lado]];
  if (quantidade <= 0) lista.splice(indice, 1);
  else lista[indice] = { ...lista[indice], quantidade };
  return { ...troca, [lado]: lista };
}

// ─── Link compartilhado ─────────────────────────────────────────

const ladoParaLink = (itens: ItemDaTroca[]) =>
  itens
    .map((i) =>
      i.quantidade > 1 ? `${i.carta.id}*${i.quantidade}` : i.carta.id,
    )
    .join(",");

/**
 * /troca?d=<id>*2,<id>&r=<id>: só ids e quantidades. Os preços são calculados
 * na hora de abrir ("valores de hoje"), e "do meu portfólio" não viaja: quem
 * abre o link não tem o portfólio de quem mandou.
 */
export function linkDaTroca(troca: Troca): string {
  const qs = new URLSearchParams();
  if (troca.dar.length) qs.set("d", ladoParaLink(troca.dar));
  if (troca.receber.length) qs.set("r", ladoParaLink(troca.receber));
  return `/troca${qs.size ? `?${qs.toString()}` : ""}`;
}

/** Lê um lado do link: "id*2,id" → [{ id, quantidade }]. Lixo é descartado. */
export function lerLadoDoLink(
  valor: string | null,
): { id: string; quantidade: number }[] {
  if (!valor) return [];
  return valor
    .split(",")
    .map((parte) => {
      const [id, q] = parte.trim().split("*");
      const quantidade = q ? Number.parseInt(q, 10) : 1;
      return { id: id ?? "", quantidade };
    })
    .filter(
      (x) =>
        /^[0-9a-f-]{36}$/i.test(x.id) &&
        Number.isInteger(x.quantidade) &&
        x.quantidade > 0 &&
        x.quantidade <= 999,
    )
    .slice(0, 40);
}

// ─── A troca em montagem, guardada no navegador ─────────────────

const CHAVE = "mf-troca";

/** Sair e voltar não perde a troca. Sem storage (aba anônima), começa vazia. */
export function lerTrocaGuardada(): Troca {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return TROCA_VAZIA;
    const t = JSON.parse(bruto) as Troca;
    if (!Array.isArray(t.dar) || !Array.isArray(t.receber)) return TROCA_VAZIA;
    return t;
  } catch {
    return TROCA_VAZIA;
  }
}

export function guardarTroca(troca: Troca) {
  try {
    if (troca.dar.length + troca.receber.length === 0)
      localStorage.removeItem(CHAVE);
    else localStorage.setItem(CHAVE, JSON.stringify(troca));
  } catch {
    // Sem storage a troca só não sobrevive a recarregar a página
  }
}
