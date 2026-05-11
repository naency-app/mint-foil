export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Política de Privacidade
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Última atualização: março de 2026
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            1. Informações que Coletamos
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Coletamos as seguintes informações ao usar o Mint Foil:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Dados de conta:</strong> email,
              nome e foto de perfil (quando via Google OAuth);
            </li>
            <li>
              <strong className="text-foreground">Dados de uso:</strong> cartas
              adicionadas ao portfólio, histórico de scans e preferências;
            </li>
            <li>
              <strong className="text-foreground">Dados técnicos:</strong> logs
              de acesso, endereço IP e informações do dispositivo para fins de
              segurança.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            2. Como Usamos suas Informações
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Utilizamos seus dados para:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Prover e melhorar os serviços da plataforma;</li>
            <li>Autenticar e proteger sua conta;</li>
            <li>Enviar comunicações relacionadas ao serviço (ex: magic link);</li>
            <li>Analisar o uso agregado para melhorias de produto.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            3. Compartilhamento de Dados
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Não vendemos ou compartilhamos seus dados pessoais com terceiros,
            exceto:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>
              Provedores de infraestrutura necessários para operar o serviço
              (hospedagem, banco de dados);
            </li>
            <li>
              Quando exigido por lei ou ordem judicial.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            4. Cookies e Sessão
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Usamos cookies de sessão para manter você autenticado. Não usamos
            cookies de rastreamento ou publicidade. Você pode desativar cookies
            no seu navegador, mas isso pode impedir o funcionamento correto da
            plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            5. Segurança dos Dados
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Adotamos medidas técnicas e organizacionais para proteger seus
            dados contra acesso não autorizado, alteração, divulgação ou
            destruição. As sessões são gerenciadas com tokens seguros e
            criptografados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            6. Seus Direitos
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Em conformidade com a LGPD (Lei Geral de Proteção de Dados), você
            tem direito a:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Acessar os dados que temos sobre você;</li>
            <li>Solicitar a correção de dados incorretos;</li>
            <li>Solicitar a exclusão da sua conta e dados associados;</li>
            <li>Portabilidade dos seus dados.</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para exercer esses direitos, entre em contato pelo email disponível
            na plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            7. Retenção de Dados
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Mantemos seus dados enquanto sua conta estiver ativa. Após a
            exclusão da conta, seus dados são removidos em até 30 dias, exceto
            quando obrigados a retê-los por lei.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            8. Alterações nesta Política
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Podemos atualizar esta política periodicamente. Notificaremos por
            email sobre alterações significativas. O uso continuado da
            plataforma implica aceitação da política atualizada.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">9. Contato</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para dúvidas ou solicitações relacionadas à privacidade, entre em
            contato pelo email disponível na plataforma.
          </p>
        </section>
      </div>
    </main>
  );
}
