// FrontEnd/src/app/(main)/dashboard/editorial/[projectId]/roteiros/[format]/[scriptId]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  RoteirosEditorialModule,
  type ScriptFormatSlug,
} from "@/components/editorial/workspace/RoteirosEditorialModule";
import { useEditorialWorkspace } from "@/lib/context/EditorialWorkspaceContext";

export default function DedicatedScriptStudioPage() {
  const params = useParams<{
    projectId: string;
    format: string;
    scriptId: string;
  }>();
  const router = useRouter();

  const projectId = params?.projectId || "proj-produto-x";
  const formatSlug = (params?.format || "short_video") as ScriptFormatSlug;
  const scriptId = params?.scriptId || "scr-canon-01";

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/dashboard/editorial/${project.id}?aba=roteiros`}
          className="inline-flex items-center gap-2 rounded-la-md border border-white/12 bg-white/[0.03] px-3.5 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary transition-colors hover:border-la-border-gold hover:text-la-gold-light"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-la-gold" />
          <span>Voltar para Roteiros do Projeto ({project.name})</span>
        </Link>

        <span className="font-la-mono text-[0.6875rem] text-la-gold-light">
          Studio Dedicado do Roteiro • ID: {scriptId}
        </span>
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
        initialFormatSlug={formatSlug}
        initialScriptId={scriptId}
        isStandaloneStudioPage={true}
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