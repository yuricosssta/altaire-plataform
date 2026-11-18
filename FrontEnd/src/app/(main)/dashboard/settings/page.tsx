// FrontEnd/src/app/(main)/dashboard/settings/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  Building2,
  Check,
  CreditCard,
  KeyRound,
  LogOut,
  Mail,
  Palette,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { logout } from "@/lib/redux/slices/authSlice";
import {
  clearOrganizationState,
  selectCurrentOrg,
} from "@/lib/redux/slices/organizationSlice";
import { ROUTES, WORKSPACE_ROUTES } from "@/lib/constants/routes";
import { DataManagement } from "@/components/dashboard/settings/DataManagement";
import { BrandingSettings } from "@/components/dashboard/settings/BrandingSettings";
import {
  DarkCustomSelect,
  type CustomSelectOption,
} from "@/components/ui/DarkCustomSelect";
import { userService } from "@/lib/services/userService";
import {
  apiCreateOrgMember,
  apiGetOrgMembers,
  apiRemoveOrgMember,
  apiUpdateOrganizationProfile,
  apiUpdateOrgMemberRole,
} from "@/lib/services/organizationService";
import { editorialService } from "@/lib/services/editorialService";
import { scriptsService } from "@/lib/services/scriptsService";
import { storageService } from "@/lib/services/storageService";

/* -------------------------------------------------------------------------- */
/* Tipos e Constantes Canônicas                                               */
/* -------------------------------------------------------------------------- */

export type SettingsTabId = "perfil" | "plano" | "preferencias" | "membros";

export type EditorialRoleId =
  | "OWNER"
  | "ADMIN"
  | "MEMBER"
  | "CLIENT"
  | "EXTERNAL";

type TeamMemberItem = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: EditorialRoleId;
  readonly status: "Ativo" | "Convite Pendente";
  readonly projectsAccess: string;
  readonly functionName?: string;
};

const SETTINGS_TABS: readonly {
  readonly id: SettingsTabId;
  readonly label: string;
  readonly badge?: string;
  readonly icon: typeof User;
}[] = [
  { id: "perfil", label: "Meu Perfil", icon: User },
  { id: "plano", label: "Conta & Plano", icon: CreditCard },
  { id: "preferencias", label: "Preferências", icon: Sparkles },
  { id: "membros", label: "Membros & Permissões", icon: Users },
] as const;

const EDITORIAL_ROLES: Record<
  EditorialRoleId,
  { readonly label: string; readonly description: string }
> = {
  OWNER: {
    label: "Proprietário (OWNER)",
    description:
      "Acesso total à organização, faturamento, projetos e permissões.",
  },
  ADMIN: {
    label: "Administrador (ADMIN)",
    description:
      "Gerencia projetos, equipe e configurações operacionais da organização.",
  },
  MEMBER: {
    label: "Membro Editorial (MEMBER)",
    description:
      "Opera a Linha Editorial, Calendário, Temas e Roteiros e gerencia convidados.",
  },
  CLIENT: {
    label: "Cliente / Aprovador (CLIENT)",
    description:
      "Visualiza e aprova entregas nos projetos atribuídos sem alterar a base.",
  },
  EXTERNAL: {
    label: "Colaborador Externo (EXTERNAL)",
    description:
      "Acesso restrito a projetos editoriais autorizados.",
  },
};

function formatStorageBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/* -------------------------------------------------------------------------- */
/* Componente Principal: GeneralSettingsPage                                  */
/* -------------------------------------------------------------------------- */

export default function GeneralSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const currentOrg = useSelector(selectCurrentOrg);
  const authUser = useSelector((state: RootState) => state.auth?.user);
  const profile = useSelector((state: RootState) => state.user?.profile);
  const profileRecord = profile as Record<string, unknown> | null;

  const orgObject =
    currentOrg?.organizationId && typeof currentOrg.organizationId === "object"
      ? (currentOrg.organizationId as unknown as Record<string, any>)
      : null;
  const activeOrgId =
    typeof currentOrg?.organizationId === "string"
      ? currentOrg.organizationId
      : String(orgObject?._id || orgObject?.id || "");
  const activeOrgPlan = String(orgObject?.plan || "FREE");

  /* 1. Estado de Navegação das 4 Sub-Abas */
  const [activeTab, setActiveTab] = useState<SettingsTabId>("perfil");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "saved"
  );

  /* 2. Estados: Aba 1 — Meu Perfil */
  const [fullName, setFullName] = useState<string>(
    (typeof profileRecord?.fullName === "string" && profileRecord.fullName) ||
      authUser?.fullName ||
      ""
  );
  const [displayRole, setDisplayRole] = useState<string>(
    typeof profileRecord?.displayRole === "string"
      ? profileRecord.displayRole
      : ""
  );
  const [email, setEmail] = useState<string>(
    (typeof profileRecord?.email === "string" && profileRecord.email) ||
      authUser?.email ||
      ""
  );
  const [editorialBio, setEditorialBio] = useState<string>(
    typeof profileRecord?.editorialBio === "string"
      ? profileRecord.editorialBio
      : ""
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(
    typeof profileRecord?.twoFactorEnabled === "boolean"
      ? profileRecord.twoFactorEnabled
      : false
  );
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  /* 3. Estados: Aba 2 — Conta & Plano */
  const [workspaceTitle, setWorkspaceTitle] = useState<string>(
    String(orgObject?.name || "")
  );
  const [billingDocument, setBillingDocument] = useState<string>(
    String(orgObject?.billingDocument || "")
  );
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [publicationsCount, setPublicationsCount] = useState<number>(0);
  const [storageUsedBytes, setStorageUsedBytes] = useState<number>(0);
  const [isBrandingModalOpen, setIsBrandingModalOpen] =
    useState<boolean>(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState<boolean>(false);
  const [archiveConfirmText, setArchiveConfirmText] = useState<string>("");

  /* 4. Estados: Aba 3 — Preferências */
  const [preferredStartRoute, setPreferredStartRoute] = useState<
    "/dashboard/editorial" | "/dashboard"
  >("/dashboard/editorial");
  const [defaultScriptMode, setDefaultScriptMode] = useState<
    "TECNICO" | "CONEXAO"
  >("TECNICO");
  const [defaultRetinaBalance, setDefaultRetinaBalance] =
    useState<boolean>(true);
  const [notifyDailyBriefing, setNotifyDailyBriefing] = useState<boolean>(true);
  const [notifySlotGaps, setNotifySlotGaps] = useState<boolean>(true);
  const [notifyAiSuggestions, setNotifyAiSuggestions] = useState<boolean>(true);

  /* 5. Estados: Aba 4 — Membros & Permissões */
  const [members, setMembers] = useState<readonly TeamMemberItem[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);
  const [membersFeedback, setMembersFeedback] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<EditorialRoleId | "TODOS">(
    "TODOS"
  );
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [inviteName, setInviteName] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [invitePassword, setInvitePassword] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<EditorialRoleId>("MEMBER");
  const [inviteProjects, setInviteProjects] = useState<string>("");

  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Opções tipadas para o componente DarkCustomSelect */
  const roleFilterOptions = useMemo((): readonly CustomSelectOption<
    EditorialRoleId | "TODOS"
  >[] => {
    return [
      {
        value: "TODOS",
        label: `Todos os papéis (${members.length})`,
      },
      ...(
        Object.entries(EDITORIAL_ROLES) as [
          EditorialRoleId,
          { readonly label: string; readonly description: string },
        ][]
      ).map(([key, role]) => ({
        value: key,
        label: role.label,
      })),
    ];
  }, [members.length]);

  const memberRoleSelectOptions = useMemo((): readonly CustomSelectOption<EditorialRoleId>[] => {
    return (
      Object.entries(EDITORIAL_ROLES) as [
        EditorialRoleId,
        { readonly label: string; readonly description: string },
      ][]
    ).map(([roleKey, roleMeta]) => ({
      value: roleKey,
      label: roleMeta.label,
      hint: roleMeta.description,
    }));
  }, []);

  const inviteRoleSelectOptions = useMemo((): readonly CustomSelectOption<EditorialRoleId>[] => {
    return (
      Object.entries(EDITORIAL_ROLES) as [
        EditorialRoleId,
        { readonly label: string; readonly description: string },
      ][]
    )
      .filter(([key]) => key !== "OWNER")
      .map(([roleKey, roleMeta]) => ({
        value: roleKey,
        label: roleMeta.label,
        hint: roleMeta.description,
      }));
  }, []);

  const loadMembersData = useCallback(async () => {
    if (!activeOrgId) return;
    setIsLoadingMembers(true);
    try {
      const rawMembers = await apiGetOrgMembers(activeOrgId);
      const validRoles: EditorialRoleId[] = [
        "OWNER",
        "ADMIN",
        "MEMBER",
        "CLIENT",
        "EXTERNAL",
      ];
      const mapped: TeamMemberItem[] = Array.isArray(rawMembers)
        ? rawMembers.map((m: any) => {
            const roleRaw = String(m?.membership?.role || "MEMBER").toUpperCase();
            const role: EditorialRoleId = validRoles.includes(
              roleRaw as EditorialRoleId
            )
              ? (roleRaw as EditorialRoleId)
              : "MEMBER";
            const allowedCount = Array.isArray(m?.membership?.allowedProjects)
              ? m.membership.allowedProjects.length
              : 0;
            const fnName = m?.membership?.customFunction?.name;
            return {
              id: String(m._id || m.id || ""),
              name: String(m.name || m.email || "Membro"),
              email: String(m.email || ""),
              role,
              status: "Ativo",
              projectsAccess: fnName
                ? `${fnName}${allowedCount > 0 ? ` · ${allowedCount} projeto(s)` : ""}`
                : allowedCount > 0
                  ? `${allowedCount} projeto(s) liberado(s)`
                  : role === "OWNER" || role === "ADMIN"
                    ? "Todos os projetos"
                    : "Projetos autorizados",
              functionName: fnName,
            };
          })
        : [];
      setMembers(mapped);
    } catch {
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [activeOrgId]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      userService.getProfile().catch(() => null),
      editorialService.listProjects().catch(() => []),
      scriptsService.listPublications().catch(() => []),
      storageService.getAssets().catch(() => ({ storageUsed: 0 })),
    ]).then(([prof, projs, pubs, storage]) => {
      if (cancelled) return;
      if (prof) {
        if (prof.name || prof.fullName) setFullName(String(prof.name || prof.fullName));
        if (prof.email) setEmail(String(prof.email));
        if (typeof prof.displayRole === "string") setDisplayRole(prof.displayRole);
        if (typeof prof.editorialBio === "string") setEditorialBio(prof.editorialBio);
        if (typeof prof.twoFactorEnabled === "boolean") {
          setTwoFactorEnabled(prof.twoFactorEnabled);
        }
        const prefs = prof.preferences as Record<string, unknown> | undefined;
        if (prefs) {
          if (prefs.preferredStartRoute === "/dashboard" || prefs.preferredStartRoute === "/dashboard/editorial") {
            setPreferredStartRoute(prefs.preferredStartRoute);
          }
          if (prefs.defaultScriptMode === "TECNICO" || prefs.defaultScriptMode === "CONEXAO") {
            setDefaultScriptMode(prefs.defaultScriptMode);
          }
          if (typeof prefs.defaultRetinaBalance === "boolean") {
            setDefaultRetinaBalance(prefs.defaultRetinaBalance);
          }
          if (typeof prefs.notifyDailyBriefing === "boolean") {
            setNotifyDailyBriefing(prefs.notifyDailyBriefing);
          }
          if (typeof prefs.notifySlotGaps === "boolean") {
            setNotifySlotGaps(prefs.notifySlotGaps);
          }
          if (typeof prefs.notifyAiSuggestions === "boolean") {
            setNotifyAiSuggestions(prefs.notifyAiSuggestions);
          }
        }
      }
      setProjectsCount(Array.isArray(projs) ? projs.length : 0);
      setPublicationsCount(Array.isArray(pubs) ? pubs.length : 0);
      setStorageUsedBytes(Number(storage?.storageUsed || 0));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (orgObject?.name) setWorkspaceTitle(String(orgObject.name));
    if (orgObject?.billingDocument !== undefined) {
      setBillingDocument(String(orgObject.billingDocument || ""));
    }
    void loadMembersData();
  }, [orgObject?.name, orgObject?.billingDocument, loadMembersData]);

  /* Sincroniza a aba inicial com ?tab= na URL (compatível com Sidebar.tsx) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") as SettingsTabId | null;
    if (
      tabParam &&
      ["perfil", "plano", "preferencias", "membros"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleSelectTab = (tab: SettingsTabId) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  /* Persiste alterações de Perfil/Workspace/Preferências no servidor via BFF (com debounce) */
  const triggerAutosave = useCallback(
    (overrides?: {
      fullName?: string;
      displayRole?: string;
      email?: string;
      editorialBio?: string;
      twoFactorEnabled?: boolean;
      workspaceTitle?: string;
      billingDocument?: string;
      preferredStartRoute?: "/dashboard/editorial" | "/dashboard";
      defaultScriptMode?: "TECNICO" | "CONEXAO";
      defaultRetinaBalance?: boolean;
      notifyDailyBriefing?: boolean;
      notifySlotGaps?: boolean;
      notifyAiSuggestions?: boolean;
    }) => {
      setSaveStatus("saving");
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

      autosaveTimerRef.current = setTimeout(async () => {
        try {
          await userService.updateProfile({
            name: overrides?.fullName ?? fullName,
            email: overrides?.email ?? email,
            displayRole: overrides?.displayRole ?? displayRole,
            editorialBio: overrides?.editorialBio ?? editorialBio,
            twoFactorEnabled: overrides?.twoFactorEnabled ?? twoFactorEnabled,
            preferences: {
              preferredStartRoute:
                overrides?.preferredStartRoute ?? preferredStartRoute,
              defaultScriptMode:
                overrides?.defaultScriptMode ?? defaultScriptMode,
              defaultRetinaBalance:
                overrides?.defaultRetinaBalance ?? defaultRetinaBalance,
              notifyDailyBriefing:
                overrides?.notifyDailyBriefing ?? notifyDailyBriefing,
              notifySlotGaps: overrides?.notifySlotGaps ?? notifySlotGaps,
              notifyAiSuggestions:
                overrides?.notifyAiSuggestions ?? notifyAiSuggestions,
            },
          });

          if (
            activeOrgId &&
            (overrides?.workspaceTitle !== undefined ||
              overrides?.billingDocument !== undefined)
          ) {
            await apiUpdateOrganizationProfile(activeOrgId, {
              name: (overrides.workspaceTitle ?? workspaceTitle).trim() || undefined,
              billingDocument: overrides.billingDocument ?? billingDocument,
            });
          }

          setSaveStatus("saved");
        } catch {
          setSaveStatus("idle");
        }
      }, 650);
    },
    [
      fullName,
      email,
      displayRole,
      editorialBio,
      twoFactorEnabled,
      preferredStartRoute,
      defaultScriptMode,
      defaultRetinaBalance,
      notifyDailyBriefing,
      notifySlotGaps,
      notifyAiSuggestions,
      activeOrgId,
      workspaceTitle,
      billingDocument,
    ]
  );

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearOrganizationState());
    try {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("la-session-active");
    } catch {
      /* Ignora bloqueio de storage */
    }
    window.location.replace(ROUTES.login);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim() || newPassword.trim().length < 8) {
      setPasswordFeedback(
        "Informe a senha atual e uma nova senha com no mínimo 8 caracteres."
      );
      return;
    }
    setSaveStatus("saving");
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setSaveStatus("saved");
      setPasswordFeedback("Credenciais de segurança atualizadas com sucesso.");
      window.setTimeout(() => setPasswordFeedback(null), 4000);
    } catch (err: unknown) {
      setSaveStatus("idle");
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Erro ao atualizar senha. Verifique a senha atual.";
      setPasswordFeedback(msg);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim() || !activeOrgId) return;

    setSaveStatus("saving");
    setMembersFeedback(null);
    try {
      await apiCreateOrgMember(activeOrgId, {
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        password: invitePassword.trim() || undefined,
        role: inviteRole,
      });

      setInviteName("");
      setInviteEmail("");
      setInvitePassword("");
      setInviteRole("MEMBER");
      setIsInviteModalOpen(false);
      await loadMembersData();
      setSaveStatus("saved");
      setMembersFeedback("Membro adicionado à organização.");
    } catch (err: unknown) {
      setSaveStatus("idle");
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Não foi possível adicionar o membro. Para contas novas, informe uma senha temporária.";
      setMembersFeedback(msg);
    }
  };

  const handleRoleChange = async (memberId: string, nextRole: EditorialRoleId) => {
    if (!activeOrgId) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: nextRole } : m))
    );
    setSaveStatus("saving");
    try {
      await apiUpdateOrgMemberRole(activeOrgId, memberId, nextRole);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("idle");
      void loadMembersData();
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeOrgId) return;
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setSaveStatus("saving");
    try {
      await apiRemoveOrgMember(activeOrgId, memberId);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("idle");
      void loadMembersData();
    }
  };

  const filteredMembers = useMemo(() => {
    if (roleFilter === "TODOS") return members;
    return members.filter((m) => m.role === roleFilter);
  }, [members, roleFilter]);

  const userInitials = useMemo(() => {
    const clean = fullName.trim();
    if (!clean) return "AL";
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? "A"}${parts[parts.length - 1][0] ?? "L"}`.toUpperCase();
  }, [fullName]);

  return (
    <div
      data-la-surface="dark"
      className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-28 text-la-text-primary"
    >
      {/* 1. CABEÇALHO GLOBAL DE CONFIGURAÇÕES */}
      <header className="relative overflow-hidden rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
        />

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-la-full border border-la-border-gold/45 bg-la-gold-faint px-3 py-1 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
              <Shield className="h-3.5 w-3.5 text-la-gold" />
              <span>
                Governança da Conta & Workspace · {currentOrg?.role || "OWNER"}
              </span>
            </div>

            <h1 className="mt-2.5 font-la-sans text-2xl font-bold tracking-tight text-la-text-primary sm:text-[1.75rem]">
              Configurações da Conta
            </h1>
            <p className="mt-1 max-w-2xl text-justify [text-align-last:left] hyphens-auto font-la-sans text-sm text-la-text-secondary">
              Gerencie sua identidade profissional, parâmetros do plano ativo,
              preferências do Sistema Operacional Editorial e permissões da sua
              equipe em todos os projetos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Indicador de Autosave */}
            <div className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-la-md border border-white/10 bg-black/45 px-3.5 py-2 font-la-mono text-xs text-la-text-secondary">
              {saveStatus === "saving" ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-la-gold" />
                  <span className="text-la-gold-light">
                    Salvando alterações...
                  </span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Alterações salvas automaticamente</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsBrandingModalOpen(true)}
              className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md border border-la-border-gold/55 bg-la-gold-faint px-4 py-2 font-la-sans text-xs font-semibold text-la-gold-light transition-colors hover:border-la-gold hover:bg-la-gold hover:text-la-text-inverse"
            >
              <Palette className="h-4 w-4" />
              <span>Identidade & Timbrado</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md border border-red-500/30 bg-red-500/10 px-4 py-2 font-la-sans text-xs font-semibold text-red-200 transition-colors hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              <span>Encerrar Sessão</span>
            </button>
          </div>
        </div>

        {/* 2. BARRA DE SUB-ABAS HORIZONTAIS (4 ABAS DO MVP) */}
        <nav
          aria-label="Sub-abas de Configurações"
          className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4"
        >
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "inline-flex min-h-[2.75rem] items-center gap-2.5 rounded-la-lg border px-4 py-2 font-la-sans text-xs font-semibold transition-all",
                  isActive
                    ? "border-la-border-gold/70 bg-la-gold-faint text-la-gold-light shadow-[0_0_20px_rgba(207,169,101,0.16)]"
                    : "border-white/10 bg-black/35 text-la-text-secondary hover:border-white/20 hover:text-la-text-primary"
                )}
              >
                <Icon
                  className={clsx(
                    "h-4 w-4",
                    isActive ? "text-la-gold" : "text-la-text-muted"
                  )}
                />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span className="rounded-la-full border border-la-gold/50 bg-la-gold/20 px-2 py-0.5 font-la-mono text-[0.625rem] uppercase text-la-gold-light">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </header>

      {/* 3. CONTEÚDO DA SUB-ABA ATIVA */}
      {activeTab === "perfil" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Coluna Principal: Dados do Perfil */}
          <section className="flex flex-col gap-5 rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-6 lg:col-span-7">
            <div className="flex items-center gap-4 border-b border-white/10 pb-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-la-xl border border-la-gold/60 bg-la-gold font-la-mono text-xl font-bold text-la-text-inverse shadow-[0_0_24px_rgba(207,169,101,0.3)]">
                {userInitials}
              </div>
              <div>
                <span className="font-la-mono text-[0.6875rem] uppercase tracking-[0.08em] text-la-gold-light">
                  Titular da Operação Editorial
                </span>
                <h2 className="font-la-sans text-lg font-bold text-la-text-primary">
                  {fullName}
                </h2>
                <p className="font-la-mono text-xs text-la-text-muted">
                  {email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-la-text-secondary">
                  Nome Completo / Assinatura
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFullName(val);
                    triggerAutosave({ fullName: val });
                  }}
                  className="min-h-[2.75rem] rounded-la-md border border-white/12 bg-black/50 px-3.5 font-la-sans text-sm text-la-text-primary focus:border-la-gold focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-la-text-secondary">
                  Cargo / Posicionamento Principal
                </span>
                <input
                  type="text"
                  value={displayRole}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDisplayRole(val);
                    triggerAutosave({ displayRole: val });
                  }}
                  className="min-h-[2.75rem] rounded-la-md border border-white/12 bg-black/50 px-3.5 font-la-sans text-sm text-la-text-primary focus:border-la-gold focus:outline-none"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-la-text-secondary">
                E-mail Principal de Autenticação
              </span>
              <div className="flex items-center gap-2 rounded-la-md border border-white/12 bg-black/50 px-3.5">
                <Mail className="h-4 w-4 text-la-gold" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                    triggerAutosave({ email: val });
                  }}
                  className="min-h-[2.75rem] w-full bg-transparent font-la-sans text-sm text-la-text-primary focus:outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-la-text-secondary">
                Síntese de Autoridade (Contexto Global do Especialista)
              </span>
              <textarea
                rows={4}
                value={editorialBio}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditorialBio(val);
                  triggerAutosave({ editorialBio: val });
                }}
                className="rounded-la-md border border-white/12 bg-black/50 p-3.5 font-la-sans text-sm leading-relaxed text-la-text-primary focus:border-la-gold focus:outline-none"
              />
              <span className="font-la-sans text-xs text-la-text-muted">
                Esta síntese auxilia os modelos de IA a reconhecerem sua
                credencial ao criar novos Projetos Editoriais.
              </span>
            </label>
          </section>

          {/* Coluna Lateral: Segurança e Credenciais */}
          <section className="flex flex-col justify-between gap-5 rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-6 lg:col-span-5">
            <form
              onSubmit={handlePasswordUpdate}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 border-b border-white/10 pb-3.5">
                <KeyRound className="h-4 w-4 text-la-gold" />
                <h3 className="font-la-sans text-base font-bold text-la-text-primary">
                  Segurança & Credenciais
                </h3>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Senha Atual
                </span>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="min-h-[2.75rem] rounded-la-md border border-white/12 bg-black/50 px-3.5 font-la-sans text-sm text-la-text-primary focus:border-la-gold focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Nova Senha Forte (Mín. 8 caracteres)
                </span>
                <input
                  type="password"
                  placeholder="Nova senha de acesso"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="min-h-[2.75rem] rounded-la-md border border-white/12 bg-black/50 px-3.5 font-la-sans text-sm text-la-text-primary focus:border-la-gold focus:outline-none"
                />
              </label>

              {passwordFeedback ? (
                <p className="rounded-la-md border border-la-border-gold/50 bg-la-gold-faint px-3 py-2 font-la-sans text-xs text-la-gold-light">
                  {passwordFeedback}
                </p>
              ) : null}

              <button
                type="submit"
                className="min-h-[2.75rem] rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-xs font-bold text-la-text-inverse transition-colors hover:bg-la-gold-light"
              >
                Atualizar Senha de Acesso
              </button>
            </form>

            {/* Autenticação em 2 Fatores */}
            <div className="rounded-la-lg border border-white/10 bg-black/45 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Proteção de Sessão (2FA)
                  </span>
                  <h4 className="mt-0.5 font-la-sans text-sm font-semibold text-la-text-primary">
                    Autenticação em Dois Fatores
                  </h4>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={twoFactorEnabled}
                  onClick={() => {
                    const nextVal = !twoFactorEnabled;
                    setTwoFactorEnabled(nextVal);
                    triggerAutosave({ twoFactorEnabled: nextVal });
                  }}
                  className={clsx(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-la-full border transition-colors",
                    twoFactorEnabled
                      ? "border-la-gold bg-la-gold/30"
                      : "border-white/20 bg-white/10"
                  )}
                >
                  <span
                    className={clsx(
                      "inline-block h-4 w-4 transform rounded-la-full bg-la-gold transition-transform",
                      twoFactorEnabled ? "translate-x-5" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
              <p className="mt-2 text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs text-la-text-secondary">
                Exige código de verificação ao autenticar em novos dispositivos,
                protegendo a propriedade intelectual dos seus Projetos
                Editoriais.
              </p>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "plano" ? (
        <div className="flex flex-col gap-6">
          {/* Card do Plano e Uso */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="flex flex-col justify-between gap-5 rounded-la-xl border border-la-border-gold/55 bg-[#0B0F18]/95 p-6 shadow-[0_0_32px_rgba(207,169,101,0.1)] lg:col-span-7">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-la-full border border-la-gold/60 bg-la-gold/20 px-3 py-0.5 font-la-mono text-[0.6875rem] font-semibold uppercase text-la-gold-light">
                    Plano {activeOrgPlan} · Operação Editorial Ativa
                  </span>
                  <span className="font-la-mono text-xs text-emerald-400">
                    ● Organização ativa
                  </span>
                </div>

                <h2 className="mt-3 font-la-sans text-xl font-bold text-la-text-primary">
                  {workspaceTitle || "Minha Organização Editorial"}
                </h2>
                <p className="mt-1 text-justify [text-align-last:left] hyphens-auto font-la-sans text-sm text-la-text-secondary">
                  Acesso às Funções 01 (Linha & Calendário), 02 (Motor e
                  Mapa de Temas) e 03 (Studios de Roteiros, Carrosséis, Stories e
                  Materiais Complementares).
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Projetos Editoriais",
                      used: `${projectsCount} ativo(s)`,
                      pctWidth: `${Math.min(100, projectsCount * 10)}%`,
                    },
                    {
                      label: "Roteiros & Ativos",
                      used: `${publicationsCount} registrado(s)`,
                      pctWidth: `${Math.min(100, publicationsCount * 5)}%`,
                    },
                    {
                      label: "Acervo de Marca (Assets)",
                      used: `${formatStorageBytes(storageUsedBytes)} / 25 GB`,
                      pctWidth: `${Math.min(
                        100,
                        Math.round(
                          (storageUsedBytes / (25 * 1024 * 1024 * 1024)) * 100
                        )
                      )}%`,
                    },
                  ].map((meter) => (
                    <div
                      key={meter.label}
                      className="rounded-la-lg border border-white/10 bg-black/45 p-3.5"
                    >
                      <span className="font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                        {meter.label}
                      </span>
                      <p className="mt-1 font-la-mono text-sm font-bold text-la-gold-light">
                        {meter.used}
                      </p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-la-full bg-white/10">
                        <div
                          className="h-full bg-la-gold transition-all"
                          style={{ width: meter.pctWidth }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <span className="font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                      Nome do Workspace
                    </span>
                    <input
                      type="text"
                      value={workspaceTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWorkspaceTitle(val);
                        triggerAutosave({ workspaceTitle: val });
                      }}
                      className="min-h-[2.5rem] rounded-la-md border border-white/12 bg-black/50 px-3 font-la-sans text-xs text-la-text-primary focus:border-la-gold focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-la-mono text-[0.625rem] uppercase text-la-text-muted">
                      CNPJ / CPF de Faturamento
                    </span>
                    <input
                      type="text"
                      value={billingDocument}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBillingDocument(val);
                        triggerAutosave({ billingDocument: val });
                      }}
                      placeholder="Informe CPF ou CNPJ"
                      className="min-h-[2.5rem] rounded-la-md border border-white/12 bg-black/50 px-3 font-la-mono text-xs text-la-text-primary focus:border-la-gold focus:outline-none"
                    />
                  </label>
                </div>

                <Link
                  href={ROUTES.precos}
                  className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-xs font-bold text-la-text-inverse transition-colors hover:bg-la-gold-light"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Gerenciar ou Fazer Upgrade</span>
                </Link>
              </div>
            </section>

            {/* Status de Faturamento */}
            <section className="flex flex-col justify-between rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-6 lg:col-span-5">
              <div>
                <h3 className="font-la-sans text-base font-bold text-la-text-primary">
                  Histórico de Faturamento
                </h3>
                <p className="mt-1 font-la-sans text-xs text-la-text-secondary">
                  {billingDocument
                    ? `Recibos fiscais emitidos para ${billingDocument}.`
                    : "Nenhum documento fiscal cadastrado para faturamento."}
                </p>

                <div className="mt-4 rounded-la-lg border border-white/10 bg-black/40 p-4">
                  <span className="font-la-mono text-xs font-semibold text-la-gold-light">
                    Plano Atual: {activeOrgPlan}
                  </span>
                  <p className="mt-1 font-la-sans text-xs text-la-text-secondary">
                    Nenhuma fatura pendente registrada neste workspace no momento.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-la-lg border border-amber-500/30 bg-amber-500/10 p-3.5">
                <div>
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase text-amber-300">
                    Preservação de Histórico
                  </span>
                  <p className="font-la-sans text-xs text-la-text-secondary">
                    Prefira arquivar projetos concluídos sem perder seus
                    roteiros.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsArchiveModalOpen(true)}
                  className="shrink-0 rounded-la-md border border-amber-400/40 bg-black/40 px-3 py-1.5 font-la-mono text-[0.6875rem] text-amber-200 hover:border-amber-300"
                >
                  Opções de Conta
                </button>
              </div>
            </section>
          </div>

          {/* Bloco de Governança e Importação/Exportação de Dados existente */}
          <section className="rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-6">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-la-sans text-base font-bold text-la-text-primary">
                  Gestão, Backup e Portabilidade de Dados
                </h3>
                <p className="font-la-sans text-xs text-la-text-secondary">
                  Exporte ou sincronize os registros operacionais da sua conta.
                </p>
              </div>
            </div>
            <DataManagement />
          </section>
        </div>
      ) : null}

      {activeTab === "preferencias" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Preferências de Fluxo e IA */}
          <section className="flex flex-col gap-5 rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-6 lg:col-span-7">
            <div className="border-b border-white/10 pb-3.5">
              <h2 className="font-la-sans text-lg font-bold text-la-text-primary">
                Comportamento do Sistema Operacional Editorial
              </h2>
              <p className="mt-0.5 font-la-sans text-xs text-la-text-secondary">
                Defina como o Legion Altaire inicializa sua sessão e estrutura
                seus roteiros por padrão.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                1. Tela Inicial Padrão Pós-Login
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    route: "/dashboard/editorial" as const,
                    title: "Central Estratégica (Projetos)",
                    desc: "Abre a visão geral dos Projetos Editoriais e status das 4 funções.",
                  },
                  {
                    route: "/dashboard" as const,
                    title: "Painel do Dia (Execução Diária)",
                    desc: "Abre diretamente a prioridade do dia, slots de hoje e tarefas.",
                  },
                ].map((opt) => {
                  const selected = preferredStartRoute === opt.route;
                  return (
                    <button
                      key={opt.route}
                      type="button"
                      onClick={() => {
                        setPreferredStartRoute(opt.route);
                        triggerAutosave({ preferredStartRoute: opt.route });
                      }}
                      className={clsx(
                        "flex flex-col items-start rounded-la-lg border p-4 text-left transition-all",
                        selected
                          ? "border-la-gold bg-la-gold-faint shadow-[0_0_20px_rgba(207,169,101,0.14)]"
                          : "border-white/10 bg-black/40 hover:border-white/20"
                      )}
                    >
                      <span className="font-la-sans text-sm font-bold text-la-text-primary">
                        {opt.title}
                      </span>
                      <span className="mt-1 text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs text-la-text-secondary">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-la-gold-light">
                2. Modo Padrão do Studio de Roteirização (Função 03)
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    mode: "TECNICO" as const,
                    title: "Modo Roteiro Técnico (Teleprompter)",
                    desc: "Texto integral palavra por palavra com marcações de ênfase e direção visual.",
                  },
                  {
                    mode: "CONEXAO" as const,
                    title: "Modo Conexão (Tópicos & Improviso Guiado)",
                    desc: "Blocos de retenção, ganchos e bullets estratégicos para fala natural.",
                  },
                ].map((opt) => {
                  const selected = defaultScriptMode === opt.mode;
                  return (
                    <button
                      key={opt.mode}
                      type="button"
                      onClick={() => {
                        setDefaultScriptMode(opt.mode);
                        triggerAutosave({ defaultScriptMode: opt.mode });
                      }}
                      className={clsx(
                        "flex flex-col items-start rounded-la-lg border p-4 text-left transition-all",
                        selected
                          ? "border-la-gold bg-la-gold-faint shadow-[0_0_20px_rgba(207,169,101,0.14)]"
                          : "border-white/10 bg-black/40 hover:border-white/20"
                      )}
                    >
                      <span className="font-la-sans text-sm font-bold text-la-text-primary">
                        {opt.title}
                      </span>
                      <span className="mt-1 text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs text-la-text-secondary">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Notificações e Alertas Operacionais */}
          <section className="flex flex-col gap-4 rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-6 lg:col-span-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3.5">
              <Bell className="h-4 w-4 text-la-gold" />
              <h3 className="font-la-sans text-base font-bold text-la-text-primary">
                Alertas & Inteligência Editorial
              </h3>
            </div>

            {[
              {
                id: "retina" as const,
                title: "Auditoria Automática de Equilíbrio RETINA",
                desc: "Sinaliza quando o calendário acumula muitos conteúdos de vendas sem base de relacionamento/autoridade.",
                checked: defaultRetinaBalance,
                toggle: () => {
                  const nextVal = !defaultRetinaBalance;
                  setDefaultRetinaBalance(nextVal);
                  triggerAutosave({ defaultRetinaBalance: nextVal });
                },
              },
              {
                id: "briefing" as const,
                title: "Resumo Diário do Painel do Dia",
                desc: "Destaca logo cedo os slots agendados para gravação ou publicação nas próximas 48 horas.",
                checked: notifyDailyBriefing,
                toggle: () => {
                  const nextVal = !notifyDailyBriefing;
                  setNotifyDailyBriefing(nextVal);
                  triggerAutosave({ notifyDailyBriefing: nextVal });
                },
              },
              {
                id: "gaps" as const,
                title: "Alerta de Slots Sem Tema Vinculado",
                desc: "Notifica quando houver janelas abertas na semana sem pauta ou roteiro pronto.",
                checked: notifySlotGaps,
                toggle: () => {
                  const nextVal = !notifySlotGaps;
                  setNotifySlotGaps(nextVal);
                  triggerAutosave({ notifySlotGaps: nextVal });
                },
              },
              {
                id: "ai" as const,
                title: "Sugestões Explicáveis de Reaproveitamento",
                desc: "Permite que a IA sugira duplicar e adaptar roteiros campeões entre projetos.",
                checked: notifyAiSuggestions,
                toggle: () => {
                  const nextVal = !notifyAiSuggestions;
                  setNotifyAiSuggestions(nextVal);
                  triggerAutosave({ notifyAiSuggestions: nextVal });
                },
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-la-lg border border-white/10 bg-black/40 p-3.5"
              >
                <div>
                  <h4 className="font-la-sans text-xs font-bold text-la-text-primary">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs text-la-text-secondary">
                    {item.desc}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.checked}
                  onClick={() => item.toggle()}
                  className={clsx(
                    "relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-la-full border transition-colors",
                    item.checked
                      ? "border-la-gold bg-la-gold/30"
                      : "border-white/20 bg-white/10"
                  )}
                >
                  <span
                    className={clsx(
                      "inline-block h-4 w-4 transform rounded-la-full bg-la-gold transition-transform",
                      item.checked ? "translate-x-5" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            ))}
          </section>
        </div>
      ) : null}

      {activeTab === "membros" ? (
        <section className="flex flex-col gap-5 rounded-la-xl border border-white/10 bg-[#0B0F18]/90 p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-la-sans text-lg font-bold text-la-text-primary">
                Membros & Papéis da Operação Editorial
              </h2>
              <p className="mt-0.5 font-la-sans text-xs text-la-text-secondary">
                Delegue funções específicas (Estratégia, Copy/Roteiro, Design ou
                Revisão) mantendo a Base Estratégica protegida.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* MENU 1 PADRONIZADO: Filtro de Papéis com DarkCustomSelect */}
              <div className="min-w-[16rem]">
                <DarkCustomSelect
                  fullWidth
                  align="right"
                  value={roleFilter}
                  options={roleFilterOptions}
                  onChange={(val) =>
                    setRoleFilter(val as EditorialRoleId | "TODOS")
                  }
                  ariaLabel="Filtrar membros por papel"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="inline-flex min-h-[2.625rem] items-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-xs font-bold text-la-text-inverse transition-colors hover:bg-la-gold-light"
              >
                <Plus className="h-4 w-4" />
                <span>Convidar Membro</span>
              </button>
            </div>
          </div>

          {/* Lista de Membros com proteção de empilhamento (z-index) para os dropdowns */}
          {membersFeedback ? (
            <p className="rounded-la-md border border-la-border-gold/40 bg-la-gold-faint px-3.5 py-2 font-la-mono text-xs text-la-gold-light">
              {membersFeedback}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-3">
            {isLoadingMembers ? (
              <div className="rounded-la-lg border border-white/10 bg-black/40 p-6 text-center font-la-mono text-xs text-la-text-muted">
                Carregando membros da organização...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="rounded-la-lg border border-dashed border-white/15 bg-black/40 p-6 text-center font-la-sans text-xs text-la-text-muted">
                Nenhum membro encontrado para este filtro na organização atual.
              </div>
            ) : null}

            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="relative flex flex-col justify-between gap-4 rounded-la-lg border border-white/10 bg-black/40 p-4 transition-colors focus-within:z-40 hover:z-30 hover:border-white/20 lg:flex-row lg:items-center"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-la-md border border-la-border-gold/50 bg-la-gold-faint font-la-mono text-xs font-bold text-la-gold-light">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-la-sans text-sm font-bold text-la-text-primary">
                        {member.name}
                      </span>
                      <span
                        className={clsx(
                          "rounded-la-full px-2 py-0.5 font-la-mono text-[0.625rem] font-semibold uppercase",
                          member.status === "Ativo"
                            ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                            : "border border-amber-500/40 bg-amber-500/15 text-amber-300"
                        )}
                      >
                        {member.status}
                      </span>
                    </div>
                    <p className="font-la-mono text-xs text-la-text-muted">
                      {member.email} · Escopo: {member.projectsAccess}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* MENU 2 PADRONIZADO: Seletor de Papel de cada Membro com DarkCustomSelect */}
                  <div className="min-w-[16.5rem]">
                    <DarkCustomSelect
                      fullWidth
                      align="right"
                      disabled={member.role === "OWNER"}
                      value={member.role}
                      options={memberRoleSelectOptions}
                      onChange={(nextRole) =>
                        handleRoleChange(
                          member.id,
                          nextRole as EditorialRoleId
                        )
                      }
                      ariaLabel={`Papel de ${member.name}`}
                    />
                  </div>

                  {member.role !== "OWNER" ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      title="Revogar acesso do membro"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-la-md border border-white/10 bg-white/[0.03] text-la-text-muted transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* MODAL 1: CONVIDAR NOVO MEMBRO */}
      {isInviteModalOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-la-xl border border-la-border-gold/55 bg-[#090C14] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <h3 className="font-la-sans text-base font-bold text-la-text-primary">
                Convidar Membro para a Operação Editorial
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="rounded-la-xs p-1 text-la-text-muted hover:text-la-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleInviteMember}
              className="mt-4 flex flex-col gap-4"
            >
              <label className="flex flex-col gap-1">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Nome do Profissional
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex.: Rafael Costa"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="min-h-[2.625rem] rounded-la-md border border-white/12 bg-black/50 px-3 font-la-sans text-sm text-la-text-primary focus:border-la-gold focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  E-mail de Convite
                </span>
                <input
                  type="email"
                  required
                  placeholder="rafael@agencia.com.br"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="min-h-[2.625rem] rounded-la-md border border-white/12 bg-black/50 px-3 font-la-sans text-sm text-la-text-primary focus:border-la-gold focus:outline-none"
                />
              </label>

              {/* MENU 3 PADRONIZADO: Seletor de Papel no Modal de Convite com DarkCustomSelect */}
              <div className="flex flex-col gap-1">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Papel na Esteira Editorial
                </span>
                <DarkCustomSelect
                  fullWidth
                  menuZIndex="z-[260]"
                  value={inviteRole}
                  options={inviteRoleSelectOptions}
                  onChange={(val) => setInviteRole(val as EditorialRoleId)}
                  ariaLabel="Selecionar papel na esteira editorial"
                />
                <span className="font-la-sans text-xs text-la-text-muted">
                  {EDITORIAL_ROLES[inviteRole].description}
                </span>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-la-mono text-[0.6875rem] uppercase text-la-text-secondary">
                  Senha Temporária (caso usuário ainda não exista)
                </span>
                <input
                  type="password"
                  placeholder="Opcional se conta já existir (mín. 6 caracteres)"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  className="min-h-[2.625rem] rounded-la-md border border-white/12 bg-black/50 px-3 font-la-sans text-sm text-la-text-primary focus:border-la-gold focus:outline-none"
                />
              </label>

              <div className="mt-2 flex items-center justify-end gap-2.5 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="min-h-[2.625rem] rounded-la-md border border-white/12 px-4 py-2 font-la-sans text-xs font-semibold text-la-text-secondary hover:text-la-text-primary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[2.625rem] rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-xs font-bold text-la-text-inverse hover:bg-la-gold-light"
                >
                  Enviar Convite de Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* MODAL 2: BRANDING SETTINGS (IDENTIDADE E TIMBRADO) */}
      {isBrandingModalOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-la-xl border border-la-border-gold/55 bg-[#090C14] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="font-la-sans text-base font-bold text-la-text-primary">
                Configurações de Identidade & Papel Timbrado
              </h2>
              <button
                type="button"
                onClick={() => setIsBrandingModalOpen(false)}
                className="rounded-la-xs p-1.5 text-la-text-muted hover:text-la-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <BrandingSettings />
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL 3: ARQUIVAMENTO / ENCERRAMENTO DE CONTA */}
      {isArchiveModalOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-la-xl border border-amber-500/40 bg-[#090C14] p-6 shadow-2xl">
            <h3 className="font-la-sans text-base font-bold text-la-text-primary">
              Preservação e Arquivamento Editorial
            </h3>
            <p className="mt-2 text-justify [text-align-last:left] hyphens-auto font-la-sans text-xs leading-relaxed text-la-text-secondary">
              No Legion Altaire, recomendamos o{" "}
              <strong className="text-la-gold-light">
                Arquivamento de Projetos Editoriais
              </strong>{" "}
              na Central Estratégica em vez da exclusão destrutiva, preservando
              seu histórico de versões e roteiros. Para solicitar o
              encerramento, digite{" "}
              <strong className="text-amber-300">CONFIRMAR</strong>:
            </p>
            <input
              type="text"
              placeholder="Digite CONFIRMAR"
              value={archiveConfirmText}
              onChange={(e) => setArchiveConfirmText(e.target.value)}
              className="mt-3 min-h-[2.625rem] w-full rounded-la-md border border-white/12 bg-black/55 px-3 font-la-mono text-xs text-la-text-primary focus:border-amber-400 focus:outline-none"
            />
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setArchiveConfirmText("");
                  setIsArchiveModalOpen(false);
                }}
                className="min-h-[2.5rem] rounded-la-md border border-white/12 px-4 py-1.5 font-la-sans text-xs text-la-text-secondary hover:text-la-text-primary"
              >
                Voltar
              </button>
              <Link
                href={WORKSPACE_ROUTES.centralEstrategica}
                onClick={() => setIsArchiveModalOpen(false)}
                className="inline-flex min-h-[2.5rem] items-center rounded-la-md bg-la-gold px-4 py-1.5 font-la-sans text-xs font-bold text-la-text-inverse"
              >
                Ir para Projetos Editoriais
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}