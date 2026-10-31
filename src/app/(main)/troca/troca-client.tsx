"use client";

import {
  IconArrowsExchange,
  IconCards,
  IconHeartHandshake,
  IconLoader2,
  IconSearch,
  IconShare2,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CardImage } from "@/app/components/CardImage";
import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import { RollingCounter } from "@/app/components/RollingCounter";
import { formatPrice } from "@/app/components/SugestoesBusca";
import { EstadoVazio } from "@/components/EstadoVazio";
import { BotaoFoil } from "@/components/ui/botao-foil";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassPill } from "@/components/ui/glass";
import { ApiError, api, textoDoErro } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { usePortfolioStore } from "@/lib/portfolio-store";
import {
  useInvalidateCollection,
  usePortfolioDetail,
  usePortfolios,
} from "@/lib/queries";
import {
  adicionarNaTroca,
  type CartaDaTroca,
  guardarTroca,
  type ItemDaTroca,
  type Lado,
  lerLadoDoLink,
  lerTrocaGuardada,
  linkDaTroca,
  mudarQuantidade,
  precoUnitario,
  resumoDaTroca,
  TROCA_VAZIA,
  type Troca,
} from "@/lib/troca";
import { cn } from "@/lib/utils";

const nomeDaCarta = (c: CartaDaTroca) => c.namePt?.trim() || c.name;

export function TrocaClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session } = useSession();
  const logado = !!session?.user;

  const [troca, setTroca] = useState<Troca>(TROCA_VAZIA);
  const [carregandoLink, setCarregandoLink] = useState(false);
  const [doPortfolioAberto, setDoPortfolioAberto] = useState(false);
  const [confirmarAberto, setConfirmarAberto] = useState(false);

  // Abrir um link compartilhado (?d=…&r=…) substitui a troca guardada; sem
  // link, volta a que estava sendo montada
  // biome-ignore lint/correctness/useExhaustiveDependencies: só na chegada
  useEffect(() => {
    const d = lerLadoDoLink(params.get("d"));
    const r = lerLadoDoLink(params.get("r"));
    if (d.length + r.length === 0) {
      setTroca(lerTrocaGuardada());
      return;
    }
    setCarregandoLink(true);
    api.cards
      .lote([...d, ...r].map((x) => x.id))
      .then((cartas) => {
        const porId = new Map(cartas.map((c) => [c.id, c]));
        const montar = (lado: { id: string; quantidade: number }[]) =>
          lado.flatMap(({ id, quantidade }) => {
            const carta = porId.get(id);
            return carta ? [{ carta, quantidade }] : [];
          });
        setTroca({ dar: montar(d), receber: montar(r) });
        // O link já foi lido: a URL volta a ser /troca para não ficar velha
        // enquanto a pessoa mexe na troca
        router.replace("/troca", { scroll: false });
      })
      .catch(() => toast.error("Não foi possível abrir a troca do link."))
      .finally(() => setCarregandoLink(false));
  }, []);

  useEffect(() => guardarTroca(troca), [troca]);

  const resumo = resumoDaTroca(troca);
  const vazia = resumo.veredito === "vazia";

  const adicionar = (
    lado: Lado,
    carta: CartaDaTroca,
    opcoes?: { itemId?: string; maximo?: number },
  ) => setTroca((t) => adicionarNaTroca(t, lado, carta, opcoes));

  async function compartilhar() {
    const url = `${window.location.origin}${linkDaTroca(troca)}`;
    const texto = `Olha essa troca: R$ ${formatPrice(resumo.dar)} × R$ ${formatPrice(resumo.receber)} no Mint Foil`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Troca no Mint Foil",
          text: texto,
          url,
        });
        return;
      }
    } catch {
      // Cancelar o menu de compartilhar não é erro
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link da troca copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  return (
    <main className="mx-auto max-w-screen-xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <IconHeartHandshake className="size-7 text-primary" />
            Essa troca vale a pena?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monte os dois lados e veja se a troca vale a pena, com o preço em
            real de cada carta.
          </p>
        </div>
        {!vazia && (
          <div className="flex items-center gap-2">
            <GlassPill
              onClick={compartilhar}
              className="h-9 gap-1.5 px-3.5 text-sm"
            >
              <IconShare2 className="size-4" />
              Compartilhar
            </GlassPill>
            <GlassPill
              onClick={() => setTroca(TROCA_VAZIA)}
              className="h-9 gap-1.5 px-3.5 text-sm text-muted-foreground"
            >
              <IconTrash className="size-4" />
              Limpar
            </GlassPill>
          </div>
        )}
      </div>

      {carregandoLink ? (
        <div className="flex justify-center py-20">
          <IconLoader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4">
            <LadoDaTroca
              titulo="Você entrega"
              itens={troca.dar}
              total={resumo.dar}
              onAdicionar={(c) => adicionar("dar", c)}
              onQuantidade={(i, q) =>
                setTroca((t) => mudarQuantidade(t, "dar", i, q))
              }
              extra={
                logado ? (
                  <GlassPill
                    onClick={() => setDoPortfolioAberto(true)}
                    className="h-9 gap-1.5 px-3.5 text-sm"
                  >
                    <IconCards className="size-4" />
                    Do meu portfólio
                  </GlassPill>
                ) : null
              }
            />
            {/* O que está sendo trocado, numa coluna própria entre os dois
                lados (30/10); empilhado no celular, gira para a vertical */}
            <span
              aria-hidden="true"
              className="flex size-12 items-center justify-center self-center justify-self-center rounded-full bg-primary/10"
            >
              <IconArrowsExchange className="size-6 rotate-90 text-primary md:rotate-0" />
            </span>
            <LadoDaTroca
              titulo="Você recebe"
              itens={troca.receber}
              total={resumo.receber}
              onAdicionar={(c) => adicionar("receber", c)}
              onQuantidade={(i, q) =>
                setTroca((t) => mudarQuantidade(t, "receber", i, q))
              }
            />
          </div>

          <ResumoDaTroca
            resumo={resumo}
            podeConfirmar={logado && !vazia}
            onConfirmar={() => setConfirmarAberto(true)}
            logado={logado}
          />
        </>
      )}

      {logado && (
        <DoMeuPortfolio
          aberto={doPortfolioAberto}
          onFechar={() => setDoPortfolioAberto(false)}
          onEscolher={(item) =>
            adicionar("dar", item.card, {
              itemId: item.id,
              maximo: item.quantity,
            })
          }
        />
      )}

      {logado && (
        <ConfirmarTroca
          aberto={confirmarAberto}
          onFechar={() => setConfirmarAberto(false)}
          troca={troca}
          onConfirmada={() => setTroca(TROCA_VAZIA)}
        />
      )}
    </main>
  );
}

