import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EditorialProjectService } from './editorial-project.service';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import { CompanyAccessService } from '../../company/services/company-access.service';
import { BrandRepository } from '../../brand/repositories/brand.repository';
import { ICompanyContext } from '../../company/schemas/models/company-member.interface';

describe('EditorialProjectService', () => {
  let service: EditorialProjectService;
  let repository: Partial<EditorialProjectRepository>;
  let companyAccessService: Partial<CompanyAccessService>;
  let brandRepository: Partial<BrandRepository>;

  const companyId = '507f1f77bcf86cd799439010';
  const brandId = '507f1f77bcf86cd799439020';
  const otherBrandId = '507f1f77bcf86cd799439021';
  const userId = '507f1f77bcf86cd799439012';
  const projectId = '507f1f77bcf86cd799439011';

  const mockProject = {
    _id: projectId,
    id: projectId,
    name: 'Projeto Teste',
    niche: 'Marketing',
    subniche: 'Marketing Digital',
    currentObjective: 'Criar conteúdo',
    editorialLineStatus: 'active' as const,
    calendarStatus: 'pending' as const,
    createdBy: userId,
    orgId: 'altaire',
    companyId,
    brandId,
    isActive: true,
  };

  const mockBrand = {
    _id: brandId,
    organizationId: '507f1f77bcf86cd799439001',
    companyId,
    name: 'Marca Alpha',
    slug: 'marca-alpha',
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

  const guestMemberCtx: ICompanyContext = {
    ...managerCtx,
    isCompanyCreator: false,
    isCompanyManager: false,
    allowedBrandIds: [brandId],
    allowedProjectIds: null,
  };

  const clientCtx: ICompanyContext = {
    ...managerCtx,
    userRole: 'CLIENT',
    isCompanyCreator: false,
    isCompanyManager: false,
    allowedBrandIds: [],
    allowedProjectIds: [projectId],
  };

  beforeEach(async () => {
    repository = {
      findAll: jest.fn().mockResolvedValue([mockProject]),
      findById: jest.fn().mockResolvedValue(mockProject),
      create: jest.fn().mockResolvedValue(mockProject),
      update: jest.fn().mockResolvedValue(mockProject),
      softDelete: jest.fn().mockResolvedValue(mockProject),
    };

    companyAccessService = {
      resolveCompanyContext: jest.fn().mockResolvedValue(managerCtx),
      assertCanAccessBrand: jest.fn().mockImplementation((ctx, bId) => {
        if (ctx.isCompanyManager) return;
        if (!ctx.allowedBrandIds?.includes(String(bId))) {
          throw new ForbiddenException('Sem acesso à marca.');
        }
      }),
    };

    brandRepository = {
      findById: jest.fn().mockResolvedValue(mockBrand),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditorialProjectService,
        { provide: EditorialProjectRepository, useValue: repository },
        { provide: CompanyAccessService, useValue: companyAccessService },
        { provide: BrandRepository, useValue: brandRepository },
      ],
    }).compile();

    service = module.get<EditorialProjectService>(EditorialProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all company projects for company manager', async () => {
      const result = await service.findAll(companyId, { sub: userId });
      expect(result).toEqual([mockProject]);
      expect(repository.findAll).toHaveBeenCalledWith({ companyId });
    });

    it('should filter by allowedBrandIds for invited MEMBER', async () => {
      companyAccessService.resolveCompanyContext = jest
        .fn()
        .mockResolvedValue(guestMemberCtx);
      const result = await service.findAll(companyId, { sub: userId });
      expect(result).toEqual([mockProject]);
      expect(repository.findAll).toHaveBeenCalledWith({
        companyId,
        brandIds: [brandId],
      });
    });

    it('should throw ForbiddenException if invited MEMBER requests unauthorized brandId', async () => {
      companyAccessService.resolveCompanyContext = jest
        .fn()
        .mockResolvedValue(guestMemberCtx);
      brandRepository.findById = jest.fn().mockResolvedValue({
        ...mockBrand,
        _id: otherBrandId,
      });

      await expect(
        service.findAll(companyId, { sub: userId }, otherBrandId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return empty array when CLIENT/EXTERNAL has empty allowedProjectIds', async () => {
      companyAccessService.resolveCompanyContext = jest
        .fn()
        .mockResolvedValue({ ...clientCtx, allowedProjectIds: [] });

      const result = await service.findAll(companyId, {
        sub: userId,
        role: 'CLIENT',
      });
      expect(result).toEqual([]);
      expect(repository.findAll).not.toHaveBeenCalled();
    });

    it('should filter by allowedProjectIds for CLIENT/EXTERNAL', async () => {
      companyAccessService.resolveCompanyContext = jest
        .fn()
        .mockResolvedValue(clientCtx);

      const result = await service.findAll(companyId, {
        sub: userId,
        role: 'CLIENT',
      });
      expect(result).toEqual([mockProject]);
      expect(repository.findAll).toHaveBeenCalledWith({
        companyId,
        allowedProjectIds: [projectId],
      });
    });
  });

  describe('findById', () => {
    it('should return a project when found and authorized', async () => {
      const result = await service.findById(projectId, { sub: userId });
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findById = jest.fn().mockResolvedValue(null);
      await expect(
        service.findById('nonexistent', { sub: userId }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when CLIENT/EXTERNAL is not allowed to view the project', async () => {
      companyAccessService.resolveCompanyContext = jest.fn().mockResolvedValue({
        ...clientCtx,
        allowedProjectIds: ['507f1f77bcf86cd799439099'],
      });

      await expect(
        service.findById(projectId, { sub: userId, role: 'CLIENT' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when invited MEMBER is not linked to project brand', async () => {
      companyAccessService.resolveCompanyContext = jest.fn().mockResolvedValue({
        ...guestMemberCtx,
        allowedBrandIds: [otherBrandId],
      });

      await expect(
        service.findById(projectId, { sub: userId }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create a new project scoped to company and brand', async () => {
      const input = {
        name: 'Novo Projeto',
        niche: 'Educação',
        subniche: 'EAD',
        currentObjective: 'Lançar curso',
        brandId,
      };
      const result = await service.create(companyId, input, { sub: userId });
      expect(result).toEqual(mockProject);
      expect(repository.create).toHaveBeenCalledWith({
        ...input,
        brandOrClientName: mockBrand.name,
        companyId,
        brandId,
        createdBy: userId,
        orgId: 'altaire',
      });
    });

    it('should throw BadRequestException if brand does not belong to company', async () => {
      brandRepository.findById = jest.fn().mockResolvedValue({
        ...mockBrand,
        companyId: '507f1f77bcf86cd799439099',
      });

      await expect(
        service.create(
          companyId,
          {
            name: 'Novo Projeto',
            niche: 'Educação',
            subniche: 'EAD',
            currentObjective: 'Lançar curso',
            brandId,
          },
          { sub: userId },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for CLIENT/EXTERNAL', async () => {
      companyAccessService.resolveCompanyContext = jest
        .fn()
        .mockResolvedValue(clientCtx);

      await expect(
        service.create(
          companyId,
          {
            name: 'Novo Projeto',
            niche: 'Educação',
            subniche: 'EAD',
            currentObjective: 'Lançar curso',
            brandId,
          },
          { sub: userId, role: 'CLIENT' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a project when authorized', async () => {
      const input = { name: 'Atualizado' };
      const result = await service.update(projectId, input, { sub: userId });
      expect(result).toEqual(mockProject);
      expect(repository.update).toHaveBeenCalledWith(projectId, input);
    });
  });

  describe('delete', () => {
    it('should soft delete a project when authorized', async () => {
      const result = await service.delete(projectId, { sub: userId });
      expect(result).toEqual({
        message: 'Projeto editorial removido com sucesso.',
      });
      expect(repository.softDelete).toHaveBeenCalledWith(projectId);
    });
  });
});
