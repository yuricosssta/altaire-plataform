import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandRepository } from '../repositories/brand.repository';
import { CompanyAccessService } from '../../company/services/company-access.service';
import { EditorialProjectRepository } from '../../editorial/repositories/editorial-project.repository';
import { EditorialBrandStoryService } from '../../editorial/services/editorial-brand-story.service';

describe('BrandService', () => {
  let service: BrandService;
  let brandRepo: Partial<BrandRepository>;
  let companyAccessService: Partial<CompanyAccessService>;
  let projectRepo: Partial<EditorialProjectRepository>;
  let brandStoryService: Partial<EditorialBrandStoryService>;

  const companyId = '507f1f77bcf86cd799439010';
  const brandId = '507f1f77bcf86cd799439020';
  const userId = '507f1f77bcf86cd799439011';

  const mockBrand = {
    _id: brandId,
    organizationId: '507f1f77bcf86cd799439001',
    companyId,
    name: 'Marca Alpha',
    slug: 'marca-alpha',
    createdBy: userId,
    isActive: true,
  };

  beforeEach(async () => {
    brandRepo = {
      findAllByCompany: jest.fn().mockResolvedValue([mockBrand]),
      findById: jest.fn().mockResolvedValue(mockBrand),
      findBySlugInCompany: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockBrand),
      softDelete: jest
        .fn()
        .mockResolvedValue({ ...mockBrand, isActive: false }),
    };
    companyAccessService = {
      resolveCompanyContext: jest.fn().mockResolvedValue({
        companyId,
        organizationId: '507f1f77bcf86cd799439001',
        userId,
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
      assertCanAccessBrand: jest.fn(),
    };
    projectRepo = {
      countActiveByBrandId: jest.fn().mockResolvedValue(0),
      findBrandIdsByProjectIds: jest.fn().mockResolvedValue([brandId]),
    };
    brandStoryService = {
      getByBrand: jest.fn(),
      upsertByBrand: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
        { provide: BrandRepository, useValue: brandRepo },
        { provide: CompanyAccessService, useValue: companyAccessService },
        { provide: EditorialProjectRepository, useValue: projectRepo },
        { provide: EditorialBrandStoryService, useValue: brandStoryService },
      ],
    }).compile();

    service = module.get<BrandService>(BrandService);
  });

  it('findAllByCompany should filter brands for invited MEMBER by allowedBrandIds', async () => {
    companyAccessService.resolveCompanyContext = jest.fn().mockResolvedValue({
      companyId,
      organizationId: '507f1f77bcf86cd799439001',
      userId,
      userRole: 'MEMBER',
      isAltaireAdmin: false,
      isCompanyCreator: false,
      isCompanyManager: false,
      allowedBrandIds: [brandId],
      allowedProjectIds: null,
    });

    const result = await service.findAllByCompany(companyId, { sub: userId });
    expect(result).toEqual([mockBrand]);
    expect(brandRepo.findAllByCompany).toHaveBeenCalledWith(companyId, [
      brandId,
    ]);
  });

  it('create should block non-manager MEMBER from creating brand', async () => {
    companyAccessService.resolveCompanyContext = jest.fn().mockResolvedValue({
      companyId,
      organizationId: '507f1f77bcf86cd799439001',
      userId,
      userRole: 'MEMBER',
      isAltaireAdmin: false,
      isCompanyCreator: false,
      isCompanyManager: false,
      allowedBrandIds: [brandId],
      allowedProjectIds: null,
    });

    await expect(
      service.create(companyId, { name: 'Nova Marca' }, { sub: userId }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('softDelete should block deletion when active editorial projects exist', async () => {
    projectRepo.countActiveByBrandId = jest.fn().mockResolvedValue(2);
    await expect(service.softDelete(brandId, { sub: userId })).rejects.toThrow(
      BadRequestException,
    );
    expect(brandRepo.softDelete).not.toHaveBeenCalled();
  });
});
