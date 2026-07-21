"use client";

import {
  IconMenu,
  IconMoon,
  IconSearch,
  IconSun,
  IconX,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/UserMenu";
import { Kbd } from "@/components/ui/kbd";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CommandK } from "./CommandK";

const navLinks = [
  { label: "Explorar", href: "/explore" },
  { label: "Portfólio", href: "/portfolio" },
  { label: "Sets", href: "/sets" },
];

const mobileOnlyLinks = [{ label: "Scan", href: "/scan" }];

// Mesma cara do wordmark da landing: fonte do sistema, peso 800, caixa alta
const WORDMARK_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif';

function isLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Toggle redondo primary-tinted, como o da nav da landing */
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      className="flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition-colors hover:bg-primary/15"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Alternar tema"
      suppressHydrationWarning
    >
      <IconSun
        className="hidden size-3.5 dark:block"
        suppressHydrationWarning
      />
      <IconMoon className="size-3.5 dark:hidden" suppressHydrationWarning />
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Padrão da nav da landing: parada no topo, vira pill flutuante ao rolar
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const activeHref =
    navLinks.find((l) => isLinkActive(pathname, l.href))?.href ?? null;
  // Pill desliza pro link com hover; sem hover, marca o ativo
  const pillOn = hovered ?? activeHref;

  return (
    <>
      <nav
        className={cn(
          "fixed left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-out",
          scrolled
            ? "top-3 w-[calc(100%-16px)] rounded-2xl border border-border bg-background/60 px-2.5 py-1.5 shadow-[0_8px_28px_rgba(2,6,23,0.18)] backdrop-blur-xl backdrop-saturate-150 md:w-[min(880px,calc(100%-32px))]"
            : "top-0 w-full border-b border-border/40 bg-background/85 px-4 py-2.5 backdrop-blur-md md:px-10 md:py-3",
        )}
      >
        <div className="flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
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
                className="w-72 border-border bg-background p-0"
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

                <div className="flex flex-col py-3">
                  {[...navLinks, ...mobileOnlyLinks].map((link) => {
                    const active = isLinkActive(pathname, link.href);
                    return (
                      <SheetClose key={link.label} asChild>
                        <Link
                          href={link.href}
                          className={cn(
                            "relative flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-primary/5 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId="mobile-nav-indicator"
                              className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 30,
                              }}
                            />
                          )}
                          {link.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>

                <div className="border-t border-border px-5 pt-3">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tema
                    </span>
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link
              href="/explore"
              className="flex items-center gap-2"
              aria-label="Mint Foil — Explorar"
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
            </Link>
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
                  href={link.href}
                  onMouseEnter={() => setHovered(link.href)}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 font-medium transition-colors duration-150",
                    scrolled ? "text-[13px]" : "text-sm",
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

          {/* ── Direita: busca ⌘K, tema, usuário ── */}
          <div className="flex items-center gap-2 md:justify-self-end">
            <button
              type="button"
              id="search-button"
              onClick={() => setCommandOpen(true)}
              className="glass-pill flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Buscar"
            >
              <IconSearch className="size-3.5" />
              <Kbd className="hidden h-4 min-w-4 bg-transparent px-1 text-[10px] text-muted-foreground sm:inline-flex">
                ⌘K
              </Kbd>
            </button>

            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            <UserMenu />
          </div>
        </div>
      </nav>

      <CommandK open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
