// FrontEnd/src/app/(main)/dashboard/editorial/[projectId]/linha-editorial/onboarding/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LinhaEditorialModule } from "@/components/editorial/workspace/LinhaEditorialModule";
import { useEditorialWorkspace } from "@/lib/context/EditorialWorkspaceContext";

export default function LinhaEditorialOnboardingPage() {
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
      currentPhaseLabel: "Aquecimento",
    };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/editorial/${project.id}?aba=linha-editorial`}
          className="inline-flex items-center gap-2 rounded-la-md border border-white/12 bg-white/[0.03] px-3.5 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary transition-colors hover:border-la-border-gold hover:text-la-gold-light"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-la-gold" />
          <span>Voltar ao Workspace do Projeto</span>
        </Link>
      </div>

      <LinhaEditorialModule
        projectId={project.id}
        projectName={project.name}
        projectNiche={project.niche}
        projectSubniche={project.subniche}
        projectObjective={project.currentObjectiveLabel}
        currentPhase={project.currentPhaseLabel}
        initialView="onboarding"
        onGoToCalendarTab={() =>
          router.push(`/dashboard/editorial/${project.id}?aba=calendario`)
        }
      />
    </div>
  );
}