"use client";

import {
  IconFilter,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AddIconButton } from "@/app/components/AddIconButton";
import { CardImage } from "@/app/components/CardImage";
import { useQuickAdd } from "@/app/components/QuickAdd";
import { RollingNumber } from "@/app/components/RollingNumber";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiError, api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { nomeDaRaridade } from "@/lib/raridade";

/** Um atalho do menu de filtro rápido: "Coleção · Plasma Freeze". */
export interface FiltroRapido {
  rotulo: string;
  valor: string;
  aplicar: () => void;
}

export interface TcgCardProps {
  name: string;
  /** Nome PT oficial (BR): exibido no lugar do EN quando presente. */
  namePt?: string | null;
  price: string;
  priceChange?: number;
  imageUrl: string;
  /** Tamanhos vindos da API; sem eles cai no `imageUrl` (backend antigo). */
  images?: { thumb: string; grid: string; full: string } | null;
  collectorNumber?: string | null;
  setName?: string | null;
  tcgSlug?: string;
  setSlug?: string;
  rarity?: string;
  change: number;
  quantity?: number;
  cardId?: string;
  cardHref?: string;
  defaultPortfolioId?: string;
  onAdd?: () => void;
  /** Atalhos do botão de filtro que aparece no hover (só no Explorar). */
  filtrosRapidos?: FiltroRapido[];
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function TcgCard({
  name,
  namePt,
  price,
  priceChange,
  imageUrl,
  images,
  collectorNumber,
  setName,
  tcgSlug,
  setSlug,
  rarity,
  change,
  quantity = 0,
  cardId,
  cardHref,
  defaultPortfolioId,
  onAdd,
  filtrosRapidos,
}: TcgCardProps) {
  const displayName = namePt?.trim() || name;
  const isPositive = change >= 0;
  const [localQty, setLocalQty] = useState(quantity);
  const [success, setSuccess] = useState(false);
  // Troca a cada confirmação para remontar a animação e ela rodar de novo
  const [successId, setSuccessId] = useState(0);
  const router = useRouter();
  const { data: session, isPending: sessaoCarregando } = useSession();
  const { pedirLogin } = useQuickAdd();
  // Cliques acumulam num contador e só viram 1 request + 1 animação depois que
  // o usuário para de clicar (debounce). Assim dá pra adicionar 3 rápido sem
  // esperar a animação de cada uma.
  const pendingRef = useRef(0);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalQty(quantity);
  }, [quantity]);

  // Garante o commit e limpa o timer se o card desmontar com adds pendentes
  useEffect(() => {
    return () => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
    };
  }, []);

  function cartaParaLogin() {
    return {
      id: cardId as string,
      name,
      namePt,
      imageUrl,
      images,
      setName,
      rarity,
      collectorNumber,
      price,
      change,
    };
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!cardId) return;

    // Sessão ANTES de portfólio: o portfólio ativo fica guardado no navegador e
    // sobrevive ao logout. Perguntando na ordem inversa, quem tinha entrado
    // antes caía no ramo "tem portfólio", a gravação ia para a API sem sessão e
    // voltava 401 — que a tela traduzia como "Erro ao adicionar carta".
    if (!sessaoCarregando && !session?.user) {
      // Mostra a carta escolhida e oferece entrar — jogar direto no /login
      // faz a pessoa perder de vista o que estava adicionando.
      pedirLogin(cartaParaLogin());
      return;
    }
    // Sessão ainda chegando: não dá para afirmar nada. O clique seria um
    // palpite, e errar aqui é oferecer login a quem já entrou.
    if (sessaoCarregando) return;
    // Sem portfólio ativo (conta nova, sem nenhum) segue sem `portfolioId`: o
    // servidor grava no padrão e cria o "Principal" se preciso.

    // Feedback instantâneo: incrementa na hora, sem esperar a rede
    setLocalQty((prev) => prev + 1);
    pendingRef.current += 1;
    const portfolioId = defaultPortfolioId;

    // Reagenda o commit a cada clique — só dispara após ~320ms sem clicar
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(async () => {
      const qty = pendingRef.current;
      pendingRef.current = 0;
      if (qty <= 0) return;

      // Antes do await, de propósito: a confirmação acompanha o gesto (parou de
      // clicar → animou), não a latência da rede. O número já subiu de forma
      // otimista; se a gravação falhar, o catch desfaz.
      setSuccess(true);
      setSuccessId((n) => n + 1);
      setTimeout(() => setSuccess(false), 1700);

      try {
        await api.collection.add({
          cardId,
          quantity: qty,
          condition: "NM",
          ...(portfolioId ? { portfolioId } : {}),
        });
        if (onAdd) onAdd();
        toast.success(
          qty > 1
            ? `+${qty} adicionadas ao portfólio!`
            : "Adicionado ao portfólio!",
        );
      } catch (erro) {
        // Falhou: desfaz o incremento otimista
        setLocalQty((prev) => Math.max(0, prev - qty));
        setSuccess(false);
        // Sessão que expirou no meio do uso: a saída é entrar, não "tente de
        // novo" — o botão faria exatamente o mesmo 401.
        if (erro instanceof ApiError && erro.status === 401) {
          pedirLogin(cartaParaLogin());
        } else {
          toast.error("Erro ao adicionar carta");
        }
      }
    }, 320);
  }

  const setHref =
    tcgSlug && setSlug ? `/sets/${tcgSlug}/${setSlug}` : undefined;

  /* A grade pede _400w: em tile de ~200px numa tela retina, o _200w que vem
     do TCGCSV é esticado ao dobro e fica borrado. A carta aberta usa a
     variante cheia; aqui 180 KB por tile numa lista longa seria desperdício. */

  return (
    // O bg explícito substitui o bg-card do <Card> (utilitário vence a
    // classe .glass-card, que mora em @layer components) — sem ele o card do
    // grid ficava sólido e de outra cor que os painéis (19/10)
    <Card className="group h-full w-full overflow-hidden glass-card bg-[var(--glass-bg)] !rounded-2xl py-0 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/20">
      <CardContent className="relative p-0">
        {/* A arte manda no tile: 4px de respiro só para ela não encostar na
            borda do card (os 8px de antes encolhiam a carta duas vezes — a
            margem, e a altura que sobrava para ela). O raio interno é menor
            que o do card na mesma medida do respiro, senão os dois cantos
            ficam concêntricos errados. */}
        {cardHref ? (
          <Link href={cardHref} className="block overflow-hidden p-1">
            <CardImage
              carta={{ imageUrl, images }}
              tamanho="grade"
              alt={displayName}
              className="aspect-[5/7] w-full rounded-xl object-contain transition-transform duration-300 group-hover:scale-[1.012]"
              width={400}
              height={560}
            />
          </Link>
        ) : (
          <div className="overflow-hidden p-1">
            <CardImage
              carta={{ imageUrl, images }}
              tamanho="grade"
              alt={displayName}
              className="aspect-[5/7] w-full rounded-xl object-contain transition-transform duration-300 group-hover:scale-[1.012]"
              width={400}
              height={560}
            />
          </div>
        )}

        {/* Filtro rápido: no hover aparece um botão no canto da arte que
            filtra o Explorar pelo nome, coleção, raridade ou jogo desta carta,
            sem abrir a barra de filtros (23/10). Só em tela com mouse: no
            toque não há hover, e um botão fixo em cada carta poluiria a grade
            de duas colunas. O menu vai num portal, mas o clique ainda sobe
            pela árvore do React até o Link da carta; o stopPropagation segura
            a navegação. */}
        {filtrosRapidos && filtrosRapidos.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Filtrar por esta carta"
                title="Filtrar por esta carta"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="absolute top-2.5 right-2.5 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white opacity-0 shadow-sm backdrop-blur-md transition-opacity duration-150 hover:bg-black/70 focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:hidden"
              >
                <IconFilter className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-60"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Filtrar por
              </DropdownMenuLabel>
              {filtrosRapidos.map((filtro) => (
                <DropdownMenuItem
                  key={filtro.rotulo}
                  onSelect={filtro.aplicar}
                  className="flex cursor-pointer flex-col items-start gap-0"
                >
                  <span className="text-xs text-muted-foreground">
                    {filtro.rotulo}
                  </span>
                  <span className="w-full truncate font-medium">
                    {filtro.valor}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardContent>

      <div className="space-y-1 p-2.5">
        {/* Uma linha só: o min-h de duas linhas reservava espaço vazio em
            toda carta de nome curto, e era esse espaço que empurrava a arte
            para cima e a deixava pequena. */}
        {cardHref ? (
          <Link href={cardHref}>
            <h3 className="truncate text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary">
              {displayName}
            </h3>
          </Link>
        ) : (
          <h3 className="truncate text-sm font-semibold leading-snug text-foreground">
            {displayName}
          </h3>
        )}

        {setName &&
          (setHref ? (
            <Link
              href={setHref}
              onClick={(e) => e.stopPropagation()}
              className="block truncate text-xs leading-tight text-tertiary underline decoration-tertiary/40 underline-offset-2 transition-colors hover:text-tertiary-hover hover:decoration-current"
            >
              {setName}
            </Link>
          ) : (
            <p className="truncate text-xs leading-tight text-tertiary">
              {setName}
            </p>
          ))}

        {(rarity || collectorNumber) && (
          // Linha de apoio, toda no mesmo cinza: o código em negrito e quase
          // branco competia com o nome e o preço (22/10).
          <p className="truncate text-[11px] leading-tight text-muted-foreground">
            {rarity && nomeDaRaridade(rarity, tcgSlug)}
            {rarity && collectorNumber && " · "}
            {collectorNumber && (
              <span className="font-mono tracking-tight">
                {collectorNumber}
              </span>
            )}
          </p>
        )}

        <div className="flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            {/* O "R$" quebrava longe do número no celular e, com preço de
                sete dígitos, também na grade de 5 colunas: o preço fica
                inteiro e a variação desce para a linha de baixo se não couber */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0">
              <span className="whitespace-nowrap font-mono text-sm font-bold text-foreground">
                R$ {price}
              </span>
              <span className="flex items-center gap-1.5">
                {/* Só o percentual no tile: o valor absoluto junto virava uma
                  linha longa que truncava em grade de 5 colunas. Ele continua
                  inteiro na página da carta. */}
                {/* A seta fica: quem não distingue verde de vermelho lê a
                  direção pela forma, não só pela cor. */}
                {isPositive ? (
                  <IconTrendingUp className="size-3 shrink-0 text-emerald-400" />
                ) : (
                  <IconTrendingDown className="size-3 shrink-0 text-red-400" />
                )}
                <span
                  className={`font-mono text-[11px] ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                  title={
                    priceChange !== undefined
                      ? `${isPositive ? "+" : ""}R$ ${formatPrice(priceChange)}`
                      : undefined
                  }
                >
                  {isPositive ? "+" : ""}
                  {/* Vírgula, como no preço ao lado */}
                  {change.toFixed(2).replace(".", ",")}%
                </span>
              </span>
            </div>
            <span className="block text-[10px] leading-tight text-muted-foreground">
              internacional
            </span>
            {/* O rótulo fica parado; só os algarismos rolam.
                Com carta na coleção o número sai do cinza e vai para o emerald
                — a mesma cor do botão de adicionar. Numa grade de 5 colunas é
                o que responde "eu já tenho essa?" sem ter que ler o número. */}
            <span
              className={`mt-0.5 flex items-center gap-1 font-mono text-[11px] ${
                localQty > 0
                  ? "font-bold text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              Quant.
              <RollingNumber value={localQty} fontSize={11} />
            </span>
          </div>

          {cardId && (
            <AddIconButton
              onClick={handleAdd}
              success={success}
              successId={successId}
              title="Adicionar ao portfólio"
            />
          )}
        </div>
      </div>
    </Card>
  );
}
