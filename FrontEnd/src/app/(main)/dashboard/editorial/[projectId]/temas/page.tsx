// FrontEnd/src/app/(main)/dashboard/editorial/[projectId]/temas/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TemasEditorialModule } from "@/components/editorial/workspace/TemasEditorialModule";
import { useEditorialWorkspace } from "@/lib/context/EditorialWorkspaceContext";

export default function TemasDedicatedStudioPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const subabaParam = searchParams?.get("subaba") as
    | "gerar"
    | "mapa"
    | "integracao"
    | null;
  const modoParam = searchParams?.get("modo") as
    | "hub"
    | "roma_avatar"
    | "dados_mercado"
    | "objetivo_momento"
    | null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/editorial/${project.id}?aba=temas`}
          className="inline-flex items-center gap-2 rounded-la-md border border-white/12 bg-white/[0.03] px-3.5 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary transition-colors hover:border-la-border-gold hover:text-la-gold-light"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-la-gold" />
          <span>Voltar ao Workspace do Projeto ({project.name})</span>
        </Link>
      </div>

      <TemasEditorialModule
        projectId={project.id}
        projectName={project.name}
        projectNiche={project.niche}
        projectSubniche={project.subniche}
        projectObjective={project.currentObjectiveLabel}
        currentPhase={project.currentPhaseLabel}
        hasActiveLine={project.hasActiveLineEditorial}
        hasActiveCalendar={project.hasActiveCalendar}
        initialSubTab={subabaParam || "gerar"}
        initialGeneratorMode={modoParam || "hub"}
        isStandalonePage={true}
        onGoToLineTab={() =>
          router.push(`/dashboard/editorial/${project.id}?aba=linha-editorial`)
        }
        onGoToCalendarTab={() =>
          router.push(`/dashboard/editorial/${project.id}?aba=calendario`)
        }
        onGoToScriptsTab={(_slotId, themeTitle) =>
          router.push(
            `/dashboard/editorial/${project.id}?aba=roteiros${  
              themeTitle ? `&tema=${encodeURIComponent(themeTitle)}` : ""
            }`
          )
        }
      />
    </div>
  );
}