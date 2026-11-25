import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CompanyAccessService } from './company-access.service';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyMemberRepository } from '../repositories/company-member.repository';

describe('CompanyAccessService', () => {
  let service: CompanyAccessService;
  let companyRepo: Partial<CompanyRepository>;
  let memberRepo: Partial<CompanyMemberRepository>;

  const orgId = '507f1f77bcf86cd799439001';
  const companyId = '507f1f77bcf86cd799439010';
  const creatorId = '507f1f77bcf86cd799439011';
  const guestMemberId = '507f1f77bcf86cd799439012';
  const outsiderId = '507f1f77bcf86cd799439013';
  const brandId = '507f1f77bcf86cd799439020';
  const projectId = '507f1f77bcf86cd799439030';

  const mockCompany = {
    _id: companyId,
    organizationId: orgId,
    name: 'Empresa Teste',
    slug: 'empresa-teste',
    acronym: 'EMT',
    plan: 'FREE' as const,
    storageUsed: 0,
    status: 'active' as const,
    createdBy: creatorId,
    isActive: true,
  };

  beforeEach(async () => {
    companyRepo = {
      findById: jest.fn().mockResolvedValue(mockCompany),
    };
    memberRepo = {
      findByCompanyAndUser: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyAccessService,
        { provide: CompanyRepository, useValue: companyRepo },
        { provide: CompanyMemberRepository, useValue: memberRepo },
      ],
    }).compile();

    service = module.get<CompanyAccessService>(CompanyAccessService);
  });

  it('should grant full manager access to Altaire OWNER/ADMIN even without CompanyMember', async () => {
    const ctx = await service.resolveCompanyContext(
      { sub: outsiderId, role: 'ADMIN', email: 'admin@altaire.com' },
      companyId,
    );

    expect(ctx.isAltaireAdmin).toBe(true);
    expect(ctx.isCompanyManager).toBe(true);
    expect(ctx.allowedBrandIds).toBeNull();
  });

  it('should grant full manager access to company creator', async () => {
    const ctx = await service.resolveCompanyContext(
      { sub: creatorId, role: 'MEMBER' },
      companyId,
    );

    expect(ctx.isCompanyCreator).toBe(true);
    expect(ctx.isCompanyManager).toBe(true);
    expect(ctx.allowedBrandIds).toBeNull();
  });

  it('should deny access to MEMBER not linked to company', async () => {
    await expect(
      service.resolveCompanyContext(
        { sub: outsiderId, role: 'MEMBER' },
        companyId,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should scope invited MEMBER to assigned brandIds only', async () => {
    memberRepo.findByCompanyAndUser = jest.fn().mockResolvedValue({
      _id: 'cm1',
      companyId,
      userId: guestMemberId,
      brandIds: [brandId],
      allowedProjects: [],
      permissions: [],
      isActive: true,
    });

    const ctx = await service.resolveCompanyContext(
      { sub: guestMemberId, role: 'MEMBER' },
      companyId,
    );

    expect(ctx.isCompanyManager).toBe(false);
    expect(ctx.allowedBrandIds).toEqual([brandId]);
    expect(() => service.assertCanAccessBrand(ctx, brandId)).not.toThrow();
    expect(() =>
      service.assertCanAccessBrand(ctx, '507f1f77bcf86cd799439099'),
    ).toThrow(ForbiddenException);
  });

  it('should scope CLIENT/EXTERNAL to allowedProjects only', async () => {
    memberRepo.findByCompanyAndUser = jest.fn().mockResolvedValue({
      _id: 'cm2',
      companyId,
      userId: guestMemberId,
      brandIds: [],
      allowedProjects: [projectId],
      permissions: [],
      isActive: true,
    });

    const ctx = await service.resolveCompanyContext(
      { sub: guestMemberId, role: 'CLIENT' },
      companyId,
    );

    expect(ctx.isCompanyManager).toBe(false);
    expect(ctx.allowedProjectIds).toEqual([projectId]);
    expect(ctx.allowedBrandIds).toEqual([]);
  });

  it('should throw NotFoundException if company does not exist', async () => {
    companyRepo.findById = jest.fn().mockResolvedValue(null);
    await expect(
      service.resolveCompanyContext(
        { sub: creatorId, role: 'MEMBER' },
        companyId,
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
