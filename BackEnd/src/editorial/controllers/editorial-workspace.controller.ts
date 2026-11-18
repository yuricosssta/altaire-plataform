import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import { GetUser } from '../../shared/decorators/get-user-decorator';
import { isClientOrExternalRole } from '../../shared/utils/org-role.util';
import { EditorialWorkspaceService } from '../services/editorial-workspace.service';
import {
  createWorkspaceTaskSchema,
  updateWorkspaceTaskSchema,
  CreateWorkspaceTaskInput,
  UpdateWorkspaceTaskInput,
} from '../validations/editorial-workspace.zod';

@UseGuards(AuthGuard)
@Controller('editorial/workspace')
export class EditorialWorkspaceController {
  constructor(private readonly workspaceService: EditorialWorkspaceService) {}

  @Get()
  async getOverview(@GetUser() user: any) {
    const userId = typeof user === 'string' ? user : user?.sub;
    const allowedProjects =
      isClientOrExternalRole(user?.role) && Array.isArray(user?.allowedProjects)
        ? user.allowedProjects.map(String)
        : undefined;
    return this.workspaceService.getOverview(
      'altaire',
      userId,
      allowedProjects,
    );
  }

  @Get('tasks')
  async listTasks(
    @GetUser() user: any,
    @Query('projectId') projectId?: string,
  ) {
    const userId = typeof user === 'string' ? user : user?.sub;
    return this.workspaceService.listTasks('altaire', userId, projectId);
  }

  @Post('tasks')
  async createTask(
    @Body(new ZodValidationPipe(createWorkspaceTaskSchema))
    data: CreateWorkspaceTaskInput,
    @GetUser() user: any,
  ) {
    const userId = typeof user === 'string' ? user : user?.sub;
    return this.workspaceService.createTask('altaire', userId, data);
  }

  @Patch('tasks/:taskId')
  async updateTask(
    @Param('taskId') taskId: string,
    @Body(new ZodValidationPipe(updateWorkspaceTaskSchema))
    data: UpdateWorkspaceTaskInput,
  ) {
    return this.workspaceService.updateTask(taskId, data);
  }

  @Delete('tasks/:taskId')
  async deleteTask(@Param('taskId') taskId: string) {
    return this.workspaceService.deleteTask(taskId);
  }

  @Get('activity')
  async listActivity(
    @GetUser() user: any,
    @Query('projectId') projectId?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = typeof user === 'string' ? user : user?.sub;
    const parsedLimit = limit ? Math.min(100, Math.max(1, Number(limit))) : 30;
    return this.workspaceService.listActivity(
      'altaire',
      userId,
      projectId,
      parsedLimit,
    );
  }
}
