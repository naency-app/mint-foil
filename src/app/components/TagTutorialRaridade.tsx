import { IconSparkles } from "@tabler/icons-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

function hrefDoTutorial(jogo?: string | null) {
  const slug = jogo?.replace(/^tcg-/, "");
  return slug ? `/raridades#jogo-${slug}` : "/raridades";
}

/**
 * Tag "Tutorial" ao lado do rótulo "Raridade" (filtro do Explorar, detalhes
 * da carta): leva ao tutorial já na seção do jogo. Quem não joga aquele jogo
 * não sabe o que é "Illustration Rare". Era um texto de duas linhas embaixo da
 * lista, que poluía o bloco (22/10). Mesmo selo do topo de /raridades.
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
