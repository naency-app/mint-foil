"use client";

import {
  IconAdjustments,
  IconChartBar,
  IconCrown,
  IconDeviceMobile,
  IconDownload,
  IconExternalLink,
  IconInfoCircle,
  IconLogout,
  IconMail,
  IconRefresh,
  IconScan,
  IconShieldCheck,
  IconSparkles,
  IconSun,
  IconTrophy,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CardImage } from "@/app/components/CardImage";
import { ProUpgradeModal } from "@/app/components/ProUpgradeModal";
import { DialogoSair } from "@/components/DialogoSair";
import { SeletorTema } from "@/components/SeletorTema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPill } from "@/components/ui/glass";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type UserStats } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { capaVisivel, coverCss, findCoverPreset } from "@/lib/cover-catalog";
import { cn } from "@/lib/utils";
import { ContasBloqueadas } from "./contas-bloqueadas";
import { CoverPicker } from "./cover-picker";
import { DeleteAccount } from "./delete-account";
import { FotoDePerfil } from "./foto-de-perfil";
import { ProfileForm } from "./profile-form";

const ADMIN_EMAIL = "danilomiranda1451@gmail.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type JobStatus = "idle" | "running" | "done" | "error";

interface ScraperJob {
  id: string;
  label: string;
  endpoint: string;
}

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

  function setJob(id: string, status: JobStatus, message = "") {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    setMessages((prev) => ({ ...prev, [id]: message }));
  }

  async function runJob(job: ScraperJob) {
    if (!scraperKey.trim()) {
      setJob(job.id, "error", "Digite o SCRAPER_SECRET");
      return;
    }
    setJob(job.id, "running", "Iniciando em background…");
    try {
      const res = await fetch(`${API_URL}/scraper/${job.endpoint}`, {
        method: "POST",
        headers: { "x-scraper-key": scraperKey.trim() },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setJob(job.id, "done", data.message ?? "Iniciado com sucesso");
      } else {
        setJob(job.id, "error", `HTTP ${res.status}`);
      }
    } catch {
      setJob(job.id, "error", "Erro de rede");
    }
  }

  const statusColor: Record<JobStatus, string> = {
    idle: "",
    running: "text-yellow-400",
    done: "text-emerald-400",
    error: "text-red-400",
  };

  return (
    <section className="glass-card !rounded-2xl p-6 space-y-5">
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <IconAdjustments className="size-4 text-muted-foreground" />
        Admin
        <Badge variant="outline" className="ml-1 text-[10px]">
          internal
        </Badge>
      </h2>

      <Separator className="bg-border" />

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
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-2.5"
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
                  <IconRefresh className="size-3 animate-spin mr-1" />
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

/**
 * Fundo da capa no cabeçalho da conta — mesma leitura do `ProfileCover`, para o
 * usuário ver aqui exatamente o que o perfil público mostra.
 */
function coverStyle(
  type: string | undefined,
  value: string | null | undefined,
): React.CSSProperties {
  if (type === "image" && value) {
    return { backgroundImage: `url(${value})`, backgroundSize: "cover" };
  }
  if (type === "color" && value) return { background: value };
  const preset = type === "preset" ? findCoverPreset(value) : null;
  if (preset) {
    return { background: coverCss(preset) };
  }
  return {
    background:
      "linear-gradient(to bottom, color-mix(in oklab, var(--primary) 40%, transparent), color-mix(in oklab, var(--primary) 10%, transparent))",
  };
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
        // No computador é a lateral (largura cheia); no celular vira pílula do
        // tamanho do texto: largura cheia numa linha rolável deixava uma aba
        // por tela e obrigava a deslizar (21/10)
        "justify-start h-auto w-full gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg shrink-0 whitespace-nowrap max-md:w-auto max-md:gap-2 max-md:rounded-full max-md:px-3.5 max-md:py-2 max-md:text-[13px]",
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
        <div className="glass-card !rounded-2xl p-6 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="glass-card !rounded-2xl p-6 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* 4 Mini Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card !rounded-2xl p-4 space-y-2">
            <Skeleton className="h-3 w-20 mx-auto sm:mx-0" />
            <Skeleton className="h-7 w-12 mx-auto sm:mx-0" />
          </div>
        ))}
      </div>

      {/* TCG Breakdown Skeleton */}
      <div className="glass-card !rounded-2xl p-6 space-y-4">
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
      <div className="glass-card !rounded-2xl p-6 space-y-4">
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
  const { data: session, isPending, refetch: refetchSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [proModalOpen, setProModalOpen] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "stats" | "account" | "support" | "admin"
  >("stats");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  /**
   * O que o usuário acabou de salvar, ainda não refletido na sessão.
   *
   * `authClient.getSession()` refaz a requisição mas não reemite para o
   * `useSession` já montado, e `router.refresh()` só revalida Server Component —
   * esta página é client. Sem isto, escolher um fundo salvava no banco e o
   * cabeçalho aqui em cima continuava com o antigo até dar F5.
   */
  const [novoCover, setNovoCover] = useState<{
    type: string;
    value: string | null;
  } | null>(null);
  const [novoPerfil, setNovoPerfil] = useState<{
    nickname: string;
    handle: string;
  } | null>(null);

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
      router.replace("/login?redirect=/settings");
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

  // Depois de salvar perfil ou fundo, a sessão em cache ainda tem os valores
  // antigos — o cabeçalho desta própria tela mostra nome, @ e capa.
  /**
   * Recarrega a sessão de verdade.
   *
   * `authClient.getSession()` refaz a requisição mas NÃO reemite para o store
   * reativo — o `useSession` de outras telas continua com o valor antigo. É o
   * `refetch` do próprio hook que notifica todo mundo. Sem ele, trocar o fundo
   * aqui e navegar para /portfolio mostrava a capa anterior, porque aquela
   * página lê `session.user.coverType`.
   */
  function refreshUser() {
    refetchSession?.();
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
  // Fundo Pro de quem não é mais Pro some daqui (o salvo fica guardado).
  const cover = capaVisivel(
    novoCover ?? {
      type: user.coverType ?? "gradient",
      value: user.coverValue ?? null,
    },
    stats ? !!(stats.isPro || user.isPro) : undefined,
  );
  const nomeExibido =
    novoPerfil?.nickname ?? user.nickname ?? user.name ?? "Colecionador";
  const handleExibido = novoPerfil?.handle ?? user.handle ?? "";

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
        {/* Sidebar Navigation: Carrossel horizontal em linha única no mobile, vertical no desktop */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row flex-nowrap overflow-x-auto gap-2 pb-2.5 md:pb-0 md:flex-col md:gap-1 border-b border-border md:border-b-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <SidebarButton
              label="Estatísticas"
              icon={IconChartBar}
              active={activeTab === "stats"}
              onClick={() => setActiveTab("stats")}
            />
            <SidebarButton
              label="Conta & Aparência"
              icon={IconUser}
              active={activeTab === "account"}
              onClick={() => setActiveTab("account")}
            />
            <SidebarButton
              label="Ajuda & Suporte"
              icon={IconInfoCircle}
              active={activeTab === "support"}
              onClick={() => setActiveTab("support")}
            />
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === "stats" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {statsLoading ? (
                <StatsSkeleton />
              ) : !stats ? (
                <div className="text-center py-10 glass-card !rounded-2xl p-6">
                  <p className="text-sm text-muted-foreground">
                    Não foi possível carregar as estatísticas.
                  </p>
                </div>
              ) : (
                <>
                  {/* Sem o card de Lucro / Prejuízo (21/10): quem não informa o
                      preço pago entrava com R$ 0 investido, e o valor inteiro
                      da coleção aparecia como "lucro". */}
                  <div>
                    <div className="glass-card !rounded-2xl p-6 space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <IconSparkles className="size-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Valor Estimado
                        </span>
                      </div>
                      <div className="text-3xl font-extrabold text-foreground font-mono">
                        {formatPrice(stats.totalValue)}
                      </div>
                    </div>
                  </div>

                  {/* General metrics mini cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Scans Realizados",
                        value: stats.lifetimeScans,
                        icon: IconScan,
                      },
                      {
                        label: "Cartas Únicas",
                        value: stats.uniqueCards,
                        icon: IconSparkles,
                      },
                      {
                        label: "Total de Cartas",
                        value: stats.totalCards,
                        icon: IconUser,
                      },
                      {
                        label: "Portfólios",
                        value: stats.portfolioCount,
                        icon: IconAdjustments,
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="glass-card !rounded-2xl p-4 space-y-1 text-center sm:text-left"
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
                </>
              )}
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Profile Card Info */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-card">
                {/* Capa real do usuário, a mesma do perfil público */}
                <div
                  className="h-24"
                  style={coverStyle(cover.type, cover.value)}
                />
                <div className="relative px-6 pb-6">
                  {/* Só o avatar sobrepõe a capa. O texto fica abaixo dela: com
                      o nome, o @ e o e-mail o bloco tem três linhas e, alinhado
                      à base do avatar, invadia a capa — ilegível em fundo
                      escuro. */}
                  <div className="-mt-10 mb-3 flex items-end justify-between gap-4">
                    {/* Clicar troca a foto (prévia + Salvar, como no app) */}
                    <FotoDePerfil
                      image={user.image ?? null}
                      nome={user.name ?? user.email ?? "?"}
                    />

                    {/* mt-10 anula o -mt-10 da linha (só o avatar sobe, senão o
                        botão fica por cima da capa); o resto é respiro para o
                        botão não encostar na borda da capa. */}
                    <div className="mt-14 flex flex-col items-end gap-2">
                      {handleExibido && (
                        <Link
                          href={`/showcase/profile/@${handleExibido}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-semibold text-xs transition hover:bg-muted"
                        >
                          <IconExternalLink className="size-3.5" />
                          Ver perfil público
                        </Link>
                      )}
                      {stats?.memberSince && (
                        <span className="text-muted-foreground text-xs">
                          Membro desde {formatDate(stats.memberSince)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-foreground text-xl">
                        {nomeExibido}
                      </h2>
                      {(stats?.isPro || user.isPro) && (
                        <Badge className="gap-1 bg-primary px-2 py-0.5 font-bold text-[10px] text-white hover:bg-primary/95">
                          <IconCrown className="size-3" /> PRO
                        </Badge>
                      )}
                    </div>
                    {handleExibido && (
                      <p className="font-medium text-muted-foreground text-sm">
                        @{handleExibido}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <ProfileForm
                currentName={user.nickname ?? user.name ?? ""}
                currentHandle={user.handle ?? ""}
                handleEditCount={user.handleEditCount ?? 0}
                isPro={!!(stats?.isPro || user.isPro)}
                onSaved={(perfil) => {
                  setNovoPerfil(perfil);
                  refreshUser();
                }}
              />

              <CoverPicker
                currentType={cover.type}
                currentValue={cover.value}
                onChange={(type, value) => setNovoCover({ type, value })}
                onSaved={refreshUser}
                isPro={!!(stats?.isPro || user.isPro)}
                onUpgrade={() => setProModalOpen(true)}
              />

              {/* Exportar coleção (PRO) */}
              <section className="glass-card !rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <IconDownload className="size-4 text-primary" />
                  Exportar coleção
                </h2>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Baixe todos os seus portfólios em uma planilha, com
                    quantidade, condição, preço de compra e valor de referência.
                    O .xlsx vem com uma aba por portfólio e um resumo, e os
                    valores já como número — dá para somar sem converter nada.
                  </p>
                  {stats?.isPro || user.isPro ? (
                    <div className="flex shrink-0 items-center gap-2">
                      {/*
                        Link direto, e não fetch + createObjectURL: o endpoint
                        depende do cookie de sessão, que a navegação do próprio
                        browser já manda, e o Content-Disposition do backend
                        cuida do nome do arquivo.
                      */}
                      <Button asChild size="sm">
                        <a href={`${API_URL}/collection/export.xlsx`}>
                          <IconDownload className="size-4" />
                          Baixar .xlsx
                        </a>
                      </Button>
                      {/* O .csv fica como alternativa: quem já importa em outra
                          ferramenta ou no Sheets não perde o caminho. */}
                      <Button asChild size="sm" variant="outline">
                        <a href={`${API_URL}/collection/export.csv`}>.csv</a>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 cursor-pointer"
                      onClick={() => setProModalOpen(true)}
                    >
                      <IconSparkles className="size-4" />
                      Recurso PRO
                    </Button>
                  )}
                </div>
              </section>

              {/* Appearance */}
              <section className="glass-card !rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <IconSun className="size-4 text-primary" />
                  Aparência
                </h2>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Selecione o tema da interface visual.
                  </p>
                  <SeletorTema />
                </div>
              </section>

              <ContasBloqueadas />

              {/* Conta: sair e excluir num card só, no desenho dos outros.
                  Eram dois blocos vermelhos, mas sair não é perigoso; o
                  vermelho fica só no botão de excluir (30/10). */}
              <section className="glass-card !rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <IconUser className="size-4 text-primary" />
                  Conta
                </h2>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Sair da conta
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sua coleção continua salva.
                    </p>
                  </div>
                  <GlassPill
                    onClick={() => setSaindo(true)}
                    className="h-8 shrink-0 gap-1.5 px-3 text-xs font-bold"
                  >
                    <IconLogout className="size-3.5" />
                    Sair
                  </GlassPill>
                </div>
                <Separator />
                <DeleteAccount handle={handleExibido} />
              </section>
              <DialogoSair open={saindo} onOpenChange={setSaindo} />

              {/* PRO Promo banner */}
              {!stats?.isPro && !user.isPro && (
                <section className="rounded-xl border border-primary/30 bg-gradient-to-br from-pink-950/10 to-slate-900/10 backdrop-blur-sm p-6 space-y-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                    <IconSparkles className="size-4 animate-pulse" />
                    Mint Foil PRO
                  </h2>
                  <Separator className="bg-primary/20" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Scans ilimitados, portfólios ilimitados, análise de P&L
                        e mais
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
                      <IconDeviceMobile className="size-4" />
                      Baixar App
                    </Button>
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <section className="glass-card !rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <IconInfoCircle className="size-4 text-primary" />
                  Ajuda & Informações
                </h2>
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <IconSparkles className="size-4 text-tertiary" />
                      <span className="text-sm font-medium text-foreground">
                        Identifique sua Raridade
                      </span>
                    </div>
                    <Link
                      href="/raridades"
                      className="text-xs font-semibold text-tertiary hover:underline"
                    >
                      Ver Tutorial
                    </Link>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <IconMail className="size-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        Contato / Suporte
                      </span>
                    </div>
                    <a
                      href="mailto:contato@mintfoil.com"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      contato@mintfoil.com
                    </a>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <IconShieldCheck className="size-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        Termos de Uso
                      </span>
                    </div>
                    <Link
                      href="/termos"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Ver Documento
                    </Link>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <IconShieldCheck className="size-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        Política de Privacidade
                      </span>
                    </div>
                    <Link
                      href="/privacidade"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Ver Documento
                    </Link>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <IconInfoCircle className="size-4 text-muted-foreground" />
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

      {user.email === ADMIN_EMAIL && (
        <div className="pt-6 border-t border-border/40 flex justify-end">
          <button
            type="button"
            onClick={() =>
              setActiveTab((prev) => (prev === "admin" ? "stats" : "admin"))
            }
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
          >
            {activeTab === "admin"
              ? "← Sair do Painel Admin"
              : "Acesso Administrativo"}
          </button>
        </div>
      )}

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
