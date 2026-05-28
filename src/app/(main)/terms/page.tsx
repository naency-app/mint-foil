export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Termos de Uso</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Última atualização: março de 2026
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            1. Aceitação dos Termos
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ao acessar ou usar o Mint Foil, você concorda em cumprir estes
            Termos de Uso. Se não concordar com qualquer parte destes termos,
            não utilize o serviço.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            2. Descrição do Serviço
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O Mint Foil é uma plataforma SaaS para colecionadores de TCG
            (Trading Card Games) que permite rastrear, gerenciar e avaliar
            coleções de cartas. Os preços exibidos são coletados automaticamente
            de fontes públicas e têm caráter informativo, podendo não refletir
            os valores reais de mercado em tempo real.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            3. Conta de Usuário
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Você é responsável por manter a confidencialidade de suas
            credenciais de acesso e por todas as atividades realizadas em sua
            conta. Notifique-nos imediatamente caso suspeite de uso não
            autorizado.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            4. Uso Permitido
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Você concorda em usar o Mint Foil apenas para fins lícitos e de
            acordo com estes termos. É proibido:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Usar o serviço para fins ilegais ou fraudulentos;</li>
            <li>
              Tentar acessar sistemas ou dados não autorizados;
            </li>
            <li>
              Reproduzir, redistribuir ou revender o conteúdo da plataforma sem
              autorização;
            </li>
            <li>
              Realizar engenharia reversa ou descompilar qualquer parte do
              software.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            5. Propriedade Intelectual
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Todo o conteúdo, design e código do Mint Foil são propriedade da
            plataforma ou de seus licenciadores. As imagens de cartas e
            informações de jogos pertencem aos seus respectivos detentores de
            direitos (Pokémon Company, Wizards of the Coast, Konami, Bandai,
            etc.).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            6. Limitação de Responsabilidade
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O Mint Foil é fornecido "como está", sem garantias de qualquer
            tipo. Não nos responsabilizamos por decisões financeiras baseadas
            nas informações de preço exibidas na plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            7. Alterações nos Termos
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Reservamos o direito de modificar estes termos a qualquer momento.
            Alterações significativas serão comunicadas por email. O uso
            continuado do serviço após as alterações implica na aceitação dos
            novos termos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">8. Contato</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para dúvidas sobre estes termos, entre em contato pelo email
            disponível na plataforma.
          </p>
        </section>
      </div>
    </main>
  );
}
