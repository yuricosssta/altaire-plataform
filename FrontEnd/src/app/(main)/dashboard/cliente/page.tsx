"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { ShieldCheck, FolderKanban, Lock, ArrowRight } from "lucide-react";
import { RootState } from "@/lib/redux/store";
import { selectCurrentOrg } from "@/lib/redux/slices/organizationSlice";
import { editorialService } from "@/lib/services/editorialService";
import type { ProjectCardDTO } from "@/lib/services/editorialService";

export default function ClientExclusivePortalPage() {
  const authUser = useSelector((state: RootState) => state.auth?.user);
  const currentOrg = useSelector(selectCurrentOrg);
  const [projects, setProjects] = useState<ProjectCardDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const allowedProjects = React.useMemo<string[]>(
    () =>
      Array.isArray(currentOrg?.allowedProjects)
        ? currentOrg.allowedProjects
        : Array.isArray(authUser?.allowedProjects)
          ? authUser.allowedProjects
          : [],
    [currentOrg?.allowedProjects, authUser?.allowedProjects]
  );

  const permissions: string[] = Array.isArray(currentOrg?.permissions)
    ? currentOrg.permissions
    : Array.isArray(authUser?.permissions)
      ? authUser.permissions
      : [];

  useEffect(() => {
    let cancelled = false;
    editorialService
      .listProjects()
      .then((list) => {
        if (cancelled) return;
        const allowedSet = new Set(allowedProjects.map(String));
        const scoped =
          allowedSet.size > 0
            ? list.filter((p) => allowedSet.has(String(p.id)))
            : list;
        setProjects(scoped);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [allowedProjects]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-6 text-foreground">
      <header className="rounded-md border border-border bg-card p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Portal Exclusivo do Cliente</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          Olá, {authUser?.name || "Cliente"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Este é o seu ambiente restrito de visualização e acompanhamento. Você
          visualiza exclusivamente os projetos e entregas liberados para o seu
          perfil.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Projetos Autorizados ({projects.length})
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Projetos editoriais vinculados à sua conta de cliente.
          </p>

          {isLoading ? (
            <div className="mt-4 rounded-md border border-border bg-background p-4 text-xs text-muted-foreground">
              Carregando projetos autorizados...
            </div>
          ) : projects.length === 0 ? (
            <div className="mt-4 rounded-md border border-border bg-background p-4 text-xs text-muted-foreground">
              Nenhum projeto foi vinculado à sua conta ainda. Solicite ao
              responsável pela conta a liberação do projeto.
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {projects.map((proj) => (
                <li key={proj.id}>
                  <Link
                    href={`/dashboard/editorial/${proj.id}`}
                    className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50"
                  >
                    <div>
                      <span className="block font-semibold">{proj.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {proj.niche} · {proj.subniche}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-primary">
                      Acessar <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Escopos de Permissão ({permissions.length})
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Permissões ativas atribuídas ao seu usuário.
          </p>

          {permissions.length === 0 ? (
            <div className="mt-4 rounded-md border border-border bg-background p-4 text-xs text-muted-foreground">
              Acesso padrão de cliente ativo. As visualizações detalhadas serão
              exibidas aqui conforme liberadas.
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
