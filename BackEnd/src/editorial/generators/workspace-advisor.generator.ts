import { IEditorialProject } from '../schemas/models/editorial-project.interface';
import { IEditorialCalendar } from '../schemas/models/editorial-calendar.interface';
import { IEditorialTask } from '../schemas/models/editorial-task.interface';

export interface IAISuggestionItem {
  id: string;
  typeBadge: string;
  projectId: string;
  projectName: string;
  identifiedWhat: string;
  whyItMatters: string;
  actionLabel: string;
  actionHref: string;
}

export interface IWorkspaceInsightsOutput {
  aiSuggestions: IAISuggestionItem[];
  projectNextActions: Record<
    string,
    { nextActionLabel: string; nextActionReason: string }
  >;
}

/**
 * Port de geração de recomendações e prioridades estratégicas do Painel do Dia (Workspace).
 * Hoje implementado por StubWorkspaceAdvisorGenerator; substituível por adapter LLM via `useClass`.
 */
export abstract class WorkspaceAdvisorGenerator {
  abstract generateWorkspaceInsights(context: {
    projects: IEditorialProject[];
    calendars: IEditorialCalendar[];
    tasks: IEditorialTask[];
  }): Promise<IWorkspaceInsightsOutput>;
}
