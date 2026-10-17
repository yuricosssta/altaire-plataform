// FrontEnd/src/components/Footer.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  Cookie,
  ShieldCheck,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import LogoBloco from "./LogoBloco";
import { landingContent } from "@/lib/constants/landing-content";
import {
  FOOTER_NAV_ROUTES,
  HEADER_RESOURCE_ROUTES,
  LANDING_SECTION_IDS,
} from "@/lib/constants/routes";

type FooterLinkItem = {
  readonly label: string;
  readonly href: string;
};

type FooterColumnGroup = {
  readonly title: string;
  readonly links: readonly FooterLinkItem[];
};

type CookiePreferencesState = {
  readonly essential: true;
  readonly functional: boolean;
  readonly analytics: boolean;
  readonly updatedAt: string;
};

const COOKIE_STORAGE_KEY = "la-cookie-preferences";

const FOOTER_GROUPS: readonly FooterColumnGroup[] = [
  {
    title: "Produto",
    links: [
      { label: "Produto", href: FOOTER_NAV_ROUTES.produto },
      { label: "Como funciona", href: FOOTER_NAV_ROUTES.comoFunciona },
      { label: "Benefícios", href: FOOTER_NAV_ROUTES.beneficios },
      { label: "Demonstração", href: FOOTER_NAV_ROUTES.demonstracao },
      { label: "Preços", href: FOOTER_NAV_ROUTES.precos },
      {
        label: "Perguntas frequentes",
        href: HEADER_RESOURCE_ROUTES.perguntasFrequentes,
      },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre o Legion Altaire", href: FOOTER_NAV_ROUTES.sobre },
      { label: "Contato", href: FOOTER_NAV_ROUTES.contato },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de Uso", href: FOOTER_NAV_ROUTES.termosDeUso },
      {
        label: "Política de Privacidade",
        href: FOOTER_NAV_ROUTES.politicaDePrivacidade,
      },
      {
        label: "Política de Cookies",
        href: FOOTER_NAV_ROUTES.politicaDeCookies,
      },
    ],
  },
  {
    title: "Acesso",
    links: [
      { label: "Entrar na plataforma", href: FOOTER_NAV_ROUTES.entrar },
      { label: "Criar conta", href: FOOTER_NAV_ROUTES.criarConta },
    ],
  },
] as const;

function FooterLink({ label, href }: FooterLinkItem) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex min-h-[2.25rem] w-fit items-center gap-1 rounded-la-xs font-la-sans text-[0.875rem] leading-[1.5] text-la-text-secondary transition-colors duration-180",
        "hover:text-la-gold-light",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas-deep"
      )}
    >
      <span>{label}</span>
    </Link>
  );
}

/**
 * Seção 15 — Rodapé Institucional Canônico (`id="rodape"`).
 *
 * Referência dominante: Resend (sobriedade, organização e silêncio visual).
 * Intensidade: 1/5 | Profundidade: Nível 0 (Plano).
 *
 * Regras inegociáveis:
 * - Preserva atmosfera dark-first (`bg-la-canvas-deep`).
 * - Não compete visualmente com o CTA Final da Seção 14.
 * - Expõe todas as rotas institucionais, legais, de produto e de acesso.
 * - Oferece controle real e acessível para "Preferências de cookies".
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [functionalEnabled, setFunctionalEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

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

  return (
    <>
      <footer
        id="rodape"
        data-la-surface="dark"
        aria-label="Rodapé institucional"
        className="relative border-t border-la-divider bg-la-canvas-deep font-la-sans text-la-text-primary"
      >
        <div className="mx-auto w-full max-w-[80rem] px-5 py-14 md:px-8 lg:px-10 lg:py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
            {/* 1. Coluna da Marca + Síntese + Acesso Discreto (4 cols) */}
            <div className="flex flex-col items-start justify-between gap-6 lg:col-span-4">
              <div className="flex flex-col items-start">
                <LogoBloco
                  orientation="horizontal"
                  size="md"
                  tone="public-dark"
                  href={landingContent.header.brandHref}
                />

                <p className="mt-4 max-w-[38ch] font-la-sans text-[0.875rem] leading-[1.65] text-la-text-secondary">
                  O Legion Altaire transforma a estratégia do seu negócio em
                  direção editorial, calendário, temas, roteiros e ativos de
                  conteúdo com contexto persistente e execução orientada.
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-la-full border border-la-border-subtle bg-la-surface-1/80 px-3 py-1 font-la-mono text-[0.6875rem] text-la-gold-light">
                  <ShieldCheck
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-la-gold"
                  />
                  <span>Sistema Operacional Editorial com IA</span>
                </div>
              </div>

              {/* Ações Institucionais Discretas (Não competem com o CTA Final) */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href={FOOTER_NAV_ROUTES.criarConta}
                  className={clsx(
                    "inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-la-md border border-la-border-gold/55 bg-la-surface-1 px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-gold-light transition-colors duration-180",
                    "hover:border-la-gold hover:bg-la-surface-2 hover:text-la-text-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas-deep"
                  )}
                >
                  <span>Criar conta</span>
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href={FOOTER_NAV_ROUTES.entrar}
                  className={clsx(
                    "inline-flex min-h-[2.75rem] items-center rounded-la-md border border-la-border-subtle bg-transparent px-4 py-2 font-la-sans text-[0.8125rem] font-medium text-la-text-secondary transition-colors duration-180",
                    "hover:border-la-border-visible hover:bg-la-surface-1 hover:text-la-text-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas-deep"
                  )}
                >
                  Entrar
                </Link>
              </div>
            </div>

            {/* 2. Colunas de Navegação Institucional (8 cols -> 4 grupos) */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-8">
              {FOOTER_GROUPS.map((group) => (
                <div key={group.title} className="flex flex-col">
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

                    {group.title === "Legal" ? (
                      <button
                        type="button"
                        onClick={handleCookiePreferencesTrigger}
                        className={clsx(
                          "inline-flex min-h-[2.25rem] w-fit items-center gap-1.5 rounded-la-xs text-left font-la-sans text-[0.875rem] leading-[1.5] text-la-text-secondary transition-colors duration-180",
                          "hover:text-la-gold-light",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-la-canvas-deep"
                        )}
                      >
                        <Cookie
                          aria-hidden="true"
                          className="h-3.5 w-3.5 text-la-gold"
                        />
                        <span>Preferências de cookies</span>
                      </button>
                    ) : null}
                  </nav>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Barra Inferior de Direitos, Assinatura Metodológica e Retorno ao Topo */}
          <div className="mt-12 border-t border-la-divider pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <p className="font-la-sans text-[0.8125rem] text-la-text-muted">
                  © {currentYear} Legion Altaire. Todos os direitos reservados.
                </p>
                <span
                  aria-hidden="true"
                  className="hidden text-la-border-visible sm:inline"
                >
                  •
                </span>
                <p className="font-la-mono text-[0.75rem] text-la-text-secondary">
                  A estratégia orienta. A IA organiza. Você revisa, ajusta e
                  aprova.
                </p>
              </div>

              <a
                href={`#${LANDING_SECTION_IDS.header}`}
                className={clsx(
                  "inline-flex min-h-[2.5rem] w-fit items-center gap-1.5 rounded-la-sm border border-la-border-subtle bg-la-surface-1/75 px-3 py-1.5 font-la-mono text-[0.6875rem] uppercase tracking-[0.06em] text-la-text-secondary transition-colors duration-180",
                  "hover:border-la-border-gold hover:text-la-gold-light",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                )}
              >
                <span>Voltar ao topo</span>
                <ArrowUp aria-hidden="true" className="h-3 w-3 text-la-gold" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Funcional de Preferências de Cookies */}
      {isCookieModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-[var(--la-z-modal)] flex items-center justify-center p-4"
        >
          <div
            aria-hidden="true"
            onClick={() => setIsCookieModalOpen(false)}
            className="fixed inset-0 bg-la-canvas-deep/80 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-[32rem] overflow-hidden rounded-la-xl border border-la-border-visible bg-la-surface-2 p-6 text-la-text-primary shadow-[var(--la-elevation-3)]">
            <div className="flex items-start justify-between gap-4 border-b border-la-divider pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-la-sm border border-la-border-gold bg-la-gold-faint text-la-gold-light">
                  <Cookie aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <h3
                    id="cookie-preferences-title"
                    className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary"
                  >
                    Preferências de cookies
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-la-sm border border-la-border-subtle bg-la-surface-1 text-la-text-secondary hover:text-la-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {/* Cookies Estritamente Necessários */}
              <div className="flex items-start justify-between gap-4 rounded-la-md border border-la-border-subtle bg-la-surface-1/90 p-3.5">
                <div>
                  <span className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                    Essenciais e de segurança
                  </span>
                  <p className="mt-1 font-la-sans text-[0.75rem] leading-[1.45] text-la-text-secondary">
                    Necessários para autenticação, sessão segura e funcionamento
                    básico da plataforma.
                  </p>
                </div>
                <span className="shrink-0 rounded-la-full border border-la-border-gold bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold uppercase text-la-gold-light">
                  Sempre ativo
                </span>
              </div>

              {/* Cookies Funcionais */}
              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-la-md border border-la-border-subtle bg-la-surface-1/90 p-3.5">
                <div>
                  <span className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                    Funcionais e de experiência
                  </span>
                  <p className="mt-1 font-la-sans text-[0.75rem] leading-[1.45] text-la-text-secondary">
                    Guardam preferências de interface e continuidade de leitura
                    no seu navegador.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={functionalEnabled}
                  onChange={(e) => setFunctionalEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#CFA965]"
                />
              </label>

              {/* Cookies Analíticos */}
              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-la-md border border-la-border-subtle bg-la-surface-1/90 p-3.5">
                <div>
                  <span className="font-la-sans text-[0.875rem] font-semibold text-la-text-primary">
                    Medição agregada de desempenho
                  </span>
                  <p className="mt-1 font-la-sans text-[0.75rem] leading-[1.45] text-la-text-secondary">
                    Ajudam a compreender estabilidade técnica e navegação das
                    páginas públicas de forma anônima.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#CFA965]"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-la-divider pt-4">
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
                  className="rounded-la-md border border-la-border-subtle bg-la-surface-1 px-3.5 py-2 font-la-sans text-[0.8125rem] font-medium text-la-text-secondary hover:text-la-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
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