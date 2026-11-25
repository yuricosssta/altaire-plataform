import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyMemberRepository } from '../repositories/company-member.repository';
import { CompanyFunctionRepository } from '../repositories/company-function.repository';
import {
  CompanyAccessService,
  AuthUserPayload,
} from './company-access.service';
import { OrganizationService } from '../../organization/services/organization.service';
import { UsersService } from '../../users/services/user.service';
import { BrandRepository } from '../../brand/repositories/brand.repository';
import {
  CompanyPlan,
  ICompany,
  ICompanySettings,
} from '../schemas/models/company.interface';
import {
  CreateCompanyInput,
  UpdateCompanyInput,
} from '../validations/company.zod';
import {
  AddCompanyMemberInput,
  UpdateCompanyMemberInput,
} from '../validations/company-member.zod';
import {
  CreateCompanyFunctionInput,
  UpdateCompanyFunctionInput,
} from '../validations/company-function.zod';
import {
  isAltaireOwnerOrAdmin,
  isClientOrExternalRole,
  resolveAltaireRoleByEmail,
} from '../../shared/utils/org-role.util';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepo: CompanyRepository,
    private readonly companyMemberRepo: CompanyMemberRepository,
    private readonly companyFunctionRepo: CompanyFunctionRepository,
    private readonly companyAccessService: CompanyAccessService,
    private readonly organizationService: OrganizationService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => BrandRepository))
    private readonly brandRepo: BrandRepository,
  ) {}

  private extractUserId(user: AuthUserPayload | string | undefined): string {
    return typeof user === 'string'
      ? user
      : String(user?.sub || user?.id || '');
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
    return base || 'empresa';
  }

  private async resolveActiveFunctionInCompany(
    companyId: string,
    functionId?: string | null,
  ): Promise<string | null | undefined> {
    if (functionId === undefined) return undefined;
    if (functionId === null || String(functionId).trim() === '') return null;

    const idStr = String(functionId).trim();
    if (!OBJECT_ID_REGEX.test(idStr)) {
      throw new BadRequestException('ID da função inválido.');
    }

    const fn = await this.companyFunctionRepo.findById(idStr);
    if (!fn || String(fn.companyId) !== String(companyId)) {
      throw new BadRequestException(
        'Função não encontrada ou inativa nesta empresa.',
      );
    }

    return String(fn._id);
  }

  private async validateBrandsInCompany(
    companyId: string,
    brandIds?: string[],
  ): Promise<string[]> {
    if (!brandIds || brandIds.length === 0) return [];
    const uniqueIds = Array.from(new Set(brandIds.map(String)));
    const found = await this.brandRepo.findByIdsInCompany(companyId, uniqueIds);
    if (found.length !== uniqueIds.length) {
      throw new BadRequestException(
        'Uma ou mais marcas informadas não pertencem a esta empresa ou estão inativas.',
      );
    }
    return uniqueIds;
  }

  async findAllForUser(user: AuthUserPayload) {
    const userId = this.extractUserId(user);
    if (!OBJECT_ID_REGEX.test(userId)) {
      return [];
    }

    await this.organizationService.ensureDefaultOrganizationForUser(
      userId,
      user?.email,
    );

    const isAdmin = isAltaireOwnerOrAdmin(user?.email, user?.role);
    const memberships = await this.companyMemberRepo.findActiveByUser(userId);
    const membershipByCompanyId = new Map(
      memberships.map((m) => [String(m.companyId), m]),
    );

    if (isAdmin) {
      const allCompanies = await this.companyRepo.findAllActive();
      return allCompanies.map((company) => {
        const membership = membershipByCompanyId.get(String(company._id));
        return {
          ...company,
          isCompanyManager: true,
          membership: membership
            ? {
                functionId: membership.functionId || null,
                brandIds: membership.brandIds || [],
                allowedProjects: membership.allowedProjects || [],
                permissions: membership.permissions || [],
              }
            : null,
        };
      });
    }

    if (memberships.length === 0) {
      return [];
    }

    const companyIds = memberships.map((m) => String(m.companyId));
    const companies = await this.companyRepo.findByIds(companyIds);

    return companies.map((company) => {
      const membership = membershipByCompanyId.get(String(company._id));
      const isCreator = String(company.createdBy) === userId;
      return {
        ...company,
        isCompanyManager: isCreator,
        membership: membership
          ? {
              functionId: membership.functionId || null,
              brandIds: membership.brandIds || [],
              allowedProjects: membership.allowedProjects || [],
              permissions: membership.permissions || [],
            }
          : null,
      };
    });
  }

  async create(
    data: CreateCompanyInput,
    user: AuthUserPayload,
  ): Promise<ICompany> {
    const userId = this.extractUserId(user);
    const role = resolveAltaireRoleByEmail(user?.email, user?.role);

    if (isClientOrExternalRole(role)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para criar empresas.',
      );
    }

    if (!OBJECT_ID_REGEX.test(userId)) {
      throw new BadRequestException(
        'Usuário inválido para criação de empresa.',
      );
    }

    const altaireOrg =
      await this.organizationService.getCanonicalAltaireOrganization(userId);

    const baseSlug = data.slug || this.generateSlug(data.name);
    let slug = baseSlug;
    const existingSlug = await this.companyRepo.findBySlug(slug);
    if (existingSlug) {
      if (data.slug) {
        throw new BadRequestException('Este slug de empresa já está em uso.');
      }
      slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    const created = await this.companyRepo.create({
      organizationId: altaireOrg._id,
      name: data.name,
      slug,
      acronym: data.acronym,
      cnpj: data.cnpj,
      plan: 'FREE',
      createdBy: userId,
    });

    await this.companyMemberRepo.upsertActive({
      companyId: String(created._id),
      userId,
      brandIds: [],
      allowedProjects: [],
      permissions: [],
    });

    return created;
  }

  async findById(companyId: string, user: AuthUserPayload) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    const company = await this.companyRepo.findById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    return {
      ...company,
      isCompanyManager: ctx.isCompanyManager,
      allowedBrandIds: ctx.allowedBrandIds,
      allowedProjectIds: ctx.allowedProjectIds,
    };
  }

  async update(
    companyId: string,
    data: UpdateCompanyInput,
    user: AuthUserPayload,
  ) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    this.companyAccessService.assertCanManageCompany(ctx);

    const updated = await this.companyRepo.update(companyId, data);
    if (!updated) {
      throw new NotFoundException('Empresa não encontrada.');
    }
    return updated;
  }

  async updateSettings(
    companyId: string,
    settings: ICompanySettings,
    user: AuthUserPayload,
  ) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    this.companyAccessService.assertCanManageCompany(ctx);

    const updated = await this.companyRepo.updateSettings(companyId, settings);
    if (!updated) {
      throw new NotFoundException('Empresa não encontrada.');
    }
    return {
      message: 'Configurações da empresa atualizadas com sucesso.',
      settings: updated.settings,
    };
  }

  async updatePlan(
    companyId: string,
    plan: CompanyPlan,
    user: AuthUserPayload,
  ) {
    if (!isAltaireOwnerOrAdmin(user?.email, user?.role)) {
      throw new ForbiddenException(
        'Apenas administradores da Altaire podem alterar o plano da empresa.',
      );
    }

    const updated = await this.companyRepo.updatePlan(companyId, plan);
    if (!updated) {
      throw new NotFoundException('Empresa não encontrada.');
    }
    return updated;
  }

  async softDelete(companyId: string, user: AuthUserPayload) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    this.companyAccessService.assertCanManageCompany(ctx);

    const activeBrands = await this.brandRepo.countActiveByCompanyId(companyId);
    if (activeBrands > 0) {
      throw new BadRequestException(
        'Não é possível excluir esta empresa pois existem marcas ativas vinculadas a ela. Remova as marcas primeiro.',
      );
    }

    await this.companyRepo.softDelete(companyId);
    return { message: 'Empresa removida com sucesso.' };
  }

  // --- MEMBROS DA EMPRESA ---

  async listMembers(companyId: string, user: AuthUserPayload) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    if (isClientOrExternalRole(ctx.userRole)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para listar membros.',
      );
    }
    this.companyAccessService.assertCanManageCompany(ctx);

    return this.companyMemberRepo.findAllPopulatedByCompany(companyId);
  }

  async addMember(
    companyId: string,
    data: AddCompanyMemberInput,
    user: AuthUserPayload,
  ) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    this.companyAccessService.assertCanManageCompany(ctx);

    const validBrandIds = await this.validateBrandsInCompany(
      companyId,
      data.brandIds,
    );
    const resolvedFnId = await this.resolveActiveFunctionInCompany(
      companyId,
      data.functionId,
    );

    let targetUser: any = await this.usersService.findOne(data.email);
    const requestedRole = data.role || 'MEMBER';

    if (!targetUser) {
      const password = data.password || crypto.randomBytes(24).toString('hex');
      const nameFromEmail = data.email.split('@')[0];
      targetUser = await this.usersService.createUser({
        name: data.name || nameFromEmail,
        email: data.email,
        password,
        role: requestedRole,
        allowedProjects: [],
        permissions: data.permissions || [],
        invitedBy: ctx.userId,
      } as any);
    } else {
      const existingGlobalRole = resolveAltaireRoleByEmail(
        targetUser.email,
        targetUser.role,
      );
      if (
        existingGlobalRole !== 'OWNER' &&
        existingGlobalRole !== 'ADMIN' &&
        requestedRole !== existingGlobalRole
      ) {
        await this.usersService.updateUser(
          String(targetUser._id || targetUser.id),
          { role: requestedRole as any },
        );
      }
    }

    const targetUserId = String(targetUser._id || targetUser.id);
    await this.organizationService.ensureDefaultOrganizationForUser(
      targetUserId,
      targetUser.email || data.email,
    );

    const existingMember = await this.companyMemberRepo.findByCompanyAndUser(
      companyId,
      targetUserId,
    );
    if (existingMember) {
      throw new BadRequestException(
        'Este usuário já está vinculado a esta empresa.',
      );
    }

    const membership = await this.companyMemberRepo.upsertActive({
      companyId,
      userId: targetUserId,
      functionId: resolvedFnId ?? null,
      brandIds: validBrandIds,
      allowedProjects: (data.allowedProjects || []).filter((pid) =>
        OBJECT_ID_REGEX.test(pid),
      ),
      permissions: data.permissions || [],
      invitedBy: ctx.userId,
    });

    return {
      message: 'Membro adicionado à empresa com sucesso.',
      membership,
    };
  }

  async updateMember(
    companyId: string,
    targetUserId: string,
    data: UpdateCompanyMemberInput,
    user: AuthUserPayload,
  ) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    this.companyAccessService.assertCanManageCompany(ctx);

    const existingMember = await this.companyMemberRepo.findByCompanyAndUser(
      companyId,
      targetUserId,
    );
    if (!existingMember) {
      throw new NotFoundException('Membro não encontrado nesta empresa.');
    }

    const validBrandIds =
      data.brandIds !== undefined
        ? await this.validateBrandsInCompany(companyId, data.brandIds)
        : undefined;

    const resolvedFnId =
      data.functionId !== undefined
        ? await this.resolveActiveFunctionInCompany(companyId, data.functionId)
        : undefined;

    if (data.role) {
      const targetUser = await this.usersService.findById(targetUserId);
      const currentGlobalRole = resolveAltaireRoleByEmail(
        targetUser?.email,
        targetUser?.role,
      );
      if (currentGlobalRole === 'OWNER' || currentGlobalRole === 'ADMIN') {
        throw new ForbiddenException(
          'Não é possível alterar o papel de sistema de OWNER/ADMIN da Altaire.',
        );
      }
      await this.usersService.updateUser(targetUserId, {
        role: data.role as any,
      });
    }

    const updated = await this.companyMemberRepo.update(
      companyId,
      targetUserId,
      {
        ...(resolvedFnId !== undefined ? { functionId: resolvedFnId } : {}),
        ...(validBrandIds !== undefined ? { brandIds: validBrandIds } : {}),
        ...(data.allowedProjects !== undefined
          ? { allowedProjects: data.allowedProjects }
          : {}),
        ...(data.permissions !== undefined
          ? { permissions: data.permissions }
          : {}),
      },
    );

    return {
      message: 'Vínculo atualizado com sucesso.',
      membership: updated,
    };
  }

  async removeMember(
    companyId: string,
    targetUserId: string,
    user: AuthUserPayload,
  ) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    this.companyAccessService.assertCanManageCompany(ctx);

    if (ctx.userId === String(targetUserId)) {
      throw new BadRequestException('Você não pode remover a si mesmo.');
    }

    const company = await this.companyRepo.findById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    if (String(company.createdBy) === String(targetUserId)) {
      throw new ForbiddenException(
        'Não é possível remover o criador da empresa.',
      );
    }

    const deleted = await this.companyMemberRepo.softDelete(
      companyId,
      targetUserId,
    );
    if (!deleted) {
      throw new NotFoundException('Membro não encontrado nesta empresa.');
    }

    return { message: 'Membro removido da empresa com sucesso.' };
  }

  // --- FUNÇÕES / CARGOS INTERNOS DA EMPRESA ---

  async listFunctions(companyId: string, user: AuthUserPayload) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    if (isClientOrExternalRole(ctx.userRole)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos não têm permissão para listar funções.',
      );
    }
    return this.companyFunctionRepo.findAllByCompany(companyId);
  }

  async createFunction(
    companyId: string,
    data: CreateCompanyFunctionInput,
    user: AuthUserPayload,
  ) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    this.companyAccessService.assertCanManageCompany(ctx);

    return this.companyFunctionRepo.create({
      companyId,
      name: data.name,
      description: data.description,
      createdBy: ctx.userId,
    });
  }

  async updateFunction(
    companyId: string,
    functionId: string,
    data: UpdateCompanyFunctionInput,
    user: AuthUserPayload,
  ) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    this.companyAccessService.assertCanManageCompany(ctx);

    const fn = await this.companyFunctionRepo.findById(functionId);
    if (!fn || String(fn.companyId) !== String(companyId)) {
      throw new NotFoundException('Função não encontrada nesta empresa.');
    }

    const updated = await this.companyFunctionRepo.update(functionId, data);
    if (!updated) {
      throw new NotFoundException('Função não encontrada nesta empresa.');
    }
    return updated;
  }

  async deleteFunction(
    companyId: string,
    functionId: string,
    user: AuthUserPayload,
  ) {
    const ctx = await this.companyAccessService.resolveCompanyContext(
      user,
      companyId,
    );
    this.companyAccessService.assertCanManageCompany(ctx);

    const fn = await this.companyFunctionRepo.findById(functionId);
    if (!fn || String(fn.companyId) !== String(companyId)) {
      throw new NotFoundException('Função não encontrada nesta empresa.');
    }

    const linkedCount = await this.companyMemberRepo.countActiveByFunction(
      companyId,
      functionId,
    );
    if (linkedCount > 0) {
      throw new BadRequestException(
        'Não é possível excluir esta função pois existem membros vinculados a ela.',
      );
    }

    await this.companyFunctionRepo.softDelete(functionId);
    return { message: 'Função removida com sucesso.' };
  }
}
