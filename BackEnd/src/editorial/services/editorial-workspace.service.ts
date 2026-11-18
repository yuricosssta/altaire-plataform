import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { EditorialProjectService } from './editorial-project.service';
import { EditorialCalendarRepository } from '../repositories/editorial-calendar.repository';
import { EditorialTaskRepository } from '../repositories/editorial-task.repository';
import { EditorialActivityRepository } from '../repositories/editorial-activity.repository';
import { WorkspaceAdvisorGenerator } from '../generators/workspace-advisor.generator';
import { IEditorialTask } from '../schemas/models/editorial-task.interface';
import { IEditorialActivityLog } from '../schemas/models/editorial-activity.interface';
import {
  CreateWorkspaceTaskInput,
  UpdateWorkspaceTaskInput,
} from '../validations/editorial-workspace.zod';

export interface WorkspaceSlotSummary {
  id: string;
  calendarId: string;
  projectId: string;
  projectName: string;
  date: string;
  scheduledTime: string;
  format: string;
  formatLabel: string;
  platform: string;
  retinaBadge: string;
  mainTheme: string;
  provisionalTitle: string;
  status: string;
  pillar?: string;
}

export interface OperationalAlert {
  id: string;
  severity: 'urgent' | 'warning' | 'info';
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

@Injectable()
export class EditorialWorkspaceService {
  constructor(
    private readonly projectService: EditorialProjectService,
    private readonly calendarRepository: EditorialCalendarRepository,
    private readonly taskRepository: EditorialTaskRepository,
    private readonly activityRepository: EditorialActivityRepository,
    @Optional()
    private readonly workspaceAdvisor?: WorkspaceAdvisorGenerator,
  ) {}

  async getOverview(
    orgId: string,
    userId?: string,
    allowedProjectIds?: string[],
  ) {
    const projects = await this.projectService.findAll(
      orgId,
      Array.isArray(allowedProjectIds) ? undefined : userId,
      allowedProjectIds,
    );

    const projectIds = projects
      .map((p) => String((p as any)._id || (p as any).id || ''))
      .filter(Boolean);

    const [calendars, tasks, recentActivity] = await Promise.all([
      this.calendarRepository.findAllByProjects(projectIds),
      this.taskRepository.findAll(orgId, userId),
      this.activityRepository.findRecent(orgId, userId, undefined, 25),
    ]);

    const projectById = new Map(
      projects.map((p) => [String((p as any)._id || (p as any).id), p]),
    );

    const now = new Date();
    const todayYmd = now.toISOString().slice(0, 10);
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const in48hYmd = in48h.toISOString().slice(0, 10);

    const todaySlots: WorkspaceSlotSummary[] = [];
    const upcoming48hSlots: WorkspaceSlotSummary[] = [];

    for (const cal of calendars) {
      if (cal.status === 'archived') continue;
      const calId = String((cal as any)._id || (cal as any).id || '');
      const projectId = String(cal.projectId);
      const proj = projectById.get(projectId);
      const projectName = proj?.brandOrClientName || proj?.name || 'Projeto';

      if (Array.isArray(cal.slots) && cal.slots.length > 0) {
        for (const s of cal.slots) {
          const slot = s as Record<string, any>;
          const dateStr = String(slot.date || '').slice(0, 10);
          const summary: WorkspaceSlotSummary = {
            id: String(slot.id || slot._id || ''),
            calendarId: calId,
            projectId,
            projectName,
            date: dateStr || todayYmd,
            scheduledTime: String(slot.scheduledTime || '12:00'),
            format: String(slot.format || 'reel'),
            formatLabel: String(slot.formatLabel || slot.format || 'Reels'),
            platform: String(slot.platform || 'Instagram'),
            retinaBadge: String(slot.retinaBadge || 'Autoridade'),
            mainTheme: String(slot.mainTheme || slot.theme || ''),
            provisionalTitle: String(
              slot.provisionalTitle ||
                slot.provisionalName ||
                slot.mainTheme ||
                'Conteúdo planejado',
            ),
            status: String(slot.status || 'planned'),
            pillar: slot.editorialPillar || slot.pillar,
          };
          if (dateStr === todayYmd) {
            todaySlots.push(summary);
          } else if (dateStr > todayYmd && dateStr <= in48hYmd) {
            upcoming48hSlots.push(summary);
          }
        }
      } else {
        for (const day of cal.days || []) {
          const dateStr = day.date
            ? new Date(day.date).toISOString().slice(0, 10)
            : '';
          for (const item of day.items || []) {
            const summary: WorkspaceSlotSummary = {
              id: String(item.id || item._id || ''),
              calendarId: calId,
              projectId,
              projectName,
              date: dateStr || todayYmd,
              scheduledTime: item.suggestedTime || '12:00',
              format: item.format,
              formatLabel: item.format,
              platform: item.platforms?.[0] || 'instagram',
              retinaBadge: item.retinaType,
              mainTheme: item.theme || '',
              provisionalTitle:
                item.provisionalName || item.theme || 'Conteúdo planejado',
              status: item.status,
              pillar: item.pillar,
            };
            if (dateStr === todayYmd) {
              todaySlots.push(summary);
            } else if (dateStr > todayYmd && dateStr <= in48hYmd) {
              upcoming48hSlots.push(summary);
            }
          }
        }
      }
    }

    const operationalAlerts: OperationalAlert[] = [];
    for (const p of projects) {
      const pid = String((p as any)._id || (p as any).id);
      const pname = p.brandOrClientName || p.name;
      if (!p.hasActiveLineEditorial) {
        operationalAlerts.push({
          id: `alert-line-${pid}`,
          severity: 'warning',
          projectId: pid,
          projectName: pname,
          title: 'Linha Editorial pendente',
          description:
            'Este projeto ainda não possui uma Linha Editorial ativa para embasar os temas e roteiros.',
          actionLabel: 'Estruturar Linha Editorial',
          actionHref: `/dashboard/editorial/${pid}?tab=linha`,
        });
      } else if (!p.hasActiveCalendar) {
        operationalAlerts.push({
          id: `alert-cal-${pid}`,
          severity: 'info',
          projectId: pid,
          projectName: pname,
          title: 'Nenhum calendário editorial ativo',
          description:
            'Configure o calendário do ciclo para distribuir seus formatos e ritmo de postagem.',
          actionLabel: 'Criar Calendário',
          actionHref: `/dashboard/editorial/${pid}?tab=calendario`,
        });
      }
    }

    for (const slot of [...todaySlots, ...upcoming48hSlots]) {
      if (!slot.mainTheme && !slot.provisionalTitle) {
        operationalAlerts.push({
          id: `alert-slot-${slot.id}`,
          severity: 'urgent',
          projectId: slot.projectId,
          projectName: slot.projectName,
          title: `Slot próximo sem tema (${slot.formatLabel})`,
          description: `Publicação prevista para ${slot.date} às ${slot.scheduledTime} sem tema vinculado.`,
          actionLabel: 'Vincular tema',
          actionHref: `/dashboard/editorial/${slot.projectId}?tab=temas`,
        });
      }
    }

    const insights = this.workspaceAdvisor
      ? await this.workspaceAdvisor.generateWorkspaceInsights({
          projects,
          calendars,
          tasks,
        })
      : { aiSuggestions: [], projectNextActions: {} };

    const enrichedProjects = projects.map((p) => {
      const pid = String((p as any)._id || (p as any).id);
      const computedNext = insights.projectNextActions[pid];
      return {
        ...p,
        nextActionLabel: p.nextActionLabel || computedNext?.nextActionLabel,
        nextActionReason: p.nextActionReason || computedNext?.nextActionReason,
      };
    });

    return {
      projects: enrichedProjects,
      todaySlots,
      upcoming48hSlots,
      operationalAlerts,
      aiSuggestions: insights.aiSuggestions,
      tasks,
      recentActivity,
    };
  }

