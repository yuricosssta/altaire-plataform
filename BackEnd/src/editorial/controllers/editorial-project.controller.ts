import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
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
import { isClientOrExternalRole } from '../../shared/utils/org-role.util';

@UseGuards(AuthGuard)
@Controller('editorial/projects')
export class EditorialProjectController {
  constructor(
    private readonly projectService: EditorialProjectService,
    private readonly versionService: EditorialVersionService,
  ) { }

  @Get()
  async findAll(
    @Headers('x-company-id') companyId: string,
    @Query('brandId') brandId: string | undefined,
    @Req() req: any,
  ) {
    if (!companyId) {
      throw new BadRequestException(
        'O cabeçalho x-company-id é obrigatório para listar projetos.',
      );
    }
    return this.projectService.findAll(companyId, req.user, brandId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.projectService.findById(id, req.user);
  }

  @Post()
  async create(
    @Headers('x-company-id') companyId: string,
    @Body(new ZodValidationPipe(createProjectSchema)) data: CreateProject,
    @Req() req: any,
  ) {
    if (!companyId) {
      throw new BadRequestException(
        'O cabeçalho x-company-id é obrigatório para criar projetos.',
      );
    }
    return this.projectService.create(companyId, data as any, req.user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProjectSchema)) data: UpdateProject,
    @Req() req: any,
  ) {
    return this.projectService.update(id, data as any, req.user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.projectService.delete(id, req.user);
  }

  @Post(':projectId/onboarding')
  async submitOnboarding(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(onboardingSchema)) data: OnboardingInput,
    @Req() req: any,
  ) {
    if (isClientOrExternalRole(req.user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para alterar o onboarding do projeto.',
      );
    }
    await this.projectService.findById(projectId, req.user);
    const userId = String(req.user?.sub || req.user?.id || '');
    return this.versionService.createFromOnboarding(projectId, data, userId);
  }

  @Get(':projectId/versions')
  async listVersions(
    @Param('projectId') projectId: string,
    @Req() req: any,
  ) {
    await this.projectService.findById(projectId, req.user);
    return this.versionService.findByProjectId(projectId);
  }
}
