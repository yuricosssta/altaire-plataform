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
import {
  EditorialCalendarService,
  CalendarSetup,
} from '../services/editorial-calendar.service';
import { IUpdateEditorialCalendar } from '../schemas/models/editorial-calendar.interface';
import {
  calendarSetupSchema,
  calendarPatchSchema,
  calendarItemUpdateSchema,
  calendarDuplicateSchema,
  createCalendarSlotSchema,
  CalendarSetupInput,
  CalendarPatchInput,
  CalendarItemUpdateInput,
  CalendarDuplicateInput,
  CreateCalendarSlotInput,
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
    return this.calendarService.create(projectId, data as CalendarSetup);
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
    return this.calendarService.update(
      calendarId,
      data as unknown as IUpdateEditorialCalendar,
    );
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

  @Post('calendars/:calendarId/slots')
  async addSlot(
    @Param('calendarId') calendarId: string,
    @Body(new ZodValidationPipe(createCalendarSlotSchema))
    data: CreateCalendarSlotInput,
  ) {
    return this.calendarService.addSlot(calendarId, data);
  }

  @Patch('calendars/:calendarId/items/:itemId')
  async updateItem(
    @Param('calendarId') calendarId: string,
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(calendarItemUpdateSchema))
    data: CalendarItemUpdateInput,
  ) {
    return this.calendarService.updateItem(calendarId, itemId, data as any);
  }

  @Delete('calendars/:calendarId/items/:itemId')
  async deleteItem(
    @Param('calendarId') calendarId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.calendarService.deleteItem(calendarId, itemId);
  }

  @Get('calendars/:calendarId/review')
  async getReview(@Param('calendarId') calendarId: string) {
    return this.calendarService.getReview(calendarId);
  }

  @Post('calendars/:calendarId/review')
  async generateReview(@Param('calendarId') calendarId: string) {
    return this.calendarService.getReview(calendarId);
  }
}
