import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from '../services/storage.service';
import { AuthGuard } from '../../auth/auth.guard';

describe('StorageController', () => {
  let controller: StorageController;

  const mockStorageService = {
    getPresignedUploadUrl: jest.fn(),
    confirmUploadAndRegister: jest.fn(),
    getOrganizationAssets: jest.fn(),
    createBrandAsset: jest.fn(),
    updateBrandAsset: jest.fn(),
    deleteAsset: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [{ provide: StorageService, useValue: mockStorageService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StorageController>(StorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
