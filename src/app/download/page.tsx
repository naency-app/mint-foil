// Página de download do app.
//
// Existe porque dois lugares já apontavam para /download — o ProUpgradeModal
// (DOWNLOAD_URL) e o CTA "Assinar PRO" da landing — e a rota nunca foi criada:
// os dois caíam em 404. É também o destino natural de quem quer assinar, já que
// a assinatura só existe como compra in-app.
//
// ⚠️ As URLs das lojas só resolvem depois que o app for publicado. Até lá, os
// botões levam a uma página de "app não encontrado" da própria loja.

const APP_STORE_URL = "https://apps.apple.com/app/mint-foil";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.mintfoil";

const S = {
  p: {
    fontSize: 14.5,
    lineHeight: 1.75,
    opacity: 0.72,
    margin: "0 0 12px",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 28px",
    borderRadius: 999,
    fontWeight: 800 as const,
    fontSize: 14.5,
    textDecoration: "none",
    border: "1px solid rgba(127,127,127,0.28)",
    color: "inherit",
  },
};

export const metadata = {
  title: "Baixar o Mint Foil",
  description:
    "Baixe o Mint Foil para iPhone ou Android e escaneie suas cartas com preços em real.",
};

export default function DownloadPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--mf-bg, #FFFFFF)",
        color: "var(--mf-fg, #020617)",
        padding: "56px 24px 80px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <a
          href="/"
          style={{
            color: "#F856A7",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          ← Voltar para o site
        </a>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: "-0.8px",
            margin: "24px 0 12px",
          }}
        >
          Baixe o Mint Foil
        </h1>

        <p style={S.p}>
          Escaneie suas cartas pela câmera, acompanhe o valor da coleção em real
          e organize seus portfólios. Dá para começar sem criar conta.
        </p>

        <p style={S.p}>
          O plano PRO — scans e portfólios ilimitados, filtros exclusivos e
          exportação da coleção em planilha — é assinado dentro do aplicativo,
          por R$ 9,90/mês ou R$ 79,90/ano.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            margin: "32px 0 0",
          }}
        >
          <a href={APP_STORE_URL} style={S.btn}>
            Baixar para iPhone
          </a>
          <a href={PLAY_STORE_URL} style={S.btn}>
            Baixar para Android
          </a>
        </div>
      </div>
    </main>
  );
}
