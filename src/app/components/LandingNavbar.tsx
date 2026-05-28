"use client";

import { IconLeaf } from "@tabler/icons-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export function LandingNavbar() {
  return (
    <header className="w-full border-b border-border/30 bg-background">
      <div className="max-w-7xl mx-auto px-6 h-15 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <IconLeaf size={14} className="text-primary-foreground" />
          </div>
          <span className="font-semibold text-base tracking-tight text-foreground">
            Mint <span className="text-primary">Foil</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a
            href="#benefits"
            className="hover:text-foreground transition-all duration-300 ease-out"
          >
            Benefícios
          </a>
          <a
            href="#features"
            className="hover:text-foreground transition-all duration-300 ease-out"
          >
            Features
          </a>
          <a
            href="#faq"
            className="hover:text-foreground transition-all duration-300 ease-out"
          >
            FAQ
          </a>
          <a
            href="#contact"
            className="hover:text-foreground transition-all duration-300 ease-out"
          >
            Contato
          </a>
        </nav>

        <ModeToggle />
      </div>
    </header>
  );
}
