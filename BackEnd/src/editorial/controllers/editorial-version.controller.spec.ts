import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EditorialVersionController } from './editorial-version.controller';
import { EditorialVersionService } from '../services/editorial-version.service';

describe('EditorialVersionController', () => {
  let controller: EditorialVersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditorialVersionController],
      providers: [
        {
          provide: EditorialVersionService,
          useValue: { findMapa: jest.fn(), duplicate: jest.fn(), update: jest.fn(), delete: jest.fn(), updateMapa: jest.fn() },
        },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    controller = module.get<EditorialVersionController>(EditorialVersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});