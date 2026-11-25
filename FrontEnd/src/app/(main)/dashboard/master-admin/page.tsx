"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Crown,
  Link as LinkIcon,
  Loader2,
  Search,
  ShieldAlert,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { RootState } from "@/lib/redux/store";
import {
  apiGetAllOrganizationsAdmin,
  apiUpdateOrganizationPlanAdmin,
} from "@/lib/services/organizationService";
import {
  apiListAllUsersAdmin,
  apiUpdateUserPlanAdmin,
} from "@/lib/services/userService";
import type { IUser, UserPlanType } from "@/types/user";

interface OwnerMembership {
  _id: string;
  role: string;
  organizationId: {
    _id: string;
    name: string;
    acronym: string;
    plan: string;
  };
}

interface AdminOrg {
  _id: string;
  name: string;
  acronym: string;
  plan: string;
  createdAt: string;
  ownerId?: {
    _id: string;
    name: string;
    email: string;
  };
  ownerMemberships?: OwnerMembership[];
}

type AdminTab = "users" | "orgs";

function extractErrorMessage(error: any, fallback: string): string {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function MasterAdminPage() {
  const token = useSelector((state: RootState) => state.auth.token);

  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [users, setUsers] = useState<IUser[]>([]);
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [pendingUserPlanChange, setPendingUserPlanChange] = useState<{
    user: IUser;
    plan: UserPlanType;
  } | null>(null);
  const [pendingOrgPlanChange, setPendingOrgPlanChange] = useState<{
    org: AdminOrg;
    plan: string;
  } | null>(null);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [usersRes, orgsRes] = await Promise.all([
        apiListAllUsersAdmin().catch(() => []),
        apiGetAllOrganizationsAdmin().catch(() => []),
      ]);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setOrgs(Array.isArray(orgsRes) ? orgsRes : []);
    } catch (error: any) {
      toast.error(
        extractErrorMessage(error, "Acesso negado ou erro ao buscar dados.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) void fetchData();
  }, [token, fetchData]);

  const handleConfirmUserPlanChange = async () => {
    if (!pendingUserPlanChange) return;
    const { user, plan } = pendingUserPlanChange;
    const userId = String(user._id || user.id);

    try {
      setIsUpdatingPlan(true);
      await apiUpdateUserPlanAdmin(userId, plan);
      setUsers((prev) =>
        prev.map((item) =>
          String(item._id || item.id) === userId ? { ...item, plan } : item
        )
      );
      toast.success(`Plano de ${user.email} atualizado para ${plan}.`);
      setPendingUserPlanChange(null);
    } catch (error: any) {
      toast.error(
        extractErrorMessage(error, "Erro ao atualizar plano do usuário.")
      );
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleConfirmOrgPlanChange = async () => {
    if (!pendingOrgPlanChange) return;
    const { org, plan } = pendingOrgPlanChange;

    try {
      setIsUpdatingPlan(true);
      await apiUpdateOrganizationPlanAdmin(org._id, plan);
      toast.success(`Plano da organização ${org.name} alterado para ${plan}.`);
      setPendingOrgPlanChange(null);
      await fetchData();
    } catch (error: any) {
      toast.error(
        extractErrorMessage(error, "Erro ao atualizar plano da organização.")
      );
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const normalizedTerm = searchTerm.trim().toLowerCase();

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name?.toLowerCase().includes(normalizedTerm) ||
          u.email?.toLowerCase().includes(normalizedTerm)
      ),
    [users, normalizedTerm]
  );

  const filteredOrgs = useMemo(
    () =>
      orgs.filter(
        (org) =>
          org.name.toLowerCase().includes(normalizedTerm) ||
          Boolean(org.ownerId?.email?.toLowerCase().includes(normalizedTerm))
      ),
    [orgs, normalizedTerm]
  );

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col space-y-6 pb-24 text-foreground">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="flex items-center gap-3 font-heading text-3xl font-bold tracking-tight text-primary">
            <ShieldAlert className="h-7 w-7" />
            Painel Administrador Master
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie assinaturas (FREE / PRO / ENTERPRISE) dos usuários para
            liberar criação de empresas e gestão de equipe.
          </p>
        </div>

        <div className="relative w-full md:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar nome, e-mail ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`inline-flex min-h-[2.75rem] items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "users"
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Usuários & Planos ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orgs")}
          className={`inline-flex min-h-[2.75rem] items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "orgs"
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Organizações (Legado) ({orgs.length})</span>
        </button>
      </div>

      {activeTab === "users" ? (
        <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Papel</th>
                  <th className="px-6 py-4">Plano Atual</th>
                  <th className="px-6 py-4 text-right">Alterar Plano</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const userId = String(user._id || user.id);
                  const plan = (user.plan || "FREE") as UserPlanType;
                  const role = String(user.role || "MEMBER").toUpperCase();
                  const isProOrEnterprise =
                    plan === "PRO" || plan === "ENTERPRISE";

                  return (
                    <tr
                      key={userId}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {user.name}
                          </span>
                          {user.preRegistered ? (
                            <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">
                              Pré-cadastro
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-semibold text-foreground">
                          {role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider ${
                            isProOrEnterprise
                              ? "border-primary/40 bg-primary/15 text-primary"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          {isProOrEnterprise ? (
                            <Crown className="h-3 w-3" />
                          ) : null}
                          {plan}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <select
                          aria-label={`Alterar plano de ${user.email}`}
                          value={plan}
                          onChange={(e) => {
                            const nextPlan = e.target.value as UserPlanType;
                            if (nextPlan !== plan) {
                              setPendingUserPlanChange({
                                user,
                                plan: nextPlan,
                              });
                            }
                          }}
                          className="h-9 cursor-pointer rounded-md border border-input bg-background px-3 text-xs font-semibold text-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        >
                          <option value="FREE">FREE</option>
                          <option value="PRO">PRO</option>
                          <option value="ENTERPRISE">ENTERPRISE</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhum usuário encontrado para a busca informada.
            </div>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Organização</th>
                  <th className="px-6 py-4">Proprietário (E-mail)</th>
                  <th className="px-6 py-4">Criação</th>
                  <th className="px-6 py-4">Status / Plano</th>
                  <th className="px-6 py-4 text-right">Ação Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrgs.map((org) => (
                  <React.Fragment key={org._id}>
                    <tr className="transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                          <Building2 className="h-4 w-4 text-primary" />
                          {org.name}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Ticker: {org.acronym || "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {org.ownerId?.email || "N/A"}
                        </div>
                        {org.ownerMemberships &&
                        org.ownerMemberships.length > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRow(
                                expandedRow === org._id ? null : org._id
                              )
                            }
                            className="mt-1 flex items-center gap-1 text-[0.6875rem] font-bold text-primary hover:underline"
                          >
                            {expandedRow === org._id ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                            Ver {org.ownerMemberships.length} vínculos
                          </button>
                        ) : null}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(org.createdAt).toLocaleDateString("pt-BR")}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider ${
                            org.plan === "ENTERPRISE" || org.plan === "PRO"
                              ? "border-primary/40 bg-primary/15 text-primary"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          {org.plan === "ENTERPRISE" || org.plan === "PRO" ? (
                            <Zap className="h-3 w-3" />
                          ) : null}
                          {org.plan || "FREE"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <select
                          aria-label={`Alterar plano de ${org.name}`}
                          value={org.plan || "FREE"}
                          onChange={(e) => {
                            const nextPlan = e.target.value;
                            if (nextPlan !== (org.plan || "FREE")) {
                              setPendingOrgPlanChange({ org, plan: nextPlan });
                            }
                          }}
                          className="h-9 cursor-pointer rounded-md border border-input bg-background px-3 text-xs font-semibold text-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        >
                          <option value="FREE">FREE</option>
                          <option value="PRO">PRO</option>
                          <option value="ENTERPRISE">ENTERPRISE</option>
                        </select>
                      </td>
                    </tr>

                    {expandedRow === org._id && org.ownerMemberships ? (
                      <tr className="border-b-2 border-border/50 bg-muted/10">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="rounded-md border border-border bg-background p-4 text-xs">
                            <h4 className="mb-3 flex items-center gap-2 font-bold text-muted-foreground">
                              <LinkIcon className="h-4 w-4" />
                              Vínculos de {org.ownerId?.email}
                            </h4>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                              {org.ownerMemberships.map((mem) => (
                                <div
                                  key={mem._id}
                                  className="flex flex-col gap-1 rounded-md border border-border/50 bg-muted/30 p-2"
                                >
                                  <span
                                    className="truncate font-semibold text-foreground"
                                    title={mem.organizationId?.name}
                                  >
                                    {mem.organizationId?.name || "Desconhecida"}
                                  </span>
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`rounded-md px-1.5 py-0.5 text-[0.625rem] font-bold ${
                                        mem.role === "OWNER"
                                          ? "bg-primary/10 text-primary"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {mem.role}
                                    </span>
                                    <span className="text-[0.625rem] font-bold text-muted-foreground">
                                      {mem.organizationId?.plan || "FREE"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrgs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhuma organização encontrada no banco de dados.
            </div>
          ) : null}
        </div>
      )}

      <ConfirmActionDialog
        open={Boolean(pendingUserPlanChange)}
        onOpenChange={(open) => {
          if (!open) setPendingUserPlanChange(null);
        }}
        variant={pendingUserPlanChange?.plan === "FREE" ? "destructive" : "default"}
        title={`Alterar plano de ${pendingUserPlanChange?.user.name || "usuário"} para ${pendingUserPlanChange?.plan || ""}?`}
        description={
          pendingUserPlanChange?.plan === "FREE"
            ? `O usuário (${pendingUserPlanChange.user.email}) perderá a permissão de criar novas empresas e a gestão administrativa das empresas existentes até reativar o plano PRO.`
            : `O usuário (${pendingUserPlanChange?.user.email || ""}) passará a ter permissão para criar empresas e pré-cadastrar membros.`
        }
        confirmLabel="Confirmar Alteração"
        isLoading={isUpdatingPlan}
        onConfirm={handleConfirmUserPlanChange}
      />

      <ConfirmActionDialog
        open={Boolean(pendingOrgPlanChange)}
        onOpenChange={(open) => {
          if (!open) setPendingOrgPlanChange(null);
        }}
        variant="default"
        title={`Alterar plano da organização "${pendingOrgPlanChange?.org.name || ""}"?`}
        description={`Confirmar mudança de plano para ${pendingOrgPlanChange?.plan || ""}.`}
        confirmLabel="Confirmar Alteração"
        isLoading={isUpdatingPlan}
        onConfirm={handleConfirmOrgPlanChange}
      />
    </div>
  );
}
