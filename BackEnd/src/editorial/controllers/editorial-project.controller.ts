import {
  Body,
  Controller,
  Delete,
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

@UseGuards(AuthGuard)
@Controller('editorial/projects')
export class EditorialProjectController {
  constructor(
    private readonly projectService: EditorialProjectService,
    private readonly versionService: EditorialVersionService,
  ) {}

  @Get()
  async findAll() {
    return this.projectService.findAll('altaire');
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.projectService.findById(id);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createProjectSchema)) data: CreateProject,
    @GetUser('sub') userId: string,
  ) {
    return this.projectService.create({
      ...data,
      createdBy: userId,
    } as ICreateEditorialProject);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProjectSchema)) data: UpdateProject,
  ) {
    return this.projectService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.projectService.delete(id);
  }

  @Post(':projectId/onboarding')
  async submitOnboarding(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(onboardingSchema)) data: OnboardingInput,
    @GetUser('sub') userId: string,
  ) {
    return this.versionService.createFromOnboarding(projectId, data, userId);
  }

  @Get(':projectId/versions')
  async listVersions(@Param('projectId') projectId: string) {
    return this.versionService.findByProjectId(projectId);
  }
}
