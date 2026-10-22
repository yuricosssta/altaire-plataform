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
import { EditorialThemeService } from '../services/editorial-theme.service';
import {
  assignThemeSchema,
  AssignThemeInput,
  bulkStatusSchema,
  BulkStatusInput,
  calendarSuggestionsRequestSchema,
  CalendarSuggestionsRequestInput,
  generateMoreSchema,
  GenerateMoreInput,
  generationRequestSchema,
  GenerationRequestInput,
  rebalanceRequestSchema,
  RebalanceRequestInput,
  saveVersionSchema,
  SaveVersionInput,
  simulateRequestSchema,
  SimulateRequestInput,
  themeUpdateSchema,
  ThemeUpdateInput,
} from '../validations/editorial-theme.zod';
import { ContentFormat } from '../schemas/models/editorial-calendar.interface';
import { ThemeStatus } from '../schemas/models/editorial-theme.interface';

@UseGuards(AuthGuard)
@Controller('editorial')
export class EditorialThemeController {
  constructor(private readonly themeService: EditorialThemeService) {}

  @Get('projects/:projectId/themes')
  async findAll(
    @Param('projectId') projectId: string,
    @Query('status') status?: string,
    @Query('format') format?: ContentFormat,
    @Query('batchId') batchId?: string,
  ) {
    const statuses = status ? (status.split(',') as ThemeStatus[]) : undefined;
    return this.themeService.findAll(projectId, {
      status: statuses,
      format,
      batchId,
    });
  }

  @Post('projects/:projectId/themes')
  async generate(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(generationRequestSchema))
    data: GenerationRequestInput,
    @GetUser() userId: string,
  ) {
    return this.themeService.generate(projectId, data as any, userId);
  }

  @Get('projects/:projectId/themes/pillars')
  async detectPillars(@Param('projectId') projectId: string) {
    return this.themeService.detectPillars(projectId);
  }

  @Post('projects/:projectId/themes/bulk-status')
  async bulkStatus(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(bulkStatusSchema)) data: BulkStatusInput,
  ) {
    return this.themeService.bulkUpdateStatus(
      projectId,
      data.themeIds,
      data.status,
    );
  }

  @Post('projects/:projectId/themes/calendar-suggestions')
  async calendarSuggestions(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(calendarSuggestionsRequestSchema))
    data: CalendarSuggestionsRequestInput,
  ) {
    return this.themeService.calendarSuggestions(projectId, data.calendarId);
  }

  @Post('projects/:projectId/themes/calendars/:calendarId/assign')
  async assignTheme(
    @Param('projectId') projectId: string,
    @Param('calendarId') calendarId: string,
    @Body(new ZodValidationPipe(assignThemeSchema)) data: AssignThemeInput,
  ) {
    return this.themeService.assignTheme(projectId, calendarId, data);
  }

  @Get('projects/:projectId/themes/calendars/:calendarId/balance')
  async getBalance(
    @Param('projectId') projectId: string,
    @Param('calendarId') calendarId: string,
  ) {
    return this.themeService.getBalance(projectId, calendarId);
  }

  @Post('projects/:projectId/themes/calendars/:calendarId/rebalance')
  async rebalance(
    @Param('projectId') projectId: string,
    @Param('calendarId') calendarId: string,
    @Body(new ZodValidationPipe(rebalanceRequestSchema))
    data: RebalanceRequestInput,
  ) {
    return this.themeService.rebalance(projectId, calendarId, data);
  }

  @Post('projects/:projectId/themes/calendars/:calendarId/simulate')
  async simulate(
    @Param('projectId') projectId: string,
    @Param('calendarId') calendarId: string,
    @Body(new ZodValidationPipe(simulateRequestSchema))
    data: SimulateRequestInput,
  ) {
    return this.themeService.simulate(projectId, calendarId, data);
  }

  @Get('projects/:projectId/themes/calendars/:calendarId/versions')
  async listVersions(
    @Param('projectId') _projectId: string,
    @Param('calendarId') calendarId: string,
  ) {
    return this.themeService.listVersions(calendarId);
  }

  @Post('projects/:projectId/themes/calendars/:calendarId/versions')
  async saveVersion(
    @Param('projectId') projectId: string,
    @Param('calendarId') calendarId: string,
    @Body(new ZodValidationPipe(saveVersionSchema)) data: SaveVersionInput,
  ) {
    return this.themeService.saveVersion(projectId, calendarId, data);
  }

  @Post('projects/:projectId/themes/:themeId/generate-more')
  async generateMore(
    @Param('projectId') projectId: string,
    @Param('themeId') themeId: string,
    @Body(new ZodValidationPipe(generateMoreSchema)) data: GenerateMoreInput,
  ) {
    return this.themeService.generateMore(projectId, themeId, data);
  }

  @Patch('projects/:projectId/themes/:themeId')
  async update(
    @Param('projectId') _projectId: string,
    @Param('themeId') themeId: string,
    @Body(new ZodValidationPipe(themeUpdateSchema)) data: ThemeUpdateInput,
  ) {
    return this.themeService.update(themeId, data as any);
  }

  @Delete('projects/:projectId/themes/:themeId')
  async delete(
    @Param('projectId') _projectId: string,
    @Param('themeId') themeId: string,
  ) {
    return this.themeService.delete(themeId);
  }
}
