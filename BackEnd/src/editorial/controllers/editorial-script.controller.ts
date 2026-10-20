import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import { GetUser } from '../../shared/decorators/get-user-decorator';
import { EditorialScriptService } from '../services/editorial-script.service';
import { EditorialBrandStoryService } from '../services/editorial-brand-story.service';
import {
  addAttachmentSchema,
  AddAttachmentInput,
  createScriptSchema,
  CreateScriptInput,
  createVersionSchema,
  CreateVersionInput,
  generateScriptSchema,
  GenerateScriptInput,
  regenerateBlockSchema,
  RegenerateBlockInput,
  updateScriptSchema,
  UpdateScriptInput,
} from '../validations/editorial-script.zod';
import {
  upsertBrandStorySchema,
  UpsertBrandStoryInput,
} from '../validations/editorial-brand-story.zod';
import { ContentFormat } from '../schemas/models/editorial-calendar.interface';

@UseGuards(AuthGuard)
@Controller('editorial')
export class EditorialScriptController {
  constructor(
    private readonly scriptService: EditorialScriptService,
    private readonly brandStoryService: EditorialBrandStoryService,
  ) {}

  @Get('projects/:projectId/scripts')
  async findAll(
    @Param('projectId') projectId: string,
    @Query('format') format?: ContentFormat,
  ) {
    return this.scriptService.findAll(projectId, format);
  }

  @Post('projects/:projectId/scripts')
  async create(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(createScriptSchema)) data: CreateScriptInput,
    @GetUser() userId: string,
  ) {
    return this.scriptService.create(projectId, userId, data);
  }

  // --- Rotas literais (devem vir antes de :scriptId) ---

  @Get('projects/:projectId/scripts/slots/:format')
  async listSlots(
    @Param('projectId') projectId: string,
    @Param('format') format: ContentFormat,
  ) {
    return this.scriptService.listSlotsByFormat(projectId, format);
  }

  @Get('projects/:projectId/scripts/themes/:format')
  async listThemes(
    @Param('projectId') projectId: string,
    @Param('format') format: ContentFormat,
  ) {
    return this.scriptService.listThemesByFormat(projectId, format);
  }

  @Get('projects/:projectId/scripts/brand-story')
  async getBrandStory(
    @Param('projectId') _projectId: string,
    @GetUser() userId: string,
  ) {
    return this.brandStoryService.get(userId);
  }

  @Put('projects/:projectId/scripts/brand-story')
  async updateBrandStory(
    @Param('projectId') _projectId: string,
    @Body(new ZodValidationPipe(upsertBrandStorySchema))
    data: UpsertBrandStoryInput,
    @GetUser() userId: string,
  ) {
    return this.brandStoryService.upsert(userId, 'altaire', data as any);
  }

  // --- Rotas parametrizadas por :scriptId ---

  @Get('projects/:projectId/scripts/:scriptId')
  async findById(
    @Param('projectId') _projectId: string,
    @Param('scriptId') scriptId: string,
  ) {
    return this.scriptService.findById(scriptId);
  }

  @Patch('projects/:projectId/scripts/:scriptId')
  async update(
    @Param('projectId') _projectId: string,
    @Param('scriptId') scriptId: string,
    @Body(new ZodValidationPipe(updateScriptSchema)) data: UpdateScriptInput,
  ) {
    return this.scriptService.update(scriptId, data);
  }

  @Delete('projects/:projectId/scripts/:scriptId')
  async delete(
    @Param('projectId') _projectId: string,
    @Param('scriptId') scriptId: string,
  ) {
    return this.scriptService.delete(scriptId);
  }

  @Post('projects/:projectId/scripts/:scriptId/generate')
  async generate(
    @Param('projectId') projectId: string,
    @Param('scriptId') scriptId: string,
    @Body(new ZodValidationPipe(generateScriptSchema))
    data: GenerateScriptInput,
  ) {
    return this.scriptService.generate(projectId, scriptId, data.briefing);
  }

  @Post('projects/:projectId/scripts/:scriptId/duplicate')
  async duplicate(
    @Param('projectId') _projectId: string,
    @Param('scriptId') scriptId: string,
    @GetUser() userId: string,
  ) {
    return this.scriptService.duplicate(scriptId, userId);
  }

  @Get('projects/:projectId/scripts/:scriptId/export')
  async export(
    @Param('projectId') _projectId: string,
    @Param('scriptId') scriptId: string,
  ) {
    return this.scriptService.export(scriptId);
  }

  @Get('projects/:projectId/scripts/:scriptId/versions')
  async listVersions(
    @Param('projectId') _projectId: string,
    @Param('scriptId') scriptId: string,
  ) {
    return this.scriptService.listVersions(scriptId);
  }

  @Post('projects/:projectId/scripts/:scriptId/versions')
  async createVersion(
    @Param('projectId') _projectId: string,
    @Param('scriptId') scriptId: string,
    @Body(new ZodValidationPipe(createVersionSchema)) data: CreateVersionInput,
    @GetUser() userId: string,
  ) {
    return this.scriptService.createVersion(scriptId, userId, data.comment);
  }

  @Get('projects/:projectId/scripts/:scriptId/attachments')
  async listAttachments(
    @Param('projectId') _projectId: string,
    @Param('scriptId') scriptId: string,
  ) {
    return this.scriptService.listAttachments(scriptId);
  }

  @Post('projects/:projectId/scripts/:scriptId/attachments')
  async addAttachment(
    @Param('projectId') _projectId: string,
    @Param('scriptId') scriptId: string,
    @Body(new ZodValidationPipe(addAttachmentSchema)) data: AddAttachmentInput,
  ) {
    return this.scriptService.addAttachment(scriptId, data);
  }

  @Delete('projects/:projectId/scripts/:scriptId/attachments/:attachmentId')
  async removeAttachment(
    @Param('projectId') _projectId: string,
    @Param('scriptId') scriptId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.scriptService.removeAttachment(scriptId, attachmentId);
  }

  @Post('projects/:projectId/scripts/:scriptId/blocks/:blockId/regenerate')
  async regenerateBlock(
    @Param('projectId') _projectId: string,
    @Param('scriptId') scriptId: string,
    @Param('blockId') blockId: string,
    @Body(new ZodValidationPipe(regenerateBlockSchema))
    data: RegenerateBlockInput,
  ) {
    return this.scriptService.regenerateBlock(scriptId, blockId, data.context);
  }
}
