import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Leva ao tutorial de raridades, já na seção do jogo. Quem não joga aquele
 * jogo não sabe o que é "Illustration Rare" ou "Secret Rare"; o lembrete fica
 * onde a raridade aparece (filtro do Explorar, detalhes da carta).
 */
export function LinkTutorialRaridade({
  jogo,
  pergunta = "Não sabe a raridade da sua carta?",
  acao = "Identifique a raridade",
  className,
}: {
  /** Slug ("pokemon") ou id do banco ("tcg-pokemon"); sem ele, abre do topo. */
  jogo?: string | null;
  pergunta?: string;
  acao?: string;
  className?: string;
}) {
  const slug = jogo?.replace(/^tcg-/, "");
  return (
    <Link
      href={slug ? `/raridades#jogo-${slug}` : "/raridades"}
      className={cn("group block space-y-0.5 text-xs", className)}
    >
      <span className="block text-muted-foreground">{pergunta}</span>
      <span className="flex items-center gap-1 font-bold text-tertiary transition-colors group-hover:text-tertiary-hover">
        {acao}
        <ChevronRight className="size-3" />
      </span>
    </Link>
  );
}
