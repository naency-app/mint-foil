"use client";

import { IconLineScan, IconX } from "@tabler/icons-react";
import { track } from "@vercel/analytics";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QRCode } from "@/components/ui/qrcode";
import {
  APP_STORE_URL,
  DOWNLOAD_URL,
  PLAY_STORE_URL,
  PUBLICADO_NA_LOJA,
} from "@/lib/app-links";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/**
 * Convites para baixar o app, espalhados pela web onde o app resolve melhor o
 * que a pessoa está fazendo (o scan só existe no app).
 *
 * No desktop o convite é um QR code: quem está no computador aponta o celular
 * e baixa sem sair do site. No celular, onde QR não serve, vira botão.
 *
 * O botão e o QR levam ao /download, que manda o celular para a loja dele
 * quando o app já está publicado lá (hoje, Android) e mostra a página no resto.
 */

/**
 * Clique num convite, no Vercel Analytics: `origem` é onde ele estava
 * (explore, carta, navbar…) e `destino` para onde levou.
 */
export function registrarClique(origem: string, destino: string) {
  track("convite_app", { origem, destino });
}

/**
 * Selos oficiais das duas lojas (os mesmos do ProUpgradeModal).
 *
 * Os SVGs são quadrados, com o selo no meio e margem transparente em cima e
 * embaixo: sem o object-cover numa caixa da proporção do selo, cada um ocupava
 * um quadrado e empurrava o resto pra longe.
 */
export function SelosLojas({
  className,
  tamanho = 150,
  origem = "outro",
}: {
  className?: string;
  /** Largura de cada selo, em px */
  tamanho?: number;
  /** Onde os selos estão, para o Analytics */
  origem?: string;
}) {
  return (
    // items-start: o selo publicado é um link e o "Em breve" é uma coluna
    // com o aviso embaixo; esticados, cada um alinhava de um jeito (19/10).
    <div className={cn("flex items-start gap-3", className)}>
      <SeloLoja loja="ios" tamanho={tamanho} origem={origem} />
      <SeloLoja loja="android" tamanho={tamanho} origem={origem} />
    </div>
  );
}

const SELOS = {
  ios: {
    url: APP_STORE_URL,
    src: "/logos/app-store-apple.svg",
    alt: "Download on the App Store",
    destino: "app-store",
  },
  android: {
    url: PLAY_STORE_URL,
    src: "/logos/app-google-play.svg",
    alt: "Get it on Google Play",
    destino: "google-play",
  },
} as const;

/**
 * Um selo. Antes da loja publicar o app, o link cairia em "app não
 * encontrado": o selo fica apagado, sem link, com "Em breve" embaixo.
 */
function SeloLoja({
  loja,
  tamanho,
  origem,
}: {
  loja: "ios" | "android";
  tamanho: number;
  origem: string;
}) {
  const selo = SELOS[loja];
  const altura = Math.round((tamanho * 44) / 150);
  const imagem = (
    <Image
      src={selo.src}
      alt={selo.alt}
      width={tamanho}
      height={altura}
      style={{ width: tamanho, height: altura, objectFit: "cover" }}
    />
  );

  if (!PUBLICADO_NA_LOJA[loja]) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div className="opacity-50">{imagem}</div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Em breve
        </span>
      </div>
    );
  }

  return (
    <a
      href={selo.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => registrarClique(origem, selo.destino)}
      className="opacity-90 transition-opacity hover:opacity-100"
    >
      {imagem}
    </a>
  );
}

/** QR code que abre a página de download no celular. */
export function QrDoApp({ className }: { className?: string }) {
  // Quadrado branco com módulos escuros, como um QR impresso: a moldura escura
  // de antes (bg-background) fazia o código parecer um buraco na faixa. As
  // cores vão explícitas porque o QRCode só lê oklch dos tokens do tema.
  return (
    <div
      className={cn(
        "shrink-0 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/5",
        className,
      )}
    >
      <QRCode
        data={DOWNLOAD_URL}
        robustness="M"
        foreground="oklch(0.15 0.03 265)"
        background="oklch(1 0 0)"
      />
    </div>
  );
}

/**
 * Degradê foil da marca (o mesmo do banner do Pro na landing, só rosas → roxo
 * → azul). Animado com o keyframe `mfFoilShift` de globals.css.
 */
export const FOIL =
  "linear-gradient(110deg, #B50D57 0%, #D7327F 6%, #F856A7 12%, #FC7DC0 19%, #FF9AD5 26%, #E3A9E9 33%, #C49AFF 40%, #AEADFF 45%, #9AC1FF 50%, #AEADFF 55%, #C49AFF 60%, #E3A9E9 67%, #FF9AD5 74%, #FC7DC0 81%, #F856A7 88%, #D7327F 94%, #B50D57 100%)";

/**
 * Destaque dos convites: a mesma linguagem do card do Pro em Configurações
 * (borda rosa e um degradê leve), por cima do vidro.
 */
const DESTAQUE =
  "border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-tertiary/10";

/** Ícone do convite, com o brilho pulsando como o do card do Pro. */
function IconeConvite({ grande = false }: { grande?: boolean }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15",
        grande ? "size-10" : "size-9",
      )}
    >
      <IconLineScan
        className={cn(
          "animate-pulse text-primary",
          grande ? "size-5" : "size-4",
        )}
      />
    </div>
  );
}

/**
 * Cartão para colunas estreitas (tela da carta): QR e selos no desktop, botão
 * no celular.
 */
export function ConviteAppCartao({
  titulo,
  texto,
}: {
  titulo: string;
  texto: string;
}) {
  return (
    <div className={cn("glass-card !rounded-2xl space-y-4 p-5", DESTAQUE)}>
      <div className="flex items-start gap-3">
        <IconeConvite grande />
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-foreground">{titulo}</h3>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
            {texto}
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <QrDoApp className="size-24" />
        <div className="min-w-0 space-y-2">
          <p className="text-sm leading-snug text-muted-foreground">
            Aponte a câmera do celular.
          </p>
          {/* Lado a lado: empilhados, o "Em breve" do de cima deixava os dois
              desencontrados (19/10). */}
          <SelosLojas
            className="flex-wrap gap-2"
            tamanho={110}
            origem="carta"
          />
        </div>
      </div>

      <div className="space-y-1.5 md:hidden">
        <Button asChild className="w-full">
          <Link
            href="/download"
            onClick={() => registrarClique("carta", "download")}
          >
            <IconLineScan />
            Baixar o app
          </Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          10 scans grátis por dia
        </p>
      </div>
    </div>
  );
}

/** Data local (AAAA-MM-DD): o dia em que o banner foi dispensado. */
function hoje() {
  const d = new Date();
  const dois = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

/**
 * Banner largo, acima de listas (Explorar, Sets, coleção, portfólio): tem que
 * parecer propaganda, não mais um card da página. Dá para dispensar, e o
 * dispensar vale até o fim do dia e só para a conta que fechou: amanhã, ou
 * noutra conta, o convite volta.
 */
export function ConviteAppFaixa({
  id,
  titulo,
  texto,
  className,
}: {
  /** Chave do dispensar — uma por lugar onde a faixa aparece */
  id: string;
  titulo: string;
  texto: string;
  className?: string;
}) {
  const { data: session, isPending } = useSession();
  // Por conta: fechar numa conta não esconde o banner de outra que entre no
  // mesmo navegador. Sem login, a chave é a do visitante anônimo.
  const conta = session?.user?.id ?? "anonimo";
  const chave = `mf:convite-app:${conta}:${id}`;
  // Começa escondida para não piscar antes de ler o storage
  const [dispensada, setDispensada] = useState(true);

  // O × vale pelo resto do dia: guarda a data e o banner volta amanhã.
  useEffect(() => {
    if (isPending) return; // ainda não sabe de quem é a chave
    try {
      setDispensada(localStorage.getItem(chave) === hoje());
    } catch {
      setDispensada(false); // storage bloqueado: mostra assim mesmo
    }
  }, [chave, isPending]);

  function dispensar() {
    setDispensada(true);
    try {
      localStorage.setItem(chave, hoje());
    } catch {
      /* sem storage: volta no próximo carregamento, tudo bem */
    }
  }

  if (dispensada) return null;

  return (
    // Borda foil animada: o fundo do wrapper é o degradê que corre, e o miolo
    // escuro por cima deixa só o fio de 1.5px aparecendo (o banner do Pro da
    // landing faz igual).
    <div
      className={cn("relative rounded-2xl p-[1.5px] shadow-xl", className)}
      style={{
        background: FOIL,
        backgroundSize: "200% 200%",
        animation: "mfFoilShift 7s linear infinite",
        boxShadow: "0 12px 40px rgba(248, 86, 167, 0.18)",
      }}
    >
      {/* Fundo do banner em globals.css (.convite-banner): claro no tema
          claro — escuro ali pesava a página —, escuro no Escuro e no Mint.
          Raio = o de fora menos o fio de 1.5px: com número fixo (14.5px) o
          token cresceu para 18px e o fio engrossava nos cantos. */}
      <div className="convite-banner relative flex items-center gap-5 overflow-hidden rounded-[calc(var(--radius-2xl)-1.5px)] py-5 pr-12 pl-5 sm:pl-6">
        <div className="relative z-10 min-w-0 flex-1">
          <span className="foil-text text-[11px] font-extrabold tracking-[3px]">
            APP MINT FOIL
          </span>
          <h3 className="mt-1.5 text-lg font-extrabold leading-tight tracking-tight text-foreground sm:text-xl">
            {titulo}
          </h3>
          <p className="mt-1 max-w-xl text-[13px] leading-snug text-muted-foreground">
            {texto}
          </p>
          <Button asChild size="sm" className="mt-3.5 md:hidden">
            <Link
              href="/download"
              onClick={() => registrarClique(id, "download")}
            >
              <IconLineScan />
              Baixar o app grátis
            </Link>
          </Button>
        </div>

        {/* Celular com o print real do scan, saindo pela base do banner */}
        <div
          aria-hidden
          className="pointer-events-none relative hidden w-[92px] shrink-0 self-stretch lg:block"
        >
          <div
            className="absolute top-1 left-0 w-[92px] rotate-[8deg] rounded-[18px] border border-white/15 p-[3px]"
            style={{
              background: "linear-gradient(145deg, #1a1a2e 0%, #0d0d1a 100%)",
              boxShadow:
                "0 16px 40px rgba(0,0,0,0.55), 0 0 40px rgba(248,86,167,0.25)",
            }}
          >
            {/* biome-ignore lint/performance/noImgElement: print local do app */}
            <img
              src="/landing/scan-uma.jpg"
              alt=""
              className="block w-full rounded-[15px]"
              style={{ aspectRatio: "720 / 1560" }}
            />
          </div>
        </div>

        {/* QR + lojas (desktop) */}
        <div className="relative z-10 hidden items-center gap-3.5 md:flex">
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">Baixe grátis</p>
            <p className="mt-0.5 mb-2 text-[11px] leading-snug text-muted-foreground">
              Aponte a câmera do celular
            </p>
            <SelosLojas className="gap-1.5" tamanho={96} origem={id} />
          </div>
          <QrDoApp className="size-[84px]" />
        </div>

        <button
          type="button"
          onClick={dispensar}
          aria-label="Dispensar"
          className="absolute top-3 right-3 z-10 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <IconX className="size-4" />
        </button>
      </div>
    </div>
  );
}
