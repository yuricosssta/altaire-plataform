// FrontEnd/src/components/landing/ResourceMenu.tsx
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, ChevronDown, Compass, HelpCircle } from "lucide-react";
import { clsx } from "clsx";
import {
  landingContent,
  type ResourceMenuItem,
} from "@/lib/constants/landing-content";
import { LANDING_DOM_IDS } from "@/lib/constants/routes";
import {
  DROPDOWN_MOTION,
  REDUCED_MOTION_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type ResourceMenuProps = {
  readonly label?: string;
  readonly items?: readonly ResourceMenuItem[];
  readonly panelId?: string;
  readonly className?: string;
  readonly onItemSelect?: (item: ResourceMenuItem) => void;
};

const HOVER_OPEN_DELAY_MS = 60;
const HOVER_CLOSE_DELAY_MS = 150;

/**
 * Dropdown editorial compacto "Recursos" da navegação pública (Etapa 2B §12.4 & Etapa 2D §4.1).
 *
 * Referências absorvidas:
 * - LiveKit: arquitetura informacional com título, descrição e ícone funcional.
 * - Resend: contenção visual, silêncio e legibilidade.
 * - Linear: precisão de estados, foco visível e navegação por teclado.
 */
export function ResourceMenu({
  label = landingContent.header.resourcesLabel,
  items = landingContent.header.resourceMenu,
  panelId = LANDING_DOM_IDS.resourcesPanel,
  className,
  onItemSelect,
}: ResourceMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const closeMenu = useCallback(
    (restoreFocusToTrigger = false) => {
      clearTimers();
      setIsOpen(false);
      if (restoreFocusToTrigger) {
        requestAnimationFrame(() => {
          triggerRef.current?.focus();
        });
      }
    },
    [clearTimers]
  );

  /* Fecha ao clicar fora ou pressionar Escape globalmente */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        target &&
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        closeMenu(false);
      }
    };

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };

    document.addEventListener("mousedown", handlePointerDownOutside);
    document.addEventListener("touchstart", handlePointerDownOutside, {
      passive: true,
    });
    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside);
      document.removeEventListener("touchstart", handlePointerDownOutside);
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen, closeMenu]);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (!isOpen) {
      openTimerRef.current = setTimeout(() => {
        setIsOpen(true);
      }, HOVER_OPEN_DELAY_MS);
    }
  };

  const handleMouseLeave = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  };

  const handleTriggerClick = () => {
    clearTimers();
    setIsOpen((prev) => !prev);
  };

  const focusItemAtIndex = (index: number) => {
    const clampedIndex = (index + items.length) % items.length;
    requestAnimationFrame(() => {
      itemRefs.current[clampedIndex]?.focus();
    });
  };

  const handleTriggerKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      clearTimers();
      setIsOpen(true);
      focusItemAtIndex(0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      clearTimers();
      setIsOpen(true);
      focusItemAtIndex(items.length - 1);
    } else if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeMenu(true);
    }
  };

  const handlePanelKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    currentIndex: number
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItemAtIndex(currentIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItemAtIndex(currentIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusItemAtIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusItemAtIndex(items.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
    }
  };

  const handleContainerBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget as Node | null;
    if (
      isOpen &&
      containerRef.current &&
      (!nextFocused || !containerRef.current.contains(nextFocused))
    ) {
      closeMenu(false);
    }
  };

  const handleItemClick = (item: ResourceMenuItem) => {
    closeMenu(false);
    onItemSelect?.(item);
  };

  const panelVariants = selectMotionPreset(
    shouldReduceMotion,
    DROPDOWN_MOTION.panel,
    REDUCED_MOTION_VARIANTS.panel
  );

  const resolveItemIcon = (key: string) => {
    if (key.includes("perguntas") || key.includes("faq")) {
      return HelpCircle;
    }
    return Compass;
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={handleContainerBlur}
      className={clsx("relative inline-flex items-center", className)}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        className={clsx(
          "group inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-la-sm px-3 py-2 font-la-sans text-[0.875rem] font-medium leading-[1.4] transition-colors duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas",
          isOpen
            ? "bg-la-surface-2/80 text-la-gold-light"
            : "text-la-text-secondary hover:text-la-text-primary"
        )}
      >
        <span>{label}</span>

        <ChevronDown
          aria-hidden="true"
          className={clsx(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen
              ? "rotate-180 text-la-gold"
              : "text-la-text-muted group-hover:text-la-text-primary"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id={panelId}
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
            className={clsx(
              "absolute right-0 top-full z-[var(--la-z-dropdown)] mt-2.5 w-[24rem] max-w-[calc(100vw-2.5rem)]",
              "rounded-la-lg border border-la-border-subtle bg-la-surface-3/95 p-3 shadow-[var(--la-elevation-2)] backdrop-blur-[var(--la-blur-surface)]",
              /* Ponte invisível entre o botão e o painel para travessia segura do cursor */
              "before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']"
            )}
          >
            {/* Filete luminoso superior discreto */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)] opacity-75"
            />

            <div className="flex flex-col gap-1">
              {items.map((item, index) => {
                const IconComponent = resolveItemIcon(item.key);

                return (
                  <div
                    key={item.key}
                    onKeyDown={(event) => handlePanelKeyDown(event, index)}
                  >
                    <Link
                      ref={(element) => {
                        itemRefs.current[index] = element;
                      }}
                      href={item.href}
                      onClick={() => handleItemClick(item)}
                      className={clsx(
                        "group/item relative flex items-start gap-3.5 rounded-la-md p-3 transition-colors duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        "hover:bg-la-surface-hover focus-visible:bg-la-surface-hover",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                      )}
                    >
                      {/* Indicador lateral dourado discreto no item ativo/hover */}
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-3 bottom-3 w-0.5 origin-center scale-y-0 rounded-la-full bg-la-gold transition-transform duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:scale-y-100 group-focus-visible/item:scale-y-100"
                      />

                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-la-sm border border-la-border-subtle bg-la-surface-2 text-la-text-secondary transition-colors duration-180 group-hover/item:border-la-border-gold group-hover/item:text-la-gold-light group-focus-visible/item:border-la-border-gold group-focus-visible/item:text-la-gold-light"
                      >
                        <IconComponent className="h-4 w-4" />
                      </span>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-la-sans text-[0.875rem] font-medium leading-[1.3] text-la-text-primary transition-colors duration-180 group-hover/item:text-la-gold-light group-focus-visible/item:text-la-gold-light">
                            {item.title}
                          </span>

                          <ArrowUpRight
                            aria-hidden="true"
                            className="h-3.5 w-3.5 shrink-0 text-la-text-muted transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:text-la-gold-light group-focus-visible/item:translate-x-0.5 group-focus-visible/item:-translate-y-0.5 group-focus-visible/item:text-la-gold-light"
                          />
                        </div>

                        <p className="font-la-sans text-[0.8125rem] leading-[1.45] text-la-text-secondary">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default ResourceMenu;