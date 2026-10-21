import type { FacetOption } from "@/lib/api";

// Magic e One Piece chegam da TCGplayer com a raridade abreviada ("R", "M",
// "SR"…), enquanto Yu-Gi-Oh!, Pokémon, Lorcana e Digimon vêm por extenso. Na
// tela a sigla não diz nada para quem não joga aquele jogo, e numa busca com
// vários jogos aparecia "C" e "Common" como se fossem coisas diferentes.
// Os nomes ficam em inglês, como os dos outros jogos (é o nome impresso na
// carta e o que se usa no mercado).

const MAGIC: Record<string, string> = {
  C: "Common",
  U: "Uncommon",
  R: "Rare",
  M: "Mythic Rare",
  S: "Special",
  T: "Token",
  P: "Promo",
  L: "Land",
};

const ONE_PIECE: Record<string, string> = {
  C: "Common",
  UC: "Uncommon",
  R: "Rare",
  SR: "Super Rare",
  SEC: "Secret Rare",
  SP: "Special",
  TR: "Treasure Rare",
  PR: "Promo",
  L: "Leader",
  "DON!!": "DON!!",
};

const SEM_RARIDADE: Record<string, string> = {
  None: "Sem raridade",
  Unconfirmed: "Não confirmada",
};

/**
 * Sem saber o jogo (busca em vários), vale a sigla que só um deles usa. "L" é
 * a única que muda de sentido: terreno no Magic, líder no One Piece.
 */
const QUALQUER_JOGO: Record<string, string> = {
  ...MAGIC,
  ...ONE_PIECE,
  L: "Leader / Land",
};

/** `jogo` aceita o slug ("magic") ou o id do banco ("tcg-magic"). */
export function nomeDaRaridade(valor: string, jogo?: string | null): string {
  const slug = jogo?.replace(/^tcg-/, "");
  const tabela =
    slug === "magic" ? MAGIC : slug === "onepiece" ? ONE_PIECE : QUALQUER_JOGO;
  return SEM_RARIDADE[valor] ?? tabela[valor] ?? valor;
}

export interface GrupoDeRaridade {
  /** Nome exibido; é também a chave da opção no filtro. */
  nome: string;
  /** Valores do banco que viram este nome ("C" e "Common" → "Common"). */
  valores: string[];
  count: number;
}

/**
 * Junta as facetas que têm o mesmo nome por extenso, somando as contagens.
 * Marcar o grupo filtra por todos os valores dele.
 */
export function agruparRaridades(
  opcoes: FacetOption[],
  jogo?: string | null,
): GrupoDeRaridade[] {
  const grupos = new Map<string, GrupoDeRaridade>();
  for (const { value, count } of opcoes) {
    const nome = nomeDaRaridade(value, jogo);
    const grupo = grupos.get(nome);
    if (grupo) {
      grupo.valores.push(value);
      grupo.count += count;
    } else {
      grupos.set(nome, { nome, valores: [value], count });
    }
  }
  return [...grupos.values()].sort((a, b) => b.count - a.count);
}
