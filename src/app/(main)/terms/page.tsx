"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Calendar } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/settings?tab=support"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Voltar para Configurações
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/45 backdrop-blur-md p-6 sm:p-10 shadow-xl space-y-10">
        {/* Decorative background glow inside the card */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative border-b border-border pb-6">
          <div className="flex items-center gap-3 text-primary mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="size-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">
              Documentos Legais
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Termos de Uso
          </h1>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>Última atualização: março de 2026</span>
          </div>
        </div>

        <div className="space-y-8 relative">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                01
              </span>
              Aceitação dos Termos
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Ao acessar ou usar o Mint Foil, você concorda em cumprir estes
              Termos de Uso. Se não concordar com qualquer parte destes termos,
              não utilize o serviço.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                02
              </span>
              Descrição do Serviço
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              O Mint Foil é uma plataforma SaaS para colecionadores de TCG
              (Trading Card Games) que permite rastrear, gerenciar e avaliar
              coleções de cartas. Os preços exibidos são coletados
              automaticamente de fontes públicas e têm caráter informativo,
              podendo não refletir os valores reais de mercado em tempo real.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                03
              </span>
              Conta de Usuário
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Você é responsável por manter a confidencialidade de suas
              credenciais de acesso e por todas as atividades realizadas em sua
              conta. Notifique-nos imediatamente caso suspeite de uso não
              autorizado.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                04
              </span>
              Uso Permitido
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Você concorda em usar o Mint Foil apenas para fins lícitos e de
              acordo com estes termos. É expressamente proibido:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
              {[
                "Usar o serviço para fins ilegais ou fraudulentos;",
                "Tentar acessar sistemas ou dados não autorizados;",
                "Reproduzir, redistribuir ou revender o conteúdo da plataforma sem autorização;",
                "Realizar engenharia reversa ou descompilar qualquer parte do software.",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-2.5 items-start p-3 rounded-lg border border-border bg-card/20 text-sm text-muted-foreground"
                >
                  <span className="text-xs font-semibold text-primary mt-0.5">
                    •
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                05
              </span>
              Propriedade Intelectual
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Todo o conteúdo, design e código do Mint Foil são propriedade da
              plataforma ou de seus licenciadores. As imagens de cartas e
              informações de jogos pertencem aos seus respectivos detentores de
              direitos (Pokémon Company, Wizards of the Coast, Konami, Bandai,
              etc.).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                06
              </span>
              Limitação de Responsabilidade
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              O Mint Foil é fornecido \"como está\", sem garantias de qualquer
              tipo. Não nos responsabilizamos por decisões financeiras baseadas
              nas informações de preço exibidas na plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                07
              </span>
              Alterações nos Termos
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Reservamos o direito de modificar estes termos a qualquer momento.
              Alterações significativas serão comunicadas por email. O uso
              continuado do serviço após as alterações implica na aceitação dos
              novos termos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                08
              </span>
              Contato
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes termos, entre em contato pelo email
              disponível na plataforma:{" "}
              <a
                href="mailto:support@mintfoil.app"
                className="text-primary hover:underline font-semibold"
              >
                support@mintfoil.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
