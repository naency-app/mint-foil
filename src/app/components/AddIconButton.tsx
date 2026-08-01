"use client";

import { IconPlus } from "@tabler/icons-react";
import { motion } from "motion/react";
import { AnimatedCheck } from "@/app/components/AnimatedCheck";
import { cn } from "@/lib/utils";

interface AddIconButtonProps {
  onClick: (e: React.MouseEvent) => void;
  /** Enquanto true, o botão mostra a confirmação animada no lugar do "+". */
  success: boolean;
  /** Muda a cada confirmação: remonta a animação para ela rodar de novo. */
  successId: number;
  /** Lado do botão em px. 28 é o padrão dos cards; a tela da carta usa 32. */
  size?: number;
  title?: string;
  className?: string;
}

/**
 * Botão redondo de adicionar/incrementar, com a confirmação animada.
 *
 * Existe para que os cinco pontos de adição do site sejam literalmente o mesmo
 * elemento: card do Explorar, card do Portfólio, tela da carta, gatilho
 * flutuante e o popover. Antes cada um repetia as classes por conta própria e
 * eles foram divergindo — um ficou rosa preenchido, outro com fundo, outro com
 * a animação em tamanho diferente do botão.
 */
export function AddIconButton({
  onClick,
  success,
  successId,
  size = 28,
  title,
  className,
}: AddIconButtonProps) {
  return (
    <motion.button
      type="button"
      title={title}
      whileTap={{ scale: 0.78 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
      onClick={onClick}
      style={{ width: size, height: size }}
      className={cn(
        "relative shrink-0 rounded-full flex items-center justify-center transition-colors cursor-pointer",
        success
          ? // Na confirmação quem desenha o disco verde é a própria animação
            "border border-transparent bg-transparent"
          : "border border-emerald-500/50 text-muted-foreground hover:text-emerald-400 hover:border-emerald-400 hover:bg-transparent",
        className,
      )}
    >
      {success ? (
        <AnimatedCheck key={successId} size={size} />
      ) : (
        <IconPlus className="size-3.5" strokeWidth={2.5} />
      )}
    </motion.button>
  );
}
