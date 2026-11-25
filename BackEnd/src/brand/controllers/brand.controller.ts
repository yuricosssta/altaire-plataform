import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import { BrandService } from '../services/brand.service';
import {
  CreateBrandInput,
  createBrandSchema,
  UpdateBrandInput,
  updateBrandSchema,
} from '../validations/brand.zod';
import {
  UpsertBrandStoryInput,
  upsertBrandStorySchema,
} from '../../editorial/validations/editorial-brand-story.zod';

@Controller()
@UseGuards(AuthGuard)
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get('companies/:companyId/brands')
  findAllByCompany(@Param('companyId') companyId: string, @Req() req: any) {
    return this.brandService.findAllByCompany(companyId, req.user);
  }

  @Post('companies/:companyId/brands')
  create(
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(createBrandSchema)) body: CreateBrandInput,
    @Req() req: any,
  ) {
    return this.brandService.create(companyId, body, req.user);
  }

  @Get('brands/:brandId')
  findById(@Param('brandId') brandId: string, @Req() req: any) {
    return this.brandService.findById(brandId, req.user);
  }

  @Patch('brands/:brandId')
  update(
    @Param('brandId') brandId: string,
    @Body(new ZodValidationPipe(updateBrandSchema)) body: UpdateBrandInput,
    @Req() req: any,
  ) {
    return this.brandService.update(brandId, body, req.user);
  }

  @Delete('brands/:brandId')
  softDelete(@Param('brandId') brandId: string, @Req() req: any) {
    return this.brandService.softDelete(brandId, req.user);
  }

  @Get('brands/:brandId/brand-story')
  getBrandStory(@Param('brandId') brandId: string, @Req() req: any) {
    return this.brandService.getBrandStory(brandId, req.user);
  }

  @Put('brands/:brandId/brand-story')
  upsertBrandStory(
    @Param('brandId') brandId: string,
    @Body(new ZodValidationPipe(upsertBrandStorySchema))
    body: UpsertBrandStoryInput,
    @Req() req: any,
  ) {
    return this.brandService.upsertBrandStory(brandId, body as any, req.user);
  }
}
