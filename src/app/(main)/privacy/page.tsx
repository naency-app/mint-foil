"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Calendar } from "lucide-react";

export default function PrivacyPage() {
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
              <Shield className="size-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">
              Documentos Legais
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Política de Privacidade
          </h1>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>Última atualização: março de 2026</span>
          </div>
        </div>

        <div className="space-y-8 relative">
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                01
              </span>
              Informações que Coletamos
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Coletamos as seguintes informações ao usar o Mint Foil:
            </p>
            <div className="space-y-3 pl-2">
              {[
                {
                  title: "Dados de conta",
                  desc: "email, nome e foto de perfil (quando fornecido via Google OAuth);",
                },
                {
                  title: "Dados de uso",
                  desc: "cartas adicionadas ao portfólio, histórico de scans e preferências de exibição;",
                },
                {
                  title: "Dados técnicos",
                  desc: "logs de acesso, endereço IP e informações básicas do dispositivo para fins de segurança.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-2.5 items-start p-3 rounded-lg border border-border bg-card/20 text-sm"
                >
                  <span className="text-xs font-semibold text-primary mt-0.5">
                    •
                  </span>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block sm:inline mr-1">
                      {item.title}:
                    </span>
                    <span className="text-muted-foreground">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                02
              </span>
              Como Usamos suas Informações
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Utilizamos seus dados para:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
              {[
                "Prover e melhorar os serviços da plataforma;",
                "Autenticar e proteger sua conta de usuário;",
                "Enviar comunicações operacionais (ex: link mágico de login);",
                "Analisar métricas de uso agregado para melhorias de produto.",
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

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                03
              </span>
              Compartilhamento de Dados
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Não vendemos ou compartilhamos seus dados pessoais com terceiros,
              exceto:
            </p>
            <div className="space-y-3 pl-2">
              {[
                {
                  title: "Provedores de infraestrutura",
                  desc: "empresas necessárias para operar o serviço (como hospedagem na nuvem e banco de dados);",
                },
                {
                  title: "Obrigações legais",
                  desc: "quando exigido por leis aplicáveis ou ordens judiciais válidas.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-2.5 items-start p-3 rounded-lg border border-border bg-card/20 text-sm"
                >
                  <span className="text-xs font-semibold text-primary mt-0.5">
                    •
                  </span>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block sm:inline mr-1">
                      {item.title}:
                    </span>
                    <span className="text-muted-foreground">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                04
              </span>
              Cookies e Sessão
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Usamos cookies estritamente necessários para manter sua sessão
              autenticada. Não utilizamos cookies de rastreamento de terceiros
              ou para publicidade direcionada. Você pode desativar os cookies no
              seu navegador, mas isso impedirá o login e funcionamento correto
              da plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                05
              </span>
              Segurança dos Dados
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Adotamos medidas técnicas e administrativas avançadas para
              proteger seus dados contra acesso não autorizado, perda, alteração
              ou divulgação. As sessões de usuários são criptografadas e
              protegidas contra vulnerabilidades comuns.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                06
              </span>
              Seus Direitos (LGPD)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Em conformidade com a LGPD (Lei Geral de Proteção de Dados), você
              possui direitos fundamentais sobre suas informações:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
              {[
                "Acesso facilitado aos seus dados armazenados;",
                "Correção de dados incompletos, inexatos ou desatualizados;",
                "Exclusão definitiva de sua conta e informações associadas;",
                "Portabilidade dos dados a outro fornecedor de serviço.",
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
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Para exercer qualquer um destes direitos, basta entrar em contato
              através de nosso email de suporte.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                07
              </span>
              Retenção de Dados
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Mantemos seus dados pessoais apenas pelo tempo necessário para
              cumprir as finalidades descritas, ou seja, enquanto sua conta
              estiver ativa. Ao solicitar a exclusão de sua conta, seus dados
              são permanentemente apagados de nossos servidores em até 30 dias.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                08
              </span>
              Alterações nesta Política
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente para
              refletir mudanças operacionais ou regulatórias. Alterações
              significativas serão notificadas por email. O uso continuado da
              plataforma indica consentimento com a política atualizada.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                09
              </span>
              Contato
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Para esclarecer dúvidas ou enviar solicitações sobre a sua
              privacidade, fale conosco em:{" "}
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
