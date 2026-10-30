"use client";

import { IconChevronLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { veioDeDentroDoSite } from "@/lib/navegacao-interna";
import { cn } from "@/lib/utils";

/**
 * "‹ Voltar" como a seta do app: volta para a tela de onde a pessoa veio.
 * Quem chegou de fora (Google, link compartilhado) não tem tela anterior no
 * site; para essa pessoa o botão vira o `padrao` (rótulo e destino), que é o
 * nível de cima da tela.
 */
export function BotaoVoltar({
  rotulo = "Voltar",
  padrao,
  className,
}: {
  rotulo?: string;
  padrao: { label: string; href: string };
  className?: string;
}) {
  const router = useRouter();
  // Só dá para saber no navegador: no servidor sai o padrão, e o rótulo
  // troca na montagem se houver tela anterior
  const [deDentro, setDeDentro] = useState(false);
  useEffect(() => setDeDentro(veioDeDentroDoSite()), []);

  return (
    <button
      type="button"
      onClick={() => (deDentro ? router.back() : router.push(padrao.href))}
      className={cn(
        "group inline-flex max-w-full cursor-pointer items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <IconChevronLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
      <span className="truncate">{deDentro ? rotulo : padrao.label}</span>
    </button>
  );
}
