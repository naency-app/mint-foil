"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AddIconButton } from "@/app/components/AddIconButton";
import { RollingNumber } from "@/app/components/RollingNumber";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { imagemDaCarta } from "@/lib/card-image";

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
}: TcgCardProps) {
  const displayName = namePt?.trim() || name;
  const isPositive = change >= 0;
  const [localQty, setLocalQty] = useState(quantity);
  const [success, setSuccess] = useState(false);
  // Troca a cada confirmação para remontar a animação e ela rodar de novo
  const [successId, setSuccessId] = useState(0);
  const router = useRouter();
  const { data: session } = useSession();
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

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!cardId) return;
    if (!defaultPortfolioId) {
      // Sem portfólio ativo: só é login se realmente não estiver logado.
      if (!session?.user) {
        router.push("/login");
      } else {
        toast.error("Selecione um portfólio para adicionar");
      }
      return;
    }

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
          portfolioId,
        });
        if (onAdd) onAdd();
        toast.success(
          qty > 1
            ? `+${qty} adicionadas ao portfólio!`
            : "Adicionado ao portfólio!",
        );
      } catch {
        // Falhou: desfaz o incremento otimista
        setLocalQty((prev) => Math.max(0, prev - qty));
        setSuccess(false);
        toast.error("Erro ao adicionar carta");
      }
    }, 320);
  }

  const setHref =
    tcgSlug && setSlug ? `/sets/${tcgSlug}/${setSlug}` : undefined;

  /*

    A grade pede _400w: em tile de ~200px numa tela retina, o _200w que vem do

    TCGCSV é esticado ao dobro e fica borrado. A carta aberta usa a variante

    cheia; aqui 180 KB por tile numa lista longa seria desperdício.

  */

  const imagemDaGrade =
    imagemDaCarta({ imageUrl, images }, "grade") ?? imageUrl;

  return (
    <Card className="group h-full w-full overflow-hidden glass-card !rounded-2xl py-0 shadow-none transition-all duration-300 hover:-translate-y-1 hover:bg-muted/30">
      <CardContent className="relative p-0">
        {/* A arte manda no tile: 4px de respiro só para ela não encostar na
            borda do card (os 8px de antes encolhiam a carta duas vezes — a
            margem, e a altura que sobrava para ela). O raio interno é menor
            que o do card na mesma medida do respiro, senão os dois cantos
            ficam concêntricos errados. */}
        {cardHref ? (
          <Link href={cardHref} className="block overflow-hidden p-1">
            <Image
              src={imagemDaGrade}
              alt={displayName}
              className="aspect-[5/7] w-full rounded-xl object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              width={400}
              height={560}
            />
          </Link>
        ) : (
          <div className="overflow-hidden p-1">
            <Image
              src={imagemDaGrade}
              alt={displayName}
              className="aspect-[5/7] w-full rounded-xl object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              width={400}
              height={560}
            />
          </div>
        )}
      </CardContent>

      <div className="space-y-1 p-2.5">
        {/* Uma linha só: o min-h de duas linhas reservava espaço vazio em
            toda carta de nome curto, e era esse espaço que empurrava a arte
            para cima e a deixava pequena. */}
        {cardHref ? (
          <Link href={cardHref}>
            <h3 className="truncate text-sm font-bold leading-snug text-foreground transition-colors hover:text-primary">
              {displayName}
            </h3>
          </Link>
        ) : (
          <h3 className="truncate text-sm font-bold leading-snug text-foreground">
            {displayName}
          </h3>
        )}

        {setName &&
          (setHref ? (
            <Link
              href={setHref}
              onClick={(e) => e.stopPropagation()}
              className="block truncate text-[11px] leading-tight text-tertiary underline underline-offset-2 transition-colors hover:text-tertiary-hover"
            >
              {setName}
            </Link>
          ) : (
            <p className="truncate text-[11px] leading-tight text-tertiary">
              {setName}
            </p>
          ))}

        {(rarity || collectorNumber) && (
          <p className="truncate text-[10px] leading-tight">
            {rarity && <span className="text-muted-foreground">{rarity}</span>}
            {rarity && collectorNumber && (
              <span className="text-muted-foreground"> • </span>
            )}
            {collectorNumber && (
              <span className="font-mono font-bold tracking-tight text-foreground/85">
                {collectorNumber}
              </span>
            )}
          </p>
        )}

        <div className="flex items-end justify-between gap-2 border-t border-border pt-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-bold text-foreground">
                R$ {price}
              </span>
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
                className={`font-mono text-[10px] ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                title={
                  priceChange !== undefined
                    ? `${isPositive ? "+" : ""}R$ ${formatPrice(priceChange)}`
                    : undefined
                }
              >
                {isPositive ? "+" : ""}
                {change.toFixed(2)}%
              </span>
            </div>
            <span className="block text-[9px] leading-tight text-muted-foreground">
              internacional
            </span>
            {/* O rótulo fica parado; só os algarismos rolam */}
            <span className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              Quant.
              <RollingNumber value={localQty} fontSize={10} />
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
