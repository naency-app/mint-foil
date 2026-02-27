"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useCamera, type CameraError } from "@/hooks/use-camera";
import { api } from "@/lib/api";
import type { Card as CardType } from "@/lib/api";
import {
  Camera,
  CameraOff,
  Loader2,
  Plus,
  RotateCcw,
  ScanLine,
  Search,
  Smartphone,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const check = () => {
      const isStandalone =
        typeof window !== "undefined" &&
        (window.matchMedia("(display-mode: standalone)").matches ||
          (navigator as { standalone?: boolean }).standalone === true);
      const isNarrow = window.innerWidth < 768;
      setIsMobile(isNarrow || !!isStandalone);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

type ScanState = "idle" | "camera" | "processing" | "results" | "error";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function cleanOcrText(text: string): string {
  return text
    .replace(/[|©®™]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickBestSearchTerm(lines: string[]): string {
  if (lines.length === 0) return "";
  if (lines.length === 1) return lines[0];
  const longest = lines.reduce((a, b) => (a.length >= b.length ? a : b));
  const first = lines[0] ?? "";
  return longest.length >= 4 ? longest : first;
}

function ResultCard({ card, onReset }: { card: CardType; onReset: () => void }) {
  const latestPrice = card.prices[0]?.value ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Zap className="size-4 text-emerald-400" />
          Carta Identificada
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs gap-1"
        >
          <RotateCcw className="size-3" />
          Nova Leitura
        </Button>
      </div>

      <Link href={`/card/${card.id}`}>
        <Card className="bg-card/50 backdrop-blur-sm border-border hover:bg-background/50 transition-all">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="shrink-0 w-20 rounded-md overflow-hidden">
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  width={80}
                  height={112}
                  className="w-full aspect-5/7 object-cover rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <h3 className="text-base font-bold text-foreground truncate">
                  {card.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {card.setName ?? card.setCode}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5">
                    {card.rarity}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {card.setCode}
                  </span>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <TrendingUp className="size-3.5 text-emerald-400" />
                  <span className="text-lg font-bold text-foreground font-mono">
                    R$ {formatPrice(latestPrice)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      <div className="flex gap-2">
        <Button asChild className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold gap-2">
          <Link href={`/card/${card.id}`}>
            <Plus className="size-4" />
            Ver Detalhes / Adicionar
          </Link>
        </Button>
      </div>
    </div>
  );
}

function MultipleResults({
  cards,
  onSelect,
  onReset,
}: {
  cards: CardType[];
  onSelect: (card: CardType) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          {cards.length} resultados encontrados
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs gap-1"
        >
          <RotateCcw className="size-3" />
          Nova Leitura
        </Button>
      </div>
      <div className="space-y-2">
        {cards.map((card) => {
          const price = card.prices[0]?.value ?? 0;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelect(card)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-background/50 transition-all text-left cursor-pointer"
            >
              <div className="shrink-0 size-10 rounded overflow-hidden">
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {card.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {card.setName ?? card.setCode} • {card.rarity}
                </p>
              </div>
              <span className="text-sm font-bold text-foreground font-mono shrink-0">
                R$ {formatPrice(price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DesktopScanFallback() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-20 space-y-10">
      <div className="text-center space-y-3">
        <div className="mx-auto size-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Smartphone className="size-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Scanner de Cartas
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Aponte a câmera do celular para uma carta e descubra o preço
          instantaneamente. Funciona com Pokémon, Yu-Gi-Oh!, Magic e One Piece.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 space-y-5">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Como usar no celular
        </h2>

        <div className="space-y-4">
          <StepItem
            number={1}
            title="Abra no celular"
            description="Acesse este site pelo navegador do seu celular (Chrome, Safari, etc)."
          />
          <StepItem
            number={2}
            title="Instale o app"
            description={
              <>
                <strong>Android/Chrome:</strong> Toque no menu (⋮) e selecione
                &quot;Instalar app&quot; ou &quot;Adicionar à tela
                inicial&quot;.
                <br />
                <strong>iPhone/Safari:</strong> Toque em{" "}
                <ScanLine className="inline size-3.5 -mt-0.5" /> Compartilhar e
                depois &quot;Adicionar à Tela de Início&quot;.
              </>
            }
          />
          <StepItem
            number={3}
            title="Escaneie suas cartas"
            description="Abra o app instalado, vá em Scan e aponte a câmera para qualquer carta TCG."
          />
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Enquanto isso, explore o catálogo completo pelo computador:
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/explore">
            <Button>
              <Search className="size-4 mr-2" />
              Buscar cartas
            </Button>
          </Link>
          <Link href="/sets">
            <Button variant="outline">Explorar sets</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="size-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 text-sm font-bold">
        {number}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function ScanPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { videoRef, canvasRef, isActive, error: cameraError, start, stop, capture } = useCamera();
  const [state, setState] = useState<ScanState>("idle");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [results, setResults] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [processing, setProcessing] = useState(false);
  const workerRef = useRef<import("tesseract.js").Worker | null>(null);

  const initOcr = useCallback(async () => {
    if (workerRef.current) return workerRef.current;
    const Tesseract = await import("tesseract.js");
    const worker = await Tesseract.createWorker(["eng", "por"]);
    workerRef.current = worker;
    return worker;
  }, []);

  async function handleCapture() {
    const dataUrl = capture();
    if (!dataUrl) return;

    setState("processing");
    setProcessing(true);
    try {
      const worker = await initOcr();
      const { data } = await worker.recognize(dataUrl);
      const text = data.text.trim();
      setRecognizedText(text);

      if (!text) {
        toast.error("Nenhum texto reconhecido. Tire a foto da carta inteira.");
        setState("camera");
        setProcessing(false);
        return;
      }

      const rawLines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
      const lines = rawLines.map(cleanOcrText).filter((l) => l.length > 2);
      const query = pickBestSearchTerm(lines);
      await searchCards(query, lines);
    } catch {
      toast.error("Erro ao processar imagem");
      setState("camera");
    } finally {
      setProcessing(false);
    }
  }

  async function searchCards(primaryQuery: string, allLines: string[] = []) {
    try {
      let cards: CardType[] = [];
      const extraLines = allLines
        .filter((l) => l !== primaryQuery && l.length >= 3)
        .slice(0, 3);
      const words = primaryQuery
        .split(/\s+/)
        .filter((w) => w.length >= 4)
        .slice(0, 3);
      const termsToTry = [
        primaryQuery,
        ...extraLines,
        ...words,
      ];

      for (const term of termsToTry) {
        if (!term.trim()) continue;
        const found = await api.cards.list(term.trim());
        if (found.length > 0) {
          cards = found;
          break;
        }
      }

      setResults(cards);

      if (cards.length === 0) {
        toast.info(
          `Nenhuma carta encontrada. Texto lido: "${primaryQuery.slice(0, 30)}${primaryQuery.length > 30 ? "…" : ""}"`,
        );
        setState("camera");
      } else {
        setSelectedCard(cards.length === 1 ? cards[0] : null);
        setDrawerOpen(true);
      }
    } catch {
      toast.error("Erro ao buscar cartas");
      setState("camera");
    }
  }

  function handleReset() {
    setDrawerOpen(false);
    setResults([]);
    setSelectedCard(null);
    setRecognizedText("");
  }

  async function handleStartCamera() {
    const ok = await start();
    if (ok) {
      setState("camera");
    }
  }

  const hasTriedStart = useRef(false);
  useEffect(() => {
    if (isMobile && !hasTriedStart.current) {
      hasTriedStart.current = true;
      handleStartCamera();
    }
  }, [isMobile]);

  if (!isMobile) return <DesktopScanFallback />;

  return (
    <main className="fixed inset-0 flex flex-col bg-black">
      {/* Full-screen camera */}
      {(state === "camera" || state === "processing") && (
        <div className="relative flex-1 min-h-0">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Processing overlay */}
          {processing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
              <Loader2 className="size-12 text-white animate-spin" />
              <p className="text-white font-medium">Identificando carta...</p>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 inset-x-0 p-6 pb-10 bg-linear-to-t from-black/90 to-transparent">
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  stop();
                  handleReset();
                  router.back();
                }}
                className="size-12 rounded-full border-white/30 text-white hover:bg-white/20 bg-black/40"
              >
                <X className="size-6" />
              </Button>

              <button
                type="button"
                onClick={handleCapture}
                disabled={processing}
                className="size-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl shadow-emerald-500/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 className="size-8 animate-spin" />
                ) : (
                  <Camera className="size-8" />
                )}
              </button>

              <div className="size-12" />
            </div>
            <p className="text-center text-white/80 text-sm mt-3">
              Tire a foto da carta inteira
            </p>
          </div>
        </div>
      )}

      {/* Idle: waiting for camera */}
      {state === "idle" && !cameraError && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <div className="size-20 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
            <Camera className="size-10 text-emerald-400" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">
              Abrindo câmera...
            </p>
            <p className="text-sm text-white/70">
              Permita o acesso à câmera para escanear cartas
            </p>
          </div>
          <Button
            onClick={handleStartCamera}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold gap-2"
          >
            <Camera className="size-4" />
            Abrir Câmera
          </Button>
        </div>
      )}

      {/* Error state */}
      {cameraError && state === "idle" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="size-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <CameraOff className="size-7 text-red-400" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-red-400">
                  {cameraError.type === "no-https"
                    ? "Conexão não segura"
                    : cameraError.type === "denied"
                      ? "Permissão negada"
                      : "Câmera indisponível"}
                </p>
                <p className="text-xs text-white/80 leading-relaxed max-w-xs mx-auto">
                  {cameraError.message}
                </p>
              </div>
            </div>

            {cameraError.type === "no-https" && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-amber-400">
                  Como resolver:
                </p>
                <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    Acesse via <code className="text-foreground">https://</code>{" "}
                    (necessário em produção)
                  </li>
                  <li>
                    Em desenvolvimento, use{" "}
                    <code className="text-foreground">localhost</code> no
                    próprio celular
                  </li>
                  <li>
                    Ou use um túnel HTTPS como{" "}
                    <code className="text-foreground">ngrok</code>
                  </li>
                </ul>
              </div>
            )}

            {cameraError.type === "denied" && (
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-blue-400">
                  Como permitir:
                </p>
                <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <strong>Android:</strong> Configurações &gt; Apps &gt;
                    Chrome &gt; Permissões &gt; Câmera
                  </li>
                  <li>
                    <strong>iPhone:</strong> Ajustes &gt; Safari &gt; Câmera
                    &gt; Permitir
                  </li>
                  <li>Ou toque no ícone de cadeado na barra de endereço</li>
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {cameraError.type !== "no-https" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartCamera}
                  className="w-full"
                >
                  <Camera className="size-4 mr-2" />
                  Tentar Novamente
                </Button>
              )}
            </div>

            <Separator className="border-white/20" />

            <p className="text-[10px] text-white/60 text-center">
              Recarregue a página e tente novamente
            </p>
        </div>
      )}

      {/* Results Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-background border-border max-h-[85vh]">
          <DrawerHeader className="px-5 py-4">
            <DrawerTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="size-4 text-emerald-400" />
              {results.length === 1 ? "Carta identificada" : `${results.length} resultados`}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-5 pb-6 overflow-y-auto">
            {selectedCard ? (
              <ResultCard card={selectedCard} onReset={handleReset} />
            ) : (
              <MultipleResults
                cards={results}
                onSelect={(card) => {
                  setSelectedCard(card);
                }}
                onReset={handleReset}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  );
}