// ─── Um lado da troca ──────────────────────────────────────────

function LadoDaTroca({
  titulo,
  itens,
  total,
  onAdicionar,
  onQuantidade,
  extra,
}: {
  titulo: string;
  itens: ItemDaTroca[];
  total: number;
  onAdicionar: (carta: CartaDaTroca) => void;
  onQuantidade: (indice: number, quantidade: number) => void;
  extra?: React.ReactNode;
}) {
  return (
    // z-10: a lista da busca abre por cima do resumo de baixo (o vidro do
    // card cria camada própria e a escondia)
    <section className="glass-card !rounded-2xl relative z-10 flex flex-col gap-4 p-5 focus-within:z-20">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">{titulo}</h2>
        <span className="font-mono text-lg font-bold text-foreground tabular-nums">
          R$ {formatPrice(total)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <BuscaDaTroca onEscolher={onAdicionar} />
        {extra}
      </div>

      {itens.length === 0 ? (
        // Vazio no padrão: a pilha de placas do EstadoVazio
        <EstadoVazio
          className="py-6"
          icon={IconCards}
          titulo="Nenhuma carta ainda"
          descricao={
            titulo === "Você entrega"
              ? "Busque as cartas que você vai entregar."
              : "Busque as cartas que você vai receber."
          }
        />
      ) : (
        <ul className="space-y-1.5">
          {itens.map((item, i) => (
            <li
              key={`${item.carta.id}:${item.itemId ?? ""}`}
              className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2"
            >
              <span className="w-9 shrink-0 overflow-hidden rounded">
                <CardImage
                  carta={item.carta}
                  tamanho="miniatura"
                  alt=""
                  width={36}
                  height={50}
                  rotulo={false}
                  className={cn(
                    "aspect-[5/7] w-full",
                    item.carta.productType === "SEALED"
                      ? "object-contain"
                      : "object-cover",
                  )}
                />
              </span>
              <span className="min-w-0 flex-1">
                <Link
                  href={`/card/${item.carta.id}`}
                  className="block truncate text-sm font-semibold text-foreground hover:text-primary"
                >
                  {nomeDaCarta(item.carta)}
                </Link>
                <span className="block truncate text-xs text-muted-foreground">
                  {item.carta.setName}
                  {item.carta.collectorNumber &&
                    ` · ${item.carta.collectorNumber}`}
                </span>
                <span className="block font-mono text-xs text-muted-foreground">
                  R$ {formatPrice(precoUnitario(item.carta))}
                  {item.itemId && " · do seu portfólio"}
                </span>
              </span>
              <RollingCounter
                value={item.quantidade}
                onChange={(q) => {
                  onQuantidade(i, q);
                  return true;
                }}
                min={0}
                max={item.maximo}
                cell={28}
                redondo
                inercia={false}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Busca de carta para um lado ───────────────────────────────

/**
 * Busca pelo motor do Explorar (nome, código, erro de digitação), com cartas
 * e selados. Escolher põe a carta no lado.
 */
function BuscaDaTroca({
  onEscolher,
}: {
  onEscolher: (carta: CartaDaTroca) => void;
}) {
  const [termo, setTermo] = useState("");
  const [esperado, setEsperado] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setEsperado(termo.trim()), 250);
    return () => clearTimeout(t);
  }, [termo]);

  const { data, isFetching } = useQuery({
    queryKey: ["troca-busca", esperado],
    queryFn: () =>
      api.cards.list({ search: esperado, productType: "all", limit: 8 }),
    enabled: esperado.length >= 2,
    staleTime: 60_000,
  });
  const resultados = esperado.length >= 2 ? (data ?? []) : [];

  return (
    <div className="relative min-w-0 flex-1">
      <div className="flex h-9 items-center gap-2 rounded-full border border-border bg-muted/40 px-3">
        <IconSearch className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar carta ou código…"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {isFetching && (
          <IconLoader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
        )}
        {termo && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => setTermo("")}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <IconX className="size-4" />
          </button>
        )}
      </div>
      {resultados.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 shadow-lg">
          {resultados.map((carta) => (
            <li key={carta.id}>
              <button
                type="button"
                onClick={() => {
                  onEscolher(carta);
                  setTermo("");
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-primary/10"
              >
                <span className="w-7 shrink-0 overflow-hidden rounded">
                  <CardImage
                    carta={carta}
                    tamanho="miniatura"
                    alt=""
                    width={28}
                    height={39}
                    rotulo={false}
                    className={cn(
                      "aspect-[5/7] w-full",
                      carta.productType === "SEALED"
                        ? "object-contain"
                        : "object-cover",
                    )}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {nomeDaCarta(carta)}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {carta.setName}
                    {carta.collectorNumber && ` · ${carta.collectorNumber}`}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs font-semibold text-foreground">
                  R$ {formatPrice(precoUnitario(carta))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Resumo e veredito ─────────────────────────────────────────

function ResumoDaTroca({
  resumo,
  podeConfirmar,
  onConfirmar,
  logado,
}: {
  resumo: ReturnType<typeof resumoDaTroca>;
  podeConfirmar: boolean;
  onConfirmar: () => void;
  logado: boolean;
}) {
  const { veredito, diferenca, pct } = resumo;
  // A frase fica na cor do texto; só o valor ganha verde ou vermelho, como
  // nos números do resto do sistema (30/10)
  const titulo =
    veredito === "vazia" ? (
      "Adicione cartas nos dois lados"
    ) : veredito === "ganha" ? (
      <>
        Você ganha{" "}
        <span className="text-emerald-400">R$ {formatPrice(diferenca)}</span>
      </>
    ) : (
      <>
        Você perde{" "}
        <span className="text-destructive">R$ {formatPrice(-diferenca)}</span>
      </>
    );
  return (
    <section className="glass-card !rounded-2xl flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:justify-between sm:text-left">
      {veredito === "equilibrada" ? (
        // Troca justa (30/10): o aperto de mãos e a diferença num selo, sem
        // pintar a frase — verde e vermelho só nos números
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <IconHeartHandshake className="size-6 text-primary" />
          </span>
          <div>
            <p className="flex flex-wrap items-center justify-center gap-2 text-2xl font-extrabold tracking-tight text-foreground sm:justify-start">
              Troca justa
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tracking-normal text-muted-foreground tabular-nums">
                {Math.abs(diferenca) < 0.005
                  ? "valores iguais"
                  : `diferença de R$ ${formatPrice(Math.abs(diferenca))}`}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground tabular-nums">
              Você entrega R$ {formatPrice(resumo.dar)} · recebe R${" "}
              {formatPrice(resumo.receber)}
            </p>
          </div>
        </div>
      ) : (
        <div>
          <p
            className={cn(
              "text-2xl font-extrabold tracking-tight",
              veredito === "vazia"
                ? "text-muted-foreground"
                : "text-foreground",
            )}
          >
            {titulo}
          </p>
          {veredito !== "vazia" && (
            <p className="mt-1 text-sm text-muted-foreground tabular-nums">
              Você entrega R$ {formatPrice(resumo.dar)} · recebe R${" "}
              {formatPrice(resumo.receber)}
              {` · ${Math.abs(pct * 100).toFixed(0)}% de diferença`}
            </p>
          )}
        </div>
      )}
      {podeConfirmar ? (
        <BotaoFoil onClick={onConfirmar} className="shrink-0">
          <IconArrowsExchange />
          Confirmar troca
        </BotaoFoil>
      ) : (
        !logado &&
        veredito !== "vazia" && (
          <Link
            href="/login?redirect=/troca"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Entre para registrar a troca no seu portfólio
          </Link>
        )
      )}
    </section>
  );
}

// ─── "Do meu portfólio" ────────────────────────────────────────

function DoMeuPortfolio({
  aberto,
  onFechar,
  onEscolher,
}: {
  aberto: boolean;
  onFechar: () => void;
  onEscolher: (item: {
    id: string;
    quantity: number;
    card: CartaDaTroca;
  }) => void;
}) {
  const { data: portfolios = [] } = usePortfolios(aberto);
  const ativoGlobal = usePortfolioStore((s) => s.activeId);
  const [portfolioId, setPortfolioId] = useState<string>("");
  useEffect(() => {
    if (!portfolioId && portfolios.length > 0)
      setPortfolioId(ativoGlobal ?? portfolios[0].id);
  }, [portfolios, ativoGlobal, portfolioId]);
  const { data: detalhe, isLoading } = usePortfolioDetail(
    aberto ? portfolioId || undefined : undefined,
  );
  const [filtro, setFiltro] = useState("");
  const itens = useMemo(() => {
    const todos = detalhe?.items ?? [];
    const q = filtro.trim().toLowerCase();
    if (!q) return todos;
    return todos.filter((i) =>
      `${i.card.namePt ?? ""} ${i.card.name} ${i.card.collectorNumber ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [detalhe, filtro]);

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Do meu portfólio</DialogTitle>
          <DialogDescription>
            Escolha as cartas que você vai entregar. Ao confirmar a troca, elas
            saem do portfólio.
          </DialogDescription>
        </DialogHeader>
        {portfolios.length > 0 && (
          <PortfolioSelector
            portfolios={portfolios}
            activePortfolioId={portfolioId}
            onSelect={setPortfolioId}
            labelPrefix="De"
          />
        )}
        <div className="flex h-9 items-center gap-2 rounded-full border border-border bg-muted/40 px-3">
          <IconSearch className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar neste portfólio…"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
          {isLoading && (
            <li className="flex justify-center py-6">
              <IconLoader2 className="size-5 animate-spin text-muted-foreground" />
            </li>
          )}
          {!isLoading && itens.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma carta aqui.
            </li>
          )}
          {itens.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  onEscolher(item);
                  toast.success(`${nomeDaCarta(item.card)} no "Você entrega".`);
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-primary/10"
              >
                <span className="w-7 shrink-0 overflow-hidden rounded">
                  <CardImage
                    carta={item.card}
                    tamanho="miniatura"
                    alt=""
                    width={28}
                    height={39}
                    rotulo={false}
                    className="aspect-[5/7] w-full object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {nomeDaCarta(item.card)}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.card.setName} · você tem {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs font-semibold text-foreground">
                  R$ {formatPrice(precoUnitario(item.card))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

// ─── Confirmar a troca ─────────────────────────────────────────

function ConfirmarTroca({
  aberto,
  onFechar,
  troca,
  onConfirmada,
}: {
  aberto: boolean;
  onFechar: () => void;
  troca: Troca;
  onConfirmada: () => void;
}) {
  const { data: portfolios = [] } = usePortfolios(aberto);
  const ativoGlobal = usePortfolioStore((s) => s.activeId);
  const [destino, setDestino] = useState("");
  useEffect(() => {
    if (!destino && portfolios.length > 0)
      setDestino(ativoGlobal ?? portfolios[0].id);
  }, [portfolios, ativoGlobal, destino]);
  const invalidar = useInvalidateCollection();
  const [enviando, setEnviando] = useState(false);

  const foraDoPortfolio = troca.dar.filter((i) => !i.itemId);

  async function confirmar() {
    setEnviando(true);
    try {
      await api.collection.confirmarTroca({
        dar: troca.dar
          .filter((i) => i.itemId)
          .map((i) => ({
            itemId: i.itemId as string,
            quantidade: i.quantidade,
          })),
        receber: troca.receber.map((i) => ({
          cardId: i.carta.id,
          quantidade: i.quantidade,
        })),
        portfolioId: destino || undefined,
      });
      await invalidar();
      toast.success("Troca registrada no seu portfólio.");
      onConfirmada();
      onFechar();
    } catch (err) {
      // Servidor sem a rota (antes do deploy) responde "Cannot POST …" em
      // inglês: isso nunca vai para a tela (30/10). As mensagens da própria
      // rota ("Você tem 2 cópias…") já vêm em português e passam
      toast.error(
        err instanceof ApiError &&
          err.status === 404 &&
          /cannot post/i.test(err.message)
          ? "Confirmar troca ainda não está disponível. Tente de novo mais tarde."
          : textoDoErro(err, "Não foi possível registrar a troca."),
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar a troca?</DialogTitle>
          <DialogDescription>
            As cartas que você entrega saem do seu portfólio, e as que você
            recebe entram no portfólio escolhido.
          </DialogDescription>
        </DialogHeader>
        {troca.receber.length > 0 && portfolios.length > 0 && (
          <PortfolioSelector
            portfolios={portfolios}
            activePortfolioId={destino}
            onSelect={setDestino}
            labelPrefix="Recebidas em"
          />
        )}
        {foraDoPortfolio.length > 0 && (
          <p className="rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {foraDoPortfolio.length === 1
              ? `${nomeDaCarta(foraDoPortfolio[0].carta)} não veio do seu portfólio e não será removida.`
              : `${foraDoPortfolio.length} cartas do "Você entrega" não vieram do seu portfólio e não serão removidas.`}
          </p>
        )}
        <DialogFooter className="gap-2">
          <GlassPill
            onClick={onFechar}
            disabled={enviando}
            className="h-9 justify-center px-4 text-sm"
          >
            Cancelar
          </GlassPill>
          <BotaoFoil
            onClick={confirmar}
            disabled={enviando}
            className="justify-center"
          >
            {enviando ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              <IconArrowsExchange />
            )}
            Confirmar troca
          </BotaoFoil>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
