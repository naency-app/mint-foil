"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCamera, type CameraError } from "@/hooks/use-camera";
import { api } from "@/lib/api";
import type { Card as CardType } from "@/lib/api";
import {
  Camera,
  CameraOff,
  Loader2,
  Monitor,
  Plus,
  RotateCcw,
  Search,
  ScanLine,
  Smartphone,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
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
  const isMobile = useIsMobile();
  const { videoRef, canvasRef, isActive, error: cameraError, start, stop, capture } = useCamera();
  const [state, setState] = useState<ScanState>("idle");
  const [recognizedText, setRecognizedText] = useState("");
  const [results, setResults] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [manualSearch, setManualSearch] = useState("");
  const [processing, setProcessing] = useState(false);
  const workerRef = useRef<import("tesseract.js").Worker | null>(null);

  const initOcr = useCallback(async () => {
    if (workerRef.current) return workerRef.current;
    const Tesseract = await import("tesseract.js");
    const worker = await Tesseract.createWorker("eng");
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
        toast.error("Nenhum texto reconhecido. Tente aproximar mais a carta.");
        setState("camera");
        setProcessing(false);
        return;
      }

      const firstLine = text.split("\n")[0].trim();
      await searchCards(firstLine);
    } catch {
      toast.error("Erro ao processar imagem");
      setState("camera");
    } finally {
      setProcessing(false);
    }
  }

  async function searchCards(query: string) {
    try {
      const cards = await api.cards.list(query);
      setResults(cards);

      if (cards.length === 0) {
        toast.info(`Nenhuma carta encontrada para "${query}"`);
        setState("camera");
      } else if (cards.length === 1) {
        setSelectedCard(cards[0]);
        setState("results");
        stop();
      } else {
        setState("results");
        stop();
      }
    } catch {
      toast.error("Erro ao buscar cartas");
      setState("camera");
    }
  }

  async function handleManualSearch() {
    if (!manualSearch.trim()) return;
    setProcessing(true);
    setState("processing");
    await searchCards(manualSearch.trim());
    setProcessing(false);
  }

  function handleReset() {
    setResults([]);
    setSelectedCard(null);
    setRecognizedText("");
    setState("idle");
  }

  async function handleStartCamera() {
    const ok = await start();
    if (ok) {
      setState("camera");
    }
  }

  if (!isMobile) return <DesktopScanFallback />;

  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <ScanLine className="size-6 text-emerald-400" />
          Scan de Carta
        </h1>
        <p className="text-sm text-muted-foreground">
          Aponte a câmera para o nome da carta ou busque manualmente
        </p>
      </div>

      {/* Manual Search */}
      <div className="rounded-xl border border-border bg-card backdrop-blur-sm p-4 space-y-3">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Busca Manual
        </h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={manualSearch}
              onChange={(e) => setManualSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
              placeholder="Nome da carta..."
              className="pl-10"
            />
          </div>
          <Button onClick={handleManualSearch} disabled={processing}>
            {processing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Buscar"
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium">ou</span>
        <Separator className="flex-1" />
      </div>

      {/* Camera Section */}
      <div className="rounded-xl border border-border bg-card backdrop-blur-sm overflow-hidden">
        {state === "idle" && (
          <div className="p-8 flex flex-col items-center gap-4">
            <div className="size-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <Camera className="size-8 text-emerald-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                Escanear com Câmera
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Aponte a câmera traseira para o nome da carta. O OCR vai
                reconhecer o texto e buscar no catálogo.
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

        {(state === "camera" || state === "processing") && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-4/3 object-cover bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80%] h-12 border-2 border-emerald-400/60 rounded-lg relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-emerald-400 font-medium whitespace-nowrap">
                  Alinhe o nome da carta aqui
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-linear-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => { stop(); handleReset(); }}
                  className="size-10 rounded-full border-white/20 text-white hover:bg-white/10 bg-black/40"
                >
                  <X className="size-5" />
                </Button>

                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={processing}
                  className="size-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : (
                    <Camera className="size-6" />
                  )}
                </button>

                <div className="size-10" />
              </div>
            </div>
          </div>
        )}

        {cameraError && (
          <div className="p-6 space-y-4">
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
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
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

            <Separator />

            <p className="text-[10px] text-muted-foreground text-center">
              Use a busca manual acima como alternativa
            </p>
          </div>
        )}
      </div>

      {/* Recognized Text */}
      {recognizedText && state === "results" && (
        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Texto Reconhecido
          </p>
          <p className="text-xs text-foreground font-mono">{recognizedText}</p>
        </div>
      )}

      {/* Results */}
      {state === "results" && selectedCard && (
        <ResultCard card={selectedCard} onReset={handleReset} />
      )}

      {state === "results" && !selectedCard && results.length > 0 && (
        <MultipleResults
          cards={results}
          onSelect={(card) => setSelectedCard(card)}
          onReset={handleReset}
        />
      )}
    </main>
  );
}
