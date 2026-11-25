"use client";

import React, { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, Building2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  removeCompanyFromList,
  selectCurrentCompany,
  updateCompanyInList,
} from "@/lib/redux/slices/companySlice";
import { AppDispatch } from "@/lib/redux/store";
import {
  apiDeleteCompany,
  apiUpdateCompany,
} from "@/lib/services/companyService";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { formatCnpjInput } from "@/lib/utils";

export function OrganizationSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const currentCompany = useSelector(selectCurrentCompany);

  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (currentCompany) {
      setName(currentCompany.name || "");
      setAcronym(currentCompany.acronym || "");
      setCnpj(formatCnpjInput(currentCompany.cnpj || ""));
    }
  }, [currentCompany]);

  if (!currentCompany) {
    return (
      <div className="w-full max-w-4xl rounded-md border border-border bg-card p-8 text-center text-foreground">
        <Building2 className="mx-auto mb-3 h-8 w-8 text-primary" />
        <h2 className="text-lg font-bold">Nenhuma empresa selecionada</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione ou crie uma empresa na barra lateral para editar suas
          configurações.
        </p>
      </div>
    );
  }

  const canManage = Boolean(currentCompany.isCompanyManager);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    try {
      setIsSaving(true);
      const updated = await apiUpdateCompany(currentCompany._id, {
        name: name.trim(),
        acronym: acronym.trim().toUpperCase(),
        cnpj: cnpj.trim(),
      });
      dispatch(updateCompanyInList({ ...updated, _id: currentCompany._id }));
      toast.success("Dados da empresa atualizados com sucesso.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao atualizar empresa.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeleteCompany = async () => {
    if (!canManage) return;

    try {
      setIsDeleting(true);
      await apiDeleteCompany(currentCompany._id);
      dispatch(removeCompanyFromList(currentCompany._id));
      toast.success(`Empresa "${currentCompany.name}" removida com sucesso.`);
      setConfirmDeleteOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Não foi possível excluir a empresa.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col space-y-8 pb-10 text-foreground">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Configurações da Empresa
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os dados cadastrais de{" "}
          <strong>{currentCompany.name}</strong> dentro da organização Altaire.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-5 rounded-md border border-border bg-card p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">
              Nome da Empresa
            </label>
            <input
              type="text"
              required
              minLength={2}
              disabled={!canManage}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Sigla
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={4}
              disabled={!canManage}
              value={acronym}
              onChange={(e) => setAcronym(e.target.value.toUpperCase())}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm uppercase disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              CNPJ (Opcional)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00.000.000/0001-00"
              disabled={!canManage}
              value={cnpj}
              onChange={(e) => setCnpj(formatCnpjInput(e.target.value))}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-60"
            />
            <p className="text-[0.6875rem] text-muted-foreground">
              Aceita números ou formato 00.000.000/0001-00. Deixe vazio para remover.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Plano da Empresa
            </label>
            <input
              type="text"
              disabled
              value={currentCompany.plan}
              className="flex h-9 w-full rounded-md border border-input bg-muted/40 px-3 py-1 text-sm font-semibold text-primary"
            />
          </div>
        </div>

        {canManage ? (
          <div className="flex justify-end border-t border-border pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Salvar Alterações</span>
            </button>
          </div>
        ) : null}
      </form>

      {canManage ? (
        <section className="pt-2">
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Zona de Perigo
            </h3>
            <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-xs text-muted-foreground">
                A exclusão remove o acesso de todos os membros desta empresa.
                Empresas com marcas ativas não podem ser excluídas.
              </p>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDeleteOpen(true)}
                className="min-h-[2.75rem] whitespace-nowrap rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90 disabled:opacity-50"
              >
                {isDeleting ? "Excluindo..." : "Excluir Empresa"}
              </button>
            </div>
          </div>

          <ConfirmActionDialog
            open={confirmDeleteOpen}
            onOpenChange={setConfirmDeleteOpen}
            title={`Excluir "${currentCompany.name}"?`}
            description="A exclusão remove o acesso de todos os membros desta empresa. Empresas que ainda possuem marcas ativas não podem ser excluídas."
            confirmLabel="Excluir Empresa"
            isLoading={isDeleting}
            onConfirm={handleConfirmDeleteCompany}
          />
        </section>
      ) : null}
    </div>
  );
}
