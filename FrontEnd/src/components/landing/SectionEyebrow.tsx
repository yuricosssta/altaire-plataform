// FrontEnd/src/components/landing/SectionEyebrow.tsx

import type { ReactNode } from "react";
import { clsx } from "clsx";

export type SectionEyebrowProps = {
  readonly label?: string | null;
  readonly stepCode?: string | null;
  readonly align?: "left" | "center";
  readonly variant?: "default" | "pill" | "subtle";
  readonly className?: string;
  readonly children?: ReactNode;
};

/**
 * Componente estrutural para o Eyebrow das seções da landing pública.
 * Respeita o DNA "Premium por restrição": dourado usado apenas como
 * marcador semântico de foco e ativação.
 */
export function SectionEyebrow({
  label,
  stepCode,
  align = "left",
  variant = "default",
  className,
  children,
}: SectionEyebrowProps) {
  const content = children ?? label;

  if (!content) {
    return null;
  }

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2.5",
        align === "center" && "mx-auto justify-center",
        variant === "pill" &&
          "rounded-la-full border border-la-border-gold bg-la-gold-faint px-3.5 py-1.5",
        variant === "default" && "py-0.5",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "inline-block shrink-0 rounded-la-full bg-la-gold",
          variant === "subtle" ? "h-1 w-1 opacity-80" : "h-1.5 w-1.5"
        )}
      />

      {stepCode ? (
        <span
          className="font-la-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-la-gold-light"
        >
          {stepCode}
        </span>
      ) : null}

      {stepCode ? (
        <span
          aria-hidden="true"
          className="h-3 w-px bg-la-border-visible"
        />
      ) : null}

      <span
        className={clsx(
          "text-[0.75rem] font-medium uppercase leading-[1.4] tracking-[0.08em]",
          variant === "pill" ? "text-la-gold-light" : "text-la-text-secondary"
        )}
      >
        {content}
      </span>
    </div>
  );
}