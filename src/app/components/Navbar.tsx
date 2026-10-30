"use client";

import {
  IconArrowsExchange,
  IconCards,
  IconCompass,
  IconLogin,
  IconLogout,
  IconMenu,
  IconScan,
  IconSettings,
  IconStack2,
  IconX,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BuscaRapida } from "@/app/components/BuscaRapida";
import {
  FOIL,
  QrDoApp,
  registrarClique,
  SelosLojas,
} from "@/app/components/ConviteApp";
import { CentralDeNotificacoes } from "@/app/components/social/CentralDeNotificacoes";
import { DialogoSair } from "@/components/DialogoSair";
import { AvatarDoUsuario } from "@/components/FotoDoUsuario";
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
import { useSession } from "@/lib/auth-client";
import { useExploreHref } from "@/lib/explore-href";
import { navbarRolada } from "@/lib/navbar-rolada";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Explorar", href: "/explore", icon: IconCompass },
  { label: "Portfólio", href: "/portfolio", icon: IconCards },
  { label: "Sets", href: "/sets", icon: IconStack2 },
  // Analisador de troca (30/10)
  { label: "Troca justa", href: "/troca", icon: IconArrowsExchange },
];

/**
 * Item do menu lateral: o mesmo desenho para a navegação e para a conta
 * (Configurações, Sair), que só mudam de grupo.
 */
function classeDoItem(ativo: boolean) {
  return cn(
    "group flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all",
    ativo
      ? "border border-primary/20 bg-primary/10 text-primary shadow-xs"
      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
  );
}

function classeDoIcone(ativo: boolean) {
  return cn(
    "size-5 transition-transform group-hover:scale-105",
    ativo
      ? "text-primary"
      : "text-muted-foreground group-hover:text-foreground",
  );
}

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
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { data: session } = useSession();
  const handle = (session?.user as { handle?: string | null } | undefined)
    ?.handle;

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
            ? "top-3 w-[calc(100%-16px)] rounded-2xl border border-border bg-[var(--glass-bg)] py-2 shadow-[0_8px_28px_rgba(2,6,23,0.18)] backdrop-blur-xl backdrop-saturate-150 md:w-[min(1040px,calc(100%-32px))]"
            : "top-0 w-full bg-transparent py-2.5 md:py-3",
        )}
      >
        {/*
          Sem rolagem, a navbar compartilha o contêiner do conteúdo
          (max-w-screen-2xl + px iguais aos do <main>). Antes ela era w-full com
          px-10: numa tela larga o logo começava a 40px da borda enquanto o
          conteúdo começava a ~150px, e as duas bordas nunca se encontravam.

          Com rolagem ela vira a pílula flutuante de 1040px, que tem centro
          próprio — aí o contêiner não se aplica.
        */}
        <div
          className={cn(
            "flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]",
            // Limite de largura e respiro lateral iguais nos dois estados
            // (24/10): tirá-los ao rolar fazia o conteúdo se espalhar até a
            // borda da tela antes de a barra encolher e voltar com ela — o
            // "travando" da troca. Assim só a barra anima, e o conteúdo vai
            // junto, sem vaivém. Na pílula (1040 px) o limite não limita nada.
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
                className="w-80 max-w-[85vw] gap-0 border-r border-border/50 bg-background/95 backdrop-blur-2xl p-0 flex flex-col h-full overflow-hidden"
                showCloseButton={false}
              >
                {/* Cabeçalho com logo oficial e botão fechar */}
                <SheetHeader className="border-b border-border/50 px-5 pt-5 pb-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {/* biome-ignore lint/performance/noImgElement: logo */}
                      <img
                        src="/landing/logo-m.png"
                        alt=""
                        width={24}
                        height={24}
                        className="size-6"
                      />
                      <SheetTitle className="leading-none">
                        <span
                          className="select-none text-base font-extrabold uppercase tracking-[0.15em] text-foreground"
                          style={{ fontFamily: WORDMARK_FONT }}
                        >
                          Mint <span className="foil-text">Foil</span>
                        </span>
                      </SheetTitle>
                    </div>
                    <SheetClose asChild>
                      <button
                        type="button"
                        className="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                        aria-label="Fechar menu"
                      >
                        <IconX className="size-4.5" />
                      </button>
                    </SheetClose>
                  </div>
                </SheetHeader>

                {/* Conteúdo rolável para telas de qualquer altura */}
                <div className="flex-1 overflow-y-auto">
                  {/* Quem está logado: só identificação, sem link — o Portfólio
                      (que na web é o perfil) já está na lista logo abaixo, e
                      dois caminhos para o mesmo lugar confundiam (30/10) */}
                  {session?.user ? (
                    <div className="border-b border-border/50 p-3">
                      <div className="flex items-center gap-3 px-1.5 py-1">
                        <AvatarDoUsuario user={session.user} tamanho={36} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-foreground">
                            {session.user.name ?? "Minha conta"}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {handle ? `@${handle}` : session.user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-b border-border/50 p-3">
                      <SheetClose asChild>
                        <Link
                          href="/login"
                          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-white shadow-xs transition-colors hover:bg-primary/90"
                        >
                          <IconLogin className="size-4" />
                          <span>Entrar na sua conta</span>
                        </Link>
                      </SheetClose>
                    </div>
                  )}

                  {/* Navegação */}
                  <nav className="flex flex-col gap-1 p-3">
                    {navLinks.map((link) => {
                      const active = isLinkActive(pathname, link.href);
                      return (
                        <SheetClose key={link.label} asChild>
                          <Link
                            href={destino(link.href)}
                            className={classeDoItem(active)}
                          >
                            <link.icon className={classeDoIcone(active)} />
                            <span>{link.label}</span>
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </nav>

                  {/* Seção de Aparência com controle segmentado de 3 opções */}
                  <div className="border-t border-border/50 px-4 py-4">
                    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      Aparência
                    </p>
                    <SeletorTema />
                  </div>

                  {/* Conta: separada da navegação, e o Sair (que pede
                      confirmação) por último, longe dos links do dia a dia */}
                  {session?.user && (
                    <div className="flex flex-col gap-1 border-t border-border/50 p-3">
                      <SheetClose asChild>
                        <Link
                          href="/settings"
                          className={classeDoItem(
                            isLinkActive(pathname, "/settings"),
                          )}
                        >
                          <IconSettings
                            className={classeDoIcone(
                              isLinkActive(pathname, "/settings"),
                            )}
                          />
                          <span>Configurações</span>
                        </Link>
                      </SheetClose>
                      <button
                        type="button"
                        onClick={() => setLogoutDialogOpen(true)}
                        className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                      >
                        <IconLogout className="size-5 text-muted-foreground transition-transform group-hover:scale-105 group-hover:text-destructive" />
                        <span>Sair da conta</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Rodapé fixo com o banner do app */}
                <div className="border-t border-border/50 bg-background/80 p-3.5 pb-5 shrink-0">
                  {/* Banner Foil do App */}
                  <div
                    className="relative w-full overflow-hidden rounded-2xl p-[1.5px]"
                    style={{
                      background: FOIL,
                      backgroundSize: "200% 200%",
                      animation: "mfFoilShift 7s linear infinite",
                      boxShadow: "0 8px 24px rgba(248, 86, 167, 0.15)",
                    }}
                  >
                    <div className="convite-banner relative overflow-hidden rounded-[calc(var(--radius-2xl)-1.5px)] p-3.5">
                      <div className="relative z-10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="foil-text text-[9px] font-extrabold tracking-[2px] uppercase">
                            APP MINT FOIL
                          </span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            Grátis
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-extrabold leading-tight text-foreground">
                            Adicione cartas pela câmera
                          </p>
                          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                            Várias numa foto só, sem digitar nada.
                          </p>
                        </div>
                        <SheetClose asChild>
                          <Link
                            href="/download"
                            onClick={() =>
                              registrarClique("menu-mobile", "download")
                            }
                            className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-bold text-white shadow-xs transition-colors hover:bg-primary/90 active:scale-95"
                          >
                            <IconScan className="size-4" />
                            <span>Baixar o app</span>
                          </Link>
                        </SheetClose>
                      </div>
                    </div>
                  </div>
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
                  {/* Entre 768 e 1023 só o ícone: com o texto a navbar não
                      cabia numa linha e o Entrar descia (30/10) */}
                  <span className="max-lg:sr-only">Baixar o app</span>
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
                    Aponte a câmera para o código e baixe o Mint Foil. São 50
                    scans grátis por semana.
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
            {/* flex: sem conta são dois botões (tema e Entrar), que num bloco
                quebravam linha quando a coluna apertava (30/10) */}
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      <DialogoSair open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />
    </>
  );
}
