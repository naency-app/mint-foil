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
import { cn } from "@/lib/utils";
import { IconCards, IconX } from "@tabler/icons-react";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CommandK } from "./CommandK";

const navLinks = [
  { label: "Explorar", href: "/explore" },
  { label: "Portfólio", href: "/portfolio" },
  { label: "Sets", href: "/sets" },
];

const mobileOnlyLinks = [{ label: "Scan", href: "/scan" }];

function isLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <nav className="sticky top-0 z-10 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-370 mx-auto px-4 sm:px-6">
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
                          Mint Foil
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
                    {[...navLinks, ...mobileOnlyLinks].map((link) => {
                      const active = isLinkActive(pathname, link.href);
                      return (
                        <SheetClose key={link.label} asChild>
                          <Link
                            href={link.href}
                            className={cn(
                              "relative flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors",
                              active
                                ? "text-primary bg-primary/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted",
                            )}
                          >
                            {active && (
                              <motion.span
                                layoutId="mobile-nav-indicator"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary"
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

              <Link
                href="/"
                className="text-center flex items-center justify-center gap-2"
              >
                <IconCards stroke={2} />
                <span className="text-xl font-extrabold  text-foreground uppercase select-none">
                  Mint Foil
                </span>
              </Link>
            </div>

            {/* ── Center: Navigation Links (desktop) ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isLinkActive(pathname, link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "relative px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors",
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 rounded-md bg-primary/10"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* ── Right: Actions ── */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                id="search-button"
                onClick={() => setCommandOpen(true)}
                variant="secondary"
              >
                <Search className="size-3.5" />
                <Kbd className="hidden sm:inline-flex bg-accent text-muted-foreground text-[10px] h-4 min-w-4 px-1">
                  ⌘K
                </Kbd>
              </Button>

              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              <Separator
                orientation="vertical"
                className="hidden sm:block h-5"
              />

              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      <CommandK open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
