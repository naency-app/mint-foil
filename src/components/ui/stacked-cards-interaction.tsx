"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Card = ({
  className,
  image,
  badge,
  children,
}: {
  className?: string;
  image?: string;
  badge?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "relative flex h-[380px] w-[272px] cursor-pointer items-center justify-center",
        className,
      )}
    >
      {image && (
        // biome-ignore lint/performance/noImgElement: external TCG card URLs require referrerPolicy
        <img
          src={image}
          alt=""
          referrerPolicy="no-referrer"
          // object-contain + largura automática: cada TCG tem proporção
          // própria (Yu-Gi-Oh é mais estreita) — cover cortava as bordas
          className="h-full w-auto rounded-xl object-contain"
          style={{ filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.28))" }}
        />
      )}
      {badge && (
        // Preço ABAIXO da carta (não sobreposto à arte)
        <span className="-bottom-4 absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#F856A7] to-[#B50D57] px-3.5 py-1.5 font-bold text-white text-xs shadow-lg">
          {badge}
        </span>
      )}
      {children && (
        <div className="flex flex-col gap-y-2 p-2 px-4">{children}</div>
      )}
    </div>
  );
};

interface CardData {
  image: string;
  badge?: string;
  title?: string;
  description?: string;
}

const StackedCardsInteraction = ({
  cards,
  spreadDistance = 40,
  rotationAngle = 5,
  animationDelay = 0.1,
}: {
  cards: CardData[];
  spreadDistance?: number;
  rotationAngle?: number;
  animationDelay?: number;
}) => {
  const [isHovering, setIsHovering] = useState(false);

  // Limit to maximum of 3 cards
  const limitedCards = cards.slice(0, 3);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative h-[380px] w-[272px]">
        {limitedCards.map((card, index) => {
          const isFirst = index === 0;

          let xOffset = 0;
          let rotation = 0;

          if (limitedCards.length > 1) {
            // First card stays in place, second goes left, third goes right
            if (index === 1) {
              xOffset = -spreadDistance;
              rotation = -rotationAngle;
            } else if (index === 2) {
              xOffset = spreadDistance;
              rotation = rotationAngle;
            }
          }

          return (
            <motion.div
              key={card.image}
              className={cn("absolute", isFirst ? "z-10" : "z-0")}
              initial={{ x: 0, rotate: 0 }}
              animate={{
                x: isHovering ? xOffset : 0,
                rotate: isHovering ? rotation : 0,
                zIndex: isFirst ? 10 : 0,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                delay: index * animationDelay,
                type: "spring",
              }}
              {...(isFirst && {
                onHoverStart: () => setIsHovering(true),
                onHoverEnd: () => setIsHovering(false),
                // Touch fallback: tap toggles the spread
                onTap: () => setIsHovering((h) => !h),
              })}
            >
              <Card
                className={isFirst ? "z-10 cursor-pointer" : "z-0"}
                image={card.image}
                badge={card.badge}
              >
                {(card.title || card.description) && (
                  <>
                    {card.title && <h2>{card.title}</h2>}
                    {card.description && <p>{card.description}</p>}
                  </>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export { StackedCardsInteraction, Card };
