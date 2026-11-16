import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import { GetUser } from '../../shared/decorators/get-user-decorator';
import { EditorialProjectService } from '../services/editorial-project.service';
import { EditorialVersionService } from '../services/editorial-version.service';
import {
  createProjectSchema,
  updateProjectSchema,
  CreateProject,
  UpdateProject,
} from '../validations/editorial-project.zod';
import {
  onboardingSchema,
  OnboardingInput,
} from '../validations/onboarding.zod';
import { ICreateEditorialProject } from '../schemas/models/editorial-project.interface';
import { isClientOrExternalRole } from '../../shared/utils/org-role.util';

@UseGuards(AuthGuard)
@Controller('editorial/projects')
export class EditorialProjectController {
  constructor(
    private readonly projectService: EditorialProjectService,
    private readonly versionService: EditorialVersionService,
  ) {}

  @Get()
  async findAll(@GetUser() user: any) {
    const userId = typeof user === 'string' ? user : user?.sub;
    if (isClientOrExternalRole(user?.role)) {
      const allowedProjects = Array.isArray(user?.allowedProjects)
        ? user.allowedProjects.map(String)
        : [];
      return this.projectService.findAll('altaire', undefined, allowedProjects);
    }
    return this.projectService.findAll('altaire', userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @GetUser() user: any) {
    const userId = typeof user === 'string' ? user : user?.sub;
    if (isClientOrExternalRole(user?.role)) {
      const allowedProjects = Array.isArray(user?.allowedProjects)
        ? user.allowedProjects.map(String)
        : [];
      return this.projectService.findById(id, userId, allowedProjects);
    }
    return this.projectService.findById(id, userId);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createProjectSchema)) data: CreateProject,
    @GetUser() user: any,
  ) {
    if (isClientOrExternalRole(user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para criar projetos.',
      );
    }
    const userId = typeof user === 'string' ? user : user?.sub;
    return this.projectService.create({
      ...data,
      createdBy: userId,
    } as ICreateEditorialProject);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProjectSchema)) data: UpdateProject,
    @GetUser() user: any,
  ) {
    if (isClientOrExternalRole(user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para editar configurações do projeto.',
      );
    }
    return this.projectService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @GetUser() user: any) {
    if (isClientOrExternalRole(user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para excluir projetos.',
      );
    }
    return this.projectService.delete(id);
  }

  @Post(':projectId/onboarding')
  async submitOnboarding(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(onboardingSchema)) data: OnboardingInput,
    @GetUser() user: any,
  ) {
    if (isClientOrExternalRole(user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para alterar o onboarding do projeto.',
      );
    }
    const userId = typeof user === 'string' ? user : user?.sub;
    return this.versionService.createFromOnboarding(projectId, data, userId);
  }

  @Get(':projectId/versions')
  async listVersions(@Param('projectId') projectId: string) {
    return this.versionService.findByProjectId(projectId);
  }
}
