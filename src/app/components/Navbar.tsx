"use client";

import {
  IconCards,
  IconCompass,
  IconMenu,
  IconScan,
  IconStack2,
  IconX,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BuscaRapida } from "@/app/components/BuscaRapida";
import { QrDoApp, SelosLojas } from "@/app/components/ConviteApp";
import { CentralDeNotificacoes } from "@/app/components/social/CentralDeNotificacoes";
import { SeletorTema } from "@/components/SeletorTema";
import { UserMenu } from "@/components/UserMenu";
import { BotaoFoil } from "@/components/ui/botao-foil";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useExploreHref } from "@/lib/explore-href";
import { navbarRolada } from "@/lib/navbar-rolada";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Explorar", href: "/explore", icon: IconCompass },
  { label: "Portfólio", href: "/portfolio", icon: IconCards },
  { label: "Sets", href: "/sets", icon: IconStack2 },
];

// Mesma cara do wordmark da landing: fonte do sistema, peso 800, caixa alta
const WORDMARK_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif';

function isLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Padrão da nav da landing: parada no topo, vira pill flutuante ao rolar
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const fn = () =>
      setScrolled((antes) => navbarRolada(antes, window.scrollY));
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const activeHref =
    navLinks.find((l) => isLinkActive(pathname, l.href))?.href ?? null;
  // Pill desliza pro link com hover; sem hover, marca o ativo
  const pillOn = hovered ?? activeHref;

  // "Explorar" volta para a última busca filtrada, não para o Explore vazio.
  // A identidade do link continua sendo o href base (`/explore`) — é ele que
  // governa pill, hover e estado ativo; só o destino da navegação muda.
  const exploreHref = useExploreHref();
  const destino = (href: string) => (href === "/explore" ? exploreHref : href);

  return (
    <>
      <nav
        className={cn(
          // Só o que muda de verdade anima (24/10). O `transition-all` animava
          // também o desfoque de fundo, caro de redesenhar a cada quadro.
          "fixed left-1/2 z-50 -translate-x-1/2 transition-[top,width,padding,border-radius,background-color,border-color,box-shadow] duration-300 ease-out",
          scrolled
            ? "top-3 w-[calc(100%-16px)] rounded-2xl border border-border bg-[var(--glass-bg)] py-1.5 shadow-[0_8px_28px_rgba(2,6,23,0.18)] backdrop-blur-xl backdrop-saturate-150 md:w-[min(880px,calc(100%-32px))]"
            : "top-0 w-full bg-transparent py-2.5 md:py-3",
        )}
      >
        {/*
          Sem rolagem, a navbar compartilha o contêiner do conteúdo
          (max-w-screen-2xl + px iguais aos do <main>). Antes ela era w-full com
          px-10: numa tela larga o logo começava a 40px da borda enquanto o
          conteúdo começava a ~150px, e as duas bordas nunca se encontravam.

          Com rolagem ela vira a pílula flutuante de 880px, que tem centro
          próprio — aí o contêiner não se aplica.
        */}
        <div
          className={cn(
            "flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]",
            // Limite de largura e respiro lateral iguais nos dois estados
            // (24/10): tirá-los ao rolar fazia o conteúdo se espalhar até a
            // borda da tela antes de a barra encolher e voltar com ela — o
            // "travando" da troca. Assim só a barra anima, e o conteúdo vai
            // junto, sem vaivém. Na pílula (880 px) o limite não limita nada.
            "mx-auto w-full max-w-screen-2xl px-4 sm:px-6",
          )}
        >
          {/* ── Esquerda: hambúrguer (mobile) + logo ── */}
          <div className="flex items-center gap-2 md:justify-self-start">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex size-[30px] cursor-pointer items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary md:hidden"
                  aria-label="Abrir menu"
                >
                  <IconMenu className="size-4" />
                </button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-72 gap-0 border-border bg-background p-0"
                showCloseButton={false}
              >
                <SheetHeader className="border-b border-border px-5 pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <SheetTitle>
                      <span
                        className="select-none text-lg font-extrabold uppercase tracking-[0.15em] text-foreground"
                        style={{ fontFamily: WORDMARK_FONT }}
                      >
                        Mint <span className="foil-text">Foil</span>
                      </span>
                    </SheetTitle>
                    <SheetClose asChild>
                      <button
                        type="button"
                        className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Fechar menu"
                      >
                        <IconX className="size-5" />
                      </button>
                    </SheetClose>
                  </div>
                </SheetHeader>

                {/* Itens em pílula com ícone, como o dock do app: a faixa de
                    largura inteira com risco na borda parecia lista de
                    configurações (21/10) */}
                <nav className="flex flex-col gap-1 p-3">
                  {navLinks.map((link) => {
                    const active = isLinkActive(pathname, link.href);
                    return (
                      <SheetClose key={link.label} asChild>
                        <Link
                          href={destino(link.href)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <link.icon className="size-5" />
                          {link.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>

                <div className="border-t border-border px-5 py-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Aparência
                  </p>
                  <SeletorTema />
                </div>

                {/* Convite pro app no pé do menu: no celular é o caminho do
                    scan, e o selo leva direto à loja */}
                <div className="mt-auto space-y-3 border-t border-border px-5 py-5">
                  <p className="text-sm font-bold text-foreground">
                    Escaneie suas cartas pelo app
                  </p>
                  <SelosLojas tamanho={116} origem="menu-mobile" />
                </div>
              </SheetContent>
            </Sheet>

            {/* Esta barra só existe nas páginas do app (a landing tem a
                dela): o logo recarrega o Explorar, do zero e sem filtros,
                em vez de mandar de volta para a landing. <a> e não <Link>
                de propósito: o pedido é recarregar a página. */}
            <a
              href="/explore"
              className="flex items-center gap-2"
              aria-label="Mint Foil — Início"
            >
              {/* biome-ignore lint/performance/noImgElement: logo local pequeno, sem necessidade de next/image */}
              <img
                src="/landing/logo-m.png"
                alt=""
                width={28}
                height={28}
                className={cn(
                  "block transition-all duration-300",
                  scrolled ? "size-6" : "size-7",
                )}
              />
              <span
                className={cn(
                  "select-none font-extrabold uppercase tracking-[0.15em] text-foreground transition-all duration-300",
                  scrolled ? "text-[13px]" : "text-[15px]",
                )}
                style={{ fontFamily: WORDMARK_FONT }}
              >
                Mint <span className="foil-text">Foil</span>
              </span>
            </a>
          </div>

          {/* ── Centro: links com pill deslizante (padrão landing) ── */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: onMouseLeave só reseta o hover visual da pill; navegação fica nos <Link> */}
          <div
            className="hidden items-center gap-0.5 md:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {navLinks.map((link) => {
              const on = pillOn === link.href;
              return (
                <Link
                  key={link.href}
                  href={destino(link.href)}
                  onMouseEnter={() => setHovered(link.href)}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-base font-medium transition-colors duration-150",
                    on ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="app-nav-pill"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 32,
                      }}
                      className="absolute inset-0 z-0 rounded-full bg-muted/70"
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* ── Direita: busca, baixar o app, usuário ── */}
          <div className="flex items-center gap-2 md:justify-self-end">
            {/* Busca rápida: ⌘K / Ctrl+K de qualquer página */}
            <BuscaRapida />
            {/*
              O scan só existe no app: a web precisa apontar pra ele de onde
              der. No celular quem convida é a faixa do rodapé (AbrirNoApp),
              que tem espaço pro recado inteiro — aqui seria só aperto.
            */}
            <Popover>
              <PopoverTrigger asChild>
                {/* Chamada, não botão comum: o BotaoFoil é a ação principal do sistema */}
                <BotaoFoil
                  className={cn(
                    // Nunca em duas linhas: em janela média ele quebrava
                    "hidden shrink-0 whitespace-nowrap md:inline-flex",
                    scrolled && "h-8 text-[13px]",
                  )}
                >
                  <IconScan />
                  Baixar o app
                </BotaoFoil>
              </PopoverTrigger>
              {/* No computador, o QR leva o download pro celular sem sair do
                  site — antes o botão trocava de página e a pessoa perdia o
                  que estava vendo. */}
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-72 space-y-3 rounded-2xl p-5 text-center"
              >
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Escaneie suas cartas pelo celular
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Aponte a câmera para o código e baixe o Mint Foil. São 10
                    scans grátis por dia.
                  </p>
                </div>
                <QrDoApp className="mx-auto size-40" />
                <SelosLojas
                  className="justify-center gap-2"
                  tamanho={120}
                  origem="navbar"
                />
                <Link
                  href="/download"
                  className="inline-block text-xs font-semibold text-primary hover:underline"
                >
                  Ver tudo o que o app faz
                </Link>
              </PopoverContent>
            </Popover>

            {/* Sino da central de notificações: só com sessão */}
            <CentralDeNotificacoes />
            <UserMenu />
          </div>
        </div>
      </nav>
    </>
  );
}