  async listTasks(
    orgId: string,
    userId?: string,
    projectId?: string,
  ): Promise<IEditorialTask[]> {
    return this.taskRepository.findAll(orgId, userId, projectId);
  }

  async createTask(
    orgId: string,
    userId: string,
    input: CreateWorkspaceTaskInput,
  ): Promise<IEditorialTask> {
    return this.taskRepository.create({
      orgId,
      userId,
      projectId: input.projectId,
      title: input.title,
      dueLabel: input.dueLabel || 'Hoje',
      dueCategory: input.dueCategory || 'today',
      origin: input.origin || 'Manual',
      completed: Boolean(input.completed ?? input.isDone),
      postponed: Boolean(input.postponed),
      resourceLabel: input.resourceLabel,
    });
  }

  async updateTask(
    taskId: string,
    input: UpdateWorkspaceTaskInput,
  ): Promise<IEditorialTask> {
    const updated = await this.taskRepository.update(taskId, {
      title: input.title,
      dueLabel: input.dueLabel,
      dueCategory: input.dueCategory,
      completed: input.completed !== undefined ? input.completed : input.isDone,
      postponed: input.postponed,
      resourceLabel: input.resourceLabel,
    });
    if (!updated) throw new NotFoundException('Tarefa não encontrada.');
    return updated;
  }

  async deleteTask(taskId: string): Promise<{ message: string }> {
    const deleted = await this.taskRepository.softDelete(taskId);
    if (!deleted) throw new NotFoundException('Tarefa não encontrada.');
    return { message: 'Tarefa removida com sucesso.' };
  }

  async listActivity(
    orgId: string,
    userId?: string,
    projectId?: string,
    limit = 30,
  ): Promise<IEditorialActivityLog[]> {
    return this.activityRepository.findRecent(orgId, userId, projectId, limit);
  }
}
