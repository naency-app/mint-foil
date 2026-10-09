// Página de download do app.
//
// Existe porque dois lugares já apontavam para /download — o ProUpgradeModal
// (DOWNLOAD_URL) e o CTA "Assinar PRO" da landing — e a rota nunca foi criada:
// os dois caíam em 404. É também o destino natural de quem quer assinar, já que
// a assinatura só existe como compra in-app.
//
// Visual herdado do rodapé da landing (fundo #020617, aurora rosa, marca
// d'água MINT FOIL) e o mesmo print do app que o hero usa no mockup.
//
// ⚠️ As URLs das lojas só resolvem depois que o app for publicado. Até lá, os
// botões levam a uma página de "app não encontrado" da própria loja.

import { ScanLine, TrendingUp, Wallet } from "lucide-react";
import { StoreBadge } from "@/app/components/StoreBadge";
import { QRCode } from "@/components/ui/qrcode";
import { DOWNLOAD_URL } from "@/lib/app-links";

const PINK = "#F856A7";
const GRAD = "linear-gradient(135deg, #F856A7 0%, #B50D57 100%)";

const FEATURES = [
  {
    icon: ScanLine,
    title: "Escaneie pela câmera",
    text: "Aponte para a carta e o app identifica na hora.",
  },
  {
    icon: TrendingUp,
    title: "Preço em real, todo dia",
    text: "Acompanhe quanto a sua coleção vale e como ela varia.",
  },
  {
    icon: Wallet,
    title: "Portfólios organizados",
    text: "Pokémon, Yu-Gi-Oh!, Magic, One Piece e mais, tudo num lugar.",
  },
];

// Layout responsivo sem hooks: a página continua server component
const CSS = `
.dl-grid { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 72px; align-items: center; }
.dl-qr { display: flex; }
@media (max-width: 860px) {
  .dl-grid { grid-template-columns: minmax(0, 1fr); gap: 48px; }
  .dl-phone { justify-self: center; width: 240px !important; }
  .dl-qr { display: none; }
}
`;

export const metadata = {
  title: "Baixar o Mint Foil",
  description:
    "Baixe o Mint Foil para iPhone ou Android e escaneie suas cartas com preços em real.",
};

export default function DownloadPage() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#020617",
        color: "#FFFFFF",
        padding: "48px 24px 96px",
      }}
    >
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSS estático do layout */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Aurora rosa — a mesma do rodapé da landing, parada */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "20%",
          left: "60%",
          transform: "translate(-50%, -50%)",
          width: "90vw",
          height: "70vh",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(248,86,167,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Marca d'água */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-4vh",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "clamp(80px, 20vw, 260px)",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255,255,255,0.03)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 60%)",
          WebkitBackgroundClip: "text",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
          lineHeight: 0.75,
        }}
      >
        MINT FOIL
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        <a
          href="/"
          style={{
            color: PINK,
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          ← Voltar para o site
        </a>

        <div className="dl-grid" style={{ marginTop: 48 }}>
          {/* Texto + lojas */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 14px 6px 6px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {/* biome-ignore lint/performance/noImgElement: ícone local pequeno */}
              <img
                src="/landing/logo-m.png"
                alt=""
                width={24}
                height={24}
                style={{ borderRadius: 6 }}
              />
              iPhone e Android
            </div>

            <h1
              style={{
                fontSize: "clamp(40px, 6vw, 64px)",
                fontWeight: 800,
                letterSpacing: "-2px",
                lineHeight: 1.02,
                margin: "24px 0 20px",
              }}
            >
              Sua coleção de TCG,{" "}
              <span
                style={{
                  background: GRAD,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                no bolso.
              </span>
            </h1>

            <p
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.72)",
                maxWidth: 520,
                margin: 0,
              }}
            >
              Baixe o Mint Foil e comece agora, sem criar conta.
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "32px 0 36px",
                display: "grid",
                gap: 18,
              }}
            >
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(248,86,167,0.1)",
                      border: "1px solid rgba(248,86,167,0.22)",
                      color: PINK,
                    }}
                  >
                    <Icon size={18} />
                  </span>
                  <span>
                    <span
                      style={{
                        display: "block",
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {title}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: 14,
                        color: "rgba(255,255,255,0.6)",
                        marginTop: 2,
                      }}
                    >
                      {text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <StoreBadge store="ios" brand />
                <StoreBadge store="android" brand />
              </div>

              {/* No computador: aponta a câmera do celular e cai aqui mesmo */}
              <div className="dl-qr" style={{ alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    padding: 6,
                    borderRadius: 12,
                    background: "#FFFFFF",
                  }}
                >
                  <QRCode
                    data={DOWNLOAD_URL}
                    foreground="oklch(0.13 0.04 265)"
                    background="oklch(1 0 0)"
                  />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: 1.4,
                    color: "rgba(255,255,255,0.55)",
                    maxWidth: 110,
                  }}
                >
                  Aponte a câmera do celular
                </span>
              </div>
            </div>

            <p
              style={{
                marginTop: 32,
                paddingTop: 20,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.55)",
                maxWidth: 520,
              }}
            >
              <strong style={{ color: PINK }}>PRO</strong> — scans e portfólios
              ilimitados, filtros exclusivos e exportação da coleção em
              planilha. Assinado dentro do app, por R$ 9,90/mês ou R$ 79,90/ano.
            </p>
          </div>

          {/* Mockup com o print real do app */}
          <div
            className="dl-phone"
            style={{
              width: 300,
              padding: 8,
              borderRadius: 44,
              background: "linear-gradient(145deg, #1a1a2e 0%, #0d0d1a 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(248,86,167,0.12)",
            }}
          >
            {/* biome-ignore lint/performance/noImgElement: print local do app */}
            <img
              src="/landing/home-sem-conta.jpg"
              alt="Tela inicial do Mint Foil com o valor da coleção"
              style={{
                display: "block",
                width: "100%",
                aspectRatio: "828 / 1800",
                objectFit: "cover",
                borderRadius: 36,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
