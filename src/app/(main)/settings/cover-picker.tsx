"use client";

import { Check, Crown, Image as ImageIcon, Lock } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { COVER_PRESETS, type CoverPreset } from "@/lib/cover-catalog";

/**
 * Galeria de fundos do perfil, espelho da tela do app.
 *
 * Os fundos são desenhados em CSS a partir do catálogo compartilhado: o banco
 * guarda só o slug, então adicionar fundo é mudança de catálogo nos dois
 * clientes, sem storage nem deploy do backend.
 */
export function CoverPicker({
  currentType,
  currentValue,
  isPro,
  onChange,
  onSaved,
  onUpgrade,
}: {
  currentType: string;
  currentValue: string | null;
  isPro: boolean;
  /**
   * Avisa o pai na hora da escolha (e de novo se o salvamento falhar, com o
   * valor anterior). É o que faz a capa do cabeçalho mudar junto — a sessão só
   * se atualiza no próximo carregamento.
   */
  onChange?: (type: string, value: string | null) => void;
  /** Chamado após o servidor confirmar — o pai recarrega a sessão. */
  onSaved?: () => void;
  /** Chamado ao tocar num fundo Pro sem assinatura. */
  onUpgrade?: () => void;
}) {
  const [sel, setSel] = useState<{ type: string; value: string | null }>({
    type: currentType,
    value: currentValue,
  });
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const livres = COVER_PRESETS.filter((p) => p.tier === "free");
  const pros = COVER_PRESETS.filter((p) => p.tier === "pro");
  const padraoSelecionado = sel.type !== "preset";

  // Escolha otimista: o card marca na hora e só volta atrás se falhar. Esperar
  // o servidor para pintar o check faz a galeria parecer travada.
  async function aplicar(type: "gradient" | "preset", value: string | null) {
    const anterior = sel;
    setSel({ type, value });
    onChange?.(type, value);
    setSalvando(value ?? "gradient");
    setErro(null);
    try {
      await api.users.updateCover(type, value);
      onSaved?.();
    } catch {
      setSel(anterior);
      onChange?.(anterior.type, anterior.value);
      setErro("Não foi possível salvar. Tente de novo.");
    } finally {
      setSalvando(null);
    }
  }

  return (
    <section className="glass-card !rounded-2xl space-y-4 p-6">
      <h2 className="flex items-center gap-2 font-bold text-foreground text-sm uppercase tracking-wider">
        <ImageIcon className="size-4 text-primary" />
        Fundo do perfil
      </h2>
      <Separator />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => aplicar("gradient", null)}
          className={`relative h-20 overflow-hidden rounded-xl border-2 bg-gradient-to-b from-primary/40 to-primary/10 text-left transition ${
            padraoSelecionado ? "border-primary" : "border-transparent"
          }`}
        >
          <span className="absolute bottom-2 left-3 font-bold text-foreground text-sm">
            Padrão
          </span>
          {padraoSelecionado && salvando !== "gradient" && <Selo />}
        </button>

        {livres.map((p) => (
          <CardFundo
            key={p.id}
            preset={p}
            selecionado={sel.type === "preset" && sel.value === p.id}
            onClick={() => aplicar("preset", p.id)}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 font-black text-[10px] text-white tracking-wide">
          <Crown className="size-3" />
          PRO
        </span>
        <h3 className="font-extrabold text-base text-foreground">Fundos Pro</h3>
      </div>
      {!isPro && (
        <p className="-mt-2 text-muted-foreground text-xs">
          Assine o Pro para usar estes fundos.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {pros.map((p) => (
          <CardFundo
            key={p.id}
            preset={p}
            selecionado={sel.type === "preset" && sel.value === p.id}
            bloqueado={!isPro}
            onClick={() => (isPro ? aplicar("preset", p.id) : onUpgrade?.())}
          />
        ))}
      </div>

      {erro && <p className="text-destructive text-sm">{erro}</p>}
    </section>
  );
}

function Selo() {
  return (
    <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary">
      <Check className="size-3.5 text-white" strokeWidth={3} />
    </span>
  );
}

function CardFundo({
  preset,
  selecionado,
  bloqueado,
  onClick,
}: {
  preset: CoverPreset;
  selecionado: boolean;
  bloqueado?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // Bloqueado continua clicável de propósito: é o gatilho do upsell,
      // e um botão inerte não conta por que não funcionou.
      className={`relative h-20 overflow-hidden rounded-xl border-2 text-left transition ${
        selecionado ? "border-primary" : "border-transparent"
      }`}
      style={{
        background: `linear-gradient(to bottom, ${preset.colors.join(", ")})`,
      }}
    >
      <span className="absolute bottom-2 left-3 font-bold text-sm text-white">
        {preset.name}
      </span>
      {bloqueado ? (
        <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/45">
          <Lock className="size-3 text-white" />
        </span>
      ) : (
        selecionado && <Selo />
      )}
    </button>
  );
}
