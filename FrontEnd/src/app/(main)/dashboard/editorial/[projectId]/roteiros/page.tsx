// FrontEnd/src/app/(main)/dashboard/editorial/[projectId]/roteiros/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RoteirosEditorialModule } from "@/components/editorial/workspace/RoteirosEditorialModule";
import { useEditorialWorkspace } from "@/lib/context/EditorialWorkspaceContext";

export default function ProjectRoteirosHubPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params?.projectId || "proj-produto-x";

  const { projects } = useEditorialWorkspace();
  const project =
    projects.find((p) => p.id === projectId) ??
    projects[0] ?? {
      id: projectId,
      name: "Produto X — Lançamento Semente",
      niche: "Finanças",
      subniche: "Algorithmic Trading",
      currentObjectiveLabel: "Conversão",
      currentPhaseLabel: "Aquecimento — Semana 2 de 4",
      hasActiveLineEditorial: true,
      hasActiveCalendar: true,
    };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/editorial/${project.id}?aba=roteiros`}
          className="inline-flex items-center gap-2 rounded-la-md border border-white/12 bg-white/[0.03] px-3.5 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary transition-colors hover:border-la-border-gold hover:text-la-gold-light"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-la-gold" />
          <span>Voltar ao Workspace do Projeto ({project.name})</span>
        </Link>
      </div>

      <RoteirosEditorialModule
        projectId={project.id}
        projectName={project.name}
        projectNiche={project.niche}
        projectSubniche={project.subniche}
        projectObjective={project.currentObjectiveLabel}
        currentPhase={project.currentPhaseLabel}
        hasActiveLine={project.hasActiveLineEditorial}
        hasActiveCalendar={project.hasActiveCalendar}
        onGoToLineTab={() =>
          router.push(`/dashboard/editorial/${project.id}?aba=linha-editorial`)
        }
        onGoToCalendarTab={() =>
          router.push(`/dashboard/editorial/${project.id}?aba=calendario`)
        }
        onGoToThemesTab={() =>
          router.push(`/dashboard/editorial/${project.id}?aba=temas`)
        }
      />
    </div>
  );
}