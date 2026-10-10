import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import { GetUser } from '../../shared/decorators/get-user-decorator';
import { EditorialCalendarService } from '../services/editorial-calendar.service';
import {
  calendarSetupSchema,
  calendarPatchSchema,
  calendarItemUpdateSchema,
  calendarDuplicateSchema,
  CalendarSetupInput,
  CalendarPatchInput,
  CalendarItemUpdateInput,
  CalendarDuplicateInput,
} from '../validations/editorial-calendar.zod';

@UseGuards(AuthGuard)
@Controller('editorial')
export class EditorialCalendarController {
  constructor(private readonly calendarService: EditorialCalendarService) {}

  @Get('projects/:projectId/calendars')
  async findAll(@Param('projectId') projectId: string) {
    return this.calendarService.findByProjectId(projectId);
  }

  @Post('projects/:projectId/calendars')
  async create(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(calendarSetupSchema)) data: CalendarSetupInput,
  ) {
    return this.calendarService.create(projectId, data);
  }

  @Get('calendars/:calendarId')
  async findById(@Param('calendarId') calendarId: string) {
    return this.calendarService.findById(calendarId);
  }

  @Patch('calendars/:calendarId')
  async update(
    @Param('calendarId') calendarId: string,
    @Body(new ZodValidationPipe(calendarPatchSchema)) data: CalendarPatchInput,
  ) {
    return this.calendarService.update(calendarId, data);
  }

  @Delete('calendars/:calendarId')
  async delete(@Param('calendarId') calendarId: string) {
    return this.calendarService.delete(calendarId);
  }

  @Post('calendars/:calendarId/duplicate')
  async duplicate(
    @Param('calendarId') calendarId: string,
    @Body(new ZodValidationPipe(calendarDuplicateSchema))
    data: CalendarDuplicateInput,
  ) {
    return this.calendarService.duplicate(calendarId, data);
  }

  @Patch('calendars/:calendarId/items/:itemId')
  async updateItem(
    @Param('calendarId') calendarId: string,
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(calendarItemUpdateSchema))
    data: CalendarItemUpdateInput,
  ) {
    return this.calendarService.updateItem(calendarId, itemId, data);
  }

  @Get('calendars/:calendarId/review')
  async getReview(@Param('calendarId') calendarId: string) {
    return this.calendarService.getReview(calendarId);
  }
}
