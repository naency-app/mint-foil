import { IconSparkles } from "@tabler/icons-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function hrefDoTutorial(jogo?: string | null) {
  const slug = jogo?.replace(/^tcg-/, "");
  return slug ? `/raridades#jogo-${slug}` : "/raridades";
}

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
  return (
    <Link
      href={hrefDoTutorial(jogo)}
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

/**
 * A mesma ida ao tutorial em forma de tag, ao lado do rótulo "Raridade" dos
 * detalhes da carta: o texto de duas linhas embaixo do valor poluía o bloco
 * (22/10). Mesmo selo "Tutorial" do topo da página de raridades.
 */
export function TagTutorialRaridade({ jogo }: { jogo?: string | null }) {
  return (
    <Badge
      asChild
      variant="outline"
      className="h-4 gap-0.5 border-tertiary/30 bg-tertiary/10 px-1.5 text-[10px] font-semibold normal-case tracking-normal text-tertiary hover:bg-tertiary/20"
    >
      <Link href={hrefDoTutorial(jogo)} title="Como identificar a raridade">
        <IconSparkles />
        Tutorial
      </Link>
    </Badge>
  );
}
