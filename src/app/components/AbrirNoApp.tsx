"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  detectarPlataforma,
  linkDeApp,
  lojaPara,
  type Plataforma,
} from "@/lib/app-links";

/**
 * Faixa fixa no rodapé do celular convidando a abrir/baixar o app.
 *
 * Por que ela existe: o scan só roda no app, e um link de perfil compartilhado
 * no WhatsApp abre no navegador in-app — que ignora o Universal Link e nunca
 * entrega a pessoa no app instalado. Esta faixa é o único caminho de volta.
 *
 * Só aparece no celular: no desktop o app não tem o que fazer, e a Navbar já
 * leva ao download.
 *
 * Mora no layout, uma instância só, e o recado sai do caminho da página — em
 * vez de cada tela montar a sua e duas faixas brigarem pelo mesmo rodapé.
 */
export function AbrirNoApp() {
  const pathname = usePathname();
  const [plataforma, setPlataforma] = useState<Plataforma | null>(null);
  const [dispensado, setDispensado] = useState(true);

  const recado = recadoPara(pathname);
  const chave = `mf:abrir-no-app:${recado.id}`;

  useEffect(() => {
    const p = detectarPlataforma(navigator.userAgent);
    setPlataforma(p);
    if (p === "outra") return;
    // sessionStorage, não localStorage: dispensar vale para esta visita, não
    // para sempre — o convite precisa voltar na próxima vez que ela abrir.
    try {
      setDispensado(sessionStorage.getItem(chave) === "1");
    } catch {
      setDispensado(false); // modo privado / storage bloqueado: mostra assim mesmo
    }
  }, [chave]);

  function dispensar() {
    setDispensado(true);
    try {
      sessionStorage.setItem(chave, "1");
    } catch {
      /* sem storage: volta no próximo carregamento, tudo bem */
    }
  }

  if (dispensado || !plataforma || plataforma === "outra") return null;

  return (
    <>
      {/* Reserva a altura da faixa para ela não cobrir o fim da página */}
      <div aria-hidden className="h-[76px] md:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          {/* biome-ignore lint/performance/noImgElement: mesmo logo local da Navbar */}
          <img
            src="/landing/logo-m.png"
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-foreground">
              {recado.titulo}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {recado.descricao}
            </p>
          </div>
          <BotaoAbrir
            caminhoNoApp={recado.caminhoNoApp}
            plataforma={plataforma}
          />
          <button
            type="button"
            onClick={dispensar}
            aria-label="Dispensar"
            className="-mr-1 shrink-0 p-1 text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * O recado muda com a página. No perfil compartilhado, o convite é continuar
 * ALI dentro do app — por isso o caminho vai junto: é o mesmo caminho da web, e
 * o app tem uma rota espelho que o traduz para a tela nativa.
 */
function recadoPara(pathname: string) {
  if (pathname.startsWith("/showcase/profile/")) {
    return {
      id: "showcase",
      titulo: "Veja esta coleção no app",
      descricao: "Siga o perfil e monte a sua também.",
      caminhoNoApp: pathname,
    };
  }
  return {
    id: "geral",
    titulo: "Escaneie suas cartas no app",
    descricao: "O scanner é exclusivo do aplicativo.",
    caminhoNoApp: undefined,
  };
}

/**
 * Sem caminho no app: leva direto para a loja.
 *
 * Com caminho: tenta o esquema do app e, se nada acontecer em 1,2s — sinal de
 * que o app não está instalado —, cai na loja. A checagem de `visibilityState`
 * evita mandar para a loja quem JÁ foi levado para o app (a aba fica oculta).
 */
function BotaoAbrir({
  caminhoNoApp,
  plataforma,
}: {
  caminhoNoApp?: string;
  plataforma: Plataforma;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loja = lojaPara(plataforma);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const classe =
    "shrink-0 rounded-full bg-primary px-4 py-2 text-[12px] font-bold text-primary-foreground";

  if (!caminhoNoApp) {
    return (
      <a href={loja} className={classe}>
        Baixar
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classe}
      onClick={() => {
        timer.current = setTimeout(() => {
          if (document.visibilityState === "visible") {
            window.location.href = loja;
          }
        }, 1200);
        window.location.href = linkDeApp(caminhoNoApp);
      }}
    >
      Abrir no app
    </button>
  );
}
