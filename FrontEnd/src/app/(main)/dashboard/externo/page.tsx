"use client";

import React from "react";
import { useSelector } from "react-redux";
import { Briefcase, FolderKanban, Lock } from "lucide-react";
import { RootState } from "@/lib/redux/store";
import { selectCurrentOrg } from "@/lib/redux/slices/organizationSlice";

export default function ExternalMemberPortalPage() {
  const authUser = useSelector((state: RootState) => state.auth?.user);
  const currentOrg = useSelector(selectCurrentOrg);

  const allowedProjects: string[] = Array.isArray(currentOrg?.allowedProjects)
    ? currentOrg.allowedProjects
    : Array.isArray(authUser?.allowedProjects)
      ? authUser.allowedProjects
      : [];

  const permissions: string[] = Array.isArray(currentOrg?.permissions)
    ? currentOrg.permissions
    : Array.isArray(authUser?.permissions)
      ? authUser.permissions
      : [];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-6 text-foreground">
      <header className="rounded-md border border-border bg-card p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <Briefcase className="h-4 w-4 text-primary" />
          <span>Workspace do Membro Externo (Editor / Freelancer)</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          Olá, {authUser?.name || "Colaborador Externo"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Este é o seu painel dedicado de execução. Você tem acesso apenas às
          demandas, roteiros e projetos especificamente atribuídos à sua conta.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Projetos Atribuídos ({allowedProjects.length})
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Projetos editoriais em que sua atuação está autorizada.
          </p>

          {allowedProjects.length === 0 ? (
            <div className="mt-4 rounded-md border border-border bg-background p-4 text-xs text-muted-foreground">
              Nenhum projeto atribuído no momento. Aguarde a vinculação pelo
              gestor do projeto.
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {allowedProjects.map((projectId) => (
                <li
                  key={projectId}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground"
                >
                  <span>Projeto ID: {projectId}</span>
                  <span className="text-primary">Ativo</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Permissões de Atuação ({permissions.length})
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Escopos liberados para edição e entrega.
          </p>

          {permissions.length === 0 ? (
            <div className="mt-4 rounded-md border border-border bg-background p-4 text-xs text-muted-foreground">
              Acesso restrito ao workspace externo ativo.
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {permissions.map((perm) => (
                <span
                  key={perm}
                  className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {perm}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
