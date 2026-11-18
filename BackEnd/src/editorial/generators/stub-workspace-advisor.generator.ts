import { Injectable } from '@nestjs/common';
import { IEditorialProject } from '../schemas/models/editorial-project.interface';
import { IEditorialCalendar } from '../schemas/models/editorial-calendar.interface';
import { IEditorialTask } from '../schemas/models/editorial-task.interface';
import {
  IAISuggestionItem,
  IWorkspaceInsightsOutput,
  WorkspaceAdvisorGenerator,
} from './workspace-advisor.generator';

@Injectable()
export class StubWorkspaceAdvisorGenerator extends WorkspaceAdvisorGenerator {
  async generateWorkspaceInsights(context: {
    projects: IEditorialProject[];
    calendars: IEditorialCalendar[];
    tasks: IEditorialTask[];
  }): Promise<IWorkspaceInsightsOutput> {
    // TODO(LLM): Analisar o estado global dos projetos editoriais, calendários ativos,
    // lacunas de temas/roteiros e tarefas pendentes para gerar sugestões explicáveis (aiSuggestions)
    // e a próxima ação recomendada (nextActionLabel / nextActionReason) por projeto.
    // Input: { projects: context.projects, calendars: context.calendars, tasks: context.tasks }
    // Output esperado: IWorkspaceInsightsOutput

    const aiSuggestions: IAISuggestionItem[] = [];
    const projectNextActions: Record<
      string,
      { nextActionLabel: string; nextActionReason: string }
    > = {};

    const activeOrReviewProjects = context.projects.filter(
      (p) => p.status !== 'archived' && p.isActive !== false,
    );

    for (const proj of activeOrReviewProjects) {
      const projId = String(proj.id || proj._id);
      const href = `/dashboard/editorial/${projId}`;
      const hasActiveLine =
        proj.hasActiveLineEditorial ?? proj.editorialLineStatus === 'active';
      const hasActiveCalendar =
        proj.hasActiveCalendar ?? proj.calendarStatus === 'active';

      if (!hasActiveLine) {
        projectNextActions[projId] = {
          nextActionLabel: 'Construa a Linha Editorial para dar contexto à IA',
          nextActionReason:
            'Conclua a promessa principal, ROMA, objeções do ICP e distribuição RETINA antes de gerar o calendário.',
        };
        aiSuggestions.push({
          id: `ai-line-${projId}`,
          typeBadge: 'ESTRUTURA ESTRATÉGICA · FUNÇÃO 01',
          projectId: projId,
          projectName: proj.name,
          identifiedWhat: `O projeto “${proj.name}” ainda não possui uma Linha Editorial ativa.`,
          whyItMatters: `Concluir a promessa, ICP e pilares de ${proj.niche} permite que a IA gere calendários e roteiros sem soar genérica.`,
          actionLabel: 'Concluir Linha Editorial',
          actionHref: `${href}?aba=linha-editorial`,
        });
      } else if (!hasActiveCalendar) {
        projectNextActions[projId] = {
          nextActionLabel:
            'Transforme sua estratégia em uma agenda editorial executável',
          nextActionReason:
            'Sua Linha Editorial está ativa, mas este projeto ainda não possui um Calendário Editorial vigente para distribuir os slots.',
        };
        aiSuggestions.push({
          id: `ai-cal-${projId}`,
          typeBadge: 'PLANEJAMENTO · FUNÇÃO 01',
          projectId: projId,
          projectName: proj.name,
          identifiedWhat: `A Linha Editorial de “${proj.name}” já está aprovada e pronta para virar agenda.`,
          whyItMatters: `Transformar a estratégia de ${proj.currentObjective.toLowerCase()} em um Calendário Editorial distribui os slots semanais dentro da sua capacidade real.`,
          actionLabel: 'Criar Calendário Editorial',
          actionHref: `${href}?aba=calendario`,
        });
      } else {
        projectNextActions[projId] = {
          nextActionLabel: 'Revisar slots e roteiros prioritários do ciclo',
          nextActionReason:
            'Mantenha os próximos slots do calendário com tema vinculado e roteiro aprovado para evitar gargalos de produção.',
        };
        aiSuggestions.push({
          id: `ai-opt-${projId}`,
          typeBadge: 'REVISÃO DE CALENDÁRIO & TEMAS',
          projectId: projId,
          projectName: proj.name,
          identifiedWhat: `Seu calendário ativo em “${proj.name}” possui oportunidades de temas para a fase atual.`,
          whyItMatters: `Reforçar conteúdos de Níveis de Consciência e Transformação acelera o objetivo de ${proj.currentObjective.toLowerCase()}.`,
          actionLabel: 'Revisar slots e temas',
          actionHref: `${href}?aba=temas`,
        });
      }
    }

    return {
      aiSuggestions: aiSuggestions.slice(0, 4),
      projectNextActions,
    };
  }
}
