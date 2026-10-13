const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const soLetrasENumeros = (s: string) => semAcento(s).replace(/[^a-z0-9]/g, "");

/**
 * Busca local do portfólio — mesma regra do app (mint-foil-app/lib/card-name.ts):
 * palavra a palavra, cada uma tem que aparecer no nome EN/PT, coleção,
 * raridade ou código. O código casa sem hífen, espaço ou caixa: "op10102"
 * acha a OP10-102. Antes o texto tinha que bater inteiro e o número da carta
 * nem entrava.
 */
export function cartaCasaBusca(
  card: {
    name: string;
    namePt?: string | null;
    setName?: string | null;
    rarity?: string | null;
    setCode?: string | null;
    collectorNumber?: string | null;
  },
  termo: string,
): boolean {
  const texto = [
    card.name,
    card.namePt,
    card.setName,
    card.rarity,
    card.setCode,
    card.collectorNumber,
  ]
    .filter((v): v is string => !!v)
    .map(semAcento)
    .join(" ");
  const codigos = [card.collectorNumber, card.setCode]
    .filter((v): v is string => !!v)
    .map(soLetrasENumeros);
  const casaCodigo = (t: string) =>
    t.length >= 2 && codigos.some((c) => c.includes(t));

  if (casaCodigo(soLetrasENumeros(termo))) return true;

  const palavras = semAcento(termo).split(/\s+/).filter(Boolean);
  return (
    palavras.length > 0 &&
    palavras.every((p) => texto.includes(p) || casaCodigo(soLetrasENumeros(p)))
  );
}
