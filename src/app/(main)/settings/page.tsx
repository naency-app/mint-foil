"use client";

import { ProUpgradeModal } from "@/app/components/ProUpgradeModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type UserStats } from "@/lib/api";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Crown,
  Info,
  LogOut,
  Mail,
  Moon,
  Play,
  RefreshCw,
  Scan,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

const ADMIN_EMAIL = "danilomiranda1451@gmail.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type JobStatus = "idle" | "running" | "done" | "error";

interface ScraperJob {
  id: string;
  label: string;
  endpoint: string;
}

const FULL_SYNC_STEPS: ScraperJob[] = [
  { id: "full-sets", label: "Sets (todos os TCGs)", endpoint: "sync-sets" },
  { id: "full-cards-yugioh", label: "Cards — YuGiOh", endpoint: "sync-cards?tcg=yugioh" },
  { id: "full-cards-pokemon", label: "Cards — Pokémon", endpoint: "sync-cards?tcg=pokemon" },
  { id: "full-cards-magic", label: "Cards — Magic", endpoint: "sync-cards?tcg=magic" },
  { id: "full-cards-onepiece", label: "Cards — One Piece", endpoint: "sync-cards?tcg=onepiece" },
  { id: "full-liga-snapshot", label: "Snapshot diário Liga (tracking)", endpoint: "snapshot-liga-prices" },
  { id: "full-epicgame-yugioh", label: "EpicGame links — YuGiOh", endpoint: "sync-epicgame?tcg=yugioh" },
  { id: "full-epicgame-pokemon", label: "EpicGame links — Pokémon", endpoint: "sync-epicgame?tcg=pokemon" },
  { id: "full-epicgame-magic", label: "EpicGame links — Magic", endpoint: "sync-epicgame?tcg=magic" },
  { id: "full-epicgame-onepiece", label: "EpicGame links — One Piece", endpoint: "sync-epicgame?tcg=onepiece" },
  { id: "full-store-prices", label: "Preços EpicGame (refresh)", endpoint: "sync-store-prices" },
  { id: "full-liga-yugioh", label: "Liga BR — YuGiOh", endpoint: "sync-liga-prices?tcg=yugioh" },
  { id: "full-liga-pokemon", label: "Liga BR — Pokémon", endpoint: "sync-liga-prices?tcg=pokemon" },
  { id: "full-liga-magic", label: "Liga BR — Magic", endpoint: "sync-liga-prices?tcg=magic" },
  { id: "full-liga-onepiece", label: "Liga BR — One Piece", endpoint: "sync-liga-prices?tcg=onepiece" },
];

const SCRAPER_JOBS: ScraperJob[] = [
  {
    id: "epicgame-yugioh",
    label: "EpicGame — links YuGiOh",
    endpoint: "sync-epicgame?tcg=yugioh",
  },
  {
    id: "epicgame-pokemon",
    label: "EpicGame — links Pokémon",
    endpoint: "sync-epicgame?tcg=pokemon",
  },
  {
    id: "epicgame-magic",
    label: "EpicGame — links Magic",
    endpoint: "sync-epicgame?tcg=magic",
  },
  {
    id: "store-prices",
    label: "Preços EpicGame (todos)",
    endpoint: "sync-store-prices",
  },
  {
    id: "liga-yugioh",
    label: "Liga BR — YuGiOh",
    endpoint: "sync-liga-prices?tcg=yugioh",
  },
  {
    id: "liga-pokemon",
    label: "Liga BR — Pokémon",
    endpoint: "sync-liga-prices?tcg=pokemon",
  },
  {
    id: "liga-magic",
    label: "Liga BR — Magic",
    endpoint: "sync-liga-prices?tcg=magic",
  },
  {
    id: "liga-onepiece",
    label: "Liga BR — One Piece",
    endpoint: "sync-liga-prices?tcg=onepiece",
  },
  { id: "sync-sets", label: "Sincronizar Sets", endpoint: "sync-sets" },
];

function AdminPanel() {
  const [scraperKey, setScraperKey] = useState(
    process.env.NEXT_PUBLIC_SCRAPER_SECRET ?? "",
  );
  const [statuses, setStatuses] = useState<Record<string, JobStatus>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [fullSyncRunning, setFullSyncRunning] = useState(false);
  const [fullSyncStatuses, setFullSyncStatuses] = useState<Record<string, JobStatus>>({});
  const [fullSyncMessages, setFullSyncMessages] = useState<Record<string, string>>({});

  function setJob(id: string, status: JobStatus, message = "") {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    setMessages((prev) => ({ ...prev, [id]: message }));
  }

  async function fireRequest(endpoint: string): Promise<{ ok: boolean; message: string }> {
    const res = await fetch(`${API_URL}/scraper/${endpoint}`, {
      method: "POST",
      headers: { "x-scraper-key": scraperKey.trim() },
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: true, message: data.message ?? "Iniciado" };
    }
    return { ok: false, message: `HTTP ${res.status}` };
  }

  async function runJob(job: ScraperJob) {
    if (!scraperKey.trim()) {
      setJob(job.id, "error", "Digite o SCRAPER_SECRET");
      return;
    }
    setJob(job.id, "running", "Iniciando em background…");
    try {
      const { ok, message } = await fireRequest(job.endpoint);
      setJob(job.id, ok ? "done" : "error", message);
    } catch {
      setJob(job.id, "error", "Erro de rede");
    }
  }

  async function runFullSync() {
    if (!scraperKey.trim()) return;
    setFullSyncRunning(true);
    setFullSyncStatuses({});
    setFullSyncMessages({});

    for (const step of FULL_SYNC_STEPS) {
      setFullSyncStatuses((prev) => ({ ...prev, [step.id]: "running" }));
      setFullSyncMessages((prev) => ({ ...prev, [step.id]: "Enviando…" }));
      try {
        const { ok, message } = await fireRequest(step.endpoint);
        setFullSyncStatuses((prev) => ({ ...prev, [step.id]: ok ? "done" : "error" }));
        setFullSyncMessages((prev) => ({ ...prev, [step.id]: message }));
      } catch {
        setFullSyncStatuses((prev) => ({ ...prev, [step.id]: "error" }));
        setFullSyncMessages((prev) => ({ ...prev, [step.id]: "Erro de rede" }));
      }
    }

    setFullSyncRunning(false);
  }

  const statusColor: Record<JobStatus, string> = {
    idle: "",
    running: "text-yellow-400",
    done: "text-emerald-400",
    error: "text-red-400",
  };

  const fullSyncDone = !fullSyncRunning && Object.keys(fullSyncStatuses).length > 0;
  const fullSyncErrors = Object.values(fullSyncStatuses).filter((s) => s === "error").length;

  return (
    <section className="rounded-xl border border-violet-500/30 bg-violet-900/10 backdrop-blur-sm p-6 space-y-5">
      <h2 className="text-sm font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2">
        <Settings2 className="size-4" />
        Admin
        <Badge
          variant="outline"
          className="ml-1 text-[10px] border-violet-500/40 text-violet-400"
        >
          internal
        </Badge>
      </h2>

      <Separator className="bg-violet-500/20" />

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">SCRAPER_SECRET</p>
        <Input
          type="password"
          placeholder="Cole o valor de SCRAPER_SECRET do backend"
          value={scraperKey}
          onChange={(e) => setScraperKey(e.target.value)}
          className="font-mono text-sm"
        />
      </div>

      <Separator className="bg-violet-500/20" />

      {/* Full Sync */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Sincronização Completa</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Executa todos os jobs em sequência:<br />
              sets → cards → EpicGame → Liga BR → snapshot diário
            </p>
          </div>
          <Button
            size="sm"
            disabled={fullSyncRunning || !scraperKey.trim()}
            onClick={runFullSync}
            className="shrink-0 gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white cursor-pointer"
          >
            {fullSyncRunning ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            {fullSyncRunning ? "Rodando…" : "Executar Tudo"}
          </Button>
        </div>

        {Object.keys(fullSyncStatuses).length > 0 && (
          <div className="rounded-lg border border-violet-500/20 bg-black/20 p-3 space-y-1.5 max-h-56 overflow-y-auto">
            {fullSyncDone && (
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-wider mb-2",
                fullSyncErrors > 0 ? "text-red-400" : "text-emerald-400",
              )}>
                {fullSyncErrors > 0
                  ? `Concluído com ${fullSyncErrors} erro(s)`
                  : "Concluído com sucesso"}
              </p>
            )}
            {FULL_SYNC_STEPS.map((step) => {
              const status = fullSyncStatuses[step.id] as JobStatus | undefined;
              const msg = fullSyncMessages[step.id];
              return (
                <div key={step.id} className="flex items-center gap-2 text-xs">
                  {!status && <Circle className="size-3 shrink-0 text-muted-foreground/30" />}
                  {status === "running" && <RefreshCw className="size-3 shrink-0 animate-spin text-yellow-400" />}
                  {status === "done" && <CheckCircle2 className="size-3 shrink-0 text-emerald-400" />}
                  {status === "error" && <XCircle className="size-3 shrink-0 text-red-400" />}
                  <span className={cn(
                    "flex-1 truncate",
                    !status && "text-muted-foreground/40",
                    status === "running" && "text-yellow-400",
                    status === "done" && "text-emerald-400",
                    status === "error" && "text-red-400",
                  )}>
                    {step.label}
                  </span>
                  {msg && status !== "running" && (
                    <span className="text-muted-foreground/60 text-[10px] shrink-0 max-w-[140px] truncate">
                      {msg}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Scrapers
        </p>
        {SCRAPER_JOBS.map((job) => {
          const status = statuses[job.id] ?? "idle";
          const msg = messages[job.id] ?? "";
          return (
            <div
              key={job.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/50 px-4 py-2.5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {job.label}
                </p>
                {msg && (
                  <p
                    className={`text-xs mt-0.5 truncate ${statusColor[status]}`}
                  >
                    {msg}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={status === "running"}
                onClick={() => runJob(job)}
                className="shrink-0 text-xs cursor-pointer"
              >
                {status === "running" ? (
                  <RefreshCw className="size-3 animate-spin mr-1" />
                ) : null}
                {status === "running" ? "Rodando…" : "Executar"}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const options = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Moon },
  ] as const;

  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <opt.icon className="size-4" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  const months = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];
  return `${months[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`;
}

function SidebarButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "justify-start h-auto w-full gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg",
        active
          ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          active ? "text-primary" : "text-muted-foreground",
        )}
      />
      <span>{label}</span>
    </Button>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      {/* 2 Big Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card/50 p-6 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-6 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* 4 Mini Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card/50 p-4 space-y-2"
          >
            <Skeleton className="h-3 w-20 mx-auto sm:mx-0" />
            <Skeleton className="h-7 w-12 mx-auto sm:mx-0" />
          </div>
        ))}
      </div>

      {/* TCG Breakdown Skeleton */}
      <div className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Top Cards Skeleton */}
      <div className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-background"
            >
              <Skeleton className="h-4 w-4" />
              <Skeleton className="size-10 rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <div className="text-right space-y-1.5">
                <Skeleton className="h-4 w-20 ml-auto" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [proModalOpen, setProModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "stats" | "account" | "support" | "admin"
  >("stats");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab === "stats" ||
      tab === "account" ||
      tab === "support" ||
      tab === "admin"
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (!session) return;
    setStatsLoading(true);
    api.collection
      .stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [session]);

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  if (isPending) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded-lg bg-muted/60" />
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-full animate-pulse rounded-lg bg-muted/70"
              />
            ))}
          </aside>
          <div className="flex-1 space-y-4">
            <div className="h-32 w-full animate-pulse rounded-xl bg-muted/40" />
            <div className="h-64 w-full animate-pulse rounded-xl bg-muted/30" />
          </div>
        </div>
      </main>
    );
  }

  if (!session) return null;

  const user = session.user as any;

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-0.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas preferências de conta, consulte estatísticas detalhadas
          e acesse suporte.
        </p>
      </div>
      <Separator className="my-6" />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 border-b border-border md:border-b-0">
            <SidebarButton
              label="Estatísticas"
              icon={BarChart3}
              active={activeTab === "stats"}
              onClick={() => setActiveTab("stats")}
            />
            <SidebarButton
              label="Conta & Aparência"
              icon={User}
              active={activeTab === "account"}
              onClick={() => setActiveTab("account")}
            />
            <SidebarButton
              label="Ajuda & Suporte"
              icon={Info}
              active={activeTab === "support"}
              onClick={() => setActiveTab("support")}
            />
            {user.email === ADMIN_EMAIL && (
              <SidebarButton
                label="Painel Admin"
                icon={Settings2}
                active={activeTab === "admin"}
                onClick={() => setActiveTab("admin")}
              />
            )}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === "stats" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {statsLoading ? (
                <StatsSkeleton />
              ) : !stats ? (
                <div className="text-center py-10 rounded-xl border border-border bg-card/45 p-6">
                  <p className="text-sm text-muted-foreground">
                    Não foi possível carregar as estatísticas.
                  </p>
                </div>
              ) : (
                <>
                  {/* Profit / Loss card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={cn(
                        "rounded-xl border p-6 space-y-2",
                        stats.profitLoss >= 0
                          ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/5"
                          : "border-red-500/20 bg-red-500/5 dark:bg-red-950/5",
                      )}
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {stats.profitLoss >= 0 ? (
                          <TrendingUp className="size-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="size-4 text-red-500" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Lucro / Prejuízo
                        </span>
                      </div>
                      <div
                        className={cn(
                          "text-3xl font-extrabold font-mono",
                          stats.profitLoss >= 0
                            ? "text-emerald-500"
                            : "text-red-500",
                        )}
                      >
                        {stats.profitLoss >= 0 ? "+" : ""}
                        {formatPrice(stats.profitLoss)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Investido:{" "}
                        <span className="font-semibold text-foreground">
                          {formatPrice(stats.totalInvested)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card/50 p-6 space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Sparkles className="size-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Valor Estimado
                        </span>
                      </div>
                      <div className="text-3xl font-extrabold text-foreground font-mono">
                        {formatPrice(stats.totalValue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Retorno sobre Investimento:{" "}
                        <span
                          className={cn(
                            "font-bold",
                            stats.profitLoss >= 0
                              ? "text-emerald-500"
                              : "text-red-500",
                          )}
                        >
                          {stats.totalInvested > 0
                            ? `${((stats.profitLoss / stats.totalInvested) * 100).toFixed(1)}%`
                            : "0.0%"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* General metrics mini cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Scans Realizados",
                        value: stats.lifetimeScans,
                        icon: Scan,
                      },
                      {
                        label: "Cartas Únicas",
                        value: stats.uniqueCards,
                        icon: Sparkles,
                      },
                      {
                        label: "Total de Cartas",
                        value: stats.totalCards,
                        icon: User,
                      },
                      {
                        label: "Portfólios",
                        value: stats.portfolioCount,
                        icon: Settings2,
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="rounded-xl border border-border bg-card/50 p-4 space-y-1 text-center sm:text-left"
                      >
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-muted-foreground">
                          <m.icon className="size-3.5 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {m.label}
                          </span>
                        </div>
                        <p className="text-xl font-bold text-foreground font-mono">
                          {m.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* TCG Breakdown */}
                  {stats.tcgBreakdown.length > 0 && (
                    <div className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Distribuição por Jogo
                      </h3>
                      <div className="space-y-4">
                        {stats.tcgBreakdown.map((tcg) => {
                          const pct =
                            stats.totalValue > 0
                              ? (tcg.value / stats.totalValue) * 100
                              : 0;
                          return (
                            <div key={tcg.slug} className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-foreground">
                                  {tcg.name}
                                </span>
                                <span className="text-muted-foreground font-mono">
                                  {formatPrice(tcg.value)} ({tcg.count} cartas •{" "}
                                  {pct.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Top Cards */}
                  {stats.topCards.length > 0 && (
                    <div className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="size-4 text-primary" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Top Cartas (Mais Valiosas)
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {stats.topCards.map((card, i) => (
                          <div
                            key={card.id}
                            onClick={() => router.push(`/card/${card.id}`)}
                            className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-background hover:bg-muted/40 transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-mono font-bold text-muted-foreground w-4 text-center">
                              #{i + 1}
                            </span>
                            <div className="relative size-10 rounded overflow-hidden shrink-0 border border-border bg-muted">
                              <Image
                                src={card.imageUrl}
                                alt={card.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {card.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {card.setCode} • Qtd: {card.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-primary font-mono">
                                {formatPrice(card.totalValue)}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {formatPrice(card.unitValue)} / un
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Profile Card Info */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-card">
                <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/5 to-muted/80" />
                <div className="px-6 pb-6 relative">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-10 mb-2">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name ?? "Avatar"}
                          width={80}
                          height={80}
                          className="h-20 w-20 rounded-full border-4 border-card object-cover bg-background shadow-md"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-card bg-muted text-2xl font-bold text-foreground shadow-md">
                          {(user.name ?? user.email ?? "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h2 className="text-xl font-bold text-foreground">
                            {user.name ?? "Treinador"}
                          </h2>
                          {(stats?.isPro || user.isPro) && (
                            <Badge className="bg-primary hover:bg-primary/95 text-white gap-1 py-0.5 px-2 text-[10px] font-bold">
                              <Crown className="size-3" /> PRO
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {stats?.memberSince && (
                      <span className="text-xs text-muted-foreground sm:mb-1">
                        Membro desde {formatDate(stats.memberSince)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <section className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Sun className="size-4 text-primary" />
                  Aparência
                </h2>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Selecione o tema da interface visual.
                  </p>
                  <ThemeSelector />
                </div>
              </section>

              {/* Session Control */}
              <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
                <h2 className="text-sm font-bold text-destructive uppercase tracking-wider flex items-center gap-2">
                  <LogOut className="size-4" />
                  Sessão
                </h2>
                <Separator className="bg-destructive/20" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Encerrar sessão
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Você será redirecionado para a tela de login.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    Sair da Conta
                  </Button>
                </div>
              </section>

              {/* PRO Promo banner */}
              {!stats?.isPro && !user.isPro && (
                <section className="rounded-xl border border-primary/30 bg-gradient-to-br from-pink-950/10 to-slate-900/10 backdrop-blur-sm p-6 space-y-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="size-4 animate-pulse" />
                    Mint Foil PRO
                  </h2>
                  <Separator className="bg-primary/20" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Scans de IA ilimitados, portfólios ilimitados, análise
                        de P&L e mais
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Assinaturas e gerenciamento disponíveis exclusivamente
                        pelo aplicativo móvel.
                      </p>
                    </div>
                    <Button
                      onClick={() => setProModalOpen(true)}
                      className="bg-primary hover:bg-primary/95 text-white font-semibold gap-2 shrink-0 cursor-pointer"
                      size="sm"
                    >
                      <Smartphone className="size-4" />
                      Baixar App
                    </Button>
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <section className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Info className="size-4 text-primary" />
                  Ajuda & Informações
                </h2>
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Mail className="size-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        Contato / Suporte
                      </span>
                    </div>
                    <a
                      href="mailto:support@mintfoil.app"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      support@mintfoil.app
                    </a>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="size-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        Termos de Uso
                      </span>
                    </div>
                    <Link
                      href="/terms"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Ver Documento
                    </Link>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="size-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        Política de Privacidade
                      </span>
                    </div>
                    <Link
                      href="/privacy"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Ver Documento
                    </Link>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Info className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Versão do Aplicativo
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono font-medium">
                      1.0.0 (Web)
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "admin" && user.email === ADMIN_EMAIL && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <AdminPanel />
            </div>
          )}
        </div>
      </div>

      <ProUpgradeModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
      />
    </main>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-96 animate-pulse rounded-lg bg-muted/60" />
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 shrink-0 space-y-2">
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted/70" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted/70" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted/70" />
            </aside>
            <div className="flex-1 space-y-4">
              <StatsSkeleton />
            </div>
          </div>
        </main>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
