// FrontEnd/src/app/(main)/layout.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  EditorialWorkspaceProvider,
  useEditorialWorkspace,
} from "@/lib/context/EditorialWorkspaceContext";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "la-sidebar-collapsed";
const WELCOME_BANNER_DISMISSED_KEY = "la-welcome-banner-dismissed-session";

function MainDashboardShellInner({
  children,
}: {
  readonly children: ReactNode;
}) {
  const pathname = usePathname() || "/dashboard";
  const { workspaceName, userFullName, userEmail, topPriorityProject } =
    useEditorialWorkspace();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showWelcomeMicroBanner, setShowWelcomeMicroBanner] =
    useState<boolean>(false);

  useEffect(() => {
    try {
      const savedCollapsed = window.localStorage.getItem(
        SIDEBAR_COLLAPSED_STORAGE_KEY
      );
      if (savedCollapsed === "true") {
        setIsSidebarCollapsed(true);
      }

      const dismissedBanner = window.sessionStorage.getItem(
        WELCOME_BANNER_DISMISSED_KEY
      );
      if (!dismissedBanner) {
        setShowWelcomeMicroBanner(true);
      }
    } catch {
      /* Ignora bloqueio de storage */
    }
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(
          SIDEBAR_COLLAPSED_STORAGE_KEY,
          String(next)
        );
      } catch {
        /* Ignora bloqueio de storage */
      }
      return next;
    });
  };

  const handleDismissWelcomeBanner = () => {
    setShowWelcomeMicroBanner(false);
    try {
      window.sessionStorage.setItem(WELCOME_BANNER_DISMISSED_KEY, "true");
    } catch {
      /* Ignora bloqueio de storage */
    }
  };

  return (
    <div
      data-la-surface="dark"
      className="relative flex min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#0A0D14] font-la-sans text-la-text-primary antialiased selection:bg-la-gold/25 selection:text-la-gold-bright [color-scheme:dark]"
    >
      <div
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 58% 0%, rgba(207, 169, 101, 0.08) 0%, rgba(207, 169, 101, 0.02) 38%, transparent 68%)",
        }}
        className="pointer-events-none fixed inset-0 z-0"
      />

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        workspaceName={workspaceName}
        userEmail={userEmail}
      />

      <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          workspaceName={workspaceName}
          userFullName={userFullName}
          autosaveStatus="saved"
        />

        {/* Micro-mensagem de Boas-Vindas Contextual Sincronizada com o Projeto Real do Cliente (Seção 3.7) */}
        <AnimatePresence initial={false}>
          {showWelcomeMicroBanner ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-b border-la-border-gold/35 bg-[#0D111C]/95"
            >
              <div className="mx-auto flex w-full max-w-[92rem] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center gap-2.5 text-[0.8125rem]">
                  <span className="inline-flex items-center gap-1.5 rounded-la-full border border-la-border-gold/55 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                    <Sparkles
                      aria-hidden="true"
                      className="h-3 w-3 text-la-gold"
                    />
                    <span>Continuidade Estratégica</span>
                  </span>
                  <span className="font-medium text-la-text-primary">
                    Bem-vindo de volta, {userFullName.split(" ")[0]}.
                  </span>
                  <span className="text-la-text-secondary">
                    {topPriorityProject ? (
                      <>
                        Sua próxima prioridade está no projeto{" "}
                        <strong className="text-la-gold-light">
                          {topPriorityProject.name}
                        </strong>{" "}
                        ({topPriorityProject.nextActionLabel}).
                      </>
                    ) : (
                      "Estruture seu primeiro Projeto Editorial para iniciar sua operação."
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {topPriorityProject ? (
                    <Link
                      href={`/dashboard/editorial/${topPriorityProject.id}/linha-editorial/onboarding`}
                      className="inline-flex items-center gap-1 font-la-mono text-[0.6875rem] font-semibold text-la-gold-light transition-colors hover:text-la-text-primary"
                    >
                      <span>Continuar de onde parei</span>
                      <ArrowRight aria-hidden="true" className="h-3 w-3" />
                    </Link>
                  ) : null}

                  <Link
                    href="/dashboard/editorial"
                    className="inline-flex items-center gap-1 font-la-mono text-[0.6875rem] text-la-text-secondary transition-colors hover:text-la-gold-light"
                  >
                    <span>Ver todos os projetos</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleDismissWelcomeBanner}
                    aria-label="Fechar mensagem de boas-vindas"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-la-xs text-la-text-muted transition-colors hover:bg-white/[0.06] hover:text-la-text-primary"
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main
          id="main-workspace-content"
          className="relative mx-auto flex w-full max-w-[92rem] flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function MainDashboardLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <EditorialWorkspaceProvider>
      <MainDashboardShellInner>{children}</MainDashboardShellInner>
    </EditorialWorkspaceProvider>
  );
}