// FrontEnd/src/components/landing/MobileNav.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown, X } from "lucide-react";
import { clsx } from "clsx";
import LogoBloco from "@/components/LogoBloco";
import { CTAButton } from "@/components/landing/CTAGroup";
import {
  landingContent,
  type HeaderNavItemContent,
  type LinkAction,
  type ResourceMenuItem,
} from "@/lib/constants/landing-content";

export type MobileNavProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly brandHref?: string;
  readonly navItems?: readonly HeaderNavItemContent[];
  readonly resourcesLabel?: string;
  readonly resourceMenu?: readonly ResourceMenuItem[];
  readonly primaryAction?: LinkAction | null;
  readonly secondaryAction?: LinkAction | null;
};

/**
 * Menu de Navegação Mobile (`MobileNav.tsx`).
 *
 * - Renderizado via `createPortal(..., document.body)` para nunca ser cortado
 *   pelo `backdrop-filter` do `<header>` quando a página é rolada.
 * - Aplica vidro fumê translúcido real (`backdrop-blur-2xl` + canal alfa calibrado).
 */
export function MobileNav({
  isOpen,
  onClose,
  brandHref = landingContent.header.brandHref,
  navItems = landingContent.header.navItems,
  resourcesLabel = landingContent.header.resourcesLabel,
  resourceMenu = landingContent.header.resourceMenu,
  primaryAction = landingContent.header.primaryAction,
  secondaryAction = landingContent.header.secondaryAction,
}: MobileNavProps) {
  const [mounted, setMounted] = useState(false);
  const [isResourcesExpanded, setIsResourcesExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Bloqueia o scroll de fundo enquanto o menu mobile estiver aberto e escuta Escape */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal de navegação"
          className="fixed inset-0 z-[9999] lg:hidden [color-scheme:dark]"
        >
          {/* Overlay Traseiro Translúcido com Blur Suave */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            style={{
              backgroundColor: "rgba(2, 3, 6, 0.52)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
            className="fixed inset-0"
          />

          {/* Painel Lateral em Vidro Fumê Translúcido Real (Ocupa 100dvh em qualquer scroll) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{
              type: "tween",
              duration: shouldReduceMotion ? 0 : 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              backgroundColor: "rgba(8, 11, 18, 0.74)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              boxShadow:
                "inset 1px 0 0 0 rgba(255, 255, 255, 0.12), -24px 0 64px rgba(0, 0, 0, 0.85)",
            }}
            className="fixed inset-y-0 right-0 z-10 flex h-[100dvh] w-full max-w-[22.5rem] flex-col justify-between overflow-y-auto px-5 py-5 text-la-text-primary"
          >
            {/* Brilho dourado difuso no topo do vidro */}
            <div
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(circle at 85% 8%, rgba(207, 169, 101, 0.16) 0%, transparent 60%)",
              }}
              className="pointer-events-none absolute inset-0 z-0"
            />

            <div className="relative z-10 flex flex-col">
              {/* Topo do Drawer: Marca + Botão Fechar */}
              <div className="flex items-center justify-between border-b border-white/12 pb-4">
                <div onClick={onClose}>
                  <LogoBloco
                    orientation="horizontal"
                    size="sm"
                    tone="public-dark"
                    href={brandHref}
                  />
                </div>

                <button
                  type="button"
                  aria-label="Fechar menu de navegação"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-la-md border border-white/12 bg-white/[0.04] text-la-text-primary transition-colors hover:border-la-border-gold hover:text-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>

              {/* Lista Principal de Links */}
              <nav aria-label="Navegação mobile" className="mt-5 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-center justify-between rounded-la-md px-3 py-3 font-la-sans text-[1rem] font-semibold text-la-text-primary transition-colors hover:bg-white/[0.06] hover:text-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                  >
                    <span>{item.label}</span>
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-la-full bg-white/25 transition-colors group-hover:bg-la-gold"
                    />
                  </Link>
                ))}

                {/* Controle Expansível: Recursos */}
                <div className="mt-2 border-t border-white/12 pt-2">
                  <button
                    type="button"
                    aria-expanded={isResourcesExpanded}
                    onClick={() => setIsResourcesExpanded((prev) => !prev)}
                    className="flex w-full items-center justify-between rounded-la-md px-3 py-3 text-left font-la-sans text-[1rem] font-semibold text-la-text-primary transition-colors hover:bg-white/[0.06] hover:text-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                  >
                    <span>{resourcesLabel}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={clsx(
                        "h-4 w-4 text-la-gold transition-transform duration-200",
                        isResourcesExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isResourcesExpanded ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 flex flex-col gap-2 px-2 pb-2">
                          {resourceMenu.map((resItem) => (
                            <Link
                              key={resItem.key}
                              href={resItem.href}
                              onClick={onClose}
                              className="flex flex-col gap-1 rounded-la-md border border-white/10 bg-white/[0.04] p-3 transition-colors hover:border-la-border-gold/60 hover:bg-white/[0.08]"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-la-sans text-[0.875rem] font-semibold text-la-gold-light">
                                  {resItem.label}
                                </span>
                                <ArrowRight
                                  aria-hidden="true"
                                  className="h-3.5 w-3.5 text-la-gold"
                                />
                              </div>
                              <p className="text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.45] text-la-text-secondary">
                                {resItem.description}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </nav>
            </div>

            {/* Rodapé do Drawer: Entrar + Começar agora */}
            <div className="relative z-10 mt-6 flex flex-col gap-3 border-t border-white/12 pt-5">
              {secondaryAction ? (
                <Link
                  href={secondaryAction.href}
                  onClick={onClose}
                  className="inline-flex min-h-[2.875rem] w-full items-center justify-center rounded-la-md border border-white/15 bg-white/[0.04] px-4 py-2.5 font-la-sans text-[0.9375rem] font-semibold text-la-text-primary transition-colors hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                >
                  {secondaryAction.label}
                </Link>
              ) : null}

              {primaryAction ? (
                <div onClick={onClose} className="w-full">
                  <CTAButton
                    action={primaryAction}
                    variant="primary"
                    size="md"
                    showArrow={true}
                    fullWidthMobile={true}
                    className="w-full justify-center"
                  />
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

export default MobileNav;