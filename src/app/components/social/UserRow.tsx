"use client";

import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/** Linha de pessoa (listas, pedidos, busca): foto, nome, @ e uma ação à direita. */
export function UserRow({
  handle,
  displayName,
  image,
  isPro,
  onNavigate,
  children,
}: {
  handle: string;
  displayName: string;
  image: string | null;
  isPro: boolean;
  onNavigate?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Link
        href={`/showcase/profile/@${handle}`}
        onClick={onNavigate}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15">
          {image ? (
            <Image
              src={image}
              alt={displayName}
              width={40}
              height={40}
              className="size-10 object-cover"
            />
          ) : (
            <span className="text-base font-black text-primary">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-sm font-bold text-foreground">
            <span className="truncate">{displayName}</span>
            {/* Selo de assinante — mesmo azul do app e do cabeçalho do perfil */}
            {isPro && (
              <IconRosetteDiscountCheckFilled
                className="size-4 shrink-0"
                style={{ color: "#1D9BF0" }}
                aria-label="Assinante Pro"
              />
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">@{handle}</p>
        </div>
      </Link>
      {children}
    </div>
  );
}
