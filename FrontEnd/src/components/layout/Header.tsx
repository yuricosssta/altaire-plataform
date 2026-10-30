// FrontEnd/src/components/layout/Header.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  FolderKanban,
  Lightbulb,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

export type HeaderProps = {
  readonly onOpenMobileMenu?: () => void;
  readonly workspaceName?: string;
  readonly userFullName?: string;
  readonly autosaveStatus?: "saved" | "saving" | "error";
};

type QuickCreateAction = {
  readonly id: string;
  readonly label: string;
  readonly subtitle: string;
  readonly href: string;
  readonly icon: typeof FolderKanban;
  readonly badge?: string;
};

/**
 * Menu Contextual "+ Criar" (Seções 5.7 e 7.14 do Documento Oficial):
 * Respeita o vínculo obrigatório com Projeto Editorial.
 */
const QUICK_CREATE_ACTIONS: readonly QuickCreateAction[] = [
  {
    id: "novo-projeto",
    label: "Novo Projeto Editorial",
    subtitle: "Criar ambiente isolado para marca, produto ou campanha",
    href: "/dashboard/editorial?acao=novo-projeto",
    icon: FolderKanban,
    badge: "Contexto",
  },
  {
    id: "nova-linha",
    label: "Nova Linha Editorial",
    subtitle: "Estruturar Base Estratégica, pilares e distribuição RETINA",
    href: "/dashboard/editorial?acao=nova-linha",
    icon: Compass,
    badge: "Função 01",
  },
  {
    id: "novo-calendario",
    label: "Novo Calendário Editorial",
    subtitle: "Planejar frequência, formatos e slots do período",
    href: "/dashboard/editorial?acao=novo-calendario",
    icon: Calendar,
    badge: "Função 01",
  },
  {
    id: "gerar-temas",
    label: "Gerar Temas Estratégicos",
    subtitle: "ROMA & Avatar, Dados de Mercado ou Objetivo do Momento",
    href: "/dashboard/editorial?acao=gerar-temas",
    icon: Lightbulb,
    badge: "Função 02",
  },
  {
    id: "novo-roteiro",
    label: "Novo Roteiro ou Ativo",
    subtitle: "A partir de um slot do Calendário ou Tema da Biblioteca",
    href: "/dashboard/editorial?acao=novo-roteiro",
    icon: FileText,
    badge: "Função 03",
  },
] as const;

type BreadcrumbSegment = {
  readonly label: string;
  readonly href?: string;
};

function resolveBreadcrumbs(pathname: string): readonly BreadcrumbSegment[] {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/painel-do-dia")) {
    return [
      { label: "Estratégia Editorial" },
      { label: "Painel do Dia" },
    ];
  }

  if (pathname === "/dashboard/editorial") {
    return [
      { label: "Estratégia Editorial", href: "/dashboard" },
      { label: "Central Estratégica — Projetos Editoriais" },
    ];
  }

  if (pathname.startsWith("/dashboard/editorial/")) {
    const parts = pathname.split("/").filter(Boolean);
    const segments: BreadcrumbSegment[] = [
      { label: "Projetos Editoriais", href: "/dashboard/editorial" },
      { label: "Workspace do Projeto" },
    ];

    if (parts.includes("linha-editorial")) {
      segments.push({ label: "Linha Editorial" });
    } else if (parts.includes("calendario-editorial")) {
      segments.push({ label: "Calendário Editorial" });
    } else if (parts.includes("temas")) {
      segments.push({ label: "Temas & Ideias" });
    } else if (parts.includes("roteiros")) {
      segments.push({ label: "Roteiros & Ativos" });
    } else {
      segments.push({ label: "Dashboard do Projeto" });
    }

    return segments;
  }

  if (
    pathname.startsWith("/dashboard/publicacoes") ||
    pathname.startsWith("/dashboard/biblioteca")
  ) {
    return [
      { label: "Execução & Biblioteca" },
      { label: "Biblioteca de Conteúdo" },
    ];
  }

  if (
    pathname.startsWith("/dashboard/armazenamento") ||
    pathname.startsWith("/dashboard/assets")
  ) {
    return [
      { label: "Execução & Biblioteca" },
      { label: "Assets & Arquivos" },
    ];
  }

  if (
    pathname.startsWith("/dashboard/configuracoes") ||
    pathname.startsWith("/dashboard/settings")
  ) {
    return [
      { label: "Conta" },
      { label: "Configurações & Permissões" },
    ];
  }

  return [
    { label: "Legion Altaire", href: "/dashboard" },
    { label: "Ambiente Operacional" },
  ];
}

export function Header({
  onOpenMobileMenu,
  workspaceName = "Roberto Zane",
  userFullName = "Roberto Zane",
  autosaveStatus = "saved",
}: HeaderProps) {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();

  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState<boolean>(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  const breadcrumbs = resolveBreadcrumbs(pathname);
  const userInitial = userFullName.trim().charAt(0).toUpperCase() || "R";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(event.target as Node)
      ) {
        setIsCreateMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      data-la-surface="dark"
      style={{
        backgroundColor: "rgba(9, 12, 20, 0.82)",
        backdropFilter: "blur(18px) saturate(180%)",
        WebkitBackdropFilter: "blur(18px) saturate(180%)",
      }}
      className="sticky top-0 z-[80] flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-6 lg:px-8"
    >
      {/* LADO ESQUERDO: Gatilho Mobile + Breadcrumbs Contextuais */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Abrir navegação principal"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-la-md border border-white/12 bg-white/[0.04] text-la-text-primary transition-colors hover:border-la-border-gold hover:text-la-gold-light lg:hidden"
        >
          <Menu aria-hidden="true" className="h-4 w-4" />
        </button>

        <nav
          aria-label="Localização atual"
          className="flex min-w-0 items-center gap-1.5 overflow-hidden"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div
                key={`${crumb.label}-${idx}`}
                className="flex min-w-0 items-center gap-1.5"
              >
                {idx > 0 ? (
                  <ChevronRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-white/25"
                  />
                ) : null}

                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hidden truncate font-la-mono text-[0.75rem] text-la-text-secondary transition-colors hover:text-la-gold-light sm:inline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={clsx(
                      "truncate",
                      isLast
                        ? "font-la-sans text-[0.9375rem] font-semibold text-la-text-primary"
                        : "hidden font-la-mono text-[0.75rem] text-la-text-muted sm:inline"
                    )}
                  >
                    {crumb.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* LADO DIREITO: Indicador de Autosave/Sessão + Botão "+ Criar" + Avatar */}
      <div className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
        {/* Indicador de Autosave e Sessão Persistente (Seções 3.8 e 3.10) */}
        <div
          title="Renovação silenciosa ativa — Todas as alterações foram salvas"
          className="hidden items-center gap-2 rounded-la-full border border-white/10 bg-black/45 px-3 py-1.5 md:inline-flex"
        >
          {autosaveStatus === "saving" ? (
            <>
              <span className="h-2 w-2 animate-pulse rounded-la-full bg-la-gold" />
              <span className="font-la-mono text-[0.6875rem] text-la-gold-light">
                Salvando alterações...
              </span>
            </>
          ) : (
            <>
              <CheckCircle2
                aria-hidden="true"
                className="h-3.5 w-3.5 text-la-gold"
              />
              <span className="font-la-mono text-[0.6875rem] text-la-text-secondary">
                Alterações salvas
              </span>
            </>
          )}
        </div>

        {/* Botão de Ação Rápida "+ Criar" (Seções 5.7 e 7.14) */}
        <div ref={createMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsCreateMenuOpen((prev) => !prev)}
            aria-expanded={isCreateMenuOpen}
            aria-haspopup="menu"
            className="inline-flex h-9 items-center gap-1.5 rounded-la-md bg-la-gold px-3.5 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse shadow-[0_0_20px_rgba(207,169,101,0.28)] transition-all hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
          >
            <Plus aria-hidden="true" className="h-4 w-4 stroke-[2.5]" />
            <span>Criar</span>
          </button>

          <AnimatePresence>
            {isCreateMenuOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                role="menu"
                className="absolute right-0 z-50 mt-2 w-[21rem] overflow-hidden rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-2 shadow-[0_28px_64px_rgba(0,0,0,0.9),0_0_48px_rgba(207,169,101,0.14)] backdrop-blur-2xl"
              >
                <div className="border-b border-white/10 px-3 py-2">
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Ações Rápidas com Contexto
                  </span>
                  <p className="mt-0.5 font-la-sans text-[0.75rem] text-la-text-secondary">
                    Todo ativo pertence a um Projeto Editorial isolado.
                  </p>
                </div>

                <div className="mt-1.5 flex flex-col gap-1">
                  {QUICK_CREATE_ACTIONS.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsCreateMenuOpen(false);
                          router.push(action.href);
                        }}
                        className="group flex w-full items-start justify-between gap-2.5 rounded-la-lg p-2.5 text-left transition-colors hover:bg-white/[0.05]"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-la-md border border-la-border-gold/45 bg-la-gold-faint text-la-gold">
                            <ActionIcon aria-hidden="true" className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <span className="block font-la-sans text-[0.8125rem] font-semibold text-la-text-primary group-hover:text-la-gold-light">
                              {action.label}
                            </span>
                            <span className="mt-0.5 block font-la-sans text-[0.6875rem] leading-[1.35] text-la-text-secondary">
                              {action.subtitle}
                            </span>
                          </div>
                        </div>

                        {action.badge ? (
                          <span className="shrink-0 rounded-la-xs border border-white/10 bg-black/50 px-1.5 py-0.5 font-la-mono text-[0.5625rem] text-la-gold-light">
                            {action.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Pílula do Usuário / Conta */}
        <Link
          href="/dashboard/configuracoes"
          title={`Configurações de ${userFullName}`}
          className="flex items-center gap-2.5 rounded-la-full border border-white/12 bg-white/[0.03] py-1 pr-3 pl-1.5 transition-colors hover:border-la-border-gold/60 hover:bg-white/[0.06]"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-la-full bg-la-gold font-la-mono text-[0.75rem] font-bold text-la-text-inverse">
            {userInitial}
          </span>
          <span className="hidden max-w-[9rem] truncate font-la-sans text-[0.8125rem] font-medium text-la-text-primary sm:inline">
            {workspaceName}
          </span>
        </Link>
      </div>
    </header>
  );
}

export default Header;