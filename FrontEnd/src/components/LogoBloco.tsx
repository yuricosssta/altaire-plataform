// FrontEnd/src/components/LogoBloco.tsx

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants/routes";

export interface LogoBlocoProps {
  readonly orientation?: "horizontal" | "vertical";
  readonly size?: "sm" | "md" | "lg";
  readonly tone?: "public-dark" | "adaptive";
  readonly className?: string;
  readonly href?: string;
  readonly priority?: boolean;
  readonly showWordmark?: boolean;
  readonly ariaLabel?: string;
}

const ICON_SIZE_CLASSES = {
  sm: "h-9 w-9",
  md: "h-10 w-10 sm:h-11 sm:w-11",
  lg: "h-14 w-14",
} as const;

const ICON_SIZES_ATTR = {
  sm: "36px",
  md: "44px",
  lg: "56px",
} as const;

/**
 * Componente oficial de marca do ecossistema Legion Altaire.
 *
 * Regras canônicas (Etapa 1 §2.13 e Etapa 2C §8.2):
 * - Lockup visual preservado como "ALTAIRE / LEGION" (não inverter a composição).
 * - Nome textual e acessível mantido como "Legion Altaire".
 * - Destino padrão: ROUTES.home ("/").
 */
export default function LogoBloco({
  orientation = "horizontal",
  size = "md",
  tone = "public-dark",
  className,
  href = ROUTES.home,
  priority = false,
  showWordmark = true,
  ariaLabel = "Legion Altaire — Ir para a página inicial",
}: LogoBlocoProps) {
  const isVertical = orientation === "vertical";
  const resolvedSize = isVertical ? "lg" : size;

  const logoIcon = (
    <div
      className={cn(
        "relative shrink-0 transition-transform duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]",
        ICON_SIZE_CLASSES[resolvedSize]
      )}
      aria-hidden="true"
    >
      <Image
        src="/logo-altaire.png"
        alt=""
        fill
        priority={priority}
        className="object-contain"
        sizes={ICON_SIZES_ATTR[resolvedSize]}
      />
    </div>
  );

  const logoText = showWordmark ? (
    <div
      className={cn(
        "flex flex-col justify-center select-none",
        isVertical ? "mt-1.5 items-center text-center" : "items-start text-left"
      )}
    >
      <span
        className={cn(
          "font-heading font-semibold uppercase leading-none tracking-[0.18em] transition-colors duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]",
          tone === "public-dark"
            ? "text-la-text-primary group-hover:text-la-gold-light"
            : "text-foreground group-hover:text-primary",
          isVertical
            ? "text-lg sm:text-xl"
            : size === "sm"
              ? "text-base"
              : "text-[1.0625rem] sm:text-lg"
        )}
      >
        ALTAIRE
      </span>

      <span
        className={cn(
          "font-la-sans font-medium uppercase leading-none tracking-[0.26em] transition-colors duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]",
          tone === "public-dark"
            ? "text-la-gold group-hover:text-la-text-primary"
            : "text-muted-foreground group-hover:text-foreground/80",
          isVertical
            ? "mt-1.5 text-[0.6875rem]"
            : "mt-1 text-[0.625rem] sm:text-[0.6875rem]"
        )}
      >
        LEGION
      </span>
    </div>
  ) : null;

  return (
    <div className={cn("inline-flex items-center", className)}>
      <Link
        href={href}
        aria-label={ariaLabel}
        className={cn(
          "group inline-flex min-h-[2.75rem] items-center rounded-la-sm py-1 transition-opacity duration-180",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            isVertical ? "flex-col" : "flex-row"
          )}
        >
          {logoIcon}
          {logoText}
        </div>
      </Link>
    </div>
  );
}