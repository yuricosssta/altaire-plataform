//src/components/dashboard/OrganizationPeople.tsx
"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Briefcase,
  FolderKanban,
  Loader2,
  Pencil,
  Plus,
  Save,
  Settings,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { selectCurrentOrg } from "@/lib/redux/slices/organizationSlice";
import { RootState } from "@/lib/redux/store";
import {
  apiCreateOrgFunction,
  apiCreateOrgMember,
  apiDeleteOrgFunction,
  apiGetOrgFunctions,
  apiGetOrgMembers,
  apiRemoveOrgMember,
  apiUpdateOrgFunction,
  apiUpdateOrgMemberRole,
} from "@/lib/services/organizationService";
import {
  ICustomFunctionSummary,
  IOrganizationFunction,
  RoleLabels,
  RoleType,
} from "@/types/organization";

interface UserData {
  _id: string;
  name: string;
  email: string;
  membership: {
    organizationId: string;
    role: RoleType | string;
    allowedProjects?: string[];
    permissions?: string[];
    invitedBy?: string;
    functionId?: string | null;
    customFunction?: ICustomFunctionSummary | null;
  };
}

interface ProjectOption {
  id: string;
  name: string;
}

function extractErrorMessage(error: any, fallback: string): string {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export function OrganizationPeople() {
  const currentOrg = useSelector(selectCurrentOrg);
  const token = useSelector((state: RootState) => state.auth.token);
  const loggedUser = useSelector((state: RootState) => state.auth.user);
  const loggedUserId = loggedUser?.sub || (loggedUser as any)?._id;

  const orgId =
    typeof currentOrg?.organizationId === "object"
      ? (currentOrg.organizationId as any)._id
      : currentOrg?.organizationId;

  const currentRoleUpper = String(
    currentOrg?.role || loggedUser?.role || "MEMBER"
  ).toUpperCase();

  const isCurrentUserOwner = currentRoleUpper === "OWNER";
  const isCurrentUserAdmin =
    currentRoleUpper === "ADMIN" || isCurrentUserOwner;
  const isCurrentUserMember = currentRoleUpper === "MEMBER";
  const canManagePeople = isCurrentUserAdmin || isCurrentUserMember;

  const defaultRoleForCreate = isCurrentUserAdmin ? "MEMBER" : "CLIENT";

  const [members, setMembers] = useState<UserData[]>([]);
  const [orgFunctions, setOrgFunctions] = useState<IOrganizationFunction[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    membership: {
      role: string;
      allowedProjects: string[];
      functionId: string;
    };
  }>({
    name: "",
    email: "",
    password: "",
    membership: {
      role: defaultRoleForCreate,
      allowedProjects: [],
      functionId: "",
    },
  });

  const [editingMember, setEditingMember] = useState<UserData | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editAllowedProjects, setEditAllowedProjects] = useState<string[]>([]);
  const [editFunctionId, setEditFunctionId] = useState<string>("");
  const [isUpdatingAction, setIsUpdatingAction] = useState(false);

  // Modal de gerenciamento do catálogo de funções
  const [isFunctionsModalOpen, setIsFunctionsModalOpen] = useState(false);
  const [functionForm, setFunctionForm] = useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });
  const [editingFunctionId, setEditingFunctionId] = useState<string | null>(
    null
  );
  const [isSavingFunction, setIsSavingFunction] = useState(false);
  const [deletingFunctionId, setDeletingFunctionId] = useState<string | null>(
    null
  );
  const [functionFeedback, setFunctionFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!orgId) return;
    try {
      setIsLoading(true);
      const data = await apiGetOrgMembers(orgId);
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  const fetchOrgFunctions = useCallback(async () => {
    if (!orgId) return;
    try {
      const data = await apiGetOrgFunctions(orgId);
      setOrgFunctions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar funções da organização:", error);
    }
  }, [orgId]);

  const fetchAvailableProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/editorial/projects", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          setProjects(
            list.map((p: any) => ({
              id: String(p.id || p._id),
              name: String(p.name || "Projeto Editorial"),
            }))
          );
        }
      }
    } catch {
      /* Ignora falha silenciosa na listagem de projetos */
    }
  }, [token]);

  useEffect(() => {
    if (token && orgId) {
      fetchMembers();
      fetchOrgFunctions();
      fetchAvailableProjects();
    }
  }, [token, orgId, fetchMembers, fetchOrgFunctions, fetchAvailableProjects]);

  const selectedCreateFunction = useMemo(
    () =>
      orgFunctions.find((fn) => fn._id === formData.membership.functionId) ||
      null,
    [orgFunctions, formData.membership.functionId]
  );

  const selectedEditFunction = useMemo(
    () => orgFunctions.find((fn) => fn._id === editFunctionId) || null,
    [orgFunctions, editFunctionId]
  );

  const toggleProjectInCreate = (projectId: string) => {
    setFormData((prev) => {
      const exists = prev.membership.allowedProjects.includes(projectId);
      const next = exists
        ? prev.membership.allowedProjects.filter((id) => id !== projectId)
        : [...prev.membership.allowedProjects, projectId];
      return {
        ...prev,
        membership: { ...prev.membership, allowedProjects: next },
      };
    });
  };

  const toggleProjectInEdit = (projectId: string) => {
    setEditAllowedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !orgId)
      return;
    try {
      setIsSubmitting(true);
      await apiCreateOrgMember(orgId, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.membership.role,
        allowedProjects: formData.membership.allowedProjects,
        functionId: formData.membership.functionId || null,
      });
      setFormData({
        name: "",
        email: "",
        password: "",
        membership: {
          role: defaultRoleForCreate,
          allowedProjects: [],
          functionId: "",
        },
      });
      fetchMembers();
      alert("Usuário cadastrado com sucesso!");
    } catch (error: any) {
      alert(extractErrorMessage(error, "Erro ao cadastrar usuário."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingMember || !orgId) return;
    try {
      setIsUpdatingAction(true);
      await apiUpdateOrgMemberRole(orgId, editingMember._id, editRole, {
        allowedProjects: editAllowedProjects,
        functionId: editFunctionId || null,
      });
      setEditingMember(null);
      fetchMembers();
    } catch (error: any) {
      alert(
        extractErrorMessage(error, "Erro ao atualizar acesso e função.")
      );
    } finally {
      setIsUpdatingAction(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!editingMember || !orgId) return;
    if (
      !confirm(
        `Tem certeza que deseja remover ${editingMember.name}? Ele perderá o acesso imediatamente.`
      )
    )
      return;

    try {
      setIsUpdatingAction(true);
      await apiRemoveOrgMember(orgId, editingMember._id);
      setEditingMember(null);
      fetchMembers();
    } catch (error: any) {
      alert(extractErrorMessage(error, "Erro ao remover usuário."));
    } finally {
      setIsUpdatingAction(false);
    }
  };

  const resetFunctionForm = () => {
    setFunctionForm({ name: "", description: "" });
    setEditingFunctionId(null);
  };

  const handleSaveFunction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !functionForm.name.trim() || !functionForm.description.trim())
      return;

    try {
      setIsSavingFunction(true);
      setFunctionFeedback(null);

      if (editingFunctionId) {
        await apiUpdateOrgFunction(orgId, editingFunctionId, {
          name: functionForm.name.trim(),
          description: functionForm.description.trim(),
        });
        setFunctionFeedback({
          type: "success",
          text: "Função atualizada com sucesso.",
        });
      } else {
        await apiCreateOrgFunction(orgId, {
          name: functionForm.name.trim(),
          description: functionForm.description.trim(),
        });
        setFunctionFeedback({
          type: "success",
          text: "Função cadastrada com sucesso.",
        });
      }

      resetFunctionForm();
      await Promise.all([fetchOrgFunctions(), fetchMembers()]);
    } catch (error: any) {
      setFunctionFeedback({
        type: "error",
        text: extractErrorMessage(error, "Erro ao salvar função."),
      });
    } finally {
      setIsSavingFunction(false);
    }
  };

  const handleDeleteFunction = async (fn: IOrganizationFunction) => {
    if (!orgId) return;
    if (!confirm(`Deseja excluir a função "${fn.name}"?`)) return;

    try {
      setDeletingFunctionId(fn._id);
      setFunctionFeedback(null);
      await apiDeleteOrgFunction(orgId, fn._id);
      if (editingFunctionId === fn._id) {
        resetFunctionForm();
      }
      setFunctionFeedback({
        type: "success",
        text: `Função "${fn.name}" removida com sucesso.`,
      });
      await fetchOrgFunctions();
    } catch (error: any) {
      setFunctionFeedback({
        type: "error",
        text: extractErrorMessage(
          error,
          "Não foi possível excluir esta função."
        ),
      });
    } finally {
      setDeletingFunctionId(null);
    }
  };

  if (!currentOrg) return null;

  const isCreateRoleScoped =
    formData.membership.role === "CLIENT" ||
    formData.membership.role === "EXTERNAL";

  const isEditRoleScoped = editRole === "CLIENT" || editRole === "EXTERNAL";
  const isEditingOwner =
    String(editingMember?.membership.role || "").toUpperCase() === "OWNER";

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col space-y-8 text-foreground pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestão de Equipe, Clientes e Externos
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Cadastre usuários, designe funções personalizadas e defina o acesso
            nominal aos projetos em{" "}
            <strong>{currentOrg.organizationId.name}</strong>.
          </p>
        </div>

        {canManagePeople && (
          <button
            type="button"
            onClick={() => {
              setFunctionFeedback(null);
              resetFunctionForm();
              setIsFunctionsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md border border-border bg-card text-foreground text-sm font-semibold hover:border-primary hover:text-primary transition-colors shadow-sm shrink-0"
          >
            <Briefcase className="w-4 h-4 text-primary" />
            Gerenciar Funções / Cargos
          </button>
        )}
      </div>

      {canManagePeople && (
        <div className="p-5 border border-border bg-card rounded-md shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" /> Cadastrar Novo
              Usuário
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              O perfil de sistema define as permissões de acesso; a função
              customizada identifica as responsabilidades operacionais sem
              alterar a role do sistema.
            </p>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div className="w-full space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <div className="w-full space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <div className="w-full space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Senha Provisória
                </label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <div className="w-full space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Perfil de Sistema
                </label>
                <select
                  value={formData.membership.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      membership: {
                        ...formData.membership,
                        role: e.target.value,
                      },
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                >
                  {isCurrentUserAdmin && (
                    <>
                      <option value="MEMBER">Membro</option>
                      <option value="ADMIN">Administrador</option>
                    </>
                  )}
                  <option value="CLIENT">Cliente</option>
                  <option value="EXTERNAL">Membro Externo (Editor)</option>
                </select>
              </div>
              <div className="w-full space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Função / Designação (Opcional)
                </label>
                <select
                  value={formData.membership.functionId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      membership: {
                        ...formData.membership,
                        functionId: e.target.value,
                      },
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="">Sem função específica</option>
                  {orgFunctions.map((fn) => (
                    <option key={fn._id} value={fn._id}>
                      {fn.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCreateFunction && (
              <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground flex items-start gap-2">
                <Briefcase className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">
                    Atividades ({selectedCreateFunction.name}):{" "}
                  </span>
                  {selectedCreateFunction.description}
                </div>
              </div>
            )}

            {isCreateRoleScoped && projects.length > 0 && (
              <div className="pt-2 border-t border-border">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                  <FolderKanban className="w-3.5 h-3.5 text-primary" />
                  Projetos Liberados para este{" "}
                  {formData.membership.role === "CLIENT"
                    ? "Cliente"
                    : "Membro Externo"}
                  :
                </label>
                <div className="flex flex-wrap gap-2">
                  {projects.map((proj) => {
                    const selected =
                      formData.membership.allowedProjects.includes(proj.id);
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => toggleProjectInCreate(proj.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                          selected
                            ? "bg-primary/15 text-primary border-primary"
                            : "bg-background text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {proj.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 h-9 px-4 w-full sm:w-auto bg-primary text-primary-foreground rounded-md text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}{" "}
                Salvar Usuário
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela de Membros Ativos */}
      <div className="flex flex-col space-y-4">
        <h3 className="text-sm font-semibold">
          Usuários Vinculados ({members.length})
        </h3>
        <div className="rounded-md border border-border overflow-hidden bg-card shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">
                  E-mail
                </th>
                <th className="px-4 py-3 font-medium">Perfil de Acesso</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  Função / Cargo
                </th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">
                  Escopo de Acesso
                </th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Carregando usuários...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const roleKey = String(
                    member.membership.role || "MEMBER"
                  ).toUpperCase() as RoleType;
                  const roleLabel = RoleLabels[roleKey] || roleKey;
                  const allowedCount =
                    member.membership.allowedProjects?.length || 0;
                  const customFn = member.membership.customFunction;
                  const canEditThisMember =
                    (roleKey !== "OWNER" &&
                      (isCurrentUserAdmin ||
                        (isCurrentUserMember &&
                          (roleKey === "CLIENT" || roleKey === "EXTERNAL")))) ||
                    (roleKey === "OWNER" && isCurrentUserOwner);

                  return (
                    <tr
                      key={member._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold border border-border flex-shrink-0 text-accent-foreground">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">
                          {member.name}{" "}
                          {member._id === loggedUserId && "(Você)"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {member.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${
                            roleKey === "ADMIN" || roleKey === "OWNER"
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {roleLabel} ({roleKey})
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {customFn ? (
                          <span
                            title={customFn.description}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground cursor-help"
                          >
                            <Briefcase className="w-3 h-3 text-primary" />
                            {customFn.name}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                        {roleKey === "CLIENT" || roleKey === "EXTERNAL"
                          ? `${allowedCount} projeto(s) permitido(s)`
                          : "Workspace padrão do perfil"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canEditThisMember && (
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setEditRole(roleKey);
                              setEditAllowedProjects(
                                member.membership.allowedProjects || []
                              );
                              setEditFunctionId(
                                member.membership.functionId || ""
                              );
                            }}
                            className="text-primary hover:text-primary/80 transition-colors p-1.5 rounded-md hover:bg-primary/10 flex items-center gap-2 ml-auto text-xs font-bold"
                          >
                            <Settings className="w-4 h-4" /> Gerenciar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE GESTÃO DO MEMBRO */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background w-full max-w-md rounded-md shadow-2xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                Gerenciar Acesso e Função
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <p className="text-sm font-bold text-foreground">
                  {editingMember.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {editingMember.email}
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Perfil de Acesso (Role do Sistema)
                  </label>
                  <select
                    value={editRole}
                    disabled={isEditingOwner}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
                  >
                    {isEditingOwner ? (
                      <option value="OWNER">Proprietário (OWNER)</option>
                    ) : (
                      <>
                        {isCurrentUserAdmin && (
                          <>
                            <option value="MEMBER">Membro (Padrão)</option>
                            <option value="ADMIN">Administrador</option>
                          </>
                        )}
                        <option value="CLIENT">Cliente (Tela Exclusiva)</option>
                        <option value="EXTERNAL">
                          Membro Externo / Editor (Tela Exclusiva)
                        </option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Função / Designação (Opcional)
                  </label>
                  <select
                    value={editFunctionId}
                    onChange={(e) => setEditFunctionId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="">Sem função específica</option>
                    {orgFunctions.map((fn) => (
                      <option key={fn._id} value={fn._id}>
                        {fn.name}
                      </option>
                    ))}
                  </select>
                  {selectedEditFunction && (
                    <p className="rounded-md border border-border bg-card p-2.5 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Atividades:{" "}
                      </span>
                      {selectedEditFunction.description}
                    </p>
                  )}
                </div>

                {isEditRoleScoped && projects.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Projetos Permitidos ({editAllowedProjects.length})
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 rounded-md border border-border bg-card">
                      {projects.map((proj) => {
                        const selected = editAllowedProjects.includes(proj.id);
                        return (
                          <button
                            key={proj.id}
                            type="button"
                            onClick={() => toggleProjectInEdit(proj.id)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                              selected
                                ? "bg-primary/15 text-primary border-primary"
                                : "bg-background text-muted-foreground border-border hover:text-foreground"
                            }`}
                          >
                            {proj.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUpdateRole}
                  disabled={isUpdatingAction}
                  className="w-full h-9 bg-primary text-primary-foreground rounded-md text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50 mt-2 flex items-center justify-center"
                >
                  {isUpdatingAction ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Salvar Alterações"
                  )}
                </button>
              </div>

              {!isEditingOwner && (
                <div className="border-t border-border pt-4">
                  <button
                    onClick={handleRemoveMember}
                    disabled={isUpdatingAction}
                    className="w-full h-9 bg-background text-red-500 border border-red-500/30 rounded-md text-sm font-bold hover:bg-red-500/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Remover Acesso
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE GERENCIAMENTO DO CATÁLOGO DE FUNÇÕES */}
      {isFunctionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background w-full max-w-2xl rounded-md shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">
                  Gerenciar Funções / Cargos Customizados
                </h3>
              </div>
              <button
                onClick={() => setIsFunctionsModalOpen(false)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              <p className="text-xs text-muted-foreground">
                Cadastre designações personalizadas (ex: Editor de Reels,
                Copywriter, Social Media) com a descrição das atividades. Essas
                funções não interferem nas permissões ou na role do sistema.
              </p>

              {functionFeedback && (
                <div
                  className={`rounded-md border px-3 py-2 text-xs font-medium ${
                    functionFeedback.type === "error"
                      ? "border-red-500/40 bg-red-500/10 text-red-400"
                      : "border-primary/40 bg-primary/10 text-primary"
                  }`}
                >
                  {functionFeedback.text}
                </div>
              )}

              <form
                onSubmit={handleSaveFunction}
                className="p-4 rounded-md border border-border bg-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {editingFunctionId
                      ? "Editar Função Selecionada"
                      : "Nova Função / Designação"}
                  </h4>
                  {editingFunctionId && (
                    <button
                      type="button"
                      onClick={resetFunctionForm}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Nome da Função
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Ex: Editor de Vídeo Sênior"
                    value={functionForm.name}
                    onChange={(e) =>
                      setFunctionForm({ ...functionForm, name: e.target.value })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Descrição das Atividades
                  </label>
                  <textarea
                    required
                    minLength={3}
                    maxLength={500}
                    rows={3}
                    placeholder="Descreva as responsabilidades e entregas atribuídas a esta função..."
                    value={functionForm.description}
                    onChange={(e) =>
                      setFunctionForm({
                        ...functionForm,
                        description: e.target.value,
                      })
                    }
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingFunction}
                    className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSavingFunction ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : editingFunctionId ? (
                      <Save className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    {editingFunctionId ? "Atualizar Função" : "Cadastrar Função"}
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Funções Cadastradas ({orgFunctions.length})
                </h4>

                {orgFunctions.length === 0 ? (
                  <div className="rounded-md border border-border bg-card p-6 text-center text-xs text-muted-foreground">
                    Nenhuma função customizada cadastrada até o momento.
                  </div>
                ) : (
                  <div className="divide-y divide-border rounded-md border border-border bg-card">
                    {orgFunctions.map((fn) => (
                      <div
                        key={fn._id}
                        className="p-3.5 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {fn.name}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {fn.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFunctionId(fn._id);
                              setFunctionForm({
                                name: fn.name,
                                description: fn.description,
                              });
                              setFunctionFeedback(null);
                            }}
                            title="Editar função"
                            className="p-1.5 rounded-md border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingFunctionId === fn._id}
                            onClick={() => handleDeleteFunction(fn)}
                            title="Excluir função"
                            className="p-1.5 rounded-md border border-border bg-background text-muted-foreground hover:text-red-500 hover:border-red-500/40 transition-colors disabled:opacity-50"
                          >
                            {deletingFunctionId === fn._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
