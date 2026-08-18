import Link from 'next/link';
import { Folder, Calendar, PenTool, Clock } from 'lucide-react';

// Mock baseado no DTO ProjectCardSchema validado na etapa anterior
const mockProjects = [
  {
    id: '64f1b2c3e4b0a1c2d3e4f5a6',
    name: 'Autoridade Imperial — Orgânico',
    niche: 'Desenvolvimento Pessoal',
    subniche: 'Alta Performance',
    currentObjective: 'Aquecimento de Audiência',
    editorialLineStatus: 'active',
    calendarStatus: 'pending',
    updatedAt: new Date('2026-08-01T10:00:00Z'),
  },
  {
    id: '64f1b2c3e4b0a1c2d3e4f5a7',
    name: 'Produto X — Lançamento Semente',
    niche: 'Finanças',
    subniche: 'Algorithmic Trading',
    currentObjective: 'Conversão',
    editorialLineStatus: 'active',
    calendarStatus: 'active',
    updatedAt: new Date('2026-08-05T14:30:00Z'),
  },
];

export default function EditorialDashboardPage() {
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
          {/* TODO: Criar rota /dashboard/editorial/novo quando a página de criação de projeto editorial existir */}
          {/* <Link
            href="/dashboard/editorial/novo"
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
            Novo Projeto
          </Link> */}
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockProjects.map((project) => (
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
                  Atualizado em {project.updatedAt.toLocaleDateString('pt-BR')}
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}