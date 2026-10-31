"use client";

import { IconTrendingUp } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/app/components/SugestoesBusca";
import { AlternarSegmento } from "@/components/AlternarSegmento";
import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { EstadoVazio } from "@/components/EstadoVazio";
import { api, type PontoMyp } from "@/lib/api";

type Aba = "myp" | "intl";

/**
 * Pontos da MYP prontos para o gráfico: dia sem valor repete o anterior (a
 * MYP já faz isso, mas um dia sem anúncio vem vazio) e o começo sem valor sai.
 */
function serieDaMyp(pontos: PontoMyp[]) {
  let menor: number | null = null;
  let faixa: number | null = null;
  let ehMedia = false;
  const serie = pontos.flatMap((p) => {
    menor = p.menor ?? menor;
    // Faixa: a mediana nos dias da MYP; a média nos dias do nosso histórico
    if (p.mediana != null) {
      faixa = p.mediana;
      ehMedia = false;
    } else if (p.media != null) {
      faixa = p.media;
      ehMedia = true;
    }
    if (menor == null) return [];
    return [
      {
        date: new Date(`${p.data}T12:00:00`),
        menor,
        mediana: faixa ?? menor,
        ehMedia,
      },
    ];
  });
  // Nosso histórico só grava ponto quando o preço muda: o último valor vale
  // até hoje. Sem isto, carta de preço parado teria um ponto só e nunca
  // mostraria o gráfico em real.
  const ultimo = serie[serie.length - 1];
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);
  if (ultimo && ultimo.date < hoje) serie.push({ ...ultimo, date: hoje });
  return serie;
}

/**
 * Histórico de preço da carta (31/10, desenho da Isa): abre em "Em real", a
 * série de 90 dias da MYP Cards (menor preço, com a mediana dos anúncios como
 * faixa clara atrás), e "Internacional" troca para a TCGplayer em reais. Sem
 * histórico da MYP, abre direto no Internacional.
 */
export function GraficoDePreco({
  cardId,
  naMyp,
  internacional,
}: {
  cardId: string;
  /** A carta tem preço da MYP (senão nem pergunta pelo histórico) */
  naMyp: boolean;
  internacional: { date: Date; price: number }[];
}) {
  const { data: historico, isLoading } = useQuery({
    queryKey: ["myp-historico", cardId],
    queryFn: () => api.myp.historico(cardId),
    enabled: naMyp,
    staleTime: 60 * 60 * 1000,
  });
  const serieMyp = useMemo(
    () => serieDaMyp(historico?.pontos ?? []),
    [historico],
  );
  const temMyp = serieMyp.length > 1;

  const [aba, setAba] = useState<Aba>("myp");
  // Sem MYP (ou sem pontos), a aba "Em real" não teria o que mostrar
  useEffect(() => {
    if (!isLoading && !temMyp) setAba("intl");
  }, [isLoading, temMyp]);
  const mostrar: Aba = temMyp ? aba : "intl";

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <IconTrendingUp className="size-5 text-primary" />
          Histórico de preço
        </h2>
        {temMyp && (
          <AlternarSegmento
            rotulo="Fonte do histórico"
            valor={aba}
            onChange={setAba}
            opcoes={[
              { value: "myp", label: "Em real" },
              { value: "intl", label: "Internacional" },
            ]}
          />
        )}
      </div>

      {mostrar === "myp" ? (
        <>
          <AreaChart
            data={serieMyp}
            xDataKey="date"
            margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
            animationDuration={1200}
            aspectRatio="2.2 / 1"
          >
            <Grid
              horizontal
              vertical={false}
              numTicksRows={4}
              stroke="var(--chart-grid)"
              strokeDasharray="4,4"
            />
            {/* A mediana dos anúncios, clara, atrás do menor preço */}
            <Area
              dataKey="mediana"
              fill="var(--primary)"
              fillOpacity={0.08}
              showLine={false}
              showHighlight={false}
              gradientToOpacity={0.02}
            />
            <Area
              dataKey="menor"
              fill="var(--primary)"
              fillOpacity={0.15}
              stroke="var(--primary)"
              strokeWidth={2.5}
              gradientToOpacity={0.01}
            />
            <ChartTooltip
              rows={(point) => [
                {
                  color: "var(--primary)",
                  label: "Menor preço",
                  value: `R$ ${formatPrice(Number(point.menor))}`,
                },
                {
                  color: "var(--muted-foreground)",
                  label: point.ehMedia ? "Média dos anúncios" : "Mediana",
                  value: `R$ ${formatPrice(Number(point.mediana))}`,
                },
              ]}
            />
            <XAxis numTicks={6} />
          </AreaChart>
          {/* Atribuição obrigatória da MYP onde o dado dela aparece */}
          <p className="mt-2 text-xs text-muted-foreground">
            {historico?.versao ? `${historico.versao} · ` : ""}
            Dados:{" "}
            <a
              href="https://mypcards.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              MYP Cards
            </a>
          </p>
        </>
      ) : internacional.length > 1 ? (
        <AreaChart
          data={internacional}
          xDataKey="date"
          margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
          animationDuration={1200}
          aspectRatio="2.2 / 1"
        >
          <Grid
            horizontal
            vertical={false}
            numTicksRows={4}
            stroke="var(--chart-grid)"
            strokeDasharray="4,4"
          />
          <Area
            dataKey="price"
            fill="var(--primary)"
            fillOpacity={0.15}
            stroke="var(--primary)"
            strokeWidth={2.5}
            gradientToOpacity={0.01}
          />
          <ChartTooltip
            rows={(point) => [
              {
                color: "var(--primary)",
                label: "Preço",
                value: `R$ ${formatPrice(Number(point.price))}`,
              },
            ]}
          />
          <XAxis numTicks={6} />
        </AreaChart>
      ) : (
        <EstadoVazio
          className="py-10"
          icon={IconTrendingUp}
          titulo={
            internacional.length === 0
              ? "Sem histórico de preço"
              : "Histórico em construção"
          }
          descricao={
            internacional.length === 0
              ? "Ainda não há dados de preço para esta carta."
              : `O gráfico aparece com mais dados. Preço atual: R$ ${formatPrice(internacional[0].price)}`
          }
        />
      )}
    </>
  );
}
