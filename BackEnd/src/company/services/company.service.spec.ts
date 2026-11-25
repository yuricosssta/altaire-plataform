import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyMemberRepository } from '../repositories/company-member.repository';
import { CompanyFunctionRepository } from '../repositories/company-function.repository';
import { CompanyAccessService } from './company-access.service';
import { OrganizationService } from '../../organization/services/organization.service';
import { UsersService } from '../../users/services/user.service';
import { BrandRepository } from '../../brand/repositories/brand.repository';

describe('CompanyService', () => {
  let service: CompanyService;
  let companyRepo: Partial<CompanyRepository>;
  let memberRepo: Partial<CompanyMemberRepository>;
  let functionRepo: Partial<CompanyFunctionRepository>;
  let companyAccessService: Partial<CompanyAccessService>;
  let orgService: Partial<OrganizationService>;
  let usersService: Partial<UsersService>;
  let brandRepo: Partial<BrandRepository>;

  const orgId = '507f1f77bcf86cd799439001';
  const companyId = '507f1f77bcf86cd799439010';
  const creatorId = '507f1f77bcf86cd799439011';
  const functionId = '507f1f77bcf86cd799439040';

  const mockCompany = {
    _id: companyId,
    organizationId: orgId,
    name: 'Empresa Alpha',
    slug: 'empresa-alpha',
    acronym: 'ALP',
    plan: 'FREE' as const,
    storageUsed: 0,
    status: 'active' as const,
    createdBy: creatorId,
    isActive: true,
  };

  beforeEach(async () => {
    companyRepo = {
      findBySlug: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(mockCompany),
      findAllActive: jest.fn().mockResolvedValue([mockCompany]),
      findByIds: jest.fn().mockResolvedValue([mockCompany]),
      create: jest.fn().mockResolvedValue(mockCompany),
      softDelete: jest
        .fn()
        .mockResolvedValue({ ...mockCompany, isActive: false }),
    };
    memberRepo = {
      upsertActive: jest
        .fn()
        .mockResolvedValue({ _id: 'cm1', companyId, userId: creatorId }),
      findActiveByUser: jest.fn().mockResolvedValue([]),
      findByCompanyAndUser: jest.fn().mockResolvedValue(null),
      countActiveByFunction: jest.fn().mockResolvedValue(0),
    };
    functionRepo = {
      findById: jest.fn().mockResolvedValue({
        _id: functionId,
        companyId,
        name: 'Social Media',
        description: 'Gestão de conteúdo',
        createdBy: creatorId,
        isActive: true,
      }),
      softDelete: jest.fn().mockResolvedValue(null),
    };
    companyAccessService = {
      resolveUserPlanAndProStatus: jest.fn().mockResolvedValue({
        userId: creatorId,
        userRole: 'MEMBER',
        plan: 'PRO',
        isAltaireAdmin: false,
        isProOrAdmin: true,
      }),
      resolveCompanyContext: jest.fn().mockResolvedValue({
        companyId,
        organizationId: orgId,
        userId: creatorId,
        userRole: 'MEMBER',
        isAltaireAdmin: false,
        isCompanyCreator: true,
        isCompanyManager: true,
        allowedBrandIds: null,
        allowedProjectIds: null,
      }),
      assertCanManageCompany: jest.fn().mockImplementation((ctx) => {
        if (!ctx.isCompanyManager)
          throw new ForbiddenException('Sem permissão.');
      }),
    };
    orgService = {
      getCanonicalAltaireOrganization: jest.fn().mockResolvedValue({
        _id: orgId,
        name: 'Altaire',
        slug: 'altaire',
        acronym: 'ALT',
      }),
      ensureDefaultOrganizationForUser: jest.fn().mockResolvedValue(undefined),
    };
    usersService = {
      findOne: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
      createPreRegisteredUser: jest.fn(),
      updateUser: jest.fn(),
    };
    brandRepo = {
      countActiveByCompanyId: jest.fn().mockResolvedValue(0),
      findByIdsInCompany: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: CompanyRepository, useValue: companyRepo },
        { provide: CompanyMemberRepository, useValue: memberRepo },
        { provide: CompanyFunctionRepository, useValue: functionRepo },
        { provide: CompanyAccessService, useValue: companyAccessService },
        { provide: OrganizationService, useValue: orgService },
        { provide: UsersService, useValue: usersService },
        { provide: BrandRepository, useValue: brandRepo },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  it('should allow PRO user to create company under canonical Altaire inheriting PRO plan and auto-link creator', async () => {
    const result = await service.create(
      { name: 'Empresa Alpha', acronym: 'ALP' },
      { sub: creatorId, role: 'MEMBER' },
    );

    expect(result).toEqual(mockCompany);
    expect(orgService.getCanonicalAltaireOrganization).toHaveBeenCalledWith(
      creatorId,
    );
    expect(companyRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'PRO',
        createdBy: creatorId,
      }),
    );
    expect(memberRepo.upsertActive).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId,
        userId: creatorId,
      }),
    );
  });

  it('should inherit ENTERPRISE plan when user has ENTERPRISE plan', async () => {
    companyAccessService.resolveUserPlanAndProStatus = jest
      .fn()
      .mockResolvedValue({
        userId: creatorId,
        userRole: 'MEMBER',
        plan: 'ENTERPRISE',
        isAltaireAdmin: false,
        isProOrAdmin: true,
      });

    await service.create(
      { name: 'Empresa Enterprise', acronym: 'ENT' },
      { sub: creatorId, role: 'MEMBER' },
    );

    expect(companyRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'ENTERPRISE',
      }),
    );
  });

  it('should block FREE user from creating a company', async () => {
    companyAccessService.resolveUserPlanAndProStatus = jest
      .fn()
      .mockResolvedValue({
        userId: creatorId,
        userRole: 'MEMBER',
        plan: 'FREE',
        isAltaireAdmin: false,
        isProOrAdmin: false,
      });

    await expect(
      service.create(
        { name: 'Empresa Bloqueada', acronym: 'BLK' },
        { sub: creatorId, role: 'MEMBER' },
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(companyRepo.create).not.toHaveBeenCalled();
  });

  it('should allow OWNER/ADMIN to create company with PRO plan even when user plan is FREE', async () => {
    companyAccessService.resolveUserPlanAndProStatus = jest
      .fn()
      .mockResolvedValue({
        userId: creatorId,
        userRole: 'ADMIN',
        plan: 'FREE',
        isAltaireAdmin: true,
        isProOrAdmin: true,
      });

    await service.create(
      { name: 'Empresa Admin', acronym: 'ADM' },
      { sub: creatorId, role: 'ADMIN' },
    );

    expect(companyRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'PRO',
      }),
    );
  });

  it('should pre-register user without password and link to multiple managed companies', async () => {
    const secondCompanyId = '507f1f77bcf86cd799439055';
    const preRegUserId = '507f1f77bcf86cd799439088';
    usersService.findOne = jest.fn().mockResolvedValue(undefined);
    usersService.createPreRegisteredUser = jest.fn().mockResolvedValue({
      _id: preRegUserId,
      email: 'convidado@altaire.com',
      name: 'Convidado',
      role: 'member',
      plan: 'FREE',
      preRegistered: true,
    }) as any;

    const result = await service.addMember(
      companyId,
      {
        name: 'Convidado',
        email: 'convidado@altaire.com',
        role: 'MEMBER',
        brandIds: [],
        allowedProjects: [],
        permissions: [],
        additionalCompanyIds: [secondCompanyId],
      },
      { sub: creatorId, role: 'MEMBER' },
    );

    expect(usersService.createPreRegisteredUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'convidado@altaire.com',
        password: undefined,
      }),
    );
    expect(memberRepo.upsertActive).toHaveBeenCalledTimes(2);
    expect(result.linkedCompanyIds).toEqual([companyId, secondCompanyId]);
  });

  it('should reject addMember when user is not manager of an additional company', async () => {
    const unmanagedCompanyId = '507f1f77bcf86cd799439077';
    companyAccessService.resolveCompanyContext = jest
      .fn()
      .mockImplementation(async (_u, cid) => ({
        companyId: cid,
        organizationId: orgId,
        userId: creatorId,
        userRole: 'MEMBER',
        isAltaireAdmin: false,
        isCompanyCreator: cid === companyId,
        isCompanyManager: cid === companyId,
        allowedBrandIds: null,
        allowedProjectIds: null,
      }));

    await expect(
      service.addMember(
        companyId,
        {
          name: 'Convidado',
          email: 'convidado@altaire.com',
          role: 'MEMBER',
          brandIds: [],
          allowedProjects: [],
          permissions: [],
          additionalCompanyIds: [unmanagedCompanyId],
        },
        { sub: creatorId, role: 'MEMBER' },
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(usersService.createPreRegisteredUser).not.toHaveBeenCalled();
  });

  it('should block softDelete when active brands exist', async () => {
    brandRepo.countActiveByCompanyId = jest.fn().mockResolvedValue(1);
    await expect(
      service.softDelete(companyId, { sub: creatorId, role: 'MEMBER' }),
    ).rejects.toThrow(BadRequestException);
    expect(companyRepo.softDelete).not.toHaveBeenCalled();
  });

  it('should block deleteFunction when active members are linked', async () => {
    memberRepo.countActiveByFunction = jest.fn().mockResolvedValue(2);
    await expect(
      service.deleteFunction(companyId, functionId, {
        sub: creatorId,
        role: 'MEMBER',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(functionRepo.softDelete).not.toHaveBeenCalled();
  });

  it('should block non-manager from updating company', async () => {
    companyAccessService.resolveCompanyContext = jest.fn().mockResolvedValue({
      companyId,
      organizationId: orgId,
      userId: '507f1f77bcf86cd799439099',
      userRole: 'MEMBER',
      isAltaireAdmin: false,
      isCompanyCreator: false,
      isCompanyManager: false,
      allowedBrandIds: [],
      allowedProjectIds: null,
    });

    await expect(
      service.update(
        companyId,
        { name: 'Alterado' },
        { sub: '507f1f77bcf86cd799439099', role: 'MEMBER' },
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
