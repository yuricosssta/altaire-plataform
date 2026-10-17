// FrontEnd/src/components/landing/CTAGroup.tsx

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { clsx } from "clsx";
import type {
  ConditionalCommercialNote,
  LinkAction,
} from "@/lib/constants/landing-content";

export type CTAButtonProps = {
  readonly action: LinkAction;
  readonly variant?: "primary" | "secondary" | "ghost";
  readonly size?: "md" | "sm";
  readonly fullWidthMobile?: boolean;
  readonly showArrow?: boolean;
  readonly className?: string;
};

/**
 * Botão de navegação pública padronizado segundo o DNA do Legion Altaire (Etapa 2B §11).
 * Usa <Link> do Next.js para destinos reais (rotas ou âncoras documentadas).
 */
export function CTAButton({
  action,
  variant = action.variant ?? "primary",
  size = "md",
  fullWidthMobile = true,
  showArrow = false,
  className,
}: CTAButtonProps) {
  const isAnchorToDemo = action.href.includes("#demonstracao");

  return (
    <Link
      href={action.href}
      className={clsx(
        "group relative inline-flex items-center justify-center gap-2.5 rounded-la-md font-la-sans font-medium transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas",
        size === "md"
          ? "min-h-[3rem] px-6 py-3 text-[0.9375rem] leading-[1.2]"
          : "min-h-[2.75rem] px-5 py-2.5 text-[0.875rem] leading-[1.2]",
        fullWidthMobile ? "w-full sm:w-auto" : "w-auto",
        variant === "primary" && [
          "bg-la-gold text-la-text-inverse font-semibold",
          "border border-transparent",
          "hover:bg-la-gold-light hover:-translate-y-[1px] hover:shadow-[0_0_24px_rgba(207,169,101,0.2)]",
          "active:bg-la-gold-deep active:translate-y-0",
        ],
        variant === "secondary" && [
          "bg-la-surface-2 text-la-text-primary",
          "border border-la-border-visible",
          "hover:bg-la-surface-hover hover:border-la-border-gold",
          "active:bg-la-surface-1",
        ],
        variant === "ghost" && [
          "bg-transparent text-la-text-secondary",
          "border border-transparent",
          "hover:bg-la-surface-1/80 hover:text-la-text-primary",
          "active:bg-la-surface-2",
        ],
        className
      )}
    >
      <span>{action.label}</span>

      {variant === "primary" && showArrow ? (
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5"
        />
      ) : null}

      {variant === "secondary" && isAnchorToDemo ? (
        <Play
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 fill-current text-la-gold transition-transform duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5"
        />
      ) : null}
    </Link>
  );
}

export type CTAGroupProps = {
  readonly primaryAction?: LinkAction | null;
  readonly secondaryAction?: LinkAction | null;
  readonly microcopy?: readonly string[] | null;
  readonly conditionalTrialInfo?: ConditionalCommercialNote | null;
  readonly align?: "left" | "center";
  readonly size?: "md" | "sm";
  readonly showPrimaryArrow?: boolean;
  readonly className?: string;
};

/**
 * Grupo coordenado de CTAs (primário + secundário opcional + microcopy controlada).
 */
export function CTAGroup({
  primaryAction,
  secondaryAction,
  microcopy,
  conditionalTrialInfo,
  align = "left",
  size = "md",
  showPrimaryArrow = true,
  className,
}: CTAGroupProps) {
  if (!primaryAction && !secondaryAction) {
    return null;
  }

  const activeMicrocopy: string[] = [
    ...(microcopy ?? []),
    ...(conditionalTrialInfo?.enabled ? conditionalTrialInfo.items : []),
  ];

  return (
    <div
      className={clsx(
        "flex flex-col gap-3.5",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      <div
        className={clsx(
          "flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center",
          align === "center" && "sm:justify-center"
        )}
      >
        {primaryAction ? (
          <CTAButton
            action={primaryAction}
            variant="primary"
            size={size}
            showArrow={showPrimaryArrow}
          />
        ) : null}

        {secondaryAction ? (
          <CTAButton
            action={secondaryAction}
            variant={secondaryAction.variant ?? "secondary"}
            size={size}
          />
        ) : null}
      </div>

      {activeMicrocopy.length > 0 ? (
        <div className="flex flex-col gap-1">
          {activeMicrocopy.map((line) => (
            <p
              key={line}
              className="max-w-[62ch] text-[0.8125rem] leading-[1.5] text-la-text-muted"
            >
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}