//src/storage/controllers/storage.controller.ts
import {
  Get,
  Delete,
  Param,
  Patch,
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  Req,
} from '@nestjs/common';
import { StorageService } from '../services/storage.service';
import { GetPresignedUrlDto } from '../dto/get-presigned-url.dto';
import { IFileAsset } from '../dto/storage.interface';
import { AuthGuard } from '../../auth/auth.guard';
import { isAltaireOwnerOrAdmin } from '../../shared/utils/org-role.util';

@Controller('storage')
@UseGuards(AuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  // SOLICITAÇÃO DO LINK DE UPLOAD (Aplica a trava do limite de espaço do plano)
  @Post('presigned-url')
  async getUploadUrl(
    @Headers('x-org-id') orgId: string,
    @Body() dto: GetPresignedUrlDto,
  ) {
    const resolvedOrgId = orgId || 'altaire';
    return this.storageService.getPresignedUploadUrl(
      resolvedOrgId,
      dto.fileName,
      dto.fileType,
      dto.sizeBytes,
    );
  }

  // CONFIRMAÇÃO DO UPLOAD (Grava o registro no banco e consome a franquia em MB)
  @Post('confirm-upload')
  async confirmUpload(
    @Headers('x-org-id') orgId: string,
    @Req() req: any,
    @Body()
    body: {
      fileUrl: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
    } & Partial<IFileAsset>,
  ) {
    const resolvedOrgId = orgId || 'altaire';
    const userId = req.user?.sub || req.user?.id;

    return this.storageService.confirmUploadAndRegister(
      resolvedOrgId,
      userId,
      body.fileUrl,
      body.fileName,
      body.mimeType,
      body.sizeBytes,
      body,
    );
  }

  // LISTAR ARQUIVOS (Isolado por usuário para MEMBER; global/gestão para OWNER/ADMIN)
  @Get('assets')
  async getAssets(@Headers('x-org-id') orgId: string, @Req() req: any) {
    const resolvedOrgId = orgId || 'altaire';
    const userId = req.user?.sub || req.user?.id;
    const isManager = isAltaireOwnerOrAdmin(req.user?.email, req.user?.role);

    return this.storageService.getOrganizationAssets(
      resolvedOrgId,
      isManager ? undefined : userId,
    );
  }

  // CRIAR ATIVO / DIRETRIZ DE MARCA (com ou sem arquivo binário)
  @Post('assets')
  async createAsset(
    @Headers('x-org-id') orgId: string,
    @Req() req: any,
    @Body() body: Partial<IFileAsset>,
  ) {
    const resolvedOrgId = orgId || 'altaire';
    const userId = req.user?.sub || req.user?.id;
    return this.storageService.createBrandAsset(resolvedOrgId, userId, body);
  }

  // ATUALIZAR ATIVO / FAVORITO / METADADOS DA MARCA
  @Patch('assets/:id')
  async updateAsset(
    @Param('id') assetId: string,
    @Headers('x-org-id') orgId: string,
    @Headers('x-org-role') role: string,
    @Req() req: any,
    @Body() body: Partial<IFileAsset>,
  ) {
    const resolvedOrgId = orgId || 'altaire';
    const userId = req.user?.sub || req.user?.id;
    const isManager =
      isAltaireOwnerOrAdmin(req.user?.email, req.user?.role) ||
      role === 'ADMIN' ||
      role === 'OWNER';

    return this.storageService.updateBrandAsset(
      resolvedOrgId,
      assetId,
      body,
      isManager ? undefined : userId,
    );
  }

  // EXCLUIR ARQUIVO (Dono do arquivo ou OWNER/ADMIN)
  @Delete('assets/:id')
  async deleteAsset(
    @Param('id') assetId: string,
    @Headers('x-org-id') orgId: string,
    @Headers('x-org-role') role: string,
    @Req() req: any,
  ) {
    const resolvedOrgId = orgId || 'altaire';
    const userId = req.user?.sub || req.user?.id;
    const isManager =
      isAltaireOwnerOrAdmin(req.user?.email, req.user?.role) ||
      role === 'ADMIN' ||
      role === 'OWNER';

    return this.storageService.deleteAsset(
      resolvedOrgId,
      assetId,
      isManager ? undefined : userId,
    );
  }
}
