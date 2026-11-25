"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Briefcase,
  Building2,
  FolderKanban,
  Loader2,
  Pencil,
  Plus,
  Save,
  Settings,
  ShieldAlert,
  Tag,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import {
  selectCompanyBrands,
  selectCurrentCompany,
} from "@/lib/redux/slices/companySlice";
import { RootState } from "@/lib/redux/store";
import {
  apiAddCompanyMember,
  apiCreateCompanyFunction,
  apiDeleteCompanyFunction,
  apiGetCompanyFunctions,
  apiGetCompanyMembers,
  apiRemoveCompanyMember,
  apiUpdateCompanyFunction,
  apiUpdateCompanyMember,
} from "@/lib/services/companyService";
import { editorialService } from "@/lib/services/editorialService";
import { ICompanyFunction, ICompanyMember } from "@/types/company";
import { RoleLabels, RoleType } from "@/types/organization";

interface ProjectOption {
  id: string;
  name: string;
}

type CompanyMemberRole = "MEMBER" | "CLIENT" | "EXTERNAL";

function extractErrorMessage(error: any, fallback: string): string {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export function OrganizationPeople() {
  const currentCompany = useSelector(selectCurrentCompany);
  const brands = useSelector(selectCompanyBrands);
  const token = useSelector((state: RootState) => state.auth.token);
  const loggedUser = useSelector((state: RootState) => state.auth.user);
  const loggedUserId = loggedUser?.sub || (loggedUser as any)?._id;

  const companyId = currentCompany?._id;
  const canManageCompany = Boolean(currentCompany?.isCompanyManager);

  const [members, setMembers] = useState<ICompanyMember[]>([]);
  const [companyFunctions, setCompanyFunctions] = useState<ICompanyFunction[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: CompanyMemberRole;
    brandIds: string[];
    allowedProjects: string[];
    functionId: string;
  }>({
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
    brandIds: [],
    allowedProjects: [],
    functionId: "",
  });

  const [editingMember, setEditingMember] = useState<ICompanyMember | null>(null);
  const [editRole, setEditRole] = useState<CompanyMemberRole>("MEMBER");
  const [editBrandIds, setEditBrandIds] = useState<string[]>([]);
  const [editAllowedProjects, setEditAllowedProjects] = useState<string[]>([]);
  const [editFunctionId, setEditFunctionId] = useState<string>("");
  const [isUpdatingAction, setIsUpdatingAction] = useState(false);

  const [isFunctionsModalOpen, setIsFunctionsModalOpen] = useState(false);
  const [functionForm, setFunctionForm] = useState({ name: "", description: "" });
  const [editingFunctionId, setEditingFunctionId] = useState<string | null>(null);
  const [isSavingFunction, setIsSavingFunction] = useState(false);
  const [deletingFunctionId, setDeletingFunctionId] = useState<string | null>(null);
  const [confirmRemoveMemberOpen, setConfirmRemoveMemberOpen] = useState(false);
  const [functionPendingDelete, setFunctionPendingDelete] =
    useState<ICompanyFunction | null>(null);
  const [functionFeedback, setFunctionFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!companyId || !canManageCompany) {
      setMembers([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await apiGetCompanyMembers(companyId);
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Erro ao buscar membros da empresa."));
    } finally {
      setIsLoading(false);
    }
  }, [companyId, canManageCompany]);

  const fetchCompanyFunctions = useCallback(async () => {
    if (!companyId) return;
    try {
      const data = await apiGetCompanyFunctions(companyId);
      setCompanyFunctions(Array.isArray(data) ? data : []);
    } catch {
      /* Ignora se usuário restrito não puder listar funções */
    }
  }, [companyId]);

  const fetchAvailableProjects = useCallback(async () => {
    if (!companyId) return;
    try {
      const list = await editorialService.listProjects();
      setProjects(
        (list || []).map((p) => ({
          id: String(p.id),
          name: String(p.name || "Projeto Editorial"),
        }))
      );
    } catch {
      /* Ignora falha silenciosa na listagem de projetos */
    }
  }, [companyId]);

  useEffect(() => {
    if (token && companyId) {
      void fetchMembers();
      void fetchCompanyFunctions();
      void fetchAvailableProjects();
    } else {
      setIsLoading(false);
    }
  }, [token, companyId, fetchMembers, fetchCompanyFunctions, fetchAvailableProjects]);

  const selectedCreateFunction = useMemo(
    () =>
      companyFunctions.find((fn) => fn._id === formData.functionId) || null,
    [companyFunctions, formData.functionId]
  );

  const selectedEditFunction = useMemo(
    () => companyFunctions.find((fn) => fn._id === editFunctionId) || null,
    [companyFunctions, editFunctionId]
  );

  const toggleInList = (list: string[], id: string): string[] =>
    list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !companyId) return;
    try {
      setIsSubmitting(true);
      await apiAddCompanyMember(companyId, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        ...(formData.password.trim()
          ? { password: formData.password.trim() }
          : {}),
        role: formData.role,
        brandIds: formData.role === "MEMBER" ? formData.brandIds : [],
        allowedProjects:
          formData.role === "CLIENT" || formData.role === "EXTERNAL"
            ? formData.allowedProjects
            : [],
        functionId: formData.functionId || null,
      });

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "MEMBER",
        brandIds: [],
        allowedProjects: [],
        functionId: "",
      });
      await fetchMembers();
      toast.success("Membro adicionado à empresa com sucesso!");
    } catch (error: any) {
      toast.error(extractErrorMessage(error, "Erro ao adicionar membro."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember || !companyId) return;
    try {
      setIsUpdatingAction(true);
      const isGlobalAdmin =
        editingMember.role === "OWNER" || editingMember.role === "ADMIN";
      await apiUpdateCompanyMember(companyId, editingMember._id, {
        ...(!isGlobalAdmin ? { role: editRole } : {}),
        brandIds: editRole === "MEMBER" ? editBrandIds : [],
        allowedProjects:
          editRole === "CLIENT" || editRole === "EXTERNAL"
            ? editAllowedProjects
            : [],
        functionId: editFunctionId || null,
      });
      setEditingMember(null);
      await fetchMembers();
      toast.success("Vínculo e permissões atualizados!");
    } catch (error: any) {
      toast.error(
        extractErrorMessage(error, "Erro ao atualizar vínculo e função.")
      );
    } finally {
      setIsUpdatingAction(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!editingMember || !companyId) return;

    try {
      setIsUpdatingAction(true);
      await apiRemoveCompanyMember(companyId, editingMember._id);
      setConfirmRemoveMemberOpen(false);
      setEditingMember(null);
      await fetchMembers();
      toast.success("Membro removido da empresa.");
    } catch (error: any) {
      toast.error(extractErrorMessage(error, "Erro ao remover usuário."));
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
    if (!companyId || !functionForm.name.trim() || !functionForm.description.trim())
      return;

    try {
      setIsSavingFunction(true);
      setFunctionFeedback(null);

      if (editingFunctionId) {
        await apiUpdateCompanyFunction(companyId, editingFunctionId, {
          name: functionForm.name.trim(),
          description: functionForm.description.trim(),
        });
        setFunctionFeedback({
          type: "success",
          text: "Função atualizada com sucesso.",
        });
      } else {
        await apiCreateCompanyFunction(companyId, {
          name: functionForm.name.trim(),
          description: functionForm.description.trim(),
        });
        setFunctionFeedback({
          type: "success",
          text: "Função cadastrada com sucesso.",
        });
      }

      resetFunctionForm();
      await Promise.all([fetchCompanyFunctions(), fetchMembers()]);
    } catch (error: any) {
      setFunctionFeedback({
        type: "error",
        text: extractErrorMessage(error, "Erro ao salvar função."),
      });
    } finally {
      setIsSavingFunction(false);
    }
  };

  const handleConfirmDeleteFunction = async () => {
    if (!companyId || !functionPendingDelete) return;
    const fn = functionPendingDelete;

    try {
      setDeletingFunctionId(fn._id);
      setFunctionFeedback(null);
      await apiDeleteCompanyFunction(companyId, fn._id);
      if (editingFunctionId === fn._id) {
        resetFunctionForm();
      }
      setFunctionFeedback({
        type: "success",
        text: `Função "${fn.name}" removida com sucesso.`,
      });
      setFunctionPendingDelete(null);
      await fetchCompanyFunctions();
    } catch (error: any) {
      setFunctionFeedback({
        type: "error",
        text: extractErrorMessage(
          error,
          "Não foi possível excluir esta função."
        ),
      });
      setFunctionPendingDelete(null);
    } finally {
      setDeletingFunctionId(null);
    }
  };

  if (!currentCompany) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-md border border-border bg-card p-8 text-center text-foreground">
        <Building2 className="mx-auto mb-3 h-8 w-8 text-primary" />
        <h2 className="text-lg font-bold">Nenhuma empresa selecionada</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione ou crie uma empresa na barra lateral para gerenciar membros e
          funções.
        </p>
      </div>
    );
  }

  if (!canManageCompany) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-md border border-border bg-card p-8 text-foreground">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h2 className="text-base font-bold">
              Gestão restrita em {currentCompany.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Apenas o criador da empresa ou administradores da organização
              Altaire podem adicionar membros, atribuir marcas e gerenciar o
              catálogo de funções.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isCreateRoleProjectScoped =
    formData.role === "CLIENT" || formData.role === "EXTERNAL";
  const isEditRoleProjectScoped =
    editRole === "CLIENT" || editRole === "EXTERNAL";
  const isEditingCreatorOrAltaireAdmin = Boolean(
    editingMember &&
      (editingMember._id === currentCompany.createdBy ||
        editingMember.role === "OWNER" ||
        editingMember.role === "ADMIN")
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col space-y-8 pb-10 text-foreground">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Membros, Marcas e Funções — {currentCompany.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione membros por marca, libere projetos específicos para clientes
            ou externos e organize cargos internos particulares desta empresa.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFunctionFeedback(null);
            resetFunctionForm();
            setIsFunctionsModalOpen(true);
          }}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
        >
          <Briefcase className="h-4 w-4 text-primary" />
          Gerenciar Funções / Cargos
        </button>
      </div>

      <div className="space-y-4 rounded-md border border-border bg-card p-5 shadow-sm">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <UserPlus className="h-4 w-4 text-primary" /> Adicionar Usuário à
            Empresa
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Se o e-mail já existir na Altaire, o usuário será vinculado com suas
            permissões nesta empresa. OWNER e ADMIN são exclusivos da organização
            Altaire.
          </p>
        </div>

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="w-full space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Nome *
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
                E-mail *
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
                Senha Provisória (Novo)
              </label>
              <input
                type="text"
                minLength={6}
                placeholder="Opcional se já tiver conta"
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
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as CompanyMemberRole,
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="MEMBER">Membro</option>
                <option value="CLIENT">Cliente</option>
                <option value="EXTERNAL">Membro Externo (Editor)</option>
              </select>
            </div>

            <div className="w-full space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Função Interna (Opcional)
              </label>
              <select
                value={formData.functionId}
                onChange={(e) =>
                  setFormData({ ...formData, functionId: e.target.value })
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="">Sem função específica</option>
                {companyFunctions.map((fn) => (
                  <option key={fn._id} value={fn._id}>
                    {fn.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedCreateFunction ? (
            <div className="flex items-start gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <div>
                <span className="font-semibold text-foreground">
                  Atividades ({selectedCreateFunction.name}):{" "}
                </span>
                {selectedCreateFunction.description}
              </div>
            </div>
          ) : null}

          {formData.role === "MEMBER" && brands.length > 0 ? (
            <div className="border-t border-border pt-3">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Tag className="h-3.5 w-3.5 text-primary" />
                Marcas Acessíveis para este Membro ({formData.brandIds.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => {
                  const selected = formData.brandIds.includes(brand._id);
                  return (
                    <button
                      key={brand._id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          brandIds: toggleInList(prev.brandIds, brand._id),
                        }))
                      }
                      className={`min-h-[2.75rem] rounded-md border px-3.5 py-2 text-xs font-medium transition-colors ${
                        selected
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {brand.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {isCreateRoleProjectScoped && projects.length > 0 ? (
            <div className="border-t border-border pt-3">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FolderKanban className="h-3.5 w-3.5 text-primary" />
                Projetos Liberados para este{" "}
                {formData.role === "CLIENT" ? "Cliente" : "Membro Externo"}:
              </label>
              <div className="flex flex-wrap gap-2">
                {projects.map((proj) => {
                  const selected = formData.allowedProjects.includes(proj.id);
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          allowedProjects: toggleInList(
                            prev.allowedProjects,
                            proj.id
                          ),
                        }))
                      }
                      className={`min-h-[2.75rem] rounded-md border px-3.5 py-2 text-xs font-medium transition-colors ${
                        selected
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {proj.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Usuário
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Membros */}
      <div className="flex flex-col space-y-4">
        <h3 className="text-sm font-semibold">
          Membros Vinculados ({members.length})
        </h3>
        <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  E-mail
                </th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Função Interna
                </th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  Escopo na Empresa
                </th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                    Carregando membros...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhum membro vinculado a esta empresa.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const roleKey = String(
                    member.role || "MEMBER"
                  ).toUpperCase() as RoleType;
                  const roleLabel = RoleLabels[roleKey] || roleKey;
                  const isCreator = member._id === currentCompany.createdBy;
                  const isGlobalAdmin =
                    roleKey === "OWNER" || roleKey === "ADMIN";
                  const customFn = member.membership.customFunction;
                  const brandsCount = member.membership.brandIds?.length || 0;
                  const allowedCount =
                    member.membership.allowedProjects?.length || 0;

                  const scopeLabel =
                    isCreator || isGlobalAdmin
                      ? "Acesso total à empresa"
                      : roleKey === "CLIENT" || roleKey === "EXTERNAL"
                        ? `${allowedCount} projeto(s) permitido(s)`
                        : `${brandsCount} marca(s) vinculada(s)`;

                  return (
                    <tr
                      key={member._id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="flex items-center gap-3 px-4 py-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-accent text-xs font-bold text-accent-foreground">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">
                          {member.name}
                          {member._id === loggedUserId ? " (Você)" : ""}
                          {isCreator ? " · Criador" : ""}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        {member.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold ${
                            isGlobalAdmin
                              ? "border-primary/20 bg-primary/10 text-primary"
                              : "border-border bg-muted text-muted-foreground"
                          }`}
                        >
                          {roleLabel}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        {customFn ? (
                          <span
                            title={customFn.description}
                            className="inline-flex cursor-help items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground"
                          >
                            <Briefcase className="h-3 w-3 text-primary" />
                            {customFn.name}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                        {scopeLabel}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMember(member);
                            setEditRole(
                              roleKey === "CLIENT" || roleKey === "EXTERNAL"
                                ? roleKey
                                : "MEMBER"
                            );
                            setEditBrandIds(member.membership.brandIds || []);
                            setEditAllowedProjects(
                              member.membership.allowedProjects || []
                            );
                            setEditFunctionId(
                              member.membership.functionId || ""
                            );
                          }}
                          className="ml-auto flex items-center gap-2 rounded-md p-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10 hover:text-primary/80"
                        >
                          <Settings className="h-4 w-4" /> Gerenciar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Gestão do Membro */}
      {editingMember ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-md border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
              <h3 className="text-sm font-semibold">
                Gerenciar Vínculo e Função
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="text-sm font-bold text-foreground">
                  {editingMember.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {editingMember.email}
                </p>
              </div>

              <div className="space-y-3">
                {!isEditingCreatorOrAltaireAdmin ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Perfil de Sistema
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) =>
                        setEditRole(e.target.value as CompanyMemberRole)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <option value="MEMBER">Membro</option>
                      <option value="CLIENT">Cliente (Tela Exclusiva)</option>
                      <option value="EXTERNAL">
                        Membro Externo / Editor (Tela Exclusiva)
                      </option>
                    </select>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Função Interna (Opcional)
                  </label>
                  <select
                    value={editFunctionId}
                    onChange={(e) => setEditFunctionId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="">Sem função específica</option>
                    {companyFunctions.map((fn) => (
                      <option key={fn._id} value={fn._id}>
                        {fn.name}
                      </option>
                    ))}
                  </select>
                  {selectedEditFunction ? (
                    <p className="rounded-md border border-border bg-card p-2.5 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Atividades:{" "}
                      </span>
                      {selectedEditFunction.description}
                    </p>
                  ) : null}
                </div>

                {!isEditingCreatorOrAltaireAdmin &&
                editRole === "MEMBER" &&
                brands.length > 0 ? (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Marcas Permitidas ({editBrandIds.length})
                    </label>
                    <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-md border border-border bg-card p-2">
                      {brands.map((brand) => {
                        const selected = editBrandIds.includes(brand._id);
                        return (
                          <button
                            key={brand._id}
                            type="button"
                            onClick={() =>
                              setEditBrandIds((prev) =>
                                toggleInList(prev, brand._id)
                              )
                            }
                            className={`min-h-[2.75rem] rounded-md border px-3.5 py-2 text-xs font-medium transition-colors ${
                              selected
                                ? "border-primary bg-primary/15 text-primary"
                                : "border-border bg-background text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {brand.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {!isEditingCreatorOrAltaireAdmin &&
                isEditRoleProjectScoped &&
                projects.length > 0 ? (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Projetos Permitidos ({editAllowedProjects.length})
                    </label>
                    <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-md border border-border bg-card p-2">
                      {projects.map((proj) => {
                        const selected = editAllowedProjects.includes(proj.id);
                        return (
                          <button
                            key={proj.id}
                            type="button"
                            onClick={() =>
                              setEditAllowedProjects((prev) =>
                                toggleInList(prev, proj.id)
                              )
                            }
                            className={`min-h-[2.75rem] rounded-md border px-3.5 py-2 text-xs font-medium transition-colors ${
                              selected
                                ? "border-primary bg-primary/15 text-primary"
                                : "border-border bg-background text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {proj.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleUpdateMember}
                  disabled={isUpdatingAction}
                  className="mt-2 flex h-9 w-full items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {isUpdatingAction ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Salvar Alterações"
                  )}
                </button>
              </div>

              {!isEditingCreatorOrAltaireAdmin ? (
                <div className="border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setConfirmRemoveMemberOpen(true)}
                    disabled={isUpdatingAction}
                    className="flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-md border border-destructive/30 bg-background text-sm font-bold text-destructive transition-all hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" /> Remover da Empresa
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal de Catálogo de Funções */}
      {isFunctionsModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">
                  Funções Internas — {currentCompany.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFunctionsModalOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto p-5">
              <p className="text-xs text-muted-foreground">
                Cadastre cargos/funções particulares desta empresa (ex: Editor de
                Reels, Copywriter, Social Media). Eles organizam o time
                internamente sem alterar permissões do sistema.
              </p>

              {functionFeedback ? (
                <div
                  className={`rounded-md border px-3 py-2 text-xs font-medium ${
                    functionFeedback.type === "error"
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-primary/40 bg-primary/10 text-primary"
                  }`}
                >
                  {functionFeedback.text}
                </div>
              ) : null}

              <form
                onSubmit={handleSaveFunction}
                className="space-y-3 rounded-md border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {editingFunctionId
                      ? "Editar Função Selecionada"
                      : "Nova Função / Cargo"}
                  </h4>
                  {editingFunctionId ? (
                    <button
                      type="button"
                      onClick={resetFunctionForm}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancelar edição
                    </button>
                  ) : null}
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
                    placeholder="Descreva as responsabilidades desta função..."
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
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSavingFunction ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : editingFunctionId ? (
                      <Save className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    {editingFunctionId ? "Atualizar Função" : "Cadastrar Função"}
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Funções Cadastradas ({companyFunctions.length})
                </h4>

                {companyFunctions.length === 0 ? (
                  <div className="rounded-md border border-border bg-card p-6 text-center text-xs text-muted-foreground">
                    Nenhuma função cadastrada nesta empresa.
                  </div>
                ) : (
                  <div className="divide-y divide-border rounded-md border border-border bg-card">
                    {companyFunctions.map((fn) => (
                      <div
                        key={fn._id}
                        className="flex items-start justify-between gap-3 p-3.5"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {fn.name}
                          </p>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {fn.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
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
                            className="rounded-md border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingFunctionId === fn._id}
                            onClick={() => setFunctionPendingDelete(fn)}
                            title="Excluir função"
                            className="rounded-md border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
                          >
                            {deletingFunctionId === fn._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
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
      ) : null}

      <ConfirmActionDialog
        open={confirmRemoveMemberOpen}
        onOpenChange={setConfirmRemoveMemberOpen}
        title={`Remover ${editingMember?.name || "membro"} da empresa?`}
        description="Ele perderá imediatamente o acesso às marcas, projetos e arquivos desta empresa."
        confirmLabel="Remover da Empresa"
        isLoading={isUpdatingAction}
        onConfirm={handleRemoveMember}
      />

      <ConfirmActionDialog
        open={Boolean(functionPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setFunctionPendingDelete(null);
        }}
        title={`Excluir função "${functionPendingDelete?.name || ""}"?`}
        description="Não é possível excluir funções que ainda possuem membros vinculados."
        confirmLabel="Excluir Função"
        isLoading={Boolean(deletingFunctionId)}
        onConfirm={handleConfirmDeleteFunction}
      />
    </div>
  );
}
