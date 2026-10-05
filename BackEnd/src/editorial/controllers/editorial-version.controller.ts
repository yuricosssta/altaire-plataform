import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import { GetUser } from '../../shared/decorators/get-user-decorator';
import { EditorialVersionService } from '../services/editorial-version.service';
import {
  updateVersionSchema,
  UpdateVersion,
} from '../validations/editorial-version.zod';

@UseGuards(AuthGuard)
@Controller('editorial/versions')
export class EditorialVersionController {
  constructor(private readonly versionService: EditorialVersionService) {}

  @Get(':versionId/mapa')
  async getMapa(@Param('versionId') versionId: string) {
    return this.versionService.findMapa(versionId);
  }

  @Post(':versionId/duplicate')
  async duplicate(
    @Param('versionId') versionId: string,
    @GetUser('sub') userId: string,
  ) {
    return this.versionService.duplicate(versionId, userId);
  }

  @Patch(':versionId')
  async update(
    @Param('versionId') versionId: string,
    @Body(new ZodValidationPipe(updateVersionSchema)) data: UpdateVersion,
  ) {
    return this.versionService.update(versionId, data);
  }

  @Delete(':versionId')
  async delete(@Param('versionId') versionId: string) {
    return this.versionService.delete(versionId);
  }
}
