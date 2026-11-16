// src/organization/controllers/organization.controller.ts

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { ConfigService } from '@nestjs/config';
import {
  isAltaireOwnerOrAdmin,
  isClientOrExternalRole,
} from '../../shared/utils/org-role.util';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import {
  CreateOrganizationFunction,
  createOrganizationFunctionSchema,
  UpdateOrganizationFunction,
  updateOrganizationFunctionSchema,
} from '../validations/organization-function.zod';

@Controller('organizations')
@UseGuards(AuthGuard)
export class OrganizationController {
  constructor(
    private readonly orgService: OrganizationService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  create(@Body() createDto: CreateOrganizationDto, @Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.orgService.create(createDto, userId);
  }

  @Get('my-orgs')
  getMyOrgs(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.orgService.findAllForUser(userId, req.user?.email);
  }

  // Busca de membros (OWNER/ADMIN veem todos; MEMBER vê seus convidados CLIENT/EXTERNAL)
  @Get(':orgId/members')
  getMembers(@Param('orgId') orgId: string, @Req() req: any) {
    if (isClientOrExternalRole(req.user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para listar membros.',
      );
    }
    const userId = req.user?.sub || req.user?.id;
    const isAdmin = isAltaireOwnerOrAdmin(req.user?.email, req.user?.role);
    return this.orgService.findMembersByOrganization(orgId, userId, isAdmin);
  }

  // Adição de membro (OWNER/ADMIN adicionam qualquer cargo; MEMBER adiciona CLIENT/EXTERNAL)
  @Post(':orgId/members')
  addMember(@Param('orgId') orgId: string, @Body() body: any, @Req() req: any) {
    if (isClientOrExternalRole(req.user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não podem adicionar membros.',
      );
    }
    const userId = req.user?.sub || req.user?.id;
    const isAdmin = isAltaireOwnerOrAdmin(req.user?.email, req.user?.role);
    return this.orgService.addMemberToOrganization(
      orgId,
      body,
      userId,
      isAdmin,
    );
  }

  // --- ATUALIZAR CARGO E PERMISSÕES DO MEMBRO ---
  @Patch(':orgId/members/:userId/role')
  async updateMemberRole(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Body()
    body: {
      role: string;
      allowedProjects?: string[];
      permissions?: string[];
      functionId?: string | null;
    },
    @Req() req: any,
  ) {
    if (isClientOrExternalRole(req.user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não podem alterar cargos.',
      );
    }
    const adminId = req.user.sub || req.user.id;
    const isAdmin = isAltaireOwnerOrAdmin(req.user?.email, req.user?.role);
    return this.orgService.updateMemberRole(
      orgId,
      adminId,
      userId,
      body.role,
      {
        allowedProjects: body.allowedProjects,
        permissions: body.permissions,
        functionId: body.functionId,
      },
      isAdmin,
    );
  }

  // --- REMOVER MEMBRO DA ORGANIZAÇÃO ---
  @Delete(':orgId/members/:userId')
  async removeMember(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    if (isClientOrExternalRole(req.user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não podem remover membros.',
      );
    }
    const adminId = req.user.sub || req.user.id;
    const isAdmin = isAltaireOwnerOrAdmin(req.user?.email, req.user?.role);
    return this.orgService.removeMemberFromOrganization(
      orgId,
      adminId,
      userId,
      isAdmin,
    );
  }

  // --- CATÁLOGO DE FUNÇÕES / CARGOS CUSTOMIZADOS ---
  @Get(':orgId/functions')
  getFunctions(@Param('orgId') orgId: string, @Req() req: any) {
    if (isClientOrExternalRole(req.user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para listar funções.',
      );
    }
    const userId = req.user?.sub || req.user?.id;
    const isAdmin = isAltaireOwnerOrAdmin(req.user?.email, req.user?.role);
    return this.orgService.listFunctions(orgId, userId, isAdmin);
  }

  @Post(':orgId/functions')
  createFunction(
    @Param('orgId') orgId: string,
    @Body(new ZodValidationPipe(createOrganizationFunctionSchema))
    body: CreateOrganizationFunction,
    @Req() req: any,
  ) {
    if (isClientOrExternalRole(req.user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não podem cadastrar funções.',
      );
    }
    const userId = req.user?.sub || req.user?.id;
    return this.orgService.createFunction(orgId, body, userId);
  }

  @Patch(':orgId/functions/:functionId')
  updateFunction(
    @Param('orgId') orgId: string,
    @Param('functionId') functionId: string,
    @Body(new ZodValidationPipe(updateOrganizationFunctionSchema))
    body: UpdateOrganizationFunction,
    @Req() req: any,
  ) {
    if (isClientOrExternalRole(req.user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não podem editar funções.',
      );
    }
    const userId = req.user?.sub || req.user?.id;
    const isAdmin = isAltaireOwnerOrAdmin(req.user?.email, req.user?.role);
    return this.orgService.updateFunction(
      orgId,
      functionId,
      body,
      userId,
      isAdmin,
    );
  }

  @Delete(':orgId/functions/:functionId')
  deleteFunction(
    @Param('orgId') orgId: string,
    @Param('functionId') functionId: string,
    @Req() req: any,
  ) {
    if (isClientOrExternalRole(req.user?.role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não podem excluir funções.',
      );
    }
    const userId = req.user?.sub || req.user?.id;
    const isAdmin = isAltaireOwnerOrAdmin(req.user?.email, req.user?.role);
    return this.orgService.deleteFunction(orgId, functionId, userId, isAdmin);
  }

  @Get('admin/all')
  async getAllForAdmin(@Req() req: any): Promise<any> {
    // A TRAVA DE DEUS
    const userEmail = req.user?.email; // Certifique-se de que seu token JWT tenha o email embutido
    const superAdminEmail = this.configService.get<string>('SUPER_ADMIN_EMAIL');

    if (userEmail !== superAdminEmail) {
      throw new ForbiddenException(
        'Acesso negado: Área restrita ao Administrador.',
      );
    }

    return this.orgService.findAllForSuperAdmin();
  }

  @Patch('admin/:id/plan')
  async updateOrgPlan(
    @Param('id') orgId: string,
    @Body('plan') plan: string,
    @Req() req: any,
  ) {
    const userEmail = req.user?.email;
    const superAdminEmail = this.configService.get<string>('SUPER_ADMIN_EMAIL');

    if (userEmail !== superAdminEmail) {
      throw new ForbiddenException(
        'Acesso negado: Área restrita ao Master Admin.',
      );
    }

    return this.orgService.updatePlan(orgId, plan);
  }

  @Patch(':orgId/settings')
  async updateOrgSettings(
    @Param('orgId') orgId: string,
    @Body('settings') settings: any,
    @Req() req: any,
  ) {
    const adminId = req.user.sub || req.user.id;
    return this.orgService.updateSettings(orgId, adminId, settings);
  }

  // Busca por slug
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.orgService.findOneBySlug(slug);
  }
}
