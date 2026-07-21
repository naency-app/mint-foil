"use client";

import { cn } from "@/lib/utils";

/**
 * Linguagem de componentes espelhada do mobile
 * (mint-foil-app/components/glass-card.tsx e padrões das tabs):
 * chips de vidro com ativo invertido, section labels uppercase e link "Ver
 * todas →". As superfícies vivem em globals.css (.glass-card / .glass-pill).
 */

export function GlassPill({
  active = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "glass-pill inline-flex shrink-0 cursor-pointer items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-bold transition-colors",
        // text-foreground é utility e venceria o color de .glass-pill-active;
        // por isso só entra quando a pill está inativa
        active ? "glass-pill-active" : "text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function SectionLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <h2 className="text-[17px] font-extrabold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
