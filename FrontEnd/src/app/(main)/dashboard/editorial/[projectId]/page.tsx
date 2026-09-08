'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenTool, CalendarDays, Lightbulb, FileVideo, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { EditorialVersionManager } from '@/components/editorial/EditorialVersionManager';
import { CalendarManager } from '@/components/editorial/calendar/CalendarManager';
import { ThemesManager } from '@/components/themes/ThemesManager';
import { ScriptsDashboard } from '@/components/editorial/scripts/ScriptsDashboard';
import { editorialService } from '@/lib/services/editorialService';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [activeTab, setActiveTab] = useState('linha-editorial');
  const [projectName, setProjectName] = useState('Projeto Estratégico');

  useEffect(() => {
    editorialService
      .listProjects()
      .then((projects) => {
        const project = projects.find((item) => item.id === projectId);
        if (project) setProjectName(project.name);
      })
      .catch(() => {});
  }, [projectId]);

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard/editorial" className="rounded-md border border-border bg-card p-2 text-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="font-sans text-sm text-primary uppercase tracking-widest">Workspace</p>
            <h1 className="font-serif text-3xl text-foreground">
              {projectName}
            </h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full max-w-4xl grid-cols-4 rounded-md bg-card border border-border p-1">
            <TabsTrigger 
              value="linha-editorial"
              className="flex items-center gap-2 rounded-sm px-3 py-2 font-sans text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground"
            >
              <PenTool className="h-4 w-4" />
              Linha Editorial
            </TabsTrigger>
            <TabsTrigger 
              value="calendario-editorial"
              className="flex items-center gap-2 rounded-sm px-3 py-2 font-sans text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground"
            >
              <CalendarDays className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger 
              value="temas"
              className="flex items-center gap-2 rounded-sm px-3 py-2 font-sans text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground"
            >
              <Lightbulb className="h-4 w-4" />
              Temas
            </TabsTrigger>
            <TabsTrigger 
              value="roteiros"
              className="flex items-center gap-2 rounded-sm px-3 py-2 font-sans text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground"
            >
              <FileVideo className="h-4 w-4" />
              Roteiros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="linha-editorial" className="rounded-md border border-border bg-card p-6">
            <EditorialVersionManager projectId={projectId} />
          </TabsContent>

          <TabsContent value="calendario-editorial" className="rounded-md border border-border bg-card p-6">
            <CalendarManager projectId={projectId} />
          </TabsContent>

          <TabsContent value="temas" className="rounded-md border border-border bg-card p-6">
            <ThemesManager projectId={projectId} />
          </TabsContent>

          <TabsContent value="roteiros" className="rounded-md border border-border bg-card p-6">
            <ScriptsDashboard projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}