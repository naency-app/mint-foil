"use client";

import type { ProductTypeValue } from "@/app/components/filters";
import { AlternarSegmento } from "@/components/AlternarSegmento";

/**
 * Tudo · Cartas · Selados, com a contagem de cada um, no desenho do
 * AlternarVisao (botão dividido). No portfólio, só aparece quando há selado:
 * sem selado, "Cartas" e "Tudo" seriam a mesma lista (30/10).
 */
export function AlternarTipoDeProduto({
  valor,
  onChange,
  contagem,
  className,
}: {
  valor: ProductTypeValue;
  onChange: (v: ProductTypeValue) => void;
  contagem: { cartas: number; selados: number };
  className?: string;
}) {
  return (
    <AlternarSegmento
      rotulo="Tipo de produto"
      valor={valor}
      onChange={onChange}
      className={className}
      opcoes={[
        { value: "all", label: "Tudo", n: contagem.cartas + contagem.selados },
        { value: "single", label: "Cartas", n: contagem.cartas },
        { value: "sealed", label: "Selados", n: contagem.selados },
      ]}
    />
  );
}
