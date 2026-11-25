import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyMemberRepository } from '../repositories/company-member.repository';
import { UsersService } from '../../users/services/user.service';
import { ICompanyContext } from '../schemas/models/company-member.interface';
import {
  AltaireOrgRole,
  UserPlanType,
  isAltaireOwnerOrAdmin,
  isClientOrExternalRole,
  isProUserPlan,
  resolveAltaireRoleByEmail,
} from '../../shared/utils/org-role.util';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export interface AuthUserPayload {
  sub?: string;
  id?: string;
  email?: string;
  role?: string;
}

export interface ResolvedUserPlanStatus {
  userId: string;
  userRole: AltaireOrgRole;
  plan: UserPlanType;
  isAltaireAdmin: boolean;
  isProOrAdmin: boolean;
}

@Injectable()
export class CompanyAccessService {
  constructor(
    private readonly companyRepo: CompanyRepository,
    private readonly companyMemberRepo: CompanyMemberRepository,
    private readonly usersService: UsersService,
  ) {}

  async resolveUserPlanAndProStatus(
    user: AuthUserPayload | string | undefined,
  ): Promise<ResolvedUserPlanStatus> {
    const userId =
      typeof user === 'string' ? user : String(user?.sub || user?.id || '');
    if (!userId || !OBJECT_ID_REGEX.test(userId)) {
      throw new ForbiddenException('Usuário autenticado inválido.');
    }

    const userEmail = typeof user === 'string' ? undefined : user?.email;
    const rawRole = typeof user === 'string' ? undefined : user?.role;
    const dbUser = await this.usersService.findById(userId).catch(() => null);

    const effectiveEmail = userEmail || dbUser?.email;
    const effectiveRawRole = rawRole || dbUser?.role;
    const isAltaireAdmin = isAltaireOwnerOrAdmin(
      effectiveEmail,
      effectiveRawRole,
    );
    const resolvedEnvRole = resolveAltaireRoleByEmail(
      effectiveEmail,
      effectiveRawRole,
    );
    const userRole: AltaireOrgRole = isAltaireAdmin
      ? effectiveRawRole?.trim().toUpperCase() === 'OWNER' ||
        resolvedEnvRole === 'OWNER'
        ? 'OWNER'
        : 'ADMIN'
      : resolvedEnvRole;

    const plan: UserPlanType = (dbUser?.plan as UserPlanType) || 'FREE';
    const isProOrAdmin = isAltaireAdmin || isProUserPlan(plan);

    return {
      userId,
      userRole,
      plan,
      isAltaireAdmin,
      isProOrAdmin,
    };
  }

  async resolveCompanyContext(
    user: AuthUserPayload | string | undefined,
    companyId: string,
  ): Promise<ICompanyContext> {
    if (!companyId || !OBJECT_ID_REGEX.test(String(companyId))) {
      throw new BadRequestException('ID da empresa inválido ou não fornecido.');
    }

    const { userId, userRole, isAltaireAdmin, isProOrAdmin } =
      await this.resolveUserPlanAndProStatus(user);

    const company = await this.companyRepo.findById(String(companyId));
    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    const isCompanyCreator = String(company.createdBy) === userId;

    if (isAltaireAdmin || (isCompanyCreator && isProOrAdmin)) {
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

    if (isCompanyCreator) {
      return {
        companyId: String(company._id),
        organizationId: String(company.organizationId),
        userId,
        userRole,
        isAltaireAdmin: false,
        isCompanyCreator: true,
        isCompanyManager: false,
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
        'Apenas o criador da empresa com plano PRO ativo ou administradores da Altaire podem realizar esta ação.',
      );
    }
  }

  assertCanAccessBrand(ctx: ICompanyContext, brandId: string): void {
    if (ctx.isCompanyManager || ctx.allowedBrandIds === null) {
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
