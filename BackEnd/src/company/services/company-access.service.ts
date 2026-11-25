import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyMemberRepository } from '../repositories/company-member.repository';
import { ICompanyContext } from '../schemas/models/company-member.interface';
import {
  AltaireOrgRole,
  isAltaireOwnerOrAdmin,
  isClientOrExternalRole,
  resolveAltaireRoleByEmail,
} from '../../shared/utils/org-role.util';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export interface AuthUserPayload {
  sub?: string;
  id?: string;
  email?: string;
  role?: string;
}

@Injectable()
export class CompanyAccessService {
  constructor(
    private readonly companyRepo: CompanyRepository,
    private readonly companyMemberRepo: CompanyMemberRepository,
  ) {}

  async resolveCompanyContext(
    user: AuthUserPayload | string | undefined,
    companyId: string,
  ): Promise<ICompanyContext> {
    if (!companyId || !OBJECT_ID_REGEX.test(String(companyId))) {
      throw new BadRequestException('ID da empresa inválido ou não fornecido.');
    }

    const userId =
      typeof user === 'string' ? user : String(user?.sub || user?.id || '');
    if (!userId || !OBJECT_ID_REGEX.test(userId)) {
      throw new ForbiddenException('Usuário autenticado inválido.');
    }

    const userEmail = typeof user === 'string' ? undefined : user?.email;
    const rawRole = typeof user === 'string' ? undefined : user?.role;
    const isAltaireAdmin = isAltaireOwnerOrAdmin(userEmail, rawRole);
    const resolvedEnvRole = resolveAltaireRoleByEmail(userEmail, rawRole);
    const userRole: AltaireOrgRole = isAltaireAdmin
      ? rawRole?.trim().toUpperCase() === 'OWNER' || resolvedEnvRole === 'OWNER'
        ? 'OWNER'
        : 'ADMIN'
      : resolvedEnvRole;

    const company = await this.companyRepo.findById(String(companyId));
    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    const isCompanyCreator = String(company.createdBy) === userId;

    if (isAltaireAdmin || isCompanyCreator) {
      return {
        companyId: String(company._id),
        organizationId: String(company.organizationId),
        userId,
        userRole,
        isAltaireAdmin,
        isCompanyCreator,
        isCompanyManager: true,
        allowedBrandIds: null,
        allowedProjectIds: null,
      };
    }

    const membership = await this.companyMemberRepo.findByCompanyAndUser(
      String(company._id),
      userId,
    );

    if (!membership) {
      throw new ForbiddenException('Acesso negado a esta empresa.');
    }

    if (isClientOrExternalRole(userRole)) {
      return {
        companyId: String(company._id),
        organizationId: String(company.organizationId),
        userId,
        userRole,
        isAltaireAdmin: false,
        isCompanyCreator: false,
        isCompanyManager: false,
        allowedBrandIds: [],
        allowedProjectIds: (membership.allowedProjects || []).map(String),
      };
    }

    return {
      companyId: String(company._id),
      organizationId: String(company.organizationId),
      userId,
      userRole,
      isAltaireAdmin: false,
      isCompanyCreator: false,
      isCompanyManager: false,
      allowedBrandIds: (membership.brandIds || []).map(String),
      allowedProjectIds: null,
    };
  }

  assertCanManageCompany(ctx: ICompanyContext): void {
    if (!ctx.isCompanyManager) {
      throw new ForbiddenException(
        'Apenas o criador da empresa ou administradores da Altaire podem realizar esta ação.',
      );
    }
  }

  assertCanAccessBrand(ctx: ICompanyContext, brandId: string): void {
    if (ctx.isCompanyManager) {
      return;
    }

    if (isClientOrExternalRole(ctx.userRole)) {
      throw new ForbiddenException(
        'Usuários clientes ou externos só podem acessar projetos explicitamente liberados.',
      );
    }

    const allowed = ctx.allowedBrandIds || [];
    if (!allowed.includes(String(brandId))) {
      throw new ForbiddenException(
        'Acesso negado: você não está vinculado a esta marca.',
      );
    }
  }
}
