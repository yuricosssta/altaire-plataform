import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileAssetRepository } from '../repositories/file-asset.repository';
import { CompanyRepository } from '../../company/repositories/company.repository';
import { CompanyAccessService } from '../../company/services/company-access.service';
import { BrandRepository } from '../../brand/repositories/brand.repository';
import { ICompanyContext } from '../../company/schemas/models/company-member.interface';

describe('StorageService', () => {
  let service: StorageService;
  let fileAssetRepo: Partial<FileAssetRepository>;
  let companyRepo: Partial<CompanyRepository>;
  let companyAccessService: Partial<CompanyAccessService>;
  let brandRepo: Partial<BrandRepository>;

  const companyId = '507f1f77bcf86cd799439010';
  const brandId = '507f1f77bcf86cd799439020';
  const userId = '507f1f77bcf86cd799439012';

  const mockCompany = {
    _id: companyId,
    organizationId: '507f1f77bcf86cd799439001',
    name: 'Empresa Alpha',
    slug: 'empresa-alpha',
    acronym: 'ALP',
    plan: 'FREE' as const,
    storageUsed: 1000,
    status: 'active' as const,
    createdBy: userId,
    isActive: true,
  };

  const managerCtx: ICompanyContext = {
    companyId,
    organizationId: '507f1f77bcf86cd799439001',
    userId,
    userRole: 'MEMBER',
    isAltaireAdmin: false,
    isCompanyCreator: true,
    isCompanyManager: true,
    allowedBrandIds: null,
    allowedProjectIds: null,
  };

  beforeEach(async () => {
    fileAssetRepo = {
      create: jest.fn().mockResolvedValue({ _id: 'asset1', companyId }),
      findAll: jest.fn().mockResolvedValue([]),
      findByIdInCompany: jest.fn(),
      updateByIdInCompany: jest
        .fn()
        .mockResolvedValue({ _id: 'asset1', companyId }),
      deleteById: jest.fn().mockResolvedValue(true),
    };
    companyRepo = {
      findById: jest.fn().mockResolvedValue(mockCompany),
      incrementStorageUsed: jest.fn().mockResolvedValue(mockCompany),
    };
    companyAccessService = {
      resolveCompanyContext: jest.fn().mockResolvedValue(managerCtx),
      assertCanAccessBrand: jest.fn(),
    };
    brandRepo = {
      findById: jest.fn().mockResolvedValue({
        _id: brandId,
        companyId,
        name: 'Marca A',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: FileAssetRepository, useValue: fileAssetRepo },
        { provide: CompanyRepository, useValue: companyRepo },
        { provide: CompanyAccessService, useValue: companyAccessService },
        { provide: BrandRepository, useValue: brandRepo },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getCompanyAssets should filter by allowedBrandIds + general for invited MEMBER', async () => {
    companyAccessService.resolveCompanyContext = jest.fn().mockResolvedValue({
      ...managerCtx,
      isCompanyCreator: false,
      isCompanyManager: false,
      allowedBrandIds: [brandId],
    });

    await service.getCompanyAssets(companyId, { sub: userId });

    expect(fileAssetRepo.findAll).toHaveBeenCalledWith({
      companyId,
      allowedBrandIds: [brandId],
      includeGeneral: true,
    });
  });

  it('confirmUploadAndRegister should increment company storageUsed', async () => {
    await service.confirmUploadAndRegister(
      companyId,
      { sub: userId },
      {
        fileUrl: 'https://cdn.test/file.png',
        fileName: 'file.png',
        mimeType: 'image/png',
        sizeBytes: 2048,
        brandId,
      },
    );

    expect(fileAssetRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId,
        brandId,
        uploadedBy: userId,
      }),
    );
    expect(companyRepo.incrementStorageUsed).toHaveBeenCalledWith(
      companyId,
      2048,
    );
  });

  it('createBrandAsset should create guideline asset without fileUrl or storage increment', async () => {
    await service.createBrandAsset(
      companyId,
      { sub: userId },
      {
        title: 'Cor Primária Dourado',
        category: 'paleta',
        hexPreview: '#D4AF37',
        brandId,
      },
    );

    expect(fileAssetRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId,
        brandId,
        title: 'Cor Primária Dourado',
        category: 'paleta',
        sizeBytes: 0,
      }),
    );
    expect(companyRepo.incrementStorageUsed).not.toHaveBeenCalled();
  });

  it('getPresignedUploadUrl should block CLIENT/EXTERNAL', async () => {
    companyAccessService.resolveCompanyContext = jest.fn().mockResolvedValue({
      ...managerCtx,
      userRole: 'CLIENT',
      isCompanyManager: false,
      isCompanyCreator: false,
    });

    await expect(
      service.getPresignedUploadUrl(
        companyId,
        { sub: userId, role: 'CLIENT' },
        'doc.pdf',
        'application/pdf',
        100,
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
