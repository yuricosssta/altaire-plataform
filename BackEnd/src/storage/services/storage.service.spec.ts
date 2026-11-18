import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StorageService } from './storage.service';
import { Organization } from '../../organization/schemas/organization.schema';
import { FileAsset } from '../schemas/file-asset.schema';

describe('StorageService', () => {
  let service: StorageService;

  const mockOrgModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockFileAssetModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: getModelToken(Organization.name), useValue: mockOrgModel },
        {
          provide: getModelToken(FileAsset.name),
          useValue: mockFileAssetModel,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
