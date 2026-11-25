import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StorageService } from '../services/storage.service';
import { GetPresignedUrlDto } from '../dto/get-presigned-url.dto';
import { IFileAsset } from '../dto/storage.interface';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('storage')
@UseGuards(AuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presigned-url')
  async getUploadUrl(
    @Headers('x-company-id') companyId: string,
    @Body() dto: GetPresignedUrlDto,
    @Req() req: any,
  ) {
    if (!companyId) {
      throw new BadRequestException(
        'Contexto da empresa (x-company-id) é obrigatório no cabeçalho.',
      );
    }

    return this.storageService.getPresignedUploadUrl(
      companyId,
      req.user,
      dto.fileName,
      dto.fileType,
      dto.sizeBytes,
      dto.brandId,
    );
  }

  @Post('confirm-upload')
  async confirmUpload(
    @Headers('x-company-id') companyId: string,
    @Req() req: any,
    @Body()
    body: {
      fileUrl: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      brandId?: string;
    } & Partial<IFileAsset>,
  ) {
    if (!companyId) {
      throw new BadRequestException(
        'Contexto da empresa (x-company-id) é obrigatório no cabeçalho.',
      );
    }

    return this.storageService.confirmUploadAndRegister(
      companyId,
      req.user,
      body,
    );
  }

  @Get('assets')
  async getAssets(
    @Headers('x-company-id') companyId: string,
    @Query('brandId') brandId: string | undefined,
    @Req() req: any,
  ) {
    if (!companyId) {
      throw new BadRequestException(
        'Contexto da empresa (x-company-id) é obrigatório.',
      );
    }

    return this.storageService.getCompanyAssets(companyId, req.user, brandId);
  }

  @Post('assets')
  async createAsset(
    @Headers('x-company-id') companyId: string,
    @Req() req: any,
    @Body() body: Partial<IFileAsset>,
  ) {
    if (!companyId) {
      throw new BadRequestException(
        'Contexto da empresa (x-company-id) é obrigatório.',
      );
    }

    return this.storageService.createBrandAsset(companyId, req.user, body);
  }

  @Patch('assets/:id')
  async updateAsset(
    @Param('id') assetId: string,
    @Headers('x-company-id') companyId: string,
    @Req() req: any,
    @Body() body: Partial<IFileAsset>,
  ) {
    if (!companyId) {
      throw new BadRequestException(
        'Contexto da empresa (x-company-id) é obrigatório.',
      );
    }

    return this.storageService.updateBrandAsset(
      companyId,
      assetId,
      req.user,
      body,
    );
  }

  @Delete('assets/:id')
  async deleteAsset(
    @Param('id') assetId: string,
    @Headers('x-company-id') companyId: string,
    @Req() req: any,
  ) {
    if (!companyId) {
      throw new BadRequestException(
        'Contexto da empresa (x-company-id) é obrigatório.',
      );
    }

    return this.storageService.deleteAsset(companyId, assetId, req.user);
  }
}
