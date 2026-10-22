// FrontEnd/src/components/Footer.tsx
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  Cookie,
  Mail,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import LogoBloco from "./LogoBloco";
import {
  formatFooterCopyright,
  landingContent,
  type LandingContent,
} from "@/lib/constants/landing-content";
import {
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_FADE_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";
import {
  FOOTER_NAV_ROUTES,
  LANDING_DOM_IDS,
  LANDING_SECTION_IDS,
} from "@/lib/constants/routes";

export type FooterProps = {
  readonly content?: LandingContent["footer"];
  readonly className?: string;
};

type FooterLinkProps = {
  readonly label: string;
  readonly href: string;
};

type CookiePreferencesState = {
  readonly essential: true;
  readonly functional: boolean;
  readonly analytics: boolean;
  readonly updatedAt: string;
};

const COOKIE_STORAGE_KEY = "la-cookie-preferences";

function FooterLink({ label, href }: FooterLinkProps) {
  return (
    <Link
      href={href}
      className={clsx(
        "group inline-flex min-h-[2.125rem] w-fit items-center gap-1.5 rounded-la-xs font-la-sans text-[0.875rem] leading-[1.5] text-la-text-secondary transition-colors duration-200",
        "hover:text-la-gold-light",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas-deep"
      )}
    >
      <span>{label}</span>
    </Link>
  );
}

/**
 * Seção 15 — Rodapé Institucional Canônico (`id="site-footer"` / `#rodape`).
 *
 * Referência dominante: Resend (sobriedade, organização em colunas, silêncio visual e marca d'água no abismo).
 * Intensidade: 1/5 | Profundidade: Nível 0 (Plano).
 *
 * Regras inegociáveis (CONTENT-LANDING.md §15):
 * - Consome 100% os dados de `landingContent.footer` (grupos, links, subheadline, microcopy e copyright).
 * - Preserva atmosfera dark-first (`bg-la-canvas-deep`) e não compete com o CTA Final da Seção 14.
 * - CTA secundário "Começar agora" apontando para `/cadastro` com peso visual secundário.
 * - Bloco de Contato por e-mail renderizado somente quando `contactSection.enabled` e `email` estiverem confirmados.
 * - "Preferências de Cookies" implementado como `<button type="button">` que abre o painel acessível sobre a página atual.
 * - Retorno ao topo ancorado funcionalmente em `/#topo` com scroll suave.
 * - Textos descritivos justificados em todas as dimensões (`text-justify [text-align-last:left] hyphens-auto`).
 */
export function Footer({
  content = landingContent.footer,
  className,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const shouldReduceMotion = useReducedMotion();
  const footerRef = useRef<HTMLElement>(null);

  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [functionalEnabled, setFunctionalEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [spotlight, setSpotlight] = useState<{
    x: number;
    y: number;
    opacity: number;
  }>({
    x: 600,
    y: 200,
    opacity: 0,
  });

  /* Carrega preferências salvas anteriormente, se existirem */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COOKIE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CookiePreferencesState>;
        if (typeof parsed.functional === "boolean") {
          setFunctionalEnabled(parsed.functional);
        }
        if (typeof parsed.analytics === "boolean") {
          setAnalyticsEnabled(parsed.analytics);
        }
      }
    } catch {
      /* Ignora leituras inválidas de storage privado */
    }
  }, []);

  /* Escuta o evento global `open-cookie-preferences` e a tecla Escape */
  useEffect(() => {
    const handleOpenEvent = () => {
      setSavedFeedback(false);
      setIsCookieModalOpen(true);
    };

    window.addEventListener("open-cookie-preferences", handleOpenEvent);
    return () => {
      window.removeEventListener("open-cookie-preferences", handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (!isCookieModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsCookieModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCookieModalOpen]);

  const handleMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (shouldReduceMotion || !footerRef.current) {
      return;
    }
    const rect = footerRef.current.getBoundingClientRect();
    setSpotlight({
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top),
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleCookiePreferencesTrigger = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
  }, []);

  const persistCookiePreferences = (
    nextFunctional: boolean,
    nextAnalytics: boolean
  ) => {
    const payload: CookiePreferencesState = {
      essential: true,
      functional: nextFunctional,
      analytics: nextAnalytics,
      updatedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* Storage indisponível no modo restrito do navegador */
    }

    setFunctionalEnabled(nextFunctional);
    setAnalyticsEnabled(nextAnalytics);
    setSavedFeedback(true);

    window.setTimeout(() => {
      setIsCookieModalOpen(false);
      setSavedFeedback(false);
    }, 450);
  };

  const staggerContainerVariants = selectMotionPreset(
    shouldReduceMotion,
    STAGGER_CONTAINER_VARIANTS,
    REDUCED_MOTION_VARIANTS.reveal
  );

  const staggerItemVariants = selectMotionPreset(
    shouldReduceMotion,
    STAGGER_ITEM_VARIANTS,
    REDUCED_MOTION_VARIANTS.reveal
  );

  const fadeVariants = selectMotionPreset(
    shouldReduceMotion,
    SECTION_FADE_VARIANTS,
    REDUCED_MOTION_VARIANTS.reveal
  );

  const canRenderContactEmail =
    content.contactSection.enabled &&
    typeof content.contactSection.email === "string" &&
    content.contactSection.email.trim().length > 0;

  return (
    <>
      <footer
        ref={footerRef}
        id={content.domId || LANDING_DOM_IDS.siteFooter}
        data-la-surface="dark"
        aria-label="Rodapé institucional"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={clsx(
          "relative overflow-hidden border-t border-white/10 bg-la-canvas-deep font-la-sans text-la-text-primary [color-scheme:dark]",
          className
        )}
      >
        {/* Âncora compatível `#rodape` para garantir navegação interna e externa */}
        <span id={content.id || LANDING_SECTION_IDS.footer} className="sr-only" />

        {/* Spotlight Radial Dourado Sutil acompanhando o cursor no abismo escuro */}
        <div
          aria-hidden="true"
          style={{
            opacity: spotlight.opacity,
            background: `radial-gradient(560px circle at ${spotlight.x}px ${spotlight.y}px, rgba(207, 169, 101, 0.07), transparent 70%)`,
          }}
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        />

        {/* Hairline superior sutil */}
        <div
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(207, 169, 101, 0.28) 50%, transparent 100%)",
          }}
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px"
        />

        <div className="relative z-10 mx-auto w-full max-w-[80rem] px-5 pt-14 pb-10 md:px-8 lg:px-10 lg:pt-16 lg:pb-12">
          {/* 1. Grid Principal do Rodapé: Coluna da Marca (4 cols) + 4 Colunas de Navegação Canônica (8 cols) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={staggerContainerVariants}
            className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10"
          >
            {/* Coluna Esquerda (4 cols): Marca + Subheadline Canônica Justificada + CTA Secundário Discreto */}
            <motion.div
              variants={staggerItemVariants}
              className="flex flex-col items-start justify-between gap-6 lg:col-span-4"
            >
              <div className="flex w-full max-w-[22rem] flex-col items-start">
                <LogoBloco
                  orientation="horizontal"
                  size="md"
                  tone="public-dark"
                  href={landingContent.header.brandHref}
                />

                {/* Subheadline Canônica (§15) */}
                <p className="mt-4 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.68] text-la-text-secondary">
                  {content.subheadline}
                </p>

                {/* Bloco Condicional de Contato Direto */}
                {canRenderContactEmail ? (
                  <a
                    href={`mailto:${content.contactSection.email}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-la-md border border-white/10 bg-white/[0.03] px-3 py-1.5 font-la-mono text-[0.75rem] text-la-gold-light transition-colors hover:border-la-border-gold hover:text-la-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                  >
                    <Mail aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
                    <span>{content.contactSection.label}</span>
                  </a>
                ) : null}
              </div>

              {/* Ações de Acesso com Peso Visual Secundário */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href={content.secondaryAction.href}
                  className={clsx(
                    "inline-flex min-h-[2.625rem] items-center gap-1.5 rounded-la-md border border-la-border-gold/55 bg-la-surface-1 px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light transition-colors duration-200",
                    "hover:border-la-gold hover:bg-la-surface-2 hover:text-la-text-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas-deep"
                  )}
                >
                  <span>{content.secondaryAction.label}</span>
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href={FOOTER_NAV_ROUTES.entrar}
                  className={clsx(
                    "inline-flex min-h-[2.625rem] items-center rounded-la-md border border-white/10 bg-transparent px-4 py-2 font-la-sans text-[0.8125rem] font-medium text-la-text-secondary transition-colors duration-200",
                    "hover:border-white/25 hover:bg-white/[0.03] hover:text-la-text-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas-deep"
                  )}
                >
                  Entrar
                </Link>
              </div>
            </motion.div>

            {/* Colunas de Navegação Canônicas (8 cols -> PRODUTO | EMPRESA | LEGAL | ACESSO) */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-8">
              {content.groups.map((group) => (
                <motion.div
                  key={group.key}
                  variants={staggerItemVariants}
                  className="flex flex-col"
                >
                  <h2 className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-la-gold-light">
                    {group.title}
                  </h2>

                  <nav
                    aria-label={`Links de ${group.title}`}
                    className="mt-4 flex flex-col gap-2"
                  >
                    {group.links.map((link) => (
                      <FooterLink
                        key={link.label}
                        label={link.label}
                        href={link.href}
                      />
                    ))}

                    {group.key === "legal" ? (
                      <button
                        type="button"
                        id={content.cookiePreferencesActionId}
                        onClick={handleCookiePreferencesTrigger}
                        className={clsx(
                          "inline-flex min-h-[2.125rem] w-fit items-center gap-1.5 rounded-la-xs text-left font-la-sans text-[0.875rem] leading-[1.5] text-la-text-secondary transition-colors duration-200",
                          "hover:text-la-gold-light",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas-deep"
                        )}
                      >
                        <Cookie
                          aria-hidden="true"
                          className="h-3.5 w-3.5 shrink-0 text-la-gold"
                        />
                        <span>{content.cookiePreferencesLabel}</span>
                      </button>
                    ) : null}
                  </nav>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 2. Barra Inferior de Direitos Autorais, Assinatura Metodológica e Retorno ao Topo */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={fadeVariants}
            className="mt-12 border-t border-white/10 pt-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3.5">
                <p className="font-la-sans text-[0.8125rem] text-la-text-muted">
                  {formatFooterCopyright(currentYear)}
                </p>

                <span
                  aria-hidden="true"
                  className="hidden text-white/20 sm:inline"
                >
                  •
                </span>

                <div className="inline-flex items-center gap-2 font-la-mono text-[0.75rem] text-la-text-secondary">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-la-full bg-la-gold shadow-[0_0_8px_#CFA965]"
                  />
                  <span>{content.legalNotice}</span>
                </div>
              </div>

              {/* Botão Retorno ao Topo: Rola para #topo sem mudar a rota atual */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={clsx(
                  "inline-flex min-h-[2.375rem] w-fit items-center gap-1.5 rounded-la-sm border border-white/10 bg-white/[0.03] px-3 py-1.5 font-la-mono text-[0.6875rem] uppercase tracking-[0.06em] text-la-text-secondary transition-colors duration-200",
                  "hover:border-la-border-gold hover:text-la-gold-light",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                )}
              >
                <span>Voltar ao topo</span>
                <ArrowUp aria-hidden="true" className="h-3 w-3 text-la-gold" />
              </button>
            </div>
          </motion.div>

          {/* 3. Marca d'Água Monumental no Abismo Escuro */}
          <div
            aria-hidden="true"
            className="pointer-events-none mt-10 flex select-none justify-center overflow-hidden pt-2"
          >
            <span
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(245, 242, 235, 0.07) 0%, rgba(207, 169, 101, 0.03) 52%, rgba(3, 4, 7, 0) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              className="text-center font-la-sans text-[clamp(2.75rem,10.5vw,8.5rem)] font-bold leading-[0.88] tracking-[-0.04em] uppercase"
            >
              {content.headline}
            </span>
          </div>
        </div>
      </footer>

      {/* Modal Funcional e Acessível de Preferências de Cookies */}
      {isCookieModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-[var(--la-z-modal)] flex items-center justify-center p-4 [color-scheme:dark]"
        >
          <div
            aria-hidden="true"
            onClick={() => setIsCookieModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-[32rem] overflow-hidden rounded-la-xl border border-white/15 bg-[#0A0D14] p-6 text-la-text-primary shadow-[0_28px_64px_rgba(0,0,0,0.9)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-la-sm border border-la-border-gold bg-la-gold-faint text-la-gold-light">
                  <Cookie aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <h3
                    id="cookie-preferences-title"
                    className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary"
                  >
                    {content.cookiePreferencesLabel}
                  </h3>
                  <p className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                    Controle como o Legion Altaire armazena preferências locais
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Fechar preferências de cookies"
                onClick={() => setIsCookieModalOpen(false)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-la-sm border border-white/10 bg-white/[0.03] text-la-text-secondary hover:text-la-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {/* Cookies Estritamente Necessários */}
              <div className="flex items-start justify-between gap-4 rounded-la-md border border-white/10 bg-black/45 p-3.5">
                <div className="min-w-0 flex-1">
                  <span className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                    Essenciais e de segurança
                  </span>
                  <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.55] text-la-text-secondary">
                    Necessários para autenticação, sessão segura e funcionamento
                    básico da plataforma.
                  </p>
                </div>
                <span className="shrink-0 rounded-la-full border border-la-border-gold bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                  Sempre ativo
                </span>
              </div>

              {/* Cookies Funcionais */}
              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-la-md border border-white/10 bg-black/45 p-3.5 transition-colors hover:border-white/20">
                <div className="min-w-0 flex-1">
                  <span className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                    Funcionais e de experiência
                  </span>
                  <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.55] text-la-text-secondary">
                    Guardam preferências de interface e continuidade de leitura
                    no seu navegador.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={functionalEnabled}
                  onChange={(e) => setFunctionalEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#CFA965]"
                />
              </label>

              {/* Cookies Analíticos */}
              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-la-md border border-white/10 bg-black/45 p-3.5 transition-colors hover:border-white/20">
                <div className="min-w-0 flex-1">
                  <span className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                    Medição agregada de desempenho
                  </span>
                  <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.55] text-la-text-secondary">
                    Ajudam a compreender estabilidade técnica e navegação das
                    páginas públicas de forma anônima.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#CFA965]"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <Link
                href={FOOTER_NAV_ROUTES.politicaDeCookies}
                onClick={() => setIsCookieModalOpen(false)}
                className="font-la-mono text-[0.75rem] text-la-gold-light underline underline-offset-4 hover:text-la-text-primary"
              >
                Ver Política de Cookies completa
              </Link>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => persistCookiePreferences(false, false)}
                  className="rounded-la-md border border-white/10 bg-white/[0.03] px-3.5 py-2 font-la-sans text-[0.8125rem] font-medium text-la-text-secondary hover:text-la-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                >
                  Apenas essenciais
                </button>

                <button
                  type="button"
                  onClick={() =>
                    persistCookiePreferences(
                      functionalEnabled,
                      analyticsEnabled
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                >
                  {savedFeedback ? (
                    <>
                      <Check aria-hidden="true" className="h-3.5 w-3.5" />
                      <span>Preferências salvas</span>
                    </>
                  ) : (
                    <span>Salvar preferências</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Footer;