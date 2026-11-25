import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StorageController } from './storage.controller';
import { StorageService } from '../services/storage.service';

describe('StorageController', () => {
  let controller: StorageController;
  let storageService: Record<string, jest.Mock>;

  beforeEach(async () => {
    storageService = {
      getPresignedUploadUrl: jest.fn(),
      confirmUploadAndRegister: jest.fn(),
      getCompanyAssets: jest
        .fn()
        .mockResolvedValue({ storageUsed: 0, assets: [] }),
      createBrandAsset: jest.fn(),
      updateBrandAsset: jest.fn(),
      deleteAsset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        { provide: StorageService, useValue: storageService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    controller = module.get<StorageController>(StorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAssets should throw BadRequestException if x-company-id is missing', async () => {
    await expect(
      controller.getAssets('', undefined, { user: { sub: 'u1' } }),
    ).rejects.toThrow(BadRequestException);
  });
});
