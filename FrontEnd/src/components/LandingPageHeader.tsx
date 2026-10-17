// FrontEnd/src/components/LandingPageHeader.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import LogoBloco from "./LogoBloco";
import { CTAButton } from "@/components/landing/CTAGroup";
import { ResourceMenu } from "@/components/landing/ResourceMenu";
import { MobileNav } from "@/components/landing/MobileNav";
import {
  landingContent,
  type HeaderNavItemContent,
  type LinkAction,
  type ResourceMenuItem,
} from "@/lib/constants/landing-content";
import {
  LANDING_DOM_IDS,
  LANDING_SECTION_IDS,
} from "@/lib/constants/routes";

export type LandingPageHeaderProps = {
  readonly navItems?: readonly HeaderNavItemContent[];
  readonly resourceItems?: readonly ResourceMenuItem[];
  readonly resourcesLabel?: string;
  readonly primaryAction?: LinkAction | null;
  readonly secondaryAction?: LinkAction | null;
  readonly mainContentId?: string;
  readonly className?: string;
};

const SCROLL_THRESHOLD_PX = 16;

/**
 * Header público canônico do Legion Altaire (Etapa 2A §3.8.1, Etapa 2B §12 & Etapa 2D §4.1).
 *
 * Referências absorvidas:
 * - Resend: estrutura limpa, silêncio e legibilidade.
 * - Raycast: translucidez controlada e profundidade sobre o canvas escuro.
 * - LiveKit: arquitetura informacional do dropdown Recursos.
 * - Linear: precisão de estados, foco por teclado e microinterações rápidas.
 *
 * Regras inegociáveis:
 * - Dark-first, sem seletor de tema no header.
 * - Navegação completa somente a partir de 1.184px (breakpoint `nav:`).
 * - Demonstração permanece no primeiro nível.
 * - Recursos abre dropdown compacto (desktop) e accordion (mobile) com FAQ e Sobre.
 * - "Começar agora" (/cadastro) é o único botão dourado preenchido.
 */
export function LandingPageHeader({
  navItems = landingContent.header.navItems,
  resourceItems = landingContent.header.resourceMenu,
  resourcesLabel = landingContent.header.resourcesLabel,
  primaryAction = landingContent.header.primaryAction,
  secondaryAction = landingContent.header.secondaryAction,
  mainContentId = "main-content",
  className,
}: LandingPageHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > SCROLL_THRESHOLD_PX;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Âncora canônica de topo (ROUTES-PUBLIC.md §7.1: /#topo) */}
      <div
        id={LANDING_SECTION_IDS.header}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-0 w-0"
      />

      <header
        id={landingContent.header.domId ?? LANDING_DOM_IDS.siteHeader}
        data-la-surface="dark"
        data-scrolled={isScrolled ? "true" : "false"}
        className={clsx(
          "fixed inset-x-0 top-0 z-[var(--la-z-header)] w-full transition-[background-color,border-color,box-shadow,backdrop-filter] duration-280 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isScrolled
            ? "border-b border-la-border-subtle bg-[var(--la-header-scrolled-bg)] shadow-[0_8px_24px_rgba(0,0,0,0.38)] backdrop-blur-[var(--la-blur-header)]"
            : "border-b border-transparent bg-transparent",
          className
        )}
      >
        {/* Skip link obrigatório para acessibilidade por teclado (ROUTES-PUBLIC.md §21) */}
        <a
          href={`#${mainContentId}`}
          className={clsx(
            "sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-[var(--la-z-toast)]",
            "focus:inline-flex focus:min-h-[2.75rem] focus:items-center focus:rounded-la-md focus:bg-la-gold focus:px-4 focus:py-2",
            "focus:font-la-sans focus:text-[0.875rem] focus:font-semibold focus:text-la-text-inverse focus:shadow-[var(--la-elevation-2)] focus:outline-none"
          )}
        >
          Pular para o conteúdo principal
        </a>

        <div
          className={clsx(
            "mx-auto flex w-full max-w-[80rem] items-center justify-between px-5 transition-[height] duration-280 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-8 lg:px-10",
            isScrolled
              ? "h-[4.125rem] nav:h-[4.375rem]"
              : "h-[4.125rem] nav:h-[4.75rem]"
          )}
        >
          {/* 1. Marca Oficial (Lockup ALTAIRE / LEGION -> /) */}
          <div className="flex shrink-0 items-center">
            <LogoBloco
              orientation="horizontal"
              size="md"
              tone="public-dark"
              href={landingContent.header.brandHref}
              priority={true}
            />
          </div>

          {/* 2. Navegação Principal Desktop (Visível a partir de 1.184px / `nav:flex`) */}
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-1 xl:gap-2 nav:flex"
          >
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={clsx(
                  "inline-flex min-h-[2.75rem] items-center rounded-la-sm px-3 py-2 font-la-sans text-[0.875rem] font-medium leading-[1.4] text-la-text-secondary transition-colors duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  "hover:text-la-text-primary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas"
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* Controle expansível Recursos (Perguntas frequentes + Sobre o Legion Altaire) */}
            <ResourceMenu
              label={resourcesLabel}
              items={resourceItems}
            />
          </nav>

          {/* 3. Ações Desktop: Entrar (/login) + CTA único preenchido Começar agora (/cadastro) */}
          <div className="hidden shrink-0 items-center gap-3 nav:flex">
            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className={clsx(
                  "inline-flex min-h-[2.75rem] items-center rounded-la-md px-3.5 py-2 font-la-sans text-[0.875rem] font-medium leading-[1.4] text-la-text-secondary transition-colors duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  "hover:bg-la-surface-1/80 hover:text-la-text-primary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas"
                )}
              >
                {secondaryAction.label}
              </Link>
            ) : null}

            {primaryAction ? (
              <CTAButton
                action={primaryAction}
                variant="primary"
                size="sm"
                fullWidthMobile={false}
                showArrow={true}
              />
            ) : null}
          </div>

          {/* 4. Navegação Mobile/Tablet (< 1.184px) */}
          <MobileNav
            navItems={navItems}
            resourceItems={resourceItems}
            resourcesLabel={resourcesLabel}
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
          />
        </div>
      </header>
    </>
  );
}

export default LandingPageHeader;