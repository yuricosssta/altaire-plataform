// FrontEnd/src/components/layout/Sidebar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  Check,
  ChevronsUpDown,
  Compass,
  FolderArchive,
  FolderKanban,
  HelpCircle,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Radar,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import LogoBloco from "@/components/LogoBloco";
import { ROUTES } from "@/lib/constants/routes";

export type SidebarNavItem = {
  readonly id:
    | "painel-do-dia"
    | "projetos-editoriais"
    | "biblioteca-de-conteudo"
    | "assets-e-arquivos"
    | "configuracoes";
  readonly label: string;
  readonly shortLabel: string;
  readonly description: string;
  readonly href: string;
  readonly matchPrefixes: readonly string[];
  readonly icon: typeof Radar;
  readonly badge?: string;
};

export type SidebarSectionGroup = {
  readonly groupId: string;
  readonly groupLabel: string;
  readonly items: readonly SidebarNavItem[];
};

export const SIDEBAR_GROUPS: readonly SidebarSectionGroup[] = [
  {
    groupId: "estrategia-editorial",
    groupLabel: "ESTRATÉGIA EDITORIAL",
    items: [
      {
        id: "painel-do-dia",
        label: "Painel do Dia",
        shortLabel: "Painel",
        description: "O que executar hoje nos projetos ativos",
        href: "/dashboard",
        matchPrefixes: ["/dashboard/painel-do-dia"],
        icon: Radar,
      },
      {
        id: "projetos-editoriais",
        label: "Projetos Editoriais",
        shortLabel: "Projetos",
        description: "Central Estratégica e entrada para workspaces",
        href: "/dashboard/editorial",
        matchPrefixes: ["/dashboard/editorial", "/editorial"],
        icon: FolderKanban,
        badge: "Central",
      },
    ],
  },
  {
    groupId: "execucao-e-biblioteca",
    groupLabel: "EXECUÇÃO & BIBLIOTECA",
    items: [
      {
        id: "biblioteca-de-conteudo",
        label: "Biblioteca de Conteúdo",
        shortLabel: "Biblioteca",
        description: "Acervo de roteiros, carrosséis, stories e ativos",
        href: "/dashboard/publicacoes",
        matchPrefixes: ["/dashboard/publicacoes", "/dashboard/biblioteca"],
        icon: BookOpen,
      },
      {
        id: "assets-e-arquivos",
        label: "Assets & Arquivos",
        shortLabel: "Assets",
        description: "Identidade visual, fotos, B-rolls, provas e PDFs",
        href: "/dashboard/armazenamento",
        matchPrefixes: ["/dashboard/armazenamento", "/dashboard/assets"],
        icon: FolderArchive,
      },
    ],
  },
  {
    groupId: "conta",
    groupLabel: "CONTA",
    items: [
      {
        id: "configuracoes",
        label: "Configurações",
        shortLabel: "Ajustes",
        description: "Perfil, plano, preferências e membros da equipe",
        href: "/dashboard/settings",
        matchPrefixes: [
          "/dashboard/configuracoes",
          "/dashboard/settings",
          "/dashboard/rh",
          "/dashboard/master-admin",
        ],
        icon: Settings,
      },
    ],
  },
] as const;

export type SidebarProps = {
  readonly isCollapsed?: boolean;
  readonly onToggleCollapse?: () => void;
  readonly isMobileOpen?: boolean;
  readonly onCloseMobile?: () => void;
  readonly workspaceName?: string;
  readonly userEmail?: string;
  readonly userRoleLabel?: string;
};

export function isSidebarItemActive(
  pathname: string,
  item: SidebarNavItem
): boolean {
  if (item.id === "painel-do-dia") {
    return (
      pathname === "/dashboard" || pathname.startsWith("/dashboard/painel-do-dia")
    );
  }

  if (pathname === item.href) {
    return true;
  }

  return item.matchPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  workspaceName = "Roberto Zane",
  userEmail = "admin@legionaltaire.com.br",
  userRoleLabel = "Proprietário · Plano Pro",
}: SidebarProps) {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const isInsideProjectWorkspace =
    /^\/dashboard\/editorial\/[^/]+/.test(pathname) ||
    /^\/editorial\/[^/]+/.test(pathname);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    try {
      window.localStorage.removeItem("la-session-active");
    } catch {
      /* Ignora bloqueio de storage */
    }
    router.push(ROUTES.login);
  };

  const workspaceInitial =
    workspaceName.trim().charAt(0).toUpperCase() || "R";

  const renderSidebarContent = (mobileMode: boolean) => {
    const collapsed = mobileMode ? false : isCollapsed;

    return (
      <div className="relative flex h-full w-full flex-col justify-between select-none">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-la-gold/25 via-white/8 to-transparent"
        />

        <div className="flex flex-col gap-4 px-3.5 pt-4">
          {/* 1. Topo: Marca Altaire Legion + Botão de Recolher/Fechar */}
          <div
            className={clsx(
              "flex items-center border-b border-white/8 pb-3.5",
              collapsed ? "justify-center" : "justify-between px-1"
            )}
          >
            {!collapsed ? (
              <LogoBloco
                orientation="horizontal"
                size="sm"
                tone="public-dark"
                href="/dashboard"
              />
            ) : (
              <Link
                href="/dashboard"
                aria-label="Ir para o Painel do Dia"
                title="Legion Altaire — Painel do Dia"
                className="inline-flex h-9 w-9 items-center justify-center rounded-la-md border border-la-border-gold/55 bg-la-gold-faint font-la-mono text-[0.8125rem] font-bold text-la-gold-light shadow-[0_0_16px_rgba(207,169,101,0.2)] transition-colors hover:border-la-gold"
              >
                LA
              </Link>
            )}

            {mobileMode ? (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Fechar menu lateral"
                className="inline-flex h-8 w-8 items-center justify-center rounded-la-md border border-white/12 bg-white/[0.04] text-la-text-secondary transition-colors hover:border-la-border-gold hover:text-la-gold-light"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={
                  collapsed
                    ? "Expandir barra lateral"
                    : "Recolher barra lateral"
                }
                title={
                  collapsed
                    ? "Expandir barra lateral"
                    : "Recolher barra lateral"
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-la-md border border-white/10 bg-white/[0.03] text-la-text-secondary transition-colors hover:border-la-border-gold/60 hover:text-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
              >
                {collapsed ? (
                  <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          {/* 2. Seletor de Conta / Workspace */}
          <div ref={accountMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((prev) => !prev)}
              aria-expanded={isAccountMenuOpen}
              aria-haspopup="menu"
              title={`Workspace da Conta: ${workspaceName}`}
              className={clsx(
                "group flex w-full items-center rounded-la-lg border border-white/12 bg-[#0B0F18]/90 transition-all duration-180",
                "hover:border-la-border-gold/60 hover:bg-[#101522]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                collapsed
                  ? "justify-center p-2"
                  : "justify-between gap-2.5 px-3 py-2.5"
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-la-md border border-la-gold/60 bg-la-gold font-la-mono text-[0.8125rem] font-bold text-la-text-inverse shadow-[0_0_14px_rgba(207,169,101,0.3)]">
                  {workspaceInitial}
                </span>

                {!collapsed ? (
                  <div className="flex min-w-0 flex-col text-left">
                    <span className="truncate font-la-sans text-[0.875rem] font-semibold leading-tight text-la-text-primary">
                      {workspaceName}
                    </span>
                    <span className="truncate font-la-mono text-[0.625rem] uppercase tracking-[0.06em] text-la-gold-light">
                      Conta / Workspace
                    </span>
                  </div>
                ) : null}
              </div>

              {!collapsed ? (
                <ChevronsUpDown
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-la-text-muted transition-colors group-hover:text-la-gold-light"
                />
              ) : null}
            </button>

            <AnimatePresence>
              {isAccountMenuOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  role="menu"
                  className={clsx(
                    "absolute z-50 mt-2 overflow-hidden rounded-la-xl border border-white/15 bg-[#090C14]/98 p-2 shadow-[0_24px_48px_rgba(0,0,0,0.85),0_0_40px_rgba(207,169,101,0.12)] backdrop-blur-2xl",
                    collapsed ? "top-0 left-14 w-64" : "inset-x-0 w-full"
                  )}
                >
                  <div className="border-b border-white/10 px-3 py-2.5">
                    <span className="block font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      {userRoleLabel}
                    </span>
                    <p className="mt-0.5 truncate font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                      {workspaceName}
                    </p>
                    <p className="truncate font-la-mono text-[0.6875rem] text-la-text-muted">
                      {userEmail}
                    </p>
                  </div>

                  <div className="mt-1.5 flex flex-col gap-1">
                    <div className="flex items-center justify-between rounded-la-md border border-la-border-gold/40 bg-la-gold-faint px-2.5 py-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-la-xs bg-la-gold font-la-mono text-[0.625rem] font-bold text-la-text-inverse">
                          {workspaceInitial}
                        </span>
                        <span className="font-la-sans text-[0.75rem] font-semibold text-la-text-primary">
                          {workspaceName}
                        </span>
                      </div>
                      <Check
                        aria-hidden="true"
                        className="h-3.5 w-3.5 text-la-gold"
                      />
                    </div>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        if (mobileMode && onCloseMobile) onCloseMobile();
                      }}
                      className="flex items-center gap-2.5 rounded-la-md px-2.5 py-2 font-la-sans text-[0.75rem] text-la-text-secondary transition-colors hover:bg-white/[0.05] hover:text-la-text-primary"
                    >
                      <Users
                        aria-hidden="true"
                        className="h-3.5 w-3.5 text-la-gold"
                      />
                      <span>Membros & Permissões</span>
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        if (mobileMode && onCloseMobile) onCloseMobile();
                      }}
                      className="flex items-center gap-2.5 rounded-la-md px-2.5 py-2 font-la-sans text-[0.75rem] text-la-text-secondary transition-colors hover:bg-white/[0.05] hover:text-la-text-primary"
                    >
                      <Settings
                        aria-hidden="true"
                        className="h-3.5 w-3.5 text-la-gold"
                      />
                      <span>Configurações da Conta</span>
                    </Link>
                  </div>

                  <div className="mt-1.5 border-t border-white/10 pt-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-la-md px-2.5 py-2 text-left font-la-sans text-[0.75rem] font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                    >
                      <LogOut aria-hidden="true" className="h-3.5 w-3.5" />
                      <span>Encerrar sessão</span>
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* 3. Navegação Principal Global em 3 Blocos */}
          <nav
            aria-label="Navegação Global do Sistema Operacional Editorial"
            className="mt-1 flex flex-col gap-5"
          >
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.groupId} className="flex flex-col gap-1.5">
                {!collapsed ? (
                  <span className="px-2.5 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-la-text-muted">
                    {group.groupLabel}
                  </span>
                ) : (
                  <div
                    aria-hidden="true"
                    className="mx-auto my-1 h-px w-6 bg-white/10"
                  />
                )}

                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isSidebarItemActive(pathname, item);

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          if (mobileMode && onCloseMobile) {
                            onCloseMobile();
                          }
                        }}
                        title={
                          collapsed
                            ? `${item.label} — ${item.description}`
                            : item.description
                        }
                        className={clsx(
                          "group relative flex items-center rounded-la-lg transition-all duration-180",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                          collapsed
                            ? "h-10 w-full justify-center px-0"
                            : "min-h-[2.625rem] justify-between px-3 py-2",
                          active
                            ? "border border-la-border-gold/65 bg-la-gold-faint font-semibold text-la-gold-light shadow-[0_0_20px_rgba(207,169,101,0.14)]"
                            : "border border-transparent text-la-text-secondary hover:border-white/8 hover:bg-white/[0.035] hover:text-la-text-primary"
                        )}
                      >
                        {active ? (
                          <span
                            aria-hidden="true"
                            className="absolute top-2 bottom-2 left-0 w-1 rounded-r-la-full bg-la-gold shadow-[0_0_8px_#CFA965]"
                          />
                        ) : null}

                        <div
                          className={clsx(
                            "flex min-w-0 items-center",
                            collapsed ? "justify-center" : "gap-3"
                          )}
                        >
                          <Icon
                            aria-hidden="true"
                            className={clsx(
                              "h-4 w-4 shrink-0 transition-colors",
                              active
                                ? "text-la-gold"
                                : "text-la-text-muted group-hover:text-la-gold-light"
                            )}
                          />

                          {!collapsed ? (
                            <span className="truncate font-la-sans text-[0.875rem] leading-tight">
                              {item.label}
                            </span>
                          ) : null}
                        </div>

                        {!collapsed && item.badge ? (
                          <span
                            className={clsx(
                              "rounded-la-full px-2 py-0.5 font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.06em]",
                              active
                                ? "border border-la-gold/60 bg-la-gold/20 text-la-gold-light"
                                : "border border-white/10 bg-black/45 text-la-text-muted"
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Indicador Contextual quando o Usuário está dentro de um Projeto Editorial */}
          {isInsideProjectWorkspace && !collapsed ? (
            <div className="mt-1 rounded-la-lg border border-la-border-gold/45 bg-[#0B0E17]/95 p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <div className="flex items-center gap-2">
                <Compass
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-la-gold"
                />
                <span className="font-la-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                  Workspace Contextual Ativo
                </span>
              </div>
              <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.45] text-la-text-secondary">
                As abas de Dashboard, Linha, Calendário, Temas e Roteiros operam
                no topo deste projeto.
              </p>
              <Link
                href="/dashboard/editorial"
                className="mt-2 inline-flex items-center gap-1 font-la-mono text-[0.625rem] font-semibold text-la-gold-light hover:underline"
              >
                <span>← Trocar de Projeto Editorial</span>
              </Link>
            </div>
          ) : null}
        </div>

        {/* Rodapé da Sidebar */}
        <div className="flex flex-col gap-1.5 border-t border-white/10 px-3.5 py-3.5">
          <button
            type="button"
            onClick={() => setIsHelpModalOpen(true)}
            title="Ajuda & Suporte Metodológico"
            className={clsx(
              "flex items-center rounded-la-lg border border-transparent text-la-text-secondary transition-colors hover:border-white/8 hover:bg-white/[0.035] hover:text-la-text-primary",
              collapsed
                ? "h-9 w-full justify-center"
                : "justify-between px-3 py-2"
            )}
          >
            <span className="flex items-center gap-2.5">
              <HelpCircle
                aria-hidden="true"
                className="h-4 w-4 text-la-gold/85"
              />
              {!collapsed ? (
                <span className="font-la-sans text-[0.8125rem]">
                  Ajuda & Suporte
                </span>
              ) : null}
            </span>
            {!collapsed ? (
              <span className="font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                Guia
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Encerrar sessão com segurança"
            className={clsx(
              "flex items-center rounded-la-lg border border-transparent text-la-text-secondary transition-colors hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-200",
              collapsed
                ? "h-9 w-full justify-center"
                : "justify-between px-3 py-2"
            )}
          >
            <span className="flex items-center gap-2.5">
              <LogOut aria-hidden="true" className="h-4 w-4" />
              {!collapsed ? (
                <span className="font-la-sans text-[0.8125rem]">Sair</span>
              ) : null}
            </span>
          </button>

          {!collapsed ? (
            <div className="mt-1 flex items-center justify-between rounded-la-md border border-white/8 bg-black/40 px-2.5 py-1.5 font-la-mono text-[0.5625rem] text-la-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-la-full bg-la-gold shadow-[0_0_6px_#CFA965]" />
                <span>Legion OS v1.0</span>
              </span>
              <span className="text-la-gold-light">Ativo</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. SIDEBAR FIXA DESKTOP (>= 1024px) */}
      <aside
        aria-label="Barra Lateral Principal"
        className={clsx(
          "hidden shrink-0 border-r border-white/10 bg-[#06080E]/95 transition-[width] duration-250 ease-out lg:flex lg:flex-col",
          isCollapsed ? "lg:w-[4.75rem]" : "lg:w-[17.5rem]"
        )}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* 2. DRAWER LATERAL MOBILE / TABLET (< 1024px) */}
      <AnimatePresence>
        {isMobileOpen ? (
          <div className="fixed inset-0 z-[120] flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              aria-hidden="true"
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "tween",
                duration: 0.24,
                ease: [0.16, 1, 0.3, 1],
              }}
              aria-label="Menu de navegação móvel"
              className="relative z-[130] flex h-full w-[18.5rem] max-w-[86vw] flex-col border-r border-white/15 bg-[#06080E]/98 shadow-[0_24px_64px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>

      {/* 3. MODAL RÁPIDO DE AJUDA & MÉTODO LEGION ALTAIRE */}
      <AnimatePresence>
        {isHelpModalOpen ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHelpModalOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative z-10 w-full max-w-[34rem] overflow-hidden rounded-la-xl border border-la-border-gold/55 bg-[#090C14]/98 p-6 shadow-[0_32px_72px_rgba(0,0,0,0.95)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-2">
                  <Sparkles
                    aria-hidden="true"
                    className="h-4 w-4 text-la-gold"
                  />
                  <h2
                    id="help-modal-title"
                    className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary"
                  >
                    Sequência Oficial do Método Legion Altaire
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-la-xs text-la-text-muted hover:text-la-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.6] text-la-text-secondary">
                Para garantir que a IA nunca gere conteúdos genéricos ou misture
                ofertas diferentes, opere sempre seguindo a cadeia de contexto:
              </p>

              <div className="mt-4 flex flex-col gap-2">
                {[
                  "01. Projeto Editorial → Isola o negócio, produto, campanha ou cliente.",
                  "02. Linha Editorial → Define promessa, ROMA, ICP, pilares e RETINA.",
                  "03. Calendário Editorial → Traduz a estratégia em agenda realista.",
                  "04. Temas → Gera e aloca pautas estratégicas nos slots.",
                  "05. Roteiros & Ativos → Produz peças prontas para gravação e design.",
                ].map((step) => (
                  <div
                    key={step}
                    className="rounded-la-md border border-white/10 bg-black/45 px-3 py-2 font-la-mono text-[0.75rem] text-la-gold-light"
                  >
                    {step}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <Link
                  href={ROUTES.contato}
                  onClick={() => setIsHelpModalOpen(false)}
                  className="font-la-mono text-[0.75rem] text-la-gold-light hover:underline"
                >
                  Falar com suporte humano →
                </Link>
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(false)}
                  className="rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.8125rem] font-semibold text-la-text-inverse hover:bg-la-gold-light"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;