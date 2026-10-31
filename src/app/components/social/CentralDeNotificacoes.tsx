"use client";

import {
  IconBell,
  IconSpeakerphone,
  IconTrendingUp,
  IconX,
} from "@tabler/icons-react";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EstadoVazio } from "@/components/EstadoVazio";
import { FotoDoUsuario } from "@/components/FotoDoUsuario";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type AppNotification, api, type NotificationPage } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  useInvalidateNotifications,
  useNotifications,
  useUnreadNotifications,
} from "@/lib/queries";

/** "agora", "há 5 min", "há 3 h", "há 2 dias", "12 de out." */
function quando(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d} ${d === 1 ? "dia" : "dias"}`;
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });
}

/** Para onde o aviso leva — o mesmo destino do app, nas rotas da web. */
function destino(
  n: AppNotification,
): { href: string; externo?: boolean } | null {
  const d = n.data ?? {};
  switch (n.type) {
    case "FOLLOW_REQUEST":
      // Os pedidos ficam no próprio perfil (botão "Pedidos" do Portfólio)
      return { href: "/portfolio" };
    case "FOLLOW_ACCEPTED":
    case "NEW_FOLLOWER":
      return d.handle ? { href: `/showcase/profile/${d.handle}` } : null;
    case "PRICE_ALERT":
    case "PRICE_RISE":
      return d.cardId ? { href: `/card/${d.cardId}` } : null;
    case "ANNOUNCEMENT":
      return d.url ? { href: d.url, externo: true } : null;
  }
}

function Visual({ n }: { n: AppNotification }) {
  const d = n.data ?? {};
  if (n.type === "PRICE_ALERT" || n.type === "PRICE_RISE") {
    const src = d.images?.thumb ?? d.imageUrl;
    if (src)
      return (
        // Miniatura de 32px vinda do CDN de cartas (o otimizador está
        // desligado; <img> evita liberar host por host no next.config)
        // biome-ignore lint/performance/noImgElement: miniatura da carta
        <img
          src={src}
          alt=""
          className="h-11 w-8 shrink-0 rounded object-cover"
          loading="lazy"
        />
      );
  }
  if (
    n.type === "FOLLOW_REQUEST" ||
    n.type === "FOLLOW_ACCEPTED" ||
    n.type === "NEW_FOLLOWER"
  ) {
    return d.image ? (
      <FotoDoUsuario
        src={d.image}
        alt={d.handle ?? ""}
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-full object-cover"
      />
    ) : (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
        {(d.handle ?? "?").charAt(0).toUpperCase()}
      </span>
    );
  }
  const Icone =
    n.type === "ANNOUNCEMENT"
      ? IconSpeakerphone
      : n.type === "PRICE_RISE"
        ? IconTrendingUp
        : IconBell;
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
      <Icone className="size-5 text-primary" />
    </span>
  );
}

/**
 * Central de notificações da web (23/10): o sino ao lado da foto, com a
 * bolinha de não lidas, e a caixa de avisos num painel — o par da tela
 * Notificações do app (mesmas rotas, mesmos tipos, mesmos destinos). Antes a
 * web não mostrava nada: quem recebia um seguidor no app não via o aviso aqui.
 *
 * Abrir o painel marca tudo como lido; os que estavam novos continuam com a
 * bolinha até fechar, para dar para ver o que chegou. Cada aviso sai no ×, e
 * "Limpar notificações" apaga a caixa.
 */
export function CentralDeNotificacoes() {
  const { data: session } = useSession();
  const logado = !!session?.user;
  const [aberto, setAberto] = useState(false);
  // "Limpar notificações" pede confirmação: apagar a caixa não tem volta
  const [confirmarLimpar, setConfirmarLimpar] = useState(false);
  const { data: naoLidas = 0 } = useUnreadNotifications(logado);
  const lista = useNotifications(logado && aberto);
  const invalidar = useInvalidateNotifications();
  const qc = useQueryClient();
  // Os que estavam sem ler quando o painel abriu: a bolinha fica neles até
  // fechar, mesmo depois de o servidor já marcar como lidos
  const novosAoAbrir = useRef<Set<string> | null>(null);

  const itens = lista.data?.pages.flatMap((p) => p.items) ?? [];

  // Abriu e a lista chegou: guarda quem era novo e marca tudo como lido
  useEffect(() => {
    if (!aberto || !lista.data || novosAoAbrir.current) return;
    novosAoAbrir.current = new Set(
      itens.filter((n) => !n.readAt).map((n) => n.id),
    );
    if (novosAoAbrir.current.size > 0 || naoLidas > 0) {
      api.notifications
        .markRead()
        .then(() => qc.setQueryData(["notifications-unread"], { count: 0 }))
        .catch(() => {});
    }
  }, [aberto, lista.data, itens, naoLidas, qc]);

  if (!logado) return null;

  function apagar(id?: string) {
    // Some na hora; o servidor confirma depois
    qc.setQueryData<InfiniteData<NotificationPage>>(
      ["notifications"],
      (antes) =>
        antes && {
          ...antes,
          pages: antes.pages.map((p) => ({
            ...p,
            items: id ? p.items.filter((n) => n.id !== id) : [],
            nextCursor: id ? p.nextCursor : null,
          })),
        },
    );
    api.notifications
      .remove(id)
      .catch(() => toast.error("Não foi possível apagar. Tente de novo."))
      .finally(() => void invalidar());
  }

  return (
    <Popover
      open={aberto}
      onOpenChange={(o) => {
        setAberto(o);
        if (!o) {
          novosAoAbrir.current = null;
          setConfirmarLimpar(false);
          void invalidar();
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            naoLidas > 0 ? `Notificações, ${naoLidas} novas` : "Notificações"
          }
          className="relative flex size-9 cursor-pointer items-center justify-center rounded-full text-foreground hover:bg-muted/60"
        >
          <IconBell className="size-5" />
          {naoLidas > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
              {naoLidas > 9 ? "9+" : naoLidas}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(380px,calc(100vw-24px))] overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-bold text-foreground">Notificações</p>
        </div>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto">
          {lista.isPending ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-3">
                  <span className="size-10 rounded-full bg-muted" />
                  <span className="h-3 flex-1 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : lista.isError ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Não foi possível carregar as notificações.{" "}
              <button
                type="button"
                onClick={() => void lista.refetch()}
                className="cursor-pointer font-semibold text-primary hover:underline"
              >
                Tentar de novo
              </button>
            </div>
          ) : itens.length === 0 ? (
            <EstadoVazio
              icon={IconBell}
              titulo="Nenhuma notificação"
              descricao="Novos seguidores, pedidos e alertas de preço aparecem aqui."
            />
          ) : (
            <ul className="divide-y divide-border">
              {itens.map((n) => {
                const ir = destino(n);
                const novo =
                  novosAoAbrir.current?.has(n.id) ?? n.readAt === null;
                const conteudo = (
                  <>
                    <Visual n={n} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-snug text-foreground">
                        {n.title}
                      </span>
                      {n.body && (
                        <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                          {n.body}
                        </span>
                      )}
                      <span className="mt-1 block text-[11px] text-muted-foreground/70">
                        {quando(n.createdAt)}
                      </span>
                    </span>
                    {novo && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary">
                        <span className="sr-only">nova</span>
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={n.id} className="group relative">
                    {ir ? (
                      <Link
                        href={ir.href}
                        target={ir.externo ? "_blank" : undefined}
                        rel={ir.externo ? "noopener noreferrer" : undefined}
                        onClick={() => setAberto(false)}
                        className="flex items-start gap-3 py-3 pr-10 pl-4 hover:bg-muted/40"
                      >
                        {conteudo}
                      </Link>
                    ) : (
                      <div className="flex items-start gap-3 py-3 pr-10 pl-4">
                        {conteudo}
                      </div>
                    )}
                    <button
                      type="button"
                      aria-label="Apagar notificação"
                      title="Apagar"
                      onClick={() => apagar(n.id)}
                      className="absolute top-3 right-2 flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                    >
                      <IconX className="size-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {lista.hasNextPage && (
            <button
              type="button"
              onClick={() => void lista.fetchNextPage()}
              disabled={lista.isFetchingNextPage}
              className="w-full cursor-pointer border-t border-border py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              {lista.isFetchingNextPage ? "Carregando…" : "Ver mais"}
            </button>
          )}
        </div>

        {itens.length > 0 &&
          !lista.hasNextPage &&
          (confirmarLimpar ? (
            <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2">
              <span className="text-xs text-muted-foreground">
                Apagar todas as notificações?
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setConfirmarLimpar(false)}
                  className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmarLimpar(false);
                    apagar();
                  }}
                  className="cursor-pointer rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive hover:bg-destructive/25 transition-colors"
                >
                  Apagar
                </button>
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmarLimpar(true)}
              className="w-full cursor-pointer border-t border-border py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
            >
              Limpar notificações
            </button>
          ))}
      </PopoverContent>
    </Popover>
  );
}
