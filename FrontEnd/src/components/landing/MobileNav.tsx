// FrontEnd/src/components/landing/MobileNav.tsx
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  ChevronDown,
  Compass,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import LogoBloco from "@/components/LogoBloco";
import { CTAButton } from "@/components/landing/CTAGroup";
import {
  landingContent,
  type HeaderNavItemContent,
  type LinkAction,
  type ResourceMenuItem,
} from "@/lib/constants/landing-content";
import { LANDING_DOM_IDS } from "@/lib/constants/routes";
import {
  FAQ_MOTION,
  MOBILE_MENU_MOTION,
  REDUCED_MOTION_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type MobileNavProps = {
  readonly navItems?: readonly HeaderNavItemContent[];
  readonly resourceItems?: readonly ResourceMenuItem[];
  readonly resourcesLabel?: string;
  readonly primaryAction?: LinkAction | null;
  readonly secondaryAction?: LinkAction | null;
  readonly drawerId?: string;
  readonly className?: string;
  readonly isOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
};

const NAV_DESKTOP_MEDIA_QUERY = "(min-width: 1184px)";
const MOBILE_RESOURCES_PANEL_ID = "mobile-resources-accordion-panel";

/**
 * Navegação mobile e tablet (< 1.184px) da experiência pública do Legion Altaire.
 *
 * Referências absorvidas (Etapa 2A §3.8.1 & Etapa 2B §12.4):
 * - Raycast: tratamento visual translúcido dark-first e separação de camadas.
 * - Resend: organização silenciosa e hierarquia clara.
 * - Linear: foco visível, controle por teclado e precisão de estado.
 */
export function MobileNav({
  navItems = landingContent.header.navItems,
  resourceItems = landingContent.header.resourceMenu,
  resourcesLabel = landingContent.header.resourcesLabel,
  primaryAction = landingContent.header.primaryAction,
  secondaryAction = landingContent.header.secondaryAction,
  drawerId = LANDING_DOM_IDS.mobileNavDrawer,
  className,
  isOpen: controlledIsOpen,
  onOpenChange,
}: MobileNavProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isResourcesExpanded, setIsResourcesExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const isControlled = typeof controlledIsOpen === "boolean";
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const setOpenState = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalIsOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const closeMenu = useCallback(
    (restoreFocusToTrigger = false) => {
      setOpenState(false);
      if (restoreFocusToTrigger) {
        requestAnimationFrame(() => {
          triggerButtonRef.current?.focus();
        });
      }
    },
    [setOpenState]
  );

  const handleToggleMenu = () => {
    if (isOpen) {
      closeMenu(true);
    } else {
      setOpenState(true);
    }
  };

  /* Fecha automaticamente se a viewport passar para o breakpoint desktop (>= 1.184px) */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(NAV_DESKTOP_MEDIA_QUERY);

    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      if (event.matches && isOpen) {
        setOpenState(false);
      }
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, [isOpen, setOpenState]);

  /* Controle de scroll do body, tecla Escape e foco inicial ao abrir */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      cancelAnimationFrame(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen, closeMenu]);

  /* Focus trap dentro do painel quando aberto */
  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) {
      return;
    }

    const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const handleLinkClick = () => {
    closeMenu(false);
  };

  const overlayVariants = selectMotionPreset(
    shouldReduceMotion,
    MOBILE_MENU_MOTION.overlay,
    REDUCED_MOTION_VARIANTS.overlay
  );

  const panelVariants = selectMotionPreset(
    shouldReduceMotion,
    MOBILE_MENU_MOTION.panel,
    REDUCED_MOTION_VARIANTS.panel
  );

  const resourcesContentVariants = selectMotionPreset(
    shouldReduceMotion,
    FAQ_MOTION.content,
    REDUCED_MOTION_VARIANTS.disclosure
  );

  const resolveResourceIcon = (key: string) => {
    if (key.includes("perguntas") || key.includes("faq")) {
      return HelpCircle;
    }
    return Compass;
  };

  return (
    <div className={clsx("inline-flex items-center nav:hidden", className)}>
      {/* Botão acionador no Header Mobile (Touch target mínimo de 44px) */}
      <button
        ref={triggerButtonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={drawerId}
        aria-label={
          isOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"
        }
        onClick={handleToggleMenu}
        className={clsx(
          "inline-flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-la-md border transition-colors duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas",
          isOpen
            ? "border-la-border-gold bg-la-surface-2 text-la-gold-light"
            : "border-la-border-subtle bg-la-surface-1/80 text-la-text-primary hover:border-la-border-visible hover:bg-la-surface-2"
        )}
      >
        {isOpen ? (
          <X aria-hidden="true" className="h-5 w-5" />
        ) : (
          <Menu aria-hidden="true" className="h-5 w-5" />
        )}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <div
            className="fixed inset-0 z-[var(--la-z-drawer)] nav:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação principal"
          >
            {/* Backdrop escuro translúcido */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              onClick={() => closeMenu(true)}
              aria-hidden="true"
              className="fixed inset-0 bg-la-canvas-deep/80 backdrop-blur-xs"
            />

            {/* Painel lateral dark-first entrando pela direita */}
            <motion.div
              id={drawerId}
              ref={panelRef}
              initial="closed"
              animate="open"
              exit="closed"
              variants={panelVariants}
              onKeyDown={handlePanelKeyDown}
              className={clsx(
                "fixed inset-y-0 right-0 z-10 flex w-full max-w-[24rem] flex-col justify-between overflow-y-auto",
                "border-l border-la-border-subtle bg-la-canvas/95 px-5 py-4 shadow-[var(--la-elevation-3)] backdrop-blur-[var(--la-blur-header)] sm:px-6"
              )}
            >
              {/* Topo do painel: Marca + Botão fechar */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between border-b border-la-divider pb-4">
                  <div onClick={handleLinkClick}>
                    <LogoBloco size="sm" tone="public-dark" />
                  </div>

                  <button
                    ref={closeButtonRef}
                    type="button"
                    aria-label="Fechar menu de navegação"
                    onClick={() => closeMenu(true)}
                    className={clsx(
                      "inline-flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-la-md border border-la-border-subtle bg-la-surface-1 text-la-text-secondary transition-colors duration-180",
                      "hover:border-la-border-visible hover:bg-la-surface-2 hover:text-la-text-primary",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                    )}
                  >
                    <X aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>

                {/* Lista principal de navegação */}
                <nav
                  aria-label="Navegação mobile"
                  className="mt-5 flex flex-col gap-1"
                >
                  {navItems.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={clsx(
                        "group flex min-h-[3rem] items-center justify-between rounded-la-md px-3.5 py-2.5 font-la-sans text-[1rem] font-medium text-la-text-primary transition-colors duration-180",
                        "hover:bg-la-surface-2 hover:text-la-gold-light",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                      )}
                    >
                      <span>{item.label}</span>
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-la-full bg-la-border-visible transition-colors duration-180 group-hover:bg-la-gold"
                      />
                    </Link>
                  ))}

                  {/* Grupo expansível Recursos (Accordion Mobile — Etapa 2B §12.4) */}
                  <div className="mt-1 border-t border-la-divider pt-2">
                    <button
                      type="button"
                      aria-expanded={isResourcesExpanded}
                      aria-controls={MOBILE_RESOURCES_PANEL_ID}
                      onClick={() =>
                        setIsResourcesExpanded((prevExpanded) => !prevExpanded)
                      }
                      className={clsx(
                        "flex min-h-[3rem] w-full items-center justify-between rounded-la-md px-3.5 py-2.5 text-left font-la-sans text-[1rem] font-medium transition-colors duration-180",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                        isResourcesExpanded
                          ? "bg-la-surface-2 text-la-gold-light"
                          : "text-la-text-primary hover:bg-la-surface-1"
                      )}
                    >
                      <span>{resourcesLabel}</span>

                      <ChevronDown
                        aria-hidden="true"
                        className={clsx(
                          "h-4 w-4 shrink-0 transition-transform duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          isResourcesExpanded
                            ? "rotate-180 text-la-gold"
                            : "text-la-text-muted"
                        )}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isResourcesExpanded ? (
                        <motion.div
                          id={MOBILE_RESOURCES_PANEL_ID}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          variants={resourcesContentVariants}
                          className="overflow-hidden"
                        >
                          <div className="mt-1.5 flex flex-col gap-1.5 pl-2 pr-1 pb-2">
                            {resourceItems.map((resource) => {
                              const IconComponent = resolveResourceIcon(
                                resource.key
                              );

                              return (
                                <Link
                                  key={resource.key}
                                  href={resource.href}
                                  onClick={handleLinkClick}
                                  className={clsx(
                                    "group/res flex min-h-[3.25rem] items-start gap-3 rounded-la-md border border-la-border-subtle bg-la-surface-1/90 p-3 transition-colors duration-180",
                                    "hover:border-la-border-gold hover:bg-la-surface-2",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                                  )}
                                >
                                  <span
                                    aria-hidden="true"
                                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-la-xs border border-la-border-subtle bg-la-surface-2 text-la-gold-light"
                                  >
                                    <IconComponent className="h-3.5 w-3.5" />
                                  </span>

                                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-la-sans text-[0.9375rem] font-medium leading-[1.3] text-la-text-primary group-hover/res:text-la-gold-light">
                                        {resource.title}
                                      </span>
                                      <ArrowUpRight
                                        aria-hidden="true"
                                        className="h-3.5 w-3.5 shrink-0 text-la-text-muted group-hover/res:text-la-gold-light"
                                      />
                                    </div>

                                    <p className="font-la-sans text-[0.8125rem] leading-[1.45] text-la-text-secondary">
                                      {resource.description}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </nav>
              </div>

              {/* Rodapé de Ações do Painel Mobile: Entrar + Começar agora */}
              <div className="mt-8 border-t border-la-divider pt-5">
                <div className="flex flex-col gap-3">
                  {secondaryAction ? (
                    <div onClick={handleLinkClick} className="w-full">
                      <CTAButton
                        action={secondaryAction}
                        variant="secondary"
                        size="md"
                        fullWidthMobile={true}
                        className="w-full"
                      />
                    </div>
                  ) : null}

                  {primaryAction ? (
                    <div onClick={handleLinkClick} className="w-full">
                      <CTAButton
                        action={primaryAction}
                        variant="primary"
                        size="md"
                        showArrow={true}
                        fullWidthMobile={true}
                        className="w-full"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default MobileNav;