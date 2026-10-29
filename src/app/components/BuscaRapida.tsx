"use client";

import {
  IconArrowRight,
  IconCards,
  IconClock,
  IconCompass,
  IconSearch,
  IconStack2,
  IconX,
} from "@tabler/icons-react";
import { Command as CommandPrimitive } from "cmdk";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { CardImage } from "@/app/components/CardImage";
import { FAN_POSITIONS } from "@/app/components/SetCard";
import { destacar, formatPrice } from "@/app/components/SugestoesBusca";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import type { SugestoesBusca } from "@/lib/api";
import { useExploreHref } from "@/lib/explore-href";
import { useSugestoesBusca } from "@/lib/queries";
import { TEMAS } from "@/lib/temas";
import { cn } from "@/lib/utils";

type Nome = SugestoesBusca["nomes"][number];
type Colecao = SugestoesBusca["colecoes"][number];
type Carta = SugestoesBusca["cartas"][number];

/** O que o painel da direita mostra para o item marcado. */
type Previa =
  | { tipo: "carta"; carta: Carta }
  | { tipo: "nome"; nome: Nome }
  | { tipo: "colecao"; colecao: Colecao }
  | { tipo: "icone"; icone: ReactNode; titulo: string; texto: string };

/** Mesmo intervalo do autocomplete do Explorar: a lista é leve. */
const ESPERA_MS = 120;
/** A mesma chave das buscas recentes do Explorar: as duas listas são uma só. */
const RECENTES = "recent_searches";

function lerRecentes(): string[] {
  try {
    const salvo = JSON.parse(localStorage.getItem(RECENTES) ?? "[]");
    return Array.isArray(salvo)
      ? salvo.filter((t) => typeof t === "string")
      : [];
  } catch {
    return [];
  }
}

/** Grava a lista de recentes (vazia = apaga a chave). */
function gravarRecentes(lista: string[]) {
  try {
    if (lista.length) localStorage.setItem(RECENTES, JSON.stringify(lista));
    else localStorage.removeItem(RECENTES);
  } catch {
    // Modo privado / storage bloqueado: só não lembra
  }
}

function guardarRecente(termo: string) {
  const limpo = termo.trim();
  if (!limpo) return;
  try {
    const lista = [
      limpo,
      ...lerRecentes().filter((t) => t.toLowerCase() !== limpo.toLowerCase()),
    ].slice(0, 8);
    localStorage.setItem(RECENTES, JSON.stringify(lista));
  } catch {
    // Modo privado / storage bloqueado: só não lembra a busca
  }
}

/** Campo de texto em foco: aí "/" é letra, não atalho. */
function digitando(alvo: EventTarget | null) {
  const el = alvo as HTMLElement | null;
  return (
    !!el &&
    (el.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
  );
}

/**
 * Busca rápida (24/10): ⌘K / Ctrl+K — ou "/" — de qualquer página abre a
 * busca do Explorar numa janela. Mesmas sugestões do autocomplete (nomes,
 * coleções e a carta exata pelo código, da rota /cards/sugestoes), com a arte
 * do item marcado num painel ao lado, que acompanha as setas.
 *
 * Não tem estado próprio de busca: escolher navega para a URL do Explorar
 * (`?q=`, `?tcg=&set=`) ou para a carta, e o Explorar já sabe se montar a
 * partir da URL. As buscas recentes são as mesmas do campo do Explorar.
 */
export function BuscaRapida() {
  const router = useRouter();
  const pathname = usePathname();
  const exploreHref = useExploreHref();
  const { theme, setTheme } = useTheme();
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const [esperado, setEsperado] = useState("");
  const [marcado, setMarcado] = useState("");
  const [recentes, setRecentes] = useState<string[]>([]);
  const campoRef = useRef<HTMLInputElement>(null);
  // "⌘" no Mac, "Ctrl" no resto — decidido no cliente, sem divergir do SSR
  const [mac, setMac] = useState(true);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAberto((a) => !a);
      } else if (
        e.key === "/" &&
        !digitando(e.target) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        setAberto(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Navegou (escolheu algo, voltou no histórico): a janela some
  // biome-ignore lint/correctness/useExhaustiveDependencies: `pathname` é o gatilho, não um valor lido aqui
  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  // Abre limpa, com as recentes do momento (o Explorar pode ter mudado a lista)
  useEffect(() => {
    if (!aberto) return;
    setTermo("");
    setEsperado("");
    setRecentes(lerRecentes());
  }, [aberto]);

  useEffect(() => {
    const t = setTimeout(() => setEsperado(termo), ESPERA_MS);
    return () => clearTimeout(t);
  }, [termo]);

  const buscando = termo.trim().length >= 2;
  const { data, isFetching } = useSugestoesBusca(buscando ? esperado : "");
  const cartas = buscando ? (data?.cartas ?? []) : [];
  const nomes = buscando ? (data?.nomes ?? []) : [];
  const colecoes = buscando ? (data?.colecoes ?? []) : [];

  function limparRecentes() {
    gravarRecentes([]);
    setRecentes([]);
    campoRef.current?.focus();
  }
  function removerRecente(termo: string) {
    const lista = recentes.filter((r) => r !== termo);
    gravarRecentes(lista);
    setRecentes(lista);
    campoRef.current?.focus();
  }

  function ir(href: string) {
    setAberto(false);
    router.push(href);
  }
  function buscar(q: string) {
    guardarRecente(q);
    ir(`/explore?q=${encodeURIComponent(q.trim())}`);
  }

  // Os outros temas (o atual não precisa de atalho)
  const temas = TEMAS.filter((t) => t.value !== theme);
  const paginas = [
    {
      valor: "ir:explorar",
      rotulo: "Explorar",
      href: exploreHref,
      icone: <IconCompass />,
      texto: "Todas as cartas, com filtros e preço em real.",
    },
    {
      valor: "ir:portfolio",
      rotulo: "Portfólio",
      href: "/portfolio",
      icone: <IconCards />,
      texto: "Sua coleção e quanto ela vale hoje.",
    },
    {
      valor: "ir:sets",
      rotulo: "Sets",
      href: "/sets",
      icone: <IconStack2 />,
      texto: "Todas as coleções, por jogo.",
    },
  ];

  // Item marcado → prévia (umas dezenas de itens: montar a cada render é barato)
  const previas = new Map<string, Previa>();
  for (const carta of cartas)
    previas.set(`carta:${carta.id}`, { tipo: "carta", carta });
  for (const nome of nomes)
    previas.set(`nome:${nome.tcg}:${nome.nome}`, { tipo: "nome", nome });
  for (const colecao of colecoes)
    previas.set(`colecao:${colecao.id}`, { tipo: "colecao", colecao });
  if (buscando)
    previas.set("buscar", {
      tipo: "icone",
      icone: <IconSearch className="size-8" />,
      titulo: `Buscar “${termo.trim()}”`,
      texto: "Abre o Explorar com tudo o que casa com o que você digitou.",
    });
  for (const r of recentes)
    previas.set(`recente:${r}`, {
      tipo: "icone",
      icone: <IconClock className="size-8" />,
      titulo: r,
      texto: "Buscar de novo no Explorar.",
    });
  for (const p of paginas)
    previas.set(p.valor, {
      tipo: "icone",
      icone: p.icone,
      titulo: p.rotulo,
      texto: p.texto,
    });
  for (const t of temas)
    previas.set(`tema:${t.value}`, {
      tipo: "icone",
      icone: <t.icon className="size-8" />,
      titulo: `Tema ${t.label}`,
      texto: "Troca a aparência do site.",
    });

  const previa = previas.get(marcado);
  const nada =
    buscando &&
    !isFetching &&
    esperado === termo &&
    cartas.length + nomes.length + colecoes.length === 0;
  // Ícone na cor do texto: o CommandItem do shadcn pinta todo ícone de
  // muted-foreground, e no escuro eles pareciam translúcidos (24/10)
  const item =
    "gap-3 rounded-lg px-3 py-2.5 data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground [&_svg:not([class*='text-'])]:text-foreground";

  return (
    <>
      {/* Gatilho: lupa + atalho em tela larga (sem texto: com ele o botão
          quebrava em duas linhas ao lado do "Baixar o app"); só a lupa no
          celular e em janela média, onde a navbar fica apertada */}
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Buscar cartas"
        aria-keyshortcuts="Meta+K Control+K"
        className="hidden h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-muted/40 pr-1.5 pl-3 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/70 xl:flex"
      >
        <IconSearch className="size-4 shrink-0" />
        <Kbd className="h-6 rounded-full px-2 whitespace-nowrap">
          {mac ? "⌘" : "Ctrl"} K
        </Kbd>
      </button>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Buscar cartas"
        className="flex size-9 cursor-pointer items-center justify-center rounded-full text-foreground hover:bg-muted/60 xl:hidden"
      >
        <IconSearch className="size-5" />
      </button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent
          showCloseButton={false}
          className="top-[12vh] translate-y-0 gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-3xl"
        >
          <DialogTitle className="sr-only">Buscar no Mint Foil</DialogTitle>
          <DialogDescription className="sr-only">
            Cartas, coleções e páginas. Use as setas para escolher e Enter para
            abrir.
          </DialogDescription>
          {/* A rota já filtra e ordena; o filtro do cmdk só atrapalharia */}
          <Command
            shouldFilter={false}
            loop
            value={marcado}
            onValueChange={setMarcado}
            className="rounded-2xl bg-popover"
          >
            <div className="flex h-14 items-center gap-3 border-b border-border px-4">
              <IconSearch className="size-5 shrink-0 text-muted-foreground" />
              <CommandPrimitive.Input
                ref={campoRef}
                value={termo}
                onValueChange={setTermo}
                placeholder="Buscar carta, coleção ou código (ex.: OP01-001)…"
                className="h-full flex-1 bg-transparent text-base outline-hidden placeholder:text-muted-foreground"
              />
              {buscando && isFetching && (
                <Spinner className="size-4 text-muted-foreground" />
              )}
              {termo && (
                // Limpa o que foi digitado e volta às recentes; o foco fica no campo
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setTermo("");
                    setEsperado("");
                    campoRef.current?.focus();
                  }}
                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <IconX className="size-4" />
                </button>
              )}
              <Kbd className="hidden sm:inline-flex">esc</Kbd>
            </div>

            <div className="flex h-[min(60vh,440px)]">
              <CommandList className="max-h-none flex-1 p-2">
                {buscando && (
                  <CommandGroup>
                    <CommandItem
                      value="buscar"
                      onSelect={() => buscar(termo)}
                      className={item}
                    >
                      <IconSearch />
                      <span className="min-w-0 flex-1 truncate">
                        Buscar{" "}
                        <strong className="font-semibold">
                          “{termo.trim()}”
                        </strong>{" "}
                        no Explorar
                      </span>
                      <IconArrowRight className="opacity-60" />
                    </CommandItem>
                  </CommandGroup>
                )}

                {cartas.length > 0 && (
                  <CommandGroup heading="Carta">
                    {cartas.map((carta) => (
                      <CommandItem
                        key={carta.id}
                        value={`carta:${carta.id}`}
                        onSelect={() => {
                          guardarRecente(termo);
                          ir(`/card/${carta.id}`);
                        }}
                        className={item}
                      >
                        <span className="w-7 shrink-0 overflow-hidden rounded">
                          <CardImage
                            carta={carta}
                            tamanho="miniatura"
                            alt=""
                            width={28}
                            height={39}
                            rotulo={false}
                            className="aspect-[5/7] w-full object-cover"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {carta.namePt?.trim() || carta.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {carta.setName}
                            {carta.collectorNumber && (
                              <span className="font-mono">
                                {" "}
                                · {destacar(carta.collectorNumber, termo)}
                              </span>
                            )}
                          </span>
                        </span>
                        {carta.latestPriceBrl != null && (
                          <span className="shrink-0 font-mono text-xs font-semibold">
                            R$ {formatPrice(carta.latestPriceBrl)}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {nomes.length > 0 && (
                  <CommandGroup heading="Cartas">
                    {nomes.map((nome) => (
                      <CommandItem
                        key={`${nome.tcg}:${nome.nome}`}
                        value={`nome:${nome.tcg}:${nome.nome}`}
                        onSelect={() => buscar(nome.nome)}
                        className={item}
                      >
                        <IconCards />
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">
                          {destacar(nome.nome, termo)}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground/70">
                          {nome.tcgNome}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {colecoes.length > 0 && (
                  <CommandGroup heading="Coleções">
                    {colecoes.map((colecao) => (
                      <CommandItem
                        key={colecao.id}
                        value={`colecao:${colecao.id}`}
                        onSelect={() =>
                          ir(
                            `/explore?tcg=${colecao.tcg.slug}&set=${colecao.id}`,
                          )
                        }
                        className={item}
                      >
                        <IconStack2 />
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">
                          {destacar(colecao.name, termo)}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground/70">
                          {colecao.tcg.name}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {nada && (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Nenhuma sugestão para “{termo.trim()}”. Enter busca no
                    Explorar mesmo assim.
                  </p>
                )}

                {!buscando && recentes.length > 0 && (
                  <CommandGroup
                    heading={
                      <span className="flex items-center justify-between">
                        Buscas recentes
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={limparRecentes}
                          className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          Limpar
                        </button>
                      </span>
                    }
                  >
                    {recentes.map((r) => (
                      <CommandItem
                        key={r}
                        value={`recente:${r}`}
                        onSelect={() => buscar(r)}
                        className={`group ${item}`}
                      >
                        <IconClock />
                        <span className="min-w-0 flex-1 truncate">{r}</span>
                        {/* Tira só esta busca, sem abrir ela */}
                        <button
                          type="button"
                          aria-label={`Remover "${r}" das recentes`}
                          onMouseDown={(e) => e.preventDefault()}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            removerRecente(r);
                          }}
                          className="flex size-6 cursor-pointer items-center justify-center rounded-full opacity-0 hover:bg-muted group-hover:opacity-100 group-data-[selected=true]:opacity-100 [@media(hover:none)]:opacity-100"
                        >
                          <IconX className="size-3.5" />
                        </button>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {!buscando && (
                  <CommandGroup heading="Ir para">
                    {paginas.map((p) => (
                      <CommandItem
                        key={p.valor}
                        value={p.valor}
                        onSelect={() => ir(p.href)}
                        className={item}
                      >
                        {p.icone}
                        <span className="flex-1">{p.rotulo}</span>
                      </CommandItem>
                    ))}
                    {temas.map((t) => (
                      <CommandItem
                        key={t.value}
                        value={`tema:${t.value}`}
                        onSelect={() => setTheme(t.value)}
                        className={item}
                      >
                        <t.icon />
                        <span className="flex-1">Tema {t.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>

              {/* Prévia do item marcado: só no computador, onde cabe */}
              <aside className="hidden w-64 shrink-0 flex-col items-center justify-center gap-3 border-l border-border bg-muted/20 p-5 text-center md:flex">
                <PreviaDoItem previa={previa} />
              </aside>
            </div>

            <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> navegar
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>↵</Kbd> abrir
              </span>
              <span className="ml-auto hidden items-center gap-1.5 sm:flex">
                <Kbd>{mac ? "⌘" : "Ctrl"} K</Kbd> abre de qualquer página
              </span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PreviaDoItem({ previa }: { previa: Previa | undefined }) {
  if (!previa) return null;
  if (previa.tipo === "icone") {
    return (
      <>
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {previa.icone}
        </span>
        <p className="line-clamp-2 text-sm font-semibold text-foreground">
          {previa.titulo}
        </p>
        <p className="text-xs text-muted-foreground">{previa.texto}</p>
      </>
    );
  }
  if (previa.tipo === "colecao") {
    const { colecao } = previa;
    const capa = colecao.imageUrl ?? colecao.coverFallbackUrl;
    const leque = colecao.coverCards ?? [];
    return (
      <>
        <span className="relative flex h-40 w-full items-center justify-center">
          {leque.length > 0 ? (
            // As 3 mais valiosas em leque, como a capa na lista de coleções —
            // o logo (quando há) quase nunca diz tanto quanto as cartas
            leque.map((carta, i) => (
              <span
                key={`${carta.imageUrl}-${i}`}
                className={cn(
                  "absolute h-[88%] aspect-[5/7] overflow-hidden rounded-md shadow-lg ring-1 ring-border",
                  FAN_POSITIONS[i],
                )}
              >
                <CardImage
                  carta={carta}
                  tamanho="grade"
                  alt=""
                  fill
                  sizes="120px"
                  rotulo={false}
                  className="object-cover"
                />
              </span>
            ))
          ) : capa ? (
            // Capa de coleção vem de hosts variados (ver SugestoesBusca)
            // biome-ignore lint/performance/noImgElement: capa da coleção
            <img
              src={capa}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <IconStack2 className="size-10 text-muted-foreground" />
          )}
        </span>
        <p className="line-clamp-2 text-sm font-semibold text-foreground">
          {colecao.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {colecao.tcg.name}
          {colecao.totalCards ? ` · ${colecao.totalCards} cartas` : ""}
        </p>
      </>
    );
  }
  const carta = previa.tipo === "carta" ? previa.carta : previa.nome;
  return (
    <>
      <span
        className={cn(
          "block w-40 overflow-hidden rounded-xl shadow-lg ring-1 ring-border",
        )}
      >
        <CardImage
          carta={carta}
          tamanho="grade"
          alt=""
          width={160}
          height={224}
          className="aspect-[5/7] w-full object-cover"
        />
      </span>
      {previa.tipo === "carta" ? (
        <>
          <p className="line-clamp-2 text-sm font-semibold text-foreground">
            {previa.carta.namePt?.trim() || previa.carta.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {previa.carta.setName}
            {previa.carta.collectorNumber
              ? ` · ${previa.carta.collectorNumber}`
              : ""}
          </p>
          {previa.carta.latestPriceBrl != null && (
            <p className="font-mono text-sm font-bold text-foreground">
              R$ {formatPrice(previa.carta.latestPriceBrl)}
            </p>
          )}
        </>
      ) : (
        <>
          <p className="line-clamp-2 text-sm font-semibold text-foreground">
            {previa.nome.nome}
          </p>
          <p className="text-xs text-muted-foreground">
            {previa.nome.tcgNome}
            {previa.nome.impressoes > 1
              ? ` · ${previa.nome.impressoes}+ versões`
              : ""}
          </p>
        </>
      )}
    </>
  );
}
