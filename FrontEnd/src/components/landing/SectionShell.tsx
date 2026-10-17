// FrontEnd/src/components/landing/SectionShell.tsx

import type { ReactNode } from "react";
import { clsx } from "clsx";

export type SectionContainerSize =
  | "prose"
  | "default"
  | "wide"
  | "max"
  | "full";

export type SectionVerticalSpacing =
  | "none"
  | "compact"
  | "default"
  | "spacious"
  | "hero"
  | "footer";

export type SectionSurfaceTone =
  | "canvas"
  | "deep"
  | "surface-1"
  | "hero"
  | "final-cta"
  | "offwhite";

export type SectionShellProps = {
  readonly id?: string;
  readonly as?: "section" | "div" | "aside";
  readonly container?: SectionContainerSize;
  readonly spacing?: SectionVerticalSpacing;
  readonly surface?: SectionSurfaceTone;
  readonly topBorder?: boolean;
  readonly bottomBorder?: boolean;
  readonly ariaLabel?: string;
  readonly ariaLabelledBy?: string;
  readonly className?: string;
  readonly containerClassName?: string;
  readonly children: ReactNode;
};

const CONTAINER_MAX_WIDTH_CLASSES: Record<SectionContainerSize, string> = {
  prose: "max-w-[45rem]",   // 720px — FAQ e leitura concentrada
  default: "max-w-[60rem]", // 960px — Seções compactas
  wide: "max-w-[75rem]",    // 1.200px — Cards e composições
  max: "max-w-[80rem]",     // 1.280px — Header, Hero e Mockups
  full: "max-w-none",       // 100% — Full-bleed controlado
};

const SECTION_SPACING_STYLES: Record<SectionVerticalSpacing, string> = {
  none: "py-0",
  compact: "py-[var(--la-section-py-compact)]",
  default: "py-[var(--la-section-py-default)]",
  spacious: "py-[var(--la-section-py-spacious)]",
  hero: "pt-[calc(var(--la-header-height-initial)+2.5rem)] pb-[var(--la-section-py-compact)] lg:pt-[calc(var(--la-header-height-initial)+4rem)] lg:pb-[var(--la-section-py-default)]",
  footer: "py-[var(--la-section-py-footer)]",
};

const SECTION_SURFACE_CLASSES: Record<SectionSurfaceTone, string> = {
  canvas: "bg-la-canvas text-la-text-primary",
  deep: "bg-la-canvas-deep text-la-text-primary",
  "surface-1": "bg-la-surface-1/60 text-la-text-primary",
  hero: "bg-[image:var(--la-gradient-hero-atmosphere)] bg-la-canvas text-la-text-primary",
  "final-cta": "bg-[image:var(--la-gradient-final-cta)] bg-la-canvas text-la-text-primary",
  offwhite:
    "bg-[var(--la-offwhite-bg)] text-[var(--la-offwhite-text)] border-y border-[var(--la-offwhite-border)]",
};

/**
 * Wrapper estrutural canônico das seções da landing page.
 * Garante alinhamento horizontal idêntico ao Header, scroll-margin para âncoras
 * e alternância deliberada de ritmo vertical (Etapa 2B §5 e §7).
 */
export function SectionShell({
  id,
  as: Tag = "section",
  container = "max",
  spacing = "default",
  surface = "canvas",
  topBorder = false,
  bottomBorder = false,
  ariaLabel,
  ariaLabelledBy,
  className,
  containerClassName,
  children,
}: SectionShellProps) {
  return (
    <Tag
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-la-surface={surface === "offwhite" ? "offwhite" : "dark"}
      className={clsx(
        "relative w-full scroll-mt-[5.5rem]",
        SECTION_SURFACE_CLASSES[surface],
        SECTION_SPACING_STYLES[spacing],
        topBorder && "border-t border-la-divider",
        bottomBorder && "border-b border-la-divider",
        className
      )}
    >
      <div
        className={clsx(
          "mx-auto w-full px-5 md:px-8 lg:px-10",
          CONTAINER_MAX_WIDTH_CLASSES[container],
          containerClassName
        )}
      >
        {children}
      </div>
    </Tag>
  );
}