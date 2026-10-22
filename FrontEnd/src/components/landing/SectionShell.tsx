// FrontEnd/src/components/landing/SectionShell.tsx
import type { ElementType, ReactNode } from "react";
import { clsx } from "clsx";

export type SectionContainerSize = "prose" | "narrow" | "wide" | "max";
export type SectionSpacingSize = "compact" | "default" | "spacious" | "hero";
export type SectionSurfaceTone =
  | "canvas"
  | "deep"
  | "surface-1"
  | "surface-2"
  | "final-cta"
  | "hero";

export type SectionShellProps = {
  readonly id?: string;
  readonly as?: ElementType;
  readonly ariaLabel?: string;
  readonly ariaLabelledBy?: string;
  readonly container?: SectionContainerSize;
  readonly spacing?: SectionSpacingSize;
  readonly surface?: SectionSurfaceTone;
  readonly topBorder?: boolean;
  readonly bottomBorder?: boolean;
  readonly className?: string;
  readonly containerClassName?: string;
  readonly children: ReactNode;
};

const CONTAINER_CLASSES: Readonly<Record<SectionContainerSize, string>> = {
  prose: "max-w-[45rem]", // 720px (FAQ e leitura densa)
  narrow: "max-w-[60rem]", // 960px (Comparações focadas)
  wide: "max-w-[75rem]", // 1200px (Seções padrão)
  max: "max-w-[80rem]", // 1280px (Hero, Mecanismo, Funções e Bento)
};

/**
 * Escala vertical calibrada para todos os dispositivos (Mobile, Tablet, Laptop e Desktop).
 * No modo `hero`, desconta a altura exata do Header fixo (4rem no mobile / 4.25rem no desktop)
 * deixando um respiro limpo de 20px a 36px acima da primeira dobra.
 */
const SPACING_CLASSES: Readonly<Record<SectionSpacingSize, string>> = {
  compact: "py-10 sm:py-12 lg:py-14",
  default: "py-14 sm:py-16 md:py-20 lg:py-24",
  spacious: "py-16 sm:py-20 md:py-24 lg:py-28",
  hero: "pt-[5.25rem] pb-12 sm:pt-[5.75rem] sm:pb-16 md:pt-[6.25rem] md:pb-20 lg:pt-[6.5rem] lg:pb-24",
};

const SURFACE_CLASSES: Readonly<Record<SectionSurfaceTone, string>> = {
  canvas: "bg-la-canvas text-la-text-primary",
  deep: "bg-la-canvas-deep text-la-text-primary",
  "surface-1": "bg-la-surface-1 text-la-text-primary",
  "surface-2": "bg-la-surface-2 text-la-text-primary",
  "final-cta":
    "bg-[radial-gradient(ellipse_at_top,rgba(207,169,101,0.08)_0%,rgba(6,7,11,1)_70%)] bg-la-canvas text-la-text-primary",
  hero: "bg-la-canvas text-la-text-primary",
};

export function SectionShell({
  id,
  as: Component = "section",
  ariaLabel,
  ariaLabelledBy,
  container = "wide",
  spacing = "default",
  surface = "canvas",
  topBorder = false,
  bottomBorder = false,
  className,
  containerClassName,
  children,
}: SectionShellProps) {
  return (
    <Component
      id={id}
      data-la-surface="dark"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={clsx(
        "relative w-full font-la-sans antialiased selection:bg-la-gold/25 selection:text-la-gold-bright",
        SURFACE_CLASSES[surface],
        SPACING_CLASSES[spacing],
        topBorder && "border-t border-la-divider",
        bottomBorder && "border-b border-la-divider",
        className
      )}
    >
      <div
        className={clsx(
          "mx-auto w-full px-5 sm:px-6 md:px-8 lg:px-10",
          CONTAINER_CLASSES[container],
          containerClassName
        )}
      >
        {children}
      </div>
    </Component>
  );
}

export default SectionShell;