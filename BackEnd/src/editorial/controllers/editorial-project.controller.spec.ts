import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EditorialProjectController } from './editorial-project.controller';
import { EditorialProjectService } from '../services/editorial-project.service';
import { EditorialVersionService } from '../services/editorial-version.service';

describe('EditorialProjectController', () => {
  let controller: EditorialProjectController;
  let projectService: Record<string, jest.Mock>;

  const companyId = '507f1f77bcf86cd799439010';
  const brandId = '507f1f77bcf86cd799439020';
  const user = { sub: '507f1f77bcf86cd799439012', role: 'MEMBER' };

  beforeEach(async () => {
    projectService = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue({ _id: 'p1' }),
      create: jest.fn().mockResolvedValue({ _id: 'p1' }),
      update: jest.fn().mockResolvedValue({ _id: 'p1' }),
      delete: jest.fn().mockResolvedValue({ message: 'ok' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditorialProjectController],
      providers: [
        { provide: EditorialProjectService, useValue: projectService },
        {
          provide: EditorialVersionService,
          useValue: {
            createFromOnboarding: jest.fn(),
            findByProjectId: jest.fn(),
          },
        },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    controller = module.get<EditorialProjectController>(
      EditorialProjectController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should require x-company-id header', async () => {
    await expect(controller.findAll('', undefined, { user })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('findAll should delegate to projectService with companyId, user and brandId', async () => {
    await controller.findAll(companyId, brandId, { user });
    expect(projectService.findAll).toHaveBeenCalledWith(
      companyId,
      user,
      brandId,
    );
  });
});
