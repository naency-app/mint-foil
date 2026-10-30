import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Trilha de navegação (Sets › Jogo › Coleção › Carta) das páginas de catálogo.
 *
 * No computador, a trilha inteira. No celular (max-md), só "‹ nível de cima"
 * numa linha: a trilha completa quebrava em três linhas e repetia o nome que
 * já está logo abaixo, em letra grande (21/10).
 */
export function Trilha({
  niveis,
  atual,
  voltar,
  className,
}: {
  /** Do mais alto ao mais próximo; o último é o "voltar" do celular */
  niveis: { label: string; href: string }[];
  atual: string;
  /**
   * No lugar do "‹ nível de cima" do celular. A carta usa o BotaoVoltar: ela
   * é aberta do Explorar, do Portfólio, da busca… e o nível de cima (a
   * coleção) levava para onde a pessoa nunca esteve (30/10).
   */
  voltar?: React.ReactNode;
  className?: string;
}) {
  const anterior = niveis.at(-1);
  return (
    <>
      <nav
        className={cn(
          "flex items-center gap-1.5 text-muted-foreground max-md:hidden",
          className,
        )}
      >
        {niveis.map((n) => (
          <span key={n.href} className="flex items-center gap-1.5">
            <Link
              href={n.href}
              className="transition-colors hover:text-primary"
            >
              {n.label}
            </Link>
            <IconChevronRight className="size-3" />
          </span>
        ))}
        <span className="max-w-80 truncate text-foreground">{atual}</span>
      </nav>
      {voltar ? (
        <div className="md:hidden">{voltar}</div>
      ) : (
        anterior && (
          <Link
            href={anterior.href}
            className="flex max-w-full items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:hidden"
          >
            <IconChevronLeft className="size-4 shrink-0" />
            <span className="truncate">{anterior.label}</span>
          </Link>
        )
      )}
    </>
  );
}
