/**
 * Fundo do tema Mint (Aparência → Mint): o escuro com o brilho de carta foil
 * atrás do conteúdo.
 *
 * Ideia vinda do Collectr, que usa um JPG fixo com grade, silhuetas e reflexos
 * de arco-íris. Aqui é CSS + SVG em vez de imagem: fica nítido em qualquer
 * tela, quase não pesa e usa só as cores da marca.
 *
 * Camadas, de baixo pra cima:
 *  1. manchas de cor (magenta à esquerda, roxo à direita);
 *  2. grade fina, mais leve no centro;
 *  3. contornos de carta e brilhos de quatro pontas, mais fortes nas bordas.
 *     Também aparecem (mais leves) atrás dos painéis, que são translúcidos:
 *     com o meio limpo, o painel parecia sólido (19/10);
 *  4. reflexos foil desfocados;
 *  5. vinheta escurecendo as bordas.
 *
 * Fica num `div` fixed em vez de `background-attachment: fixed`, que o Safari
 * do iPhone ignora. Tudo estático: nada anima, nada repinta na rolagem.
 */

// Cores da marca (tokens do tema escuro em globals.css)
const ROSA = "248, 86, 167"; // --primary #F856A7
const ROXO = "136, 124, 253"; // --tertiary #887CFD
const MAGENTA = "181, 13, 87"; // --secondary #B50D57

/**
 * Reflexo foil: faixa de cor desfocada. Opacidade baixa de propósito: o fundo
 * não pode competir com os banners de convite, que usam o mesmo foil.
 */
const REFLEXOS: {
  top: string;
  left: string;
  w: number;
  h: number;
  rot: number;
  op: number;
  soDesktop?: boolean;
}[] = [
  { top: "14%", left: "22%", w: 120, h: 34, rot: -28, op: 0.25 },
  { top: "9%", left: "71%", w: 96, h: 28, rot: 34, op: 0.21 },
  { top: "38%", left: "8%", w: 130, h: 36, rot: 18, op: 0.19, soDesktop: true },
  { top: "31%", left: "84%", w: 150, h: 40, rot: -52, op: 0.24 },
  { top: "58%", left: "52%", w: 86, h: 24, rot: 62, op: 0.15, soDesktop: true },
  { top: "72%", left: "17%", w: 160, h: 44, rot: -12, op: 0.21 },
  { top: "80%", left: "76%", w: 110, h: 30, rot: 24, op: 0.19 },
];

/**
 * Contornos de carta (proporção 2:3) e brilhos espalhados num ladrilho. As
 * cores vêm de quem usa: branco no Mint, cinza e rosa no claro (FundoClaro).
 * `id` diferente por fundo, porque os dois ficam na página ao mesmo tempo.
 */
function PadraoCartas({
  id,
  traco,
  brilho,
  opTraco,
  opBrilho,
  opPonto,
}: {
  id: string;
  traco: string;
  brilho: string;
  opTraco: number;
  opBrilho: number;
  opPonto: number;
}) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorativo, escondido do leitor de tela
    <svg
      aria-hidden
      className="absolute inset-0 size-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={id} width="280" height="280" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={traco} strokeOpacity={opTraco} strokeWidth="1">
            <rect x="22" y="30" width="36" height="54" rx="4" />
            <rect x="27" y="35" width="26" height="22" rx="1.5" />
            <rect
              x="170"
              y="150"
              width="36"
              height="54"
              rx="4"
              transform="rotate(-12 188 177)"
            />
            <rect
              x="175"
              y="155"
              width="26"
              height="22"
              rx="1.5"
              transform="rotate(-12 188 177)"
            />
            <rect
              x="200"
              y="22"
              width="28"
              height="42"
              rx="3"
              transform="rotate(9 214 43)"
            />
          </g>
          {/* Brilho de quatro pontas — o mesmo "sparkle" de carta holo */}
          <g fill={brilho} fillOpacity={opBrilho}>
            <path d="M120 96 l2.5 9 9 2.5 -9 2.5 -2.5 9 -2.5 -9 -9 -2.5 9 -2.5z" />
            <path d="M60 210 l1.6 5.6 5.6 1.6 -5.6 1.6 -1.6 5.6 -1.6 -5.6 -5.6 -1.6 5.6 -1.6z" />
            <path d="M250 240 l1.2 4.2 4.2 1.2 -4.2 1.2 -1.2 4.2 -1.2 -4.2 -4.2 -1.2 4.2 -1.2z" />
          </g>
          <g fill={traco} fillOpacity={opPonto}>
            <circle cx="140" cy="250" r="1" />
            <circle cx="95" cy="160" r="0.8" />
            <circle cx="245" cy="110" r="1" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export function FundoFoil() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden mint:block"
      style={{ backgroundColor: "#020617" }}
    >
      {/* 1. Manchas de cor */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            `radial-gradient(ellipse 55% 50% at 8% 12%, rgba(${MAGENTA}, 0.22), transparent 70%)`,
            `radial-gradient(ellipse 50% 55% at 95% 30%, rgba(${ROXO}, 0.16), transparent 70%)`,
            `radial-gradient(ellipse 60% 45% at 50% 105%, rgba(${ROSA}, 0.08), transparent 70%)`,
          ].join(", "),
        }}
      />

      {/* 2. Grade fina, mais forte nas bordas. 3% de branco: a 5,5% as
          linhas apareciam demais (21/10) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 75% 70% at 50% 45%, rgba(0,0,0,0.7), black 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 70% at 50% 45%, rgba(0,0,0,0.7), black 95%)",
        }}
      />

      {/* 3. Contornos de carta: somem no centro, aparecem nas bordas */}
      <div
        className="absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(ellipse 55% 55% at 50% 45%, rgba(0,0,0,0.45) 30%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 55% 55% at 50% 45%, rgba(0,0,0,0.45) 30%, black 100%)",
        }}
      >
        <PadraoCartas
          id="mf-cartas"
          traco="white"
          brilho="white"
          opTraco={0.1}
          opBrilho={0.14}
          opPonto={0.08}
        />
      </div>

      {/* 4. Reflexos foil: faixas de cor alongadas (o cônico, desfocado,
          virava uma mancha de cor só) com um ponto de luz no meio */}
      {REFLEXOS.map((r) => (
        <div
          key={`${r.top}-${r.left}`}
          className={r.soDesktop ? "absolute hidden md:block" : "absolute"}
          style={{
            top: r.top,
            left: r.left,
            width: r.w,
            height: r.h,
            opacity: r.op,
            transform: `rotate(${r.rot}deg)`,
            mixBlendMode: "screen",
          }}
        >
          <div
            className="absolute inset-0 rounded-[50%]"
            style={{
              filter: "blur(10px)",
              backgroundImage: `linear-gradient(90deg, transparent 0%, rgba(${ROSA},0.95) 22%, rgba(${ROXO},0.95) 42%, rgba(120,200,255,0.85) 62%, rgba(255,214,140,0.7) 80%, transparent 100%)`,
            }}
          />
          <div
            className="absolute rounded-[50%]"
            style={{
              inset: "30% 32%",
              filter: "blur(6px)",
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          />
        </div>
      ))}

      {/* 5. Vinheta */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 85% 80% at 50% 40%, transparent 55%, rgba(2,6,23,0.75) 100%)",
        }}
      />
    </div>
  );
}

/**
 * Fundo do tema claro: o mesmo desenho do Mint, bem mais discreto, para o
 * cinza da página não ficar sem graça (pedido do usuário, 21/10). Manchas de
 * rosa e lilás nos cantos, grade e contornos de carta em cinza suave, como no
 * Mint, e os brilhos de quatro pontas em rosa bem clarinho. Sem reflexos nem
 * vinheta:
 * no claro eles sujavam o fundo em vez de dar brilho.
 *
 * `dark:hidden` esconde no escuro e no Mint (a variante dark cobre os dois).
 */
export function FundoClaro() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden dark:hidden"
    >
      {/* 1. Manchas de cor */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            `radial-gradient(ellipse 55% 50% at 6% 8%, rgba(${ROSA}, 0.05), transparent 70%)`,
            `radial-gradient(ellipse 50% 55% at 96% 32%, rgba(${ROXO}, 0.06), transparent 70%)`,
            `radial-gradient(ellipse 60% 45% at 40% 105%, rgba(${ROSA}, 0.08), transparent 70%)`,
          ].join(", "),
        }}
      />

      {/* 2. Grade fina, mais leve no centro */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(2,6,23,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(2,6,23,0.022) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 75% 70% at 50% 45%, rgba(0,0,0,0.6), black 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 70% at 50% 45%, rgba(0,0,0,0.6), black 95%)",
        }}
      />

      {/* 3. Contornos de carta e brilhos rosa, mais fortes nas bordas */}
      <div
        className="absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(ellipse 55% 55% at 50% 45%, rgba(0,0,0,0.4) 30%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 55% 55% at 50% 45%, rgba(0,0,0,0.4) 30%, black 100%)",
        }}
      >
        <PadraoCartas
          id="mf-cartas-claro"
          traco="#020617"
          brilho="#F856A7"
          opTraco={0.06}
          opBrilho={0.12}
          opPonto={0.04}
        />
      </div>
    </div>
  );
}
