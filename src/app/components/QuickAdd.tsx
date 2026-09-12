"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { CardImage } from "@/app/components/CardImage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { resolveActiveId, usePortfolioStore } from "@/lib/portfolio-store";
import { useInvalidateCollection } from "@/lib/queries";

/**
 * "Entrar para adicionar": o que acontece quando alguém deslogado toca no +.
 *
 * Antes o clique ou jogava a pessoa direto no /login — perdendo a carta que ela
 * queria — ou tentava gravar e caía num "Erro ao adicionar carta", que é mentira:
 * não houve erro, faltou conta. Aqui ela vê a carta que escolheu, entende que
 * precisa entrar, e ao voltar do login a carta é adicionada sozinha.
 */
export interface CartaQuickAdd {
  id: string;
  name: string;
  namePt?: string | null;
  imageUrl: string;
  images?: { thumb: string; grid: string; full: string } | null;
  setName?: string | null;
  rarity?: string | null;
  collectorNumber?: string | null;
  /** Já formatado em pt-BR, como no card. */
  price: string;
  change: number;
}

/** Onde a intenção espera o login. Curto de propósito — ver PRAZO. */
const CHAVE = "quick_add_pendente";
/** Meia hora: depois disso a pessoa não lembra mais o que estava adicionando. */
const PRAZO = 30 * 60 * 1000;

interface QuickAddContext {
  pedirLogin: (carta: CartaQuickAdd) => void;
}

const Ctx = createContext<QuickAddContext | null>(null);

/**
 * Disponível em toda a área logada. Quem chama `pedirLogin` não precisa saber
 * nada sobre login, retomada ou portfólio.
 */
export function useQuickAdd(): QuickAddContext {
  const ctx = useContext(Ctx);
  // Fora do provider vira no-op em vez de quebrar a tela: nenhum botão de
  // adicionar vale derrubar a página.
  return ctx ?? { pedirLogin: () => {} };
}

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [carta, setCarta] = useState<CartaQuickAdd | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const invalidateCollection = useInvalidateCollection();
  const storeActiveId = usePortfolioStore((s) => s.activeId);
  const favoriteIds = usePortfolioStore((s) => s.favoriteIds);
  // Uma retomada por sessão de página: sem isto, uma revalidação do session
  // dispararia a adição de novo.
  const retomando = useRef(false);

  const pedirLogin = useCallback((c: CartaQuickAdd) => setCarta(c), []);

  function entrar() {
    if (!carta) return;
    try {
      localStorage.setItem(
        CHAVE,
        JSON.stringify({
          cardId: carta.id,
          nome: carta.namePt?.trim() || carta.name,
          quando: Date.now(),
        }),
      );
    } catch {
      // Navegador sem storage (aba anônima restrita): ainda dá para logar, só
      // não dá para retomar. Melhor entrar do que travar no diálogo.
    }
    router.push("/login");
  }

  // Voltou do login com uma carta pendente: adiciona e avisa.
  useEffect(() => {
    if (!session?.user || retomando.current) return;

    let pendente: { cardId: string; nome: string; quando: number } | null =
      null;
    try {
      const cru = localStorage.getItem(CHAVE);
      if (!cru) return;
      pendente = JSON.parse(cru);
      // Some antes de tentar: se a gravação falhar, a pessoa vê o erro uma vez
      // e não fica com uma adição fantasma perseguindo toda navegação.
      localStorage.removeItem(CHAVE);
    } catch {
      return;
    }
    if (!pendente?.cardId || Date.now() - pendente.quando > PRAZO) return;

    retomando.current = true;
    (async () => {
      try {
        const portfolios = await api.collection.portfolios();
        // Sem portfólio, manda sem `portfolioId`: o servidor resolve (toda
        // conta nasce com o "Principal", e o que não tiver ganha um na hora).
        // Pedir "crie um portfólio" era empurrar burocracia para quem acabou
        // de criar a conta só para guardar uma carta.
        const alvo = resolveActiveId(portfolios, storeActiveId, favoriteIds);
        await api.collection.add({
          cardId: pendente.cardId,
          quantity: 1,
          condition: "NM",
          ...(alvo ? { portfolioId: alvo } : {}),
        });
        await invalidateCollection();
        toast.success(`${pendente.nome} adicionada ao portfólio!`);
      } catch {
        toast.error("Não consegui adicionar a carta. Tente de novo.");
      }
    })();
  }, [session, storeActiveId, favoriteIds, invalidateCollection]);

  const positiva = (carta?.change ?? 0) >= 0;

  return (
    <Ctx.Provider value={{ pedirLogin }}>
      {children}

      <Dialog open={carta !== null} onOpenChange={(o) => !o && setCarta(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar à coleção</DialogTitle>
          </DialogHeader>

          {carta && (
            <>
              <div className="flex gap-4">
                <CardImage
                  carta={carta}
                  tamanho="grade"
                  alt={carta.namePt?.trim() || carta.name}
                  width={200}
                  height={280}
                  className="w-24 shrink-0 rounded-xl object-contain"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-bold leading-snug text-foreground">
                    {carta.namePt?.trim() || carta.name}
                  </p>
                  {carta.setName && (
                    <p className="truncate text-xs text-tertiary">
                      {carta.setName}
                    </p>
                  )}
                  {(carta.rarity || carta.collectorNumber) && (
                    <p className="truncate text-[11px] text-muted-foreground">
                      {carta.rarity}
                      {carta.rarity && carta.collectorNumber && " • "}
                      {carta.collectorNumber && (
                        <span className="font-mono font-bold text-foreground/85">
                          {carta.collectorNumber}
                        </span>
                      )}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="font-mono text-base font-bold text-foreground">
                      R$ {carta.price}
                    </span>
                    {positiva ? (
                      <IconTrendingUp className="size-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <IconTrendingDown className="size-3.5 shrink-0 text-red-400" />
                    )}
                    <span
                      className={`font-mono text-[11px] ${positiva ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {positiva ? "+" : ""}
                      {carta.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-4">
                <p className="text-sm font-bold text-foreground">Coleção</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Entre para guardar esta carta e acompanhar o preço dela.
                </p>
                <Button className="mt-3 w-full" onClick={entrar}>
                  <LogIn className="size-4" />
                  Entrar para adicionar
                </Button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Assim que você entrar, ela entra no seu portfólio.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}
