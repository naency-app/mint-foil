// Página de suporte — serve como Support URL obrigatória do App Store Connect
// e da Play Console (os campos não aceitam mailto:, só http(s)).
// Usa as vars de tema pré-paint do layout (sem flash em nenhum tema).

const CONTATO = "contato@mintfoil.com";

const S = {
  h2: {
    fontSize: 18,
    fontWeight: 800 as const,
    margin: "36px 0 10px",
    letterSpacing: "-0.3px",
  },
  p: {
    fontSize: 14.5,
    lineHeight: 1.75,
    opacity: 0.72,
    margin: "0 0 12px",
  },
  li: {
    fontSize: 14.5,
    lineHeight: 1.75,
    opacity: 0.72,
    margin: "0 0 6px",
  },
  q: {
    fontSize: 15,
    fontWeight: 700 as const,
    margin: "22px 0 6px",
  },
};

export const metadata = {
  title: "Suporte — Mint Foil",
  description:
    "Central de ajuda do Mint Foil: contato, dúvidas frequentes, assinatura e exclusão de conta.",
};

export default function SuportePage() {
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
            fontWeight: 800,
            letterSpacing: "-1px",
            margin: "18px 0 6px",
          }}
        >
          Suporte
        </h1>
        <p style={{ fontSize: 13, opacity: 0.5, margin: "0 0 8px" }}>
          Última atualização: julho de 2026
        </p>
        <p style={S.p}>
          Precisa de ajuda com o <strong>Mint Foil</strong>? Fale com a gente —
          respondemos em até 2 dias úteis.
        </p>

        <div
          style={{
            border: "1px solid var(--mf-border, rgba(0,0,0,0.1))",
            borderRadius: 14,
            padding: "18px 20px",
            margin: "20px 0 4px",
          }}
        >
          <p style={{ fontSize: 12, opacity: 0.5, margin: "0 0 4px" }}>
            E-mail de contato
          </p>
          <a
            href={`mailto:${CONTATO}`}
            style={{
              color: "#F856A7",
              fontWeight: 800,
              fontSize: 18,
              textDecoration: "none",
            }}
          >
            {CONTATO}
          </a>
        </div>

        <h2 style={S.h2}>Dúvidas frequentes</h2>

        <p style={S.q}>O preço que aparece é o preço da loja brasileira?</p>
        <p style={S.p}>
          Não. O valor exibido é um <strong>preço de referência</strong>: o preço
          internacional daquela edição, convertido para real pelo câmbio
          comercial. É uma estimativa de mercado, sempre rotulada como tal — a
          tela da carta mostra a fonte, o valor original em dólar e o câmbio
          usado. Para conferir o preço real praticado no Brasil, use o link
          &ldquo;ver preço na loja&rdquo;, que leva à página da carta na loja
          brasileira.
        </p>

        <p style={S.q}>O scan não reconheceu minha carta. O que faço?</p>
        <p style={S.p}>
          Fotografe a carta inteira, com boa luz e sem reflexo — o código de
          colecionador impresso (ex.: <code>LOB-001</code>, <code>4/102</code>) é
          o que identifica a edição. Se ainda assim não encontrar, você pode
          buscar a carta manualmente pelo nome e escolher a edição correta. Se
          for uma carta que não existe no catálogo, nos avise por e-mail com uma
          foto.
        </p>

        <p style={S.q}>Quantos scans eu tenho?</p>
        <p style={S.p}>
          O plano gratuito inclui 30 scans por dia. Cada carta identificada
          consome um scan — uma foto com 8 cartas consome 8 scans. A cota
          reinicia todo dia.
        </p>

        <p style={S.q}>Como gerencio ou cancelo minha assinatura?</p>
        <p style={S.p}>
          Assinaturas contratadas no app são gerenciadas pela loja, não por nós:
        </p>
        <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
          <li style={S.li}>
            <strong>iPhone/iPad:</strong> Ajustes → seu nome → Assinaturas →
            Mint Foil.
          </li>
          <li style={S.li}>
            <strong>Android:</strong> Google Play → foto de perfil → Pagamentos e
            assinaturas → Assinaturas.
          </li>
        </ul>
        <p style={S.p}>
          O cancelamento vale a partir do fim do período já pago. Pedidos de
          reembolso também são tratados pela loja onde a compra foi feita.
        </p>

        <p style={S.q}>Como excluo minha conta e meus dados?</p>
        <p style={S.p}>
          Direto no app, em <strong>Perfil → Config → Excluir conta</strong>. A
          exclusão é imediata e permanente: remove sua conta, seus portfólios, suas
          cartas, seus snapshots e seu histórico de scans. Se preferir, envie o
          pedido para {CONTATO} a partir do e-mail cadastrado e processamos em até
          15 dias, conforme a LGPD.
        </p>
        <p style={S.p}>
          Atenção: excluir a conta não cancela uma assinatura ativa — cancele-a
          também na loja, como descrito acima.
        </p>

        <p style={S.q}>Encontrei um preço ou uma carta com informação errada.</p>
        <p style={S.p}>
          Mande o nome da carta, a edição e um print para {CONTATO}. O catálogo e
          os preços são atualizados diariamente, e correções pontuais entram na
          próxima atualização.
        </p>

        <h2 style={S.h2}>Documentos</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li style={S.li}>
            <a href="/privacidade" style={{ color: "#F856A7" }}>
              Política de Privacidade
            </a>
          </li>
          <li style={S.li}>
            <a href="/termos" style={{ color: "#F856A7" }}>
              Termos de Uso
            </a>
          </li>
        </ul>

        <h2 style={S.h2}>Sobre marcas de terceiros</h2>
        <p style={S.p}>
          O Mint Foil é um aplicativo independente e não é afiliado, patrocinado
          nem endossado por The Pokémon Company, Konami, Wizards of the Coast ou
          Bandai Namco. Todas as marcas e imagens de cartas pertencem aos seus
          respectivos donos.
        </p>
      </div>
    </main>
  );
}
