"use client";

import {
  IconBriefcase,
  IconBuildingStore,
  IconCards,
  IconCurrencyDollar,
  IconPackage,
  IconScan,
  IconSpeakerphone,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { type ComponentType, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FeatureItem {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}

interface TabData {
  headline: string;
  items: FeatureItem[];
}

// ── Static data ───────────────────────────────────────────────────────────────

const TAB_DATA: Record<string, TabData> = {
  marcas: {
    headline: "Chega de Pesquisar Carta por Carta em Site Diferente.",
    items: [
      {
        icon: IconScan,
        title: "Scan em segundos",
        description:
          "Aponta a câmera, escaneia a carta — nome, edição, raridade e jogo identificados na hora. Cataloga em minutos o que levaria horas.",
      },
      {
        icon: IconTrendingUp,
        title: "Preço real do Brasil",
        description:
          "A diferença entre vender por R$ 30 e vender por R$ 130 pode estar nesse detalhe: apps gringos convertem dólar. O Mint Foil puxa o preço da liga brasileira.",
      },
      {
        icon: IconSpeakerphone,
        title: "Vários jogos, um lugar só",
        description:
          "Pokémon, Magic, Yu-Gi-Oh!, One Piece — tudo no mesmo portfólio. Sem alternar entre 4 sites ou 4 planilhas diferentes.",
      },
    ],
  },
  prestadores: {
    headline: "Sua Coleção Organizada. Do Jeito que Você Quiser.",
    items: [
      {
        icon: IconBriefcase,
        title: "Portfólio do seu jeito",
        description:
          "Organize por jogo, set, valor ou raridade. Sua coleção, suas regras. Acesse de qualquer lugar, no celular ou na web.",
      },
      {
        icon: IconUsers,
        title: "Gráficos de valorização",
        description:
          "Veja quais cartas estão subindo e quais estão caindo. Decida com dados se é hora de vender, segurar ou comprar mais.",
      },
      {
        icon: IconBuildingStore,
        title: "Serve pra lojistas também",
        description:
          "O scan foi feito pra catalogar em volume. Quem abre packs todo dia economiza horas de trabalho manual com o portfólio como controle de estoque.",
      },
    ],
  },
  usuarios: {
    headline: "Grátis pra Começar. Sem Burocracia Nenhuma.",
    items: [
      {
        icon: IconCards,
        title: "30 scans por dia sem criar conta",
        description:
          "Baixe o app e já começa a escanear. Sem cadastro, sem cartão, sem compromisso. Resultado na hora.",
      },
      {
        icon: IconCurrencyDollar,
        title: "PRO por R$ 19,90/mês",
        description:
          "Scans ilimitados, portfólio completo e gráficos de valorização. Menos que um booster pack. Cancela quando quiser.",
      },
      {
        icon: IconScan,
        title: "Celular e web sincronizados",
        description:
          "Escaneie pelo app em qualquer lugar. Quando quiser uma visão mais completa, abra no computador. Tudo junto, em tempo real.",
      },
    ],
  },
};

const TABS = [
  { value: "marcas", label: "Scanner" },
  { value: "prestadores", label: "Portfólio" },
  { value: "usuarios", label: "Preços e Planos" },
] as const;

// ── Dashboard data ─────────────────────────────────────────────────────────────

const BARS = [
  { h: 28, id: "b0" }, { h: 40, id: "b1" }, { h: 35, id: "b2" },
  { h: 50, id: "b3" }, { h: 44, id: "b4" }, { h: 62, id: "b5" },
  { h: 55, id: "b6" }, { h: 70, id: "b7" }, { h: 65, id: "b8" },
  { h: 80, id: "b9" }, { h: 75, id: "b10" }, { h: 92, id: "b11" },
];

const KPIS = [
  { label: "Cartas", value: "247", sub: "+12 este mês", green: true },
  { label: "Ganho", value: "+R$482", sub: "+8.4%", green: true },
  { label: "Scans hoje", value: "38", sub: "3 TCGs", green: false },
] as const;

const SCANS = [
  { name: "Charizard ex", status: "Identificado", time: "agora", ok: true },
  { name: "Uta (Alt Art)", status: "Adicionado", time: "2m", ok: true },
  { name: "DON!! Card", status: "Processando…", time: "5m", ok: false },
] as const;

// ── Dashboard mockup ──────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="relative w-full">
      {/* Glow atrás do dashboard */}
      <div className="absolute -inset-8 bg-primary/10 blur-[90px] rounded-full pointer-events-none" />

      {/* Badge flutuante: scanner */}
      <motion.div
        className="absolute -top-4 right-6 z-20 bg-card border border-border/50 rounded-xl px-3 py-2 shadow-xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-[9px] text-muted-foreground">Scanner IA</span>
        </div>
        <p className="text-[11px] font-bold text-primary">Identificado ✓</p>
      </motion.div>

      {/* Badge flutuante: valor */}
      <motion.div
        className="absolute -bottom-4 left-6 z-20 bg-card border border-border/50 rounded-xl px-3 py-2 shadow-xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      >
        <p className="text-[9px] text-muted-foreground mb-0.5">Coleção total</p>
        <p className="text-[11px] font-bold text-green-500">R$ 4.280 ↑ 12.4%</p>
      </motion.div>

      {/* Frame do dashboard */}
      <motion.div
        className="relative z-10 rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/30 bg-muted/10">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
          <div className="flex-1 flex justify-center mx-4">
            <div className="bg-muted/40 rounded-md px-3 py-1 flex items-center gap-1.5 max-w-[200px] w-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-[9px] text-muted-foreground truncate">mintfoil.com/portfolio</span>
            </div>
          </div>
        </div>

        {/* App layout */}
        <div className="flex h-[360px]">
          {/* Sidebar */}
          <div className="w-11 border-r border-border/20 flex flex-col items-center py-4 gap-3 bg-muted/5 shrink-0">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center mb-2">
              <div className="w-2.5 h-1.5 rounded-[2px] bg-primary-foreground" />
            </div>
            {(["portfolio", "scan", "explore", "settings"] as const).map((id, i) => (
              <div
                key={id}
                className={`w-7 h-6 rounded-lg flex items-center justify-center ${i === 0 ? "bg-primary/15 border border-primary/25" : ""}`}
              >
                <div className={`rounded-[3px] ${i === 0 ? "w-3 h-2.5 bg-primary/60" : "w-2.5 h-2 bg-muted-foreground/20"}`} />
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] text-muted-foreground mb-0.5">Portfólio</p>
                <p className="text-[17px] font-bold tracking-tight text-foreground leading-none">R$ 4.280,00</p>
              </div>
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-1 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-green-600 dark:text-green-400 font-medium">Live</span>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2">
              {KPIS.map(({ label, value, sub, green }) => (
                <div key={label} className="bg-muted/25 rounded-xl p-2.5 border border-border/25">
                  <p className="text-[8px] text-muted-foreground mb-1">{label}</p>
                  <p className="text-[11px] font-bold text-foreground leading-none mb-0.5">{value}</p>
                  <p className={`text-[8px] ${green ? "text-green-500" : "text-muted-foreground"}`}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-muted/15 rounded-xl p-3 border border-border/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-medium text-foreground">Histórico de valor</span>
                <span className="text-[8px] text-green-500 font-medium">+12.4% este mês</span>
              </div>
              <div className="flex items-end gap-0.5 h-12">
                {BARS.map(({ h, id }, i) => (
                  <motion.div
                    key={id}
                    className="flex-1 rounded-sm bg-primary/40"
                    style={{ transformOrigin: "bottom" }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.04, ease: "easeOut" }}
                    custom={h}
                  >
                    <div className="h-full w-full" style={{ height: `${h}%` }} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div>
              <p className="text-[9px] font-medium text-foreground mb-1.5">Scans recentes</p>
              <div className="flex flex-col gap-1">
                {SCANS.map(({ name, status, time, ok }) => (
                  <div
                    key={name}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-muted/20 border border-border/15"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ok ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
                      <span className="text-[9px] font-medium text-foreground truncate">{name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[8px] ${ok ? "text-green-500" : "text-yellow-500"}`}>{status}</span>
                      <span className="text-[8px] text-muted-foreground/50">{time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Phone mockup ──────────────────────────────────────────────────────────────

export function PhoneMockup() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow contido — não vaza horizontalmente graças ao overflow-hidden do pai */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-56 h-56 rounded-full bg-primary blur-[100px] opacity-40" />
      </div>

      {/* Frame do celular */}
      <div className="relative z-10 w-[260px] h-[520px] rounded-[3rem] border border-border/40 bg-background/30 backdrop-blur-xl shadow-2xl overflow-hidden p-2">
        {/* Tela interna */}
        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border border-border/20 bg-card">
          {/*
           * Adicione os screenshots do app na pasta public/:
           *   public/screenshots/app-light.png  ← print do modo claro
           *   public/screenshots/app-dark.png   ← print do modo escuro
           *
           * O componente troca automaticamente conforme o tema ativo.
           */}
          <Image
            key={isDark ? "dark" : "light"}
            src={
              isDark
                ? "/screenshots/app-dark.png"
                : "/screenshots/app-light.png"
            }
            alt="Mint Foil — screenshot do app"
            fill
            sizes="260px"
            className="object-cover object-top"
            priority
          />
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BenefitsSection() {
  const [activeTab, setActiveTab] = useState<string>("marcas");

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Label de seção */}
      <p className="text-primary font-medium text-xs uppercase tracking-widest mb-6">
        Por que o Mint Foil
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Pill-style tab list */}
        <TabsList className="mb-10 h-auto bg-muted/50 rounded-full p-1 border border-border flex flex-wrap gap-1 w-fit">
          {TABS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-full px-5 py-2 text-sm font-medium data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground transition-all duration-300 ease-out"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Conteúdo de cada tab */}
        {TABS.map(({ value }) => {
          const { headline, items } = TAB_DATA[value];
          return (
            <TabsContent key={value} value={value} className="mt-0">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Coluna esquerda: headline + itens (animados) */}
                <AnimatePresence mode="wait">
                  {activeTab === value && (
                    <motion.div
                      key={value}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="flex flex-col gap-8"
                    >
                      <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-foreground">
                        {headline}
                      </h2>

                      <div className="flex flex-col gap-7">
                        {items.map(({ icon: Icon, title, description }) => (
                          <div key={title} className="flex items-start gap-4">
                            <div className="mt-0.5 shrink-0">
                              <Icon size={28} className="text-secondary" />
                            </div>
                            <div>
                              <h4 className="font-bold text-base text-foreground mb-1">
                                {title}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Coluna direita: dashboard mockup estático */}
                <div className="relative overflow-hidden rounded-3xl flex items-center justify-center py-6">
                  <DashboardMockup />
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
