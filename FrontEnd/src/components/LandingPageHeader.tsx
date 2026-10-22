// FrontEnd/src/components/LandingPageHeader.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { clsx } from "clsx";
import LogoBloco from "@/components/LogoBloco";
import { CTAButton } from "@/components/landing/CTAGroup";
import { MobileNav } from "@/components/landing/MobileNav";
import { ResourceMenu } from "@/components/landing/ResourceMenu";
import {
  landingContent,
  type LandingContent,
} from "@/lib/constants/landing-content";
import {
  LANDING_DOM_IDS,
  LANDING_SECTION_IDS,
} from "@/lib/constants/routes";

export type LandingPageHeaderProps = {
  readonly content?: LandingContent["header"];
  readonly mainContentId?: string;
  readonly className?: string;
};

/**
 * Seção 01 — Header Público Canônico (`LandingPageHeader.tsx`).
 *
 * - Blindado com `left-0 right-0 w-full max-w-[100vw]` para que o botão Hambúrguer
 *   nunca seja empurrado para fora da viewport mobile por seções largas da página.
 * - Z-index elevado (`z-[100]`) garantindo visibilidade e clique em qualquer rota.
 */
export function LandingPageHeader({
  content = landingContent.header,
  mainContentId = "main-content",
  className,
}: LandingPageHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Âncora absoluta `#topo` no início do documento */}
      <div
        id={content.id || LANDING_SECTION_IDS.header}
        className="pointer-events-none absolute top-0 left-0 h-px w-px opacity-0"
      />

      {/* Skip Link de Acessibilidade */}
      <a
        href={`#${mainContentId}`}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[10000] focus:rounded-la-md focus:bg-la-gold focus:px-4 focus:py-2 focus:font-la-sans focus:text-sm focus:font-semibold focus:text-la-text-inverse focus:shadow-lg"
      >
        Pular para o conteúdo principal
      </a>

      <header
        id={content.domId || LANDING_DOM_IDS.siteHeader}
        data-la-surface="dark"
        style={{
          backgroundColor: isScrolled
            ? "rgba(4, 6, 11, 0.82)"
            : "rgba(4, 6, 11, 0.62)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
        }}
        className={clsx(
          "fixed top-0 right-0 left-0 z-[100] w-full max-w-[100vw] border-b transition-colors duration-200 pointer-events-auto",
          isScrolled
            ? "border-white/12 shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
            : "border-white/10",
          className
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-[80rem] items-center justify-between gap-3 px-4 sm:px-6 md:px-8 lg:h-[4.25rem] lg:px-10">
          {/* 1. Marca Canônica */}
          <div className="flex min-w-0 shrink-0 items-center">
            <LogoBloco
              orientation="horizontal"
              size="sm"
              tone="public-dark"
              href={content.brandHref}
            />
          </div>

          {/* 2. Navegação Principal Desktop + Recursos */}
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-1 lg:flex xl:gap-1.5"
          >
            {content.navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-la-sm px-3 py-2 font-la-sans text-[0.875rem] font-medium text-la-text-secondary transition-colors duration-180 hover:text-la-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
              >
                {item.label}
              </Link>
            ))}

            <ResourceMenu
              label={content.resourcesLabel}
              items={content.resourceMenu}
            />
          </nav>

          {/* 3. Ações Desktop: Entrar + Começar agora */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {content.secondaryAction ? (
              <Link
                href={content.secondaryAction.href}
                className="rounded-la-sm px-3.5 py-2 font-la-sans text-[0.875rem] font-medium text-la-text-secondary transition-colors duration-180 hover:text-la-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
              >
                {content.secondaryAction.label}
              </Link>
            ) : null}

            {content.primaryAction ? (
              <CTAButton
                action={content.primaryAction}
                variant="primary"
                size="sm"
                showArrow={true}
              />
            ) : null}
          </div>

          {/* 4. Gatilho Hambúrguer Mobile (< 1024px) — Sempre visível e protegido com shrink-0 */}
          <div className="relative z-[110] flex shrink-0 items-center lg:hidden">
            <button
              type="button"
              aria-label={
                isMobileMenuOpen
                  ? "Fechar menu de navegação"
                  : "Abrir menu de navegação"
              }
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(true)}
              className="pointer-events-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-la-md border border-white/15 bg-white/[0.06] text-la-text-primary shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-colors hover:border-la-border-gold hover:text-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
            >
              <Menu aria-hidden="true" className="h-5 w-5 text-la-text-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Menu Mobile Renderizado via Portal no document.body */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        brandHref={content.brandHref}
        navItems={content.navItems}
        resourcesLabel={content.resourcesLabel}
        resourceMenu={content.resourceMenu}
        primaryAction={content.primaryAction}
        secondaryAction={content.secondaryAction}
      />
    </>
  );
}

export default LandingPageHeader;