import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EditorialProjectController } from './editorial-project.controller';
import { EditorialProjectService } from '../services/editorial-project.service';
import { EditorialVersionService } from '../services/editorial-version.service';

describe('EditorialProjectController', () => {
  let controller: EditorialProjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditorialProjectController],
      providers: [
        { provide: EditorialProjectService, useValue: { findAll: jest.fn(), findById: jest.fn() } },
        { provide: EditorialVersionService, useValue: { createFromOnboarding: jest.fn(), findByProjectId: jest.fn() } },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    controller = module.get<EditorialProjectController>(EditorialProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});