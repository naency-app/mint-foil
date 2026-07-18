// Termos de Uso — rascunho funcional baseado no funcionamento real do
// produto; revisar com advogado antes do lançamento oficial.
// Usa as vars de tema pré-paint do layout (sem flash em nenhum tema).

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
};

export default function TermosPage() {
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
          Termos de Uso
        </h1>
        <p style={{ fontSize: 13, opacity: 0.5, margin: "0 0 8px" }}>
          Última atualização: julho de 2026
        </p>
        <p style={S.p}>
          Ao usar o <strong>Mint Foil</strong> — aplicativo, site e loja — você
          concorda com estes termos. Se não concordar, não utilize o serviço.
        </p>

        <h2 style={S.h2}>1. O serviço</h2>
        <p style={S.p}>
          O Mint Foil identifica cartas colecionáveis (Pokémon TCG, Magic: The
          Gathering, Yu-Gi-Oh! e One Piece Card Game) a partir de fotos,
          organiza sua coleção em portfólios e exibe valores de referência de
          mercado. A loja vende produtos físicos personalizados relacionados ao
          hobby.
        </p>

        <h2 style={S.h2}>2. Conta e planos</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li style={S.li}>
            O plano <strong>Gratuito</strong> permite até 30 scans por dia, sem
            necessidade de conta.
          </li>
          <li style={S.li}>
            O plano <strong>PRO</strong> (R$ 19,90/mês) libera scans ilimitados,
            portfólio completo, gráficos e histórico de preços. A assinatura
            pode ser cancelada a qualquer momento, sem multa; o acesso permanece
            até o fim do período pago.
          </li>
          <li style={S.li}>
            Você é responsável por manter a segurança da sua conta e pela
            veracidade das informações fornecidas.
          </li>
        </ul>

        <h2 style={S.h2}>3. Preços e valores exibidos</h2>
        <p style={S.p}>
          Os valores de cartas exibidos são <strong>estimativas</strong> de
          referência baseadas no mercado internacional, convertidas para reais e
          atualizadas periodicamente. Eles não constituem avaliação oficial,
          oferta de compra ou aconselhamento financeiro. Decisões de compra e
          venda de cartas são de sua exclusiva responsabilidade — confira sempre
          os preços praticados nas lojas brasileiras pelos links disponíveis no
          app.
        </p>

        <h2 style={S.h2}>4. Propriedade intelectual</h2>
        <p style={S.p}>
          Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece e demais marcas,
          nomes e imagens de cartas pertencem aos seus respectivos titulares
          (The Pokémon Company/Nintendo, Wizards of the Coast, Konami e Bandai,
          entre outros). O Mint Foil{" "}
          <strong>não é afiliado, patrocinado ou endossado</strong> por nenhuma
          dessas empresas; as imagens de cartas são exibidas apenas para fins de
          identificação e catalogação. A marca, o logo e o software Mint Foil
          são de nossa titularidade.
        </p>

        <h2 style={S.h2}>5. Loja e produtos físicos</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li style={S.li}>
            Preços, prazos e fretes são informados no checkout de cada pedido.
          </li>
          <li style={S.li}>
            Compras online têm direito de arrependimento em até 7 dias corridos
            após o recebimento (art. 49 do Código de Defesa do Consumidor).
          </li>
          <li style={S.li}>
            Produtos com defeito podem ser trocados conforme o CDC. Fale com a
            gente pelo e-mail de contato.
          </li>
        </ul>

        <h2 style={S.h2}>6. Uso aceitável</h2>
        <p style={S.p}>
          É proibido usar o serviço para fins ilícitos, tentar burlar limites do
          plano gratuito, extrair dados de forma automatizada (scraping),
          sobrecarregar a infraestrutura ou violar direitos de terceiros. Contas
          que violem estas regras podem ser suspensas.
        </p>

        <h2 style={S.h2}>7. Limitação de responsabilidade</h2>
        <p style={S.p}>
          O serviço é fornecido "como está". A identificação de cartas pode
          conter erros; os valores exibidos podem divergir do mercado. Na
          extensão máxima permitida pela lei, o Mint Foil não responde por
          perdas decorrentes de decisões tomadas com base nas informações do
          app, nem por indisponibilidades temporárias do serviço.
        </p>

        <h2 style={S.h2}>8. Privacidade</h2>
        <p style={S.p}>
          O tratamento dos seus dados pessoais é descrito na nossa{" "}
          <a href="/privacidade" style={{ color: "#F856A7" }}>
            Política de Privacidade
          </a>
          .
        </p>

        <h2 style={S.h2}>9. Alterações</h2>
        <p style={S.p}>
          Podemos atualizar estes termos para refletir mudanças no produto ou na
          legislação. Mudanças relevantes serão comunicadas no app ou por
          e-mail; o uso continuado após a comunicação vale como concordância.
        </p>

        <h2 style={S.h2}>10. Foro e contato</h2>
        <p style={S.p}>
          Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da
          comarca de São Paulo/SP para dirimir controvérsias.
          <br />
          Contato:{" "}
          <a href="mailto:contato@mintfoil.app" style={{ color: "#F856A7" }}>
            contato@mintfoil.app
          </a>
        </p>
      </div>
    </main>
  );
}
