"use client";

import { IconSparkles, IconX } from "@tabler/icons-react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { api, type Card, type RarityExample } from "@/lib/api";

const TCGS: { slug: string; name: string }[] = [
  { slug: "yugioh", name: "Yu-Gi-Oh!" },
  { slug: "pokemon", name: "Pokémon" },
  { slug: "magic", name: "Magic" },
  { slug: "onepiece", name: "One Piece" },
];

/**
 * Imagem de carta com tilt 3D no cursor + brilho (glare). `object-contain` +
 * fundo garante que a carta INTEIRA apareça (as de Yu-Gi-Oh! são um pouco mais
 * altas que 5/7 e estavam sendo cortadas pelo object-cover). Reutilizada no
 * grid e no modal.
 */
function TiltImage({
  imageUrl,
  rarity,
  sizes,
  className = "",
  strength = 12,
}: {
  imageUrl: string;
  rarity: string;
  sizes: string;
  className?: string;
  strength?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const mx = useSpring(px, { stiffness: 220, damping: 18 });
  const my = useSpring(py, { stiffness: 220, damping: 18 });
  const rotateX = useTransform(my, [-0.5, 0.5], [`${strength}deg`, `${-strength}deg`]);
  const rotateY = useTransform(mx, [-0.5, 0.5], [`${-strength}deg`, `${strength}deg`]);
  const glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.28), transparent 55%)`;

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div className={`[perspective:1000px] ${className}`}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group/tilt relative flex aspect-[5/7] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-b from-muted/60 to-muted p-1.5 shadow-md transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/20"
      >
        {imgError ? (
          <div className="flex flex-col items-center gap-1 p-2 text-center">
            <span className="text-xs font-bold text-muted-foreground">
              {rarity}
            </span>
            <span className="text-[9px] text-muted-foreground/70">
              sem imagem
            </span>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={rarity}
            fill
            sizes={sizes}
            className="object-contain drop-shadow-sm"
            onError={() => setImgError(true)}
          />
        )}
        <motion.div
          style={{ backgroundImage: glare }}
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-200 group-hover/tilt:opacity-100"
        />
      </motion.div>
    </div>
  );
}

/** Carta do grid: imagem com tilt + legenda (raridade · contagem). */
function RarityCard({
  item,
  index,
  onOpen,
}: {
  item: RarityExample;
  index: number;
  onOpen: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="group block w-full cursor-pointer text-left"
      >
        <TiltImage imageUrl={item.imageUrl} rarity={item.rarity} sizes="(max-width: 640px) 45vw, 220px" />
        <div className="mt-2.5 px-0.5">
          <p className="truncate text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
            {item.rarity}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {item.count.toLocaleString("pt-BR")} cartas
          </p>
        </div>
      </button>
    </motion.div>
  );
}

type TourStep = {
  title: string;
  text: string;
  accent?: boolean;
  box?: React.CSSProperties;
};

// Como identificar cada raridade — POR TCG (a mesma palavra "Rare" significa
// coisas diferentes em cada jogo). Dentro de cada jogo: do mais específico ao
// mais genérico (casamos por "inclui a chave").
const RARITY_HELP: Record<string, { key: string; text: string }[]> = {
  yugioh: [
    { key: "quarter century", text: "Selo do 25º aniversário (prata) + nome holográfico." },
    { key: "starlight", text: "A carta INTEIRA é cristalizada (efeito diamante)." },
    { key: "collector", text: "Holografia escura e metálica em toda a carta." },
    { key: "ultimate", text: "Detalhes em ALTO-RELEVO na arte e bordas." },
    { key: "ghost", text: "Arte prateada 3D 'fantasma'." },
    { key: "prismatic secret", text: "Holo prismático (linhas) + nome arco-íris." },
    { key: "secret", text: "Nome em holo ARCO-ÍRIS (diagonal, várias cores)." },
    { key: "ultra", text: "Nome em DOURADO + arte holográfica." },
    { key: "super", text: "Arte holográfica (foil), nome em prata." },
    { key: "gold", text: "Nome e bordas DOURADOS." },
    { key: "platinum", text: "Efeito platina prateado texturizado." },
    { key: "rare", text: "Nome em PRATA (letras prateadas), sem holo na arte." },
    { key: "common", text: "Sem foil, nome em preto — a versão mais comum." },
  ],
  pokemon: [
    { key: "special illustration", text: "Arte alternativa em full art (fundo todo ilustrado)." },
    { key: "illustration", text: "Arte que estende além do quadro tradicional." },
    { key: "hyper", text: "Textura e nome DOURADOS (gold), no fim do set." },
    { key: "double rare", text: "Duas estrelas pretas — as cartas ex atuais." },
    { key: "ultra", text: "Full Art (V, ex, VMAX, VSTAR...)." },
    { key: "rare holo", text: "★ estrela preta + arte holográfica no quadro." },
    { key: "rare", text: "★ estrela preta (sem holografia)." },
    { key: "uncommon", text: "◆ losango preto no rodapé." },
    { key: "common", text: "● círculo preto no rodapé." },
  ],
  magic: [
    { key: "mythic", text: "Símbolo de expansão LARANJA/bronze." },
    { key: "rare", text: "Símbolo de expansão DOURADO." },
    { key: "uncommon", text: "Símbolo de expansão PRATEADO." },
    { key: "common", text: "Símbolo de expansão PRETO." },
  ],
  onepiece: [
    { key: "special", text: "Estrela ★ acima da sigla (arte alternativa/parallel)." },
    { key: "secret", text: "Sigla SEC — arte especial rara." },
    { key: "super", text: "Sigla SR — foil forte." },
    { key: "leader", text: "Sigla L — carta de Líder." },
    { key: "uncommon", text: "Sigla UC — prateada." },
    { key: "rare", text: "Sigla R — arte holográfica." },
    { key: "common", text: "Sigla C — sem foil." },
  ],
};
function rarityHelp(rarity: string, slug: string) {
  const list = RARITY_HELP[slug] ?? [];
  const l = rarity.toLowerCase();
  return (
    list.find((r) => l.includes(r.key))?.text ??
    "Compare o acabamento (brilho/foil) e o símbolo com os outros exemplos do guia."
  );
}

// Onde cada elemento fica em cada TCG (% da carta) — layouts são padronizados
// por jogo, então dá pra apontar a região certa de cada um.
type Region = React.CSSProperties;
const REGIONS: Record<
  string,
  { name: Region; rarity: Region; code: Region; stats: Region; art: Region }
> = {
  // YGO (conferido): nome no topo (largura toda, inclui o atributo); CÓDIGO
  // logo ABAIXO da arte, à DIREITA (~74%); ATK/DEF no rodapé direito.
  yugioh: {
    name: { top: "3.4%", left: "4%", right: "3%", height: "9.5%" },
    rarity: { top: "3.4%", left: "4%", right: "3%", height: "9.5%" },
    code: { top: "73.5%", right: "4%", width: "34%", height: "4.5%" },
    stats: { bottom: "4.5%", right: "3%", width: "42%", height: "4.5%" },
    art: { top: "16%", left: "7%", right: "7%", height: "57%" },
  },
  // Pokémon: nome no topo; raridade = SÍMBOLO no canto inferior direito.
  pokemon: {
    name: { top: "4%", left: "6%", width: "62%", height: "7.5%" },
    rarity: { bottom: "2.5%", right: "3%", width: "18%", height: "5%" },
    code: { bottom: "2.5%", left: "4%", width: "34%", height: "5%" },
    stats: { top: "4%", right: "4%", width: "26%", height: "7.5%" },
    art: { top: "13%", left: "8%", right: "8%", height: "39%" },
  },
  // Magic: nome topo-esq; raridade = SÍMBOLO de expansão à direita da linha de
  // tipo (meio); CÓDIGO no canto inferior esquerdo.
  magic: {
    name: { top: "4%", left: "5%", width: "72%", height: "6.5%" },
    rarity: { top: "53%", right: "4%", width: "13%", height: "6%" },
    code: { bottom: "2.5%", left: "4%", width: "48%", height: "4.5%" },
    stats: { bottom: "3.5%", right: "4%", width: "24%", height: "7%" },
    art: { top: "11%", left: "8%", right: "8%", height: "40%" },
  },
  // One Piece: nome no TOPO; Power no canto superior direito; raridade + número
  // JUNTOS no canto inferior direito (ex.: OP01-001 SEC).
  onepiece: {
    name: { top: "4%", left: "6%", right: "6%", height: "8%" },
    rarity: { bottom: "3%", right: "4%", width: "44%", height: "5%" },
    code: { bottom: "3%", right: "4%", width: "44%", height: "5%" },
    stats: { top: "4%", right: "5%", width: "20%", height: "9%" },
    art: { top: "13%", left: "6%", right: "6%", height: "46%" },
  },
};

function buildTour(item: RarityExample, card: Card | null): TourStep[] {
  const slug = card?.tcg?.slug ?? "pokemon";
  const R = REGIONS[slug] ?? REGIONS.pokemon;
  const name = card?.name ?? item.exampleName ?? "";

  const steps: TourStep[] = [
    {
      title: "Nome",
      text: name ? `“${name}” — o nome da carta.` : "O nome da carta.",
      box: R.name,
    },
    {
      title: `Raridade: ${item.rarity}`,
      text: rarityHelp(item.rarity, slug),
      accent: true,
      box: R.rarity,
    },
  ];
  if (card?.collectorNumber)
    steps.push({
      title: "Código",
      text: `${card.collectorNumber} — identifica a edição. O “EN”, “PT” etc. é só o idioma: a mesma carta em outra língua tem o mesmo número.`,
      box: R.code,
    });
  if (card?.atk != null || card?.def != null)
    steps.push({
      title: "ATK / DEF",
      text: `${card?.atk ?? "?"} / ${card?.def ?? "?"} — ataque e defesa do monstro.`,
      box: R.stats,
    });
  steps.push({
    title: "Arte",
    text: "A ilustração. O acabamento (foil/holográfico) muda conforme a raridade — é o que você compara pra identificar.",
    box: R.art,
  });
  return steps;
}

/** Modal = mini-tour anotado pela carta (destaca cada parte + como achar a raridade). */
function CardModal({
  item,
  onClose,
}: {
  item: RarityExample;
  onClose: () => void;
}) {
  const [card, setCard] = useState<Card | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!item.exampleCardId) return;
    let alive = true;
    api.cards
      .get(item.exampleCardId)
      .then((c) => alive && setCard(c))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [item.exampleCardId]);

  const steps = buildTour(item, card);
  const idx = Math.min(step, steps.length - 1);
  const cur = steps[idx];
  const isLast = idx === steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.92, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card relative flex max-h-[90vh] w-full max-w-2xl flex-col items-center gap-5 overflow-y-auto !rounded-2xl p-6 sm:flex-row sm:items-stretch sm:gap-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
        >
          <IconX className="size-4" />
        </button>

        {/* Carta com spotlight na parte do passo atual */}
        <div className="relative aspect-[5/7] w-56 shrink-0 overflow-hidden rounded-xl border border-border bg-gradient-to-b from-muted/60 to-muted sm:w-64">
          <Image
            src={item.imageUrl}
            alt={item.rarity}
            fill
            sizes="300px"
            className="object-contain"
          />
          {cur.box && (
            <div
              className="pointer-events-none absolute rounded-md ring-2 ring-primary transition-all duration-300 ease-out"
              style={{ ...cur.box, boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" }}
            />
          )}
        </div>

        {/* Painel do tour */}
        <div className="flex min-h-[15rem] min-w-0 flex-1 flex-col">
          <p className="text-[11px] font-bold uppercase tracking-wider text-tertiary">
            {card?.tcg?.name ?? "Carta"} · Passo {idx + 1}/{steps.length}
          </p>
          <h3
            className={`mt-0.5 text-lg font-bold leading-tight ${
              cur.accent ? "text-primary" : "text-foreground"
            }`}
          >
            {cur.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {cur.text}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-6">
            <button
              type="button"
              onClick={() => setStep((v) => Math.max(0, v - 1))}
              disabled={idx === 0}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              Anterior
            </button>
            <div className="flex items-center gap-1.5">
              {steps.map((st, i) => (
                <span
                  key={st.title}
                  className={`size-1.5 rounded-full transition-colors ${
                    i === idx ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => (isLast ? onClose() : setStep((v) => v + 1))}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {isLast ? "Concluir" : "Próximo"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function RaridadesPage() {
  const [data, setData] = useState<Record<string, RarityExample[] | "loading">>(
    Object.fromEntries(TCGS.map((t) => [t.slug, "loading"])),
  );
  const [selected, setSelected] = useState<RarityExample | null>(null);

  useEffect(() => {
    let alive = true;
    for (const t of TCGS) {
      api.cards
        .rarities(t.slug)
        .then((rows) => alive && setData((p) => ({ ...p, [t.slug]: rows })))
        .catch(() => alive && setData((p) => ({ ...p, [t.slug]: [] })));
    }
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-tertiary/30 bg-tertiary/10 px-3 py-1">
          <IconSparkles className="size-3.5 text-tertiary" />
          <span className="text-xs font-semibold text-tertiary">Tutorial</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Identifique sua raridade
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Passe o mouse nas cartas para vê-las em 3D e clique para abrir os
          detalhes. Cada jogo marca a raridade de um jeito — compare os exemplos,
          da mais comum à mais rara.
        </p>
      </div>

      <div className="space-y-14">
        {TCGS.map((t) => {
          const rows = data[t.slug];
          return (
            <section key={t.slug}>
              <div className="mb-5 flex items-baseline gap-3">
                <h2 className="text-xl font-bold text-foreground">{t.name}</h2>
                {Array.isArray(rows) && rows.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {rows.length} raridades
                  </span>
                )}
              </div>

              {rows === "loading" ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: placeholders estáticos
                      key={i}
                      className="aspect-[5/7] w-full animate-pulse rounded-xl bg-muted"
                    />
                  ))}
                </div>
              ) : rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sem raridades sincronizadas ainda.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-5">
                  {rows.map((r, i) => (
                    <RarityCard
                      key={r.rarity}
                      item={r}
                      index={i}
                      onOpen={() => setSelected(r)}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-14 text-center text-xs text-muted-foreground">
        Ao escanear, o Mint Foil já identifica a raridade automaticamente pelo
        código e pela arte da carta.
      </p>

      <AnimatePresence>
        {selected && (
          <CardModal item={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
