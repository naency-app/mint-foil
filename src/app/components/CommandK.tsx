"use client";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  BarChart3,
  DollarSign,
  FileText,
  Layers,
  Plus,
  Search,
  Settings,
  Star,
  TrendingUp,
} from "lucide-react";
import * as React from "react";

// ─── Search data ─────────────────────────────────────────────────
const quickActions = [
  { label: "Adicionar Carta", icon: Plus, shortcut: "⌘N" },
  { label: "Minha Coleção", icon: Layers, shortcut: "⌘L" },
  { label: "Relatório de Preços", icon: BarChart3, shortcut: "⌘R" },
];

const searchSuggestions = [
  {
    label: "Blue-Eyes White Dragon",
    icon: Star,
    detail: "LOB-001 · R$ 1.250,00",
  },
  { label: "Dark Magician", icon: Star, detail: "LOB-005 · R$ 980,00" },
  {
    label: "Exodia the Forbidden One",
    icon: Star,
    detail: "LOB-124 · R$ 2.100,00",
  },
  { label: "Stardust Dragon", icon: Star, detail: "TDGS-040 · R$ 890,00" },
];

const pages = [
  { label: "Explorar", icon: Search },
  { label: "Sets", icon: Layers },
  { label: "Portfólio", icon: DollarSign },
  { label: "Tendências", icon: TrendingUp },
  { label: "Relatórios", icon: FileText },
  { label: "Configurações", icon: Settings },
];

interface CommandKProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandK({ open, onOpenChange }: CommandKProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Buscar cartas, sets, ações..." />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-4">
              <Search className="size-10 text-slate-600" />
              <p className="text-sm text-slate-500">
                Nenhum resultado encontrado.
              </p>
            </div>
          </CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Ações Rápidas">
            {quickActions.map((action) => (
              <CommandItem
                key={action.label}
                onSelect={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                <action.icon className="size-4" />
                <span>{action.label}</span>
                <CommandShortcut>{action.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Cards */}
          <CommandGroup heading="Cartas Populares">
            {searchSuggestions.map((card) => (
              <CommandItem
                key={card.label}
                onSelect={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                <card.icon className="size-4 text-amber-400" />
                <div className="flex flex-col">
                  <span>{card.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {card.detail}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Pages */}
          <CommandGroup heading="Páginas">
            {pages.map((page) => (
              <CommandItem
                key={page.label}
                onSelect={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                <page.icon className="size-4" />
                <span>{page.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
