import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Organization } from '../schemas/organization.schema';
import { OrganizationMember } from '../schemas/organization-member.schema';
import { UsersService } from '../../users/services/user.service';
import { OrganizationFunctionRepository } from '../repositories/organization-function.repository';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let orgModel: Record<string, jest.Mock>;
  let memberModel: Record<string, jest.Mock>;
  let usersService: Partial<UsersService>;
  let functionRepo: Partial<OrganizationFunctionRepository>;

  const orgId = '507f1f77bcf86cd799439011';
  const adminId = '507f1f77bcf86cd799439012';
  const memberId = '507f1f77bcf86cd799439013';
  const otherMemberId = '507f1f77bcf86cd799439014';
  const functionId = '507f1f77bcf86cd799439015';
  const targetUserId = '507f1f77bcf86cd799439016';

  const mockFunction = {
    _id: functionId,
    organizationId: orgId,
    name: 'Editor de Vídeo',
    description: 'Edição de Reels e cortes verticais.',
    createdBy: memberId,
    isActive: true,
  };

  beforeEach(async () => {
    orgModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    memberModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
      countDocuments: jest.fn().mockResolvedValue(0),
    };
    usersService = {
      findOne: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn().mockResolvedValue({}),
    };
    functionRepo = {
      findAllByOrg: jest.fn().mockResolvedValue([mockFunction]),
      findById: jest.fn().mockResolvedValue(mockFunction),
      create: jest.fn().mockResolvedValue(mockFunction),
      update: jest.fn().mockResolvedValue(mockFunction),
      softDelete: jest
        .fn()
        .mockResolvedValue({ ...mockFunction, isActive: false }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        { provide: getModelToken(Organization.name), useValue: orgModel },
        {
          provide: getModelToken(OrganizationMember.name),
          useValue: memberModel,
        },
        { provide: UsersService, useValue: usersService },
        { provide: OrganizationFunctionRepository, useValue: functionRepo },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should block creation of new organizations because Altaire is unique', async () => {
    await expect(
      service.create({ name: 'Outra', acronym: 'OTR' } as any, adminId),
    ).rejects.toThrow(ForbiddenException);
  });

  describe('Organization Functions Catalog', () => {
    it('listFunctions should return all org functions when requester is OWNER/ADMIN', async () => {
      const result = await service.listFunctions(orgId, adminId, true);
      expect(result).toEqual([mockFunction]);
      expect(functionRepo.findAllByOrg).toHaveBeenCalledWith(orgId);
    });

    it('listFunctions should filter by createdBy when requester is MEMBER', async () => {
      const result = await service.listFunctions(orgId, memberId, false);
      expect(result).toEqual([mockFunction]);
      expect(functionRepo.findAllByOrg).toHaveBeenCalledWith(orgId, memberId);
    });

    it('createFunction should create a function with organizationId and createdBy', async () => {
      const result = await service.createFunction(
        orgId,
        {
          name: 'Editor de Vídeo',
          description: 'Edição de Reels e cortes verticais.',
        },
        memberId,
      );
      expect(result).toEqual(mockFunction);
      expect(functionRepo.create).toHaveBeenCalledWith({
        organizationId: orgId,
        name: 'Editor de Vídeo',
        description: 'Edição de Reels e cortes verticais.',
        createdBy: memberId,
      });
    });

    it('updateFunction should throw ForbiddenException if MEMBER tries to edit another user function', async () => {
      await expect(
        service.updateFunction(
          orgId,
          functionId,
          { name: 'Novo Nome' },
          otherMemberId,
          false,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deleteFunction should block deletion when active users are linked', async () => {
      memberModel.countDocuments.mockResolvedValueOnce(2);
      await expect(
        service.deleteFunction(orgId, functionId, memberId, false),
      ).rejects.toThrow(BadRequestException);
      expect(functionRepo.softDelete).not.toHaveBeenCalled();
    });

    it('deleteFunction should soft delete when no users are linked', async () => {
      memberModel.countDocuments.mockResolvedValueOnce(0);
      const result = await service.deleteFunction(
        orgId,
        functionId,
        memberId,
        false,
      );
      expect(result).toEqual({ message: 'Função removida com sucesso.' });
      expect(functionRepo.softDelete).toHaveBeenCalledWith(functionId);
    });
  });

  describe('updateMemberRole with custom functionId', () => {
    it('should update member role and assign validated functionId without changing system role', async () => {
      memberModel.findOne.mockResolvedValueOnce({
        _id: 'mem1',
        organizationId: orgId,
        userId: targetUserId,
        role: 'EXTERNAL',
      });
      memberModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: 'mem1',
        role: 'EXTERNAL',
        functionId,
      });

      const result = await service.updateMemberRole(
        orgId,
        adminId,
        targetUserId,
        'EXTERNAL',
        { functionId },
        true,
      );

      expect(result).toEqual({ message: 'Cargo atualizado com sucesso.' });
      expect(functionRepo.findById).toHaveBeenCalledWith(functionId);
      expect(memberModel.findOneAndUpdate).toHaveBeenCalled();
      expect(usersService.updateUser).toHaveBeenCalledWith(
        targetUserId,
        expect.objectContaining({
          role: 'EXTERNAL',
          functionId,
        }),
      );
    });
  });
});
