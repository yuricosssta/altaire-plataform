import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from '../services/organization.service';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let orgService: Record<string, jest.Mock>;

  const orgId = '507f1f77bcf86cd799439011';
  const userId = '507f1f77bcf86cd799439012';
  const functionId = '507f1f77bcf86cd799439015';

  beforeEach(async () => {
    orgService = {
      listFunctions: jest.fn().mockResolvedValue([]),
      createFunction: jest.fn().mockResolvedValue({ _id: functionId }),
      updateFunction: jest.fn().mockResolvedValue({ _id: functionId }),
      deleteFunction: jest.fn().mockResolvedValue({ message: 'Função removida com sucesso.' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        { provide: OrganizationService, useValue: orgService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should block CLIENT and EXTERNAL from listing or managing functions', () => {
    expect(() =>
      controller.getFunctions(orgId, { user: { sub: userId, role: 'CLIENT' } }),
    ).toThrow(ForbiddenException);
    expect(() =>
      controller.createFunction(
        orgId,
        { name: 'Editor', description: 'Edita vídeos' },
        { user: { sub: userId, role: 'EXTERNAL' } },
      ),
    ).toThrow(ForbiddenException);
    expect(() =>
      controller.deleteFunction(orgId, functionId, {
        user: { sub: userId, role: 'CLIENT' },
      }),
    ).toThrow(ForbiddenException);
  });

  it('should delegate listFunctions to OrganizationService for MEMBER and ADMIN', () => {
    controller.getFunctions(orgId, {
      user: { sub: userId, email: 'member@test.com', role: 'MEMBER' },
    });
    expect(orgService.listFunctions).toHaveBeenCalledWith(orgId, userId, false);

    controller.getFunctions(orgId, {
      user: { sub: userId, email: 'admin@test.com', role: 'ADMIN' },
    });
    expect(orgService.listFunctions).toHaveBeenCalledWith(orgId, userId, true);
  });
});
