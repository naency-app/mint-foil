// Política de Privacidade — rascunho funcional baseado no funcionamento
// real do produto; revisar com advogado antes do lançamento oficial.
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

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>
        <p style={{ fontSize: 13, opacity: 0.5, margin: "0 0 8px" }}>
          Última atualização: julho de 2026
        </p>
        <p style={S.p}>
          Esta política descreve como o <strong>Mint Foil</strong> ("nós")
          coleta, usa e protege os seus dados pessoais, em conformidade com a
          Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
        </p>

        <h2 style={S.h2}>1. Quais dados coletamos</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li style={S.li}>
            <strong>Dados de conta (opcional):</strong> nome, e-mail e foto de
            perfil fornecidos ao criar conta ou entrar com um provedor de login.
            Você pode usar o scan sem criar conta.
          </li>
          <li style={S.li}>
            <strong>Imagens de cartas:</strong> as fotos capturadas pela câmera
            são processadas para identificar a carta. São usadas exclusivamente
            para a identificação e não são publicadas.
          </li>
          <li style={S.li}>
            <strong>Dados do portfólio:</strong> as cartas que você cataloga,
            quantidades, preços de aquisição informados e histórico de valor.
          </li>
          <li style={S.li}>
            <strong>Dados de uso:</strong> informações técnicas como modelo do
            dispositivo, sistema operacional e eventos de uso do app, para
            diagnóstico e melhoria do produto.
          </li>
          <li style={S.li}>
            <strong>Preferências locais:</strong> configurações como o tema
            (claro/escuro) ficam salvas no seu próprio dispositivo e não são
            enviadas aos nossos servidores.
          </li>
        </ul>

        <h2 style={S.h2}>2. Para que usamos os dados</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li style={S.li}>Identificar cartas a partir das fotos enviadas;</li>
          <li style={S.li}>
            Manter seu portfólio e calcular o histórico de valor da coleção;
          </li>
          <li style={S.li}>
            Operar os limites do plano gratuito e a assinatura PRO;
          </li>
          <li style={S.li}>
            Melhorar a precisão da identificação e a qualidade do serviço;
          </li>
          <li style={S.li}>
            Comunicar novidades quando você optar por recebê-las.
          </li>
        </ul>

        <h2 style={S.h2}>3. Compartilhamento</h2>
        <p style={S.p}>
          Não vendemos seus dados. Compartilhamos apenas com operadores
          necessários ao funcionamento do serviço — como provedores de
          hospedagem em nuvem, de autenticação e de processamento de pagamento
          da assinatura — sempre limitado ao mínimo necessário. As fontes
          públicas de preços de cartas não recebem dados pessoais seus.
        </p>

        <h2 style={S.h2}>4. Preços exibidos</h2>
        <p style={S.p}>
          Os valores de cartas exibidos no Mint Foil são estimativas de
          referência do mercado internacional convertidas para reais e não
          constituem avaliação oficial nem aconselhamento financeiro. Esse
          processamento não envolve dados pessoais.
        </p>

        <h2 style={S.h2}>5. Retenção e exclusão</h2>
        <p style={S.p}>
          Mantemos seus dados enquanto sua conta existir. Você pode solicitar a
          exclusão da conta e dos dados associados a qualquer momento pelo
          e-mail abaixo; removeremos os dados em até 30 dias, exceto o que a lei
          exigir manter.
        </p>

        <h2 style={S.h2}>6. Seus direitos (LGPD)</h2>
        <p style={S.p}>
          Você pode solicitar confirmação de tratamento, acesso, correção,
          anonimização, portabilidade, informação sobre compartilhamentos,
          revogação de consentimento e exclusão dos seus dados (art. 18 da
          LGPD). Basta escrever para o contato abaixo.
        </p>

        <h2 style={S.h2}>7. Segurança</h2>
        <p style={S.p}>
          Adotamos medidas técnicas e organizacionais razoáveis para proteger
          seus dados, incluindo criptografia em trânsito e controle de acesso
          aos sistemas.
        </p>

        <h2 style={S.h2}>8. Crianças e adolescentes</h2>
        <p style={S.p}>
          O Mint Foil não é direcionado a menores de 13 anos. Se você acredita
          que coletamos dados de uma criança sem o consentimento adequado, fale
          conosco para removê-los.
        </p>

        <h2 style={S.h2}>9. Alterações desta política</h2>
        <p style={S.p}>
          Podemos atualizar esta política para refletir mudanças no produto ou
          na legislação. Alterações relevantes serão comunicadas no app ou por
          e-mail.
        </p>

        <h2 style={S.h2}>10. Contato</h2>
        <p style={S.p}>
          Controlador: Mint Foil · São Paulo, Brasil.
          <br />
          Encarregado de dados (DPO):{" "}
          <a href="mailto:contato@mintfoil.app" style={{ color: "#F856A7" }}>
            contato@mintfoil.app
          </a>
        </p>
      </div>
    </main>
  );
}
