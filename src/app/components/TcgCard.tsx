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
import { cn } from "@/lib/utils";

export interface TcgCardProps {
  name: string;
  /** Nome PT oficial (BR): exibido no lugar do EN quando presente. */
  namePt?: string | null;
  price: string;
  priceChange?: number;
  imageUrl: string;
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

  return (
    <Card className="group w-full h-full overflow-hidden glass-card !rounded-2xl shadow-none hover:bg-muted/30 transition-all duration-300 hover:-translate-y-1 py-0">
      <CardContent className="p-0 flex-1">
        {cardHref ? (
          <Link href={cardHref} className="block overflow-hidden p-2">
            <Image
              src={imageUrl}
              alt={displayName}
              className="w-full rounded-xl aspect-[5/7] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              width={200}
              height={200}
            />
          </Link>
        ) : (
          <div className="overflow-hidden p-2">
            <Image
              src={imageUrl}
              alt={displayName}
              className="w-full rounded-xl aspect-[5/7] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              width={200}
              height={200}
            />
          </div>
        )}
      </CardContent>

      <div className="p-3 space-y-1">
        {cardHref ? (
          <Link href={cardHref}>
            <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 min-h-[3.1rem] hover:text-primary transition-colors">
              {displayName}
            </h3>
          </Link>
        ) : (
          <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 min-h-[3.1rem]">
            {displayName}
          </h3>
        )}
        {setName && (
          <>
            {setHref ? (
              <Link
                href={setHref}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-tertiary hover:text-tertiary-hover underline underline-offset-2 truncate leading-tight block transition-colors"
              >
                {setName}
              </Link>
            ) : (
              <p className="text-xs text-tertiary truncate leading-tight">
                {setName}
              </p>
            )}
          </>
        )}

        <p className="text-[10px] leading-tight">
          {rarity && <span className="text-muted-foreground">{rarity}</span>}
          {rarity && collectorNumber && (
            <span className="text-muted-foreground"> • </span>
          )}
          {collectorNumber ? (
            <span className="font-mono font-bold text-foreground/85 tracking-tight">
              {collectorNumber}
            </span>
          ) : (
            !rarity && <span className="text-muted-foreground">{setName}</span>
          )}
        </p>
        <div className="pt-1.5 border-t border-border space-y-0.5 flex justify-between">
          <div className="flex flex-col items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-foreground font-mono">
                R$ {price}
              </span>
              <span className="text-[9px] text-muted-foreground leading-tight">
                internacional
              </span>
            </div>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <IconTrendingUp className="size-3 text-emerald-400 shrink-0" />
              ) : (
                <IconTrendingDown className="size-3 text-red-400 shrink-0" />
              )}
              <span
                className={`text-[10px] font-mono ${isPositive ? "text-emerald-400" : "text-red-400"}`}
              >
                {priceChange !== undefined
                  ? `${isPositive ? "+" : ""}R$ ${formatPrice(priceChange)} (${isPositive ? "+" : ""}${change.toFixed(2)}%)`
                  : `${isPositive ? "+" : ""}${change.toFixed(2)}%`}
              </span>
            </div>
            {/* O rótulo fica parado; só os algarismos rolam */}
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
              Quant.
              <RollingNumber value={localQty} fontSize={10} />
            </span>
          </div>

          <div className="flex items-end">
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
      </div>
    </Card>
  );
}
