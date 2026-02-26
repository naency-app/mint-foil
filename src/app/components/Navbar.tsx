"use client";

import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { IconX } from "@tabler/icons-react";
import { Download, Menu, Moon, Search, Share, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CommandK } from "./CommandK";

const navLinks = [
  { label: "Explorar", href: "/explore" },
  { label: "Portfólio", href: "/portfolio" },
  { label: "Sets", href: "/sets" },
];

const mobileOnlyLinks = [
  { label: "Scan", href: "/scan" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        size="icon-sm"
        variant="ghost"
        className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
      >
        <Moon className="size-4" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

export function Navbar() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { canInstall, isIos, isInstalled, isStandalone, install } =
    usePwaInstall();

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* ── Left: Hamburger + Logo ── */}
            <div className="flex items-center gap-3 shrink-0">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="md:hidden flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Menu className="size-5" />
                  </button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-72 bg-background border-border p-0"
                  showCloseButton={false}
                >
                  <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <SheetTitle>
                        <span className="text-lg font-extrabold tracking-[0.2em] text-foreground uppercase select-none">
                          Minty
                        </span>
                      </SheetTitle>
                      <SheetClose asChild>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <IconX className="size-5" />
                        </button>
                      </SheetClose>
                    </div>
                  </SheetHeader>

                  <div className="flex flex-col py-3">
                    {[...navLinks, ...mobileOnlyLinks].map((link) => (
                      <SheetClose key={link.label} asChild>
                        <Link
                          href={link.href}
                          className="px-5 py-3 text-sm text-muted-foreground font-medium transition-colors hover:text-foreground hover:bg-muted"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>

                  {/* Install PWA */}
                  {!isStandalone && !isInstalled && (
                    <div className="mx-5 mt-2 mb-1">
                      {canInstall ? (
                        <button
                          type="button"
                          onClick={() => {
                            install();
                            setMobileOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                        >
                          <Download className="size-5" />
                          <div className="text-left">
                            <p className="text-sm font-semibold">
                              Instalar App
                            </p>
                            <p className="text-[10px] text-emerald-400/70">
                              Scan de cartas e acesso offline
                            </p>
                          </div>
                        </button>
                      ) : isIos ? (
                        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <Share className="size-5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-blue-400">
                              Instalar App
                            </p>
                            <p className="text-[10px] text-blue-400/70 leading-relaxed">
                              Toque em Compartilhar e depois &quot;Adicionar
                              à Tela de Início&quot;
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className="px-5 pt-3 border-t border-border">
                    <div className="flex items-center justify-between py-3">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Tema
                      </span>
                      <ThemeToggle />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/" className="flex items-center">
                <span className="text-[20px] font-extrabold tracking-[0.25em] text-foreground uppercase select-none">
                  Minty
                </span>
              </Link>
            </div>

            {/* ── Center: Navigation Links (desktop) ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-3 py-1.5 text-[13px] text-muted-foreground font-medium rounded-md transition-colors hover:text-foreground hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Right: Actions ── */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="search-button"
                onClick={() => setCommandOpen(true)}
                className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-ring transition-all cursor-pointer"
              >
                <Search className="size-3.5" />
                <Kbd className="hidden sm:inline-flex bg-accent text-muted-foreground text-[10px] h-4 min-w-4 px-1">
                  ⌘K
                </Kbd>
              </button>

              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              <Separator
                orientation="vertical"
                className="hidden sm:block h-5"
              />

              <button
                type="button"
                className="hidden sm:flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-muted border border-border text-foreground text-xs font-medium hover:bg-accent transition-colors cursor-pointer"
              >
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                BRL
              </button>

              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      <CommandK open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
