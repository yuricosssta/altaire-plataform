// FrontEnd/src/app/(public)/politica-de-cookies/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cookie,
  ExternalLink,
  Info,
  Lock,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import { ROUTES } from "@/lib/constants/routes";

type CookieCategoryDetail = {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly badge: string;
  readonly purpose: string;
  readonly examples: readonly string[];
  readonly retention: string;
  readonly statusLabel: string;
  readonly isAlwaysActive: boolean;
};

const COOKIE_CATEGORIES: readonly CookieCategoryDetail[] = [
  {
    id: "cookies-essenciais",
    code: "01",
    title: "Cookies Estritamente Necessários (Essenciais)",
    badge: "Obrigatório",
    purpose:
      "Esses cookies e tokens de armazenamento local são indispensáveis para o funcionamento técnico e seguro da plataforma. Eles mantêm a autenticação da sua sessão ativa, validam formulários contra ataques de falsificação de solicitação entre sites (CSRF) e balanceiam a carga de servidores.",
    examples: [
      "la-session-token: Mantém a sessão autenticada do assinante com segurança.",
      "la-csrf-protection: Impede requisições forjadas por páginas maliciosas.",
      "la-cookie-preferences: Armazena o registro formal das suas opções de consentimento.",
    ],
    retention: "Sessão até 1 ano (conforme o tipo de autenticação)",
    statusLabel: "Sempre ativo (indispensável à prestação do serviço)",
    isAlwaysActive: true,
  },
  {
    id: "cookies-funcionais",
    code: "02",
    title: "Cookies de Funcionalidade e Experiência",
    badge: "Personalização",
    purpose:
      "Permitem que a plataforma memorize suas escolhas de navegação e preferências de interface, como o último Projeto Editorial selecionado no painel, o modo visual ativo (tema dark com tokens --la-*) e a continuidade de filtros da Biblioteca de Temas sem exigir reconfiguração.",
    examples: [
      "la-active-project-id: Lembra qual Projeto Editorial você estava operando.",
      "la-theme-preference: Preserva a calibração de contraste do Design System.",
      "la-filter-state: Mantém ativas as abas selecionadas nas ferramentas.",
    ],
    retention: "Até 6 meses de persistência local",
    statusLabel: "Opcional (gerenciável a qualquer momento)",
    isAlwaysActive: false,
  },
  {
    id: "cookies-analiticos",
    code: "03",
    title: "Cookies Analíticos e de Desempenho Agregado",
    badge: "Estabilidade Técnica",
    purpose:
      "Coletam informações estatísticas anônimas e agregadas sobre velocidade de carregamento de páginas, taxa de erros em requisições de API e navegação geral nas rotas públicas. Esses dados não identificam nominalmente o usuário e servem exclusivamente para aprimorar a estabilidade técnica e detectar falhas de código.",
    examples: [
      "la-telemetry-perf: Mede o tempo de renderização de componentes críticos.",
      "la-route-latency: Registra o desempenho de resposta de Route Handlers.",
    ],
    retention: "Até 1 ano de forma agregada e anônima",
    statusLabel: "Opcional (gerenciável a qualquer momento)",
    isAlwaysActive: false,
  },
] as const;

export default function PoliticaDeCookiesPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    COOKIE_CATEGORIES[0].id
  );

  const handleOpenPreferencesModal = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const cat of COOKIE_CATEGORIES) {
        const element = document.getElementById(cat.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveCategoryId(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col [overflow-anchor:none]">
      {/* 1. HERO INSTITUCIONAL DO DOCUMENTO */}
      <SectionShell
        id="cookies-topo"
        ariaLabelledBy="cookies-hero-title"
        container="wide"
        spacing="hero"
        surface="canvas"
        bottomBorder={true}
        className="relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-14 left-1/2 -z-0 h-[26rem] w-[52rem] -translate-x-1/2 rounded-la-full bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.12)_0%,rgba(207,169,101,0.02)_48%,transparent_74%)] blur-3xl"
        />

        <div className="relative z-10 mx-auto flex max-w-[54rem] flex-col items-start gap-4">
          <SectionEyebrow
            label="TRANSPARÊNCIA E PREFERÊNCIAS LOCAIS"
            variant="pill"
          />

          <h1
            id="cookies-hero-title"
            className="mt-2 text-balance font-la-sans text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-[1.12] tracking-[-0.028em] text-la-text-primary"
          >
            Política de Cookies
          </h1>

          <div className="flex flex-wrap items-center gap-3 font-la-mono text-[0.75rem] text-la-text-secondary">
            <span>Última atualização: Outubro de 2026</span>
            <span aria-hidden="true">•</span>
            <span className="text-la-gold-light">Armazenamento Local e LGPD</span>
            <span aria-hidden="true">•</span>
            <span>Zero rastreamento invasivo de terceiros</span>
          </div>

          <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.0625rem] leading-[1.68] text-la-text-secondary">
            Esta Política detalha o que são cookies, como o Legion Altaire
            utiliza tecnologias de armazenamento local para garantir a
            segurança da sua conta e como você mantém o controle absoluto sobre
            as preferências salvas no seu navegador.
          </p>

          {/* BOTÃO INTERATIVO QUE REABRE O MODAL DO FOOTER */}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOpenPreferencesModal}
              className="inline-flex min-h-[2.875rem] items-center gap-2 rounded-la-md bg-la-gold px-5 py-2.5 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-colors hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
            >
              <Cookie aria-hidden="true" className="h-4 w-4" />
              <span>Gerenciar Preferências de Cookies</span>
            </button>

            <span className="font-la-mono text-[0.6875rem] text-la-text-muted">
              Você pode alterar seu consentimento a qualquer momento.
            </span>
          </div>
        </div>
      </SectionShell>

      {/* 2. CORPO DO DOCUMENTO: CATEGORIAS DETALHADAS E SUMÁRIO */}
      <SectionShell
        id="cookies-corpo"
        ariaLabel="Conteúdo da Política de Cookies"
        container="wide"
        spacing="spacious"
        surface="surface-1"
        bottomBorder={false}
      >
        <div className="mx-auto grid w-full max-w-[68rem] grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* SUMÁRIO RÁPIDO LATERAL */}
          <aside className="lg:sticky lg:top-24 lg:col-span-4">
            <div className="flex flex-col gap-3 rounded-la-xl border border-white/12 bg-[#07090F]/95 p-5 shadow-[var(--la-elevation-2)] backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <BookOpen aria-hidden="true" className="h-4 w-4 text-la-gold" />
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  Categorias de Cookies
                </span>
              </div>

              <nav
                aria-label="Sumário da política de cookies"
                className="flex flex-col gap-1.5"
              >
                {COOKIE_CATEGORIES.map((cat) => {
                  const isActive = activeCategoryId === cat.id;
                  return (
                    <a
                      key={cat.id}
                      href={`#${cat.id}`}
                      className={clsx(
                        "flex items-center justify-between rounded-la-md px-3 py-2 text-left font-la-sans text-[0.8125rem] transition-colors duration-180",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                        isActive
                          ? "border border-la-border-gold/55 bg-la-gold-faint font-semibold text-la-gold-light shadow-[0_0_12px_rgba(207,169,101,0.12)]"
                          : "text-la-text-secondary hover:bg-white/[0.03] hover:text-la-text-primary"
                      )}
                    >
                      <span className="truncate">
                        {cat.code}. {cat.badge}
                      </span>
                      {isActive ? (
                        <ArrowRight
                          aria-hidden="true"
                          className="h-3 w-3 shrink-0 text-la-gold"
                        />
                      ) : null}
                    </a>
                  );
                })}
              </nav>

              <div className="mt-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={handleOpenPreferencesModal}
                  className="flex w-full items-center justify-between rounded-la-md border border-la-border-gold/50 bg-la-gold-faint px-3 py-2 text-left font-la-mono text-[0.6875rem] text-la-gold-light transition-colors hover:border-la-gold"
                >
                  <span>Reabrir painel</span>
                  <span>Ajustar agora ⚙</span>
                </button>
              </div>
            </div>
          </aside>

          {/* CLÁUSULAS E TABELAS DE COOKIES */}
          <div className="flex flex-col gap-10 lg:col-span-8">
            {/* O QUE SÃO COOKIES */}
            <section className="rounded-la-xl border border-white/10 bg-[#090C14]/90 p-6 shadow-[var(--la-elevation-1)] sm:p-8">
              <h2 className="font-la-sans text-[1.25rem] font-semibold text-la-text-primary sm:text-[1.375rem]">
                O que são Cookies e Tecnologias de Armazenamento Local?
              </h2>

              <p className="mt-4 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.72] text-la-text-secondary">
                Cookies e chaves de armazenamento local (como localStorage e
                sessionStorage) são pequenos arquivos de texto armazenados de
                forma segura no seu navegador quando você visita páginas na
                web. Eles permitem que a aplicação web reconheça o seu dispositivo
                em visitas subsequentes, garantindo que sua sessão não seja
                encerrada no meio de um trabalho e preservando suas opções de
                configuração do Projeto Editorial.
              </p>

              <p className="mt-3 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.72] text-la-text-secondary">
                No Legion Altaire, não utilizamos cookies de rastreamento de
                redes de anúncios de terceiros nem vendemos suas informações de
                navegação para brokers publicitários. Nossas tecnologias locais
                existem exclusivamente para a prestação eficiente e segura do
                software.
              </p>
            </section>

            {/* DETALHAMENTO DAS 3 CATEGORIAS */}
            {COOKIE_CATEGORIES.map((category) => (
              <section
                key={category.id}
                id={category.id}
                className="scroll-mt-24 rounded-la-xl border border-white/10 bg-[#090C14]/90 p-6 shadow-[var(--la-elevation-1)] sm:p-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-la-md border border-la-border-gold bg-la-gold-faint font-la-mono text-[0.8125rem] font-semibold text-la-gold-light">
                      {category.code}
                    </span>
                    <h3 className="font-la-sans text-[1.1875rem] font-semibold text-la-text-primary">
                      {category.title}
                    </h3>
                  </div>

                  <span
                    className={clsx(
                      "rounded-la-full px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.06em]",
                      category.isAlwaysActive
                        ? "border border-la-border-gold bg-la-gold-faint text-la-gold-light"
                        : "border border-white/15 bg-black/45 text-la-text-secondary"
                    )}
                  >
                    {category.badge}
                  </span>
                </div>

                <p className="mt-4 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.72] text-la-text-secondary">
                  {category.purpose}
                </p>

                <div className="mt-5 rounded-la-lg border border-white/10 bg-black/45 p-4">
                  <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Exemplos de Chaves Utilizadas e Retenção
                  </span>
                  <ul className="mt-2.5 flex flex-col gap-2">
                    {category.examples.map((ex) => (
                      <li
                        key={ex}
                        className="flex items-start gap-2.5 text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.55] text-la-text-primary"
                      >
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-la-gold"
                        />
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5 font-la-mono text-[0.6875rem] text-la-text-muted">
                    <span>Prazo de retenção: {category.retention}</span>
                    <span className="text-la-gold-light">{category.statusLabel}</span>
                  </div>
                </div>
              </section>
            ))}

            {/* COMO GERENCIAR NO NAVEGADOR */}
            <section className="rounded-la-xl border border-white/10 bg-[#090C14]/90 p-6 shadow-[var(--la-elevation-1)] sm:p-8">
              <h2 className="font-la-sans text-[1.25rem] font-semibold text-la-text-primary sm:text-[1.375rem]">
                Como Desativar Cookies Diretamente no seu Navegador
              </h2>

              <p className="mt-3 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.72] text-la-text-secondary">
                Além do painel interativo de preferências do Legion Altaire, você
                pode configurar seu navegador para bloquear ou alertar sobre a
                gravação de cookies. Note que o bloqueio de cookies essenciais
                pode impedir o login seguro e a persistência dos seus Projetos
                Editoriais.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="rounded-la-md border border-white/10 bg-black/45 p-3 font-la-sans text-[0.8125rem] text-la-text-secondary">
                  • <strong className="text-la-text-primary">Google Chrome:</strong> Configurações → Privacidade e Segurança → Cookies de terceiros.
                </div>
                <div className="rounded-la-md border border-white/10 bg-black/45 p-3 font-la-sans text-[0.8125rem] text-la-text-secondary">
                  • <strong className="text-la-text-primary">Mozilla Firefox:</strong> Opções → Privacidade e Segurança → Cookies e dados de sites.
                </div>
                <div className="rounded-la-md border border-white/10 bg-black/45 p-3 font-la-sans text-[0.8125rem] text-la-text-secondary">
                  • <strong className="text-la-text-primary">Apple Safari:</strong> Ajustes → Safari → Avançado → Bloquear todos os cookies.
                </div>
                <div className="rounded-la-md border border-white/10 bg-black/45 p-3 font-la-sans text-[0.8125rem] text-la-text-secondary">
                  • <strong className="text-la-text-primary">Microsoft Edge:</strong> Configurações → Cookies e permissões de site.
                </div>
              </div>
            </section>

            {/* BOX FINAL DE DISPARO DO MODAL */}
            <div className="rounded-la-xl border border-la-border-gold/45 bg-[#07090F]/95 p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex max-w-[34rem] flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-la-gold" />
                    <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      Central de Consentimento
                    </span>
                  </div>
                  <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                    Deseja revisar suas permissões para cookies funcionais ou
                    analíticos agora mesmo?
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenPreferencesModal}
                  className="inline-flex min-h-[2.625rem] shrink-0 items-center justify-center gap-2 rounded-la-md bg-la-gold px-5 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse transition-colors hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Ajustar preferências</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}