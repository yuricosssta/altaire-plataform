// src/app/(main)/dashboard/editorial/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Folder, Calendar, PenTool, Clock, Loader2 } from 'lucide-react';
import { ProjectCardDTO } from '@/lib/dto/editorial.schema';
import { editorialService } from '@/lib/services/editorialService';

export default function EditorialDashboardPage() {
  const [projects, setProjects] = useState<ProjectCardDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    editorialService
      .listProjects()
      .then((data) => {
        if (active) setProjects(data);
      })
      .catch((err: any) => {
        if (active) setError(err?.response?.data?.error || err?.message || 'Falha ao carregar projetos.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl text-foreground">
              Central Estratégica
            </h1>
            <p className="mt-2 font-sans text-lg text-muted-foreground">
              Gerencie suas linhas e calendários editoriais.
            </p>
          </div>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-20 font-sans text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Carregando projetos...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-md border border-border bg-card p-6 font-sans text-sm text-red-500">
            {error}
          </div>
        )}

        {!isLoading && !error && projects.length === 0 && (
          <div className="rounded-md border border-border bg-card p-10 text-center font-sans text-muted-foreground">
            Nenhum projeto editorial encontrado.
          </div>
        )}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/editorial/${project.id}`}
              className="group flex flex-col rounded-md border border-border bg-card p-6 transition-all hover:border-primary"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background border border-border">
                    <Folder className="h-5 w-5 text-primary group-hover:text-primary/80" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-foreground">
                      {project.name}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="mb-6 space-y-2 font-sans text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Nicho:</strong> {project.niche} / {project.subniche}
                </p>
                <p>
                  <strong className="text-foreground">Objetivo:</strong> {project.currentObjective}
                </p>
              </div>

              <div className="mt-auto space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <PenTool className="h-4 w-4 text-primary" />
                    Linha Editorial
                  </span>
                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${project.editorialLineStatus === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {project.editorialLineStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    Calendário
                  </span>
                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${project.calendarStatus === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {project.calendarStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Atualizado em {project.updatedAt?.toLocaleDateString('pt-BR')}
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}