import { Test, TestingModule } from '@nestjs/testing';
import { EditorialVersionService } from './editorial-version.service';
import { EditorialVersionRepository } from '../repositories/editorial-version.repository';
import { EditorialMapaRepository } from '../repositories/editorial-mapa.repository';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { EDITORIAL_EVENTS } from '../../shared/events/editorial.events';

describe('EditorialVersionService', () => {
  let service: EditorialVersionService;
  let versionRepository: Partial<EditorialVersionRepository>;
  let mapaRepository: Partial<EditorialMapaRepository>;
  let projectRepository: Partial<EditorialProjectRepository>;
  let eventEmitter: Partial<EventEmitter2>;

  const mockVersion = {
    _id: '507f1f77bcf86cd799439021',
    projectId: '507f1f77bcf86cd799439011',
    versionNumber: 1,
    name: 'Versão Inicial',
    status: 'active',
    createdBy: '507f1f77bcf86cd799439012',
    isActive: true,
  };

  const mockMapa = {
    _id: '507f1f77bcf86cd799439031',
    versionId: '507f1f77bcf86cd799439021',
    versionNumber: 1,
    name: 'Versão Inicial',
    positioningPhrase: 'A melhor escolha',
    mensagemCentral: 'Transforme seu negócio',
    pilares: [],
    tomDeVoz: { traits: ['formal'], rules: [] },
    retina: [],
  };

  beforeEach(async () => {
    versionRepository = {
      findAllByProject: jest.fn().mockResolvedValue([mockVersion]),
      findById: jest.fn().mockResolvedValue(mockVersion),
      findMaxVersionNumber: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(mockVersion),
      update: jest.fn().mockResolvedValue(mockVersion),
      softDelete: jest.fn().mockResolvedValue(mockVersion),
    };

    mapaRepository = {
      findByVersionId: jest.fn().mockResolvedValue(mockMapa),
      create: jest.fn().mockResolvedValue(mockMapa),
      update: jest.fn().mockResolvedValue(mockMapa),
      deleteByVersionId: jest.fn().mockResolvedValue(undefined),
    };

    projectRepository = {
      update: jest.fn().mockResolvedValue({}),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditorialVersionService,
        { provide: EditorialVersionRepository, useValue: versionRepository },
        { provide: EditorialMapaRepository, useValue: mapaRepository },
        { provide: EditorialProjectRepository, useValue: projectRepository },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<EditorialVersionService>(EditorialVersionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByProjectId', () => {
    it('should return versions for a project', async () => {
      const result = await service.findByProjectId(mockVersion.projectId);
      expect(result).toEqual([mockVersion]);
      expect(versionRepository.findAllByProject).toHaveBeenCalledWith(
        mockVersion.projectId,
      );
    });
  });

  describe('findById', () => {
    it('should return a version when found', async () => {
      const result = await service.findById(mockVersion._id);
      expect(result).toEqual(mockVersion);
      expect(versionRepository.findById).toHaveBeenCalledWith(mockVersion._id);
    });

    it('should throw NotFoundException when not found', async () => {
      versionRepository.findById = jest.fn().mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findMapa', () => {
    it('should return the mapa for a version', async () => {
      const result = await service.findMapa(mockVersion._id);
      expect(result).toEqual(mockMapa);
      expect(mapaRepository.findByVersionId).toHaveBeenCalledWith(
        mockVersion._id,
      );
    });

    it('should throw NotFoundException when mapa not found', async () => {
      mapaRepository.findByVersionId = jest.fn().mockResolvedValue(null);
      await expect(service.findMapa('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateMapa', () => {
    it('should update the mapa when version exists', async () => {
      const input = { mensagemCentral: 'Nova mensagem' };
      const result = await service.updateMapa(mockVersion._id, input);
      expect(result).toEqual(mockMapa);
      expect(versionRepository.findById).toHaveBeenCalledWith(mockVersion._id);
      expect(mapaRepository.update).toHaveBeenCalledWith(
        mockVersion._id,
        input,
      );
    });

    it('should throw NotFoundException when version not found', async () => {
      versionRepository.findById = jest.fn().mockResolvedValue(null);
      await expect(
        service.updateMapa('nonexistent', { mensagemCentral: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update version and emit archived event when status=archived', async () => {
      const input = { status: 'archived' as const };
      const result = await service.update(mockVersion._id, input);
      expect(result).toEqual(mockVersion);
      expect(versionRepository.update).toHaveBeenCalledWith(
        mockVersion._id,
        input,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EDITORIAL_EVENTS.VERSION_ARCHIVED,
        expect.objectContaining({
          event: EDITORIAL_EVENTS.VERSION_ARCHIVED,
          versionId: mockVersion._id,
        }),
      );
    });
  });

  describe('delete', () => {
    it('should soft delete version and cascade delete mapa', async () => {
      const result = await service.delete(mockVersion._id);
      expect(result).toEqual({ message: 'Versão removida com sucesso.' });
      expect(versionRepository.softDelete).toHaveBeenCalledWith(
        mockVersion._id,
      );
      expect(mapaRepository.deleteByVersionId).toHaveBeenCalledWith(
        mockVersion._id,
      );
    });

    it('should throw NotFoundException when version not found', async () => {
      versionRepository.softDelete = jest.fn().mockResolvedValue(null);
      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createFromOnboarding', () => {
    it('should create version, mapa and emit events', async () => {
      const projectId = mockVersion.projectId;
      const userId = mockVersion.createdBy;
      const onboardingData = {
        nicheData: { niche: 'Educação', subniche: 'EAD' },
        offerData: {
          product: 'Curso Online',
          offer: 'Combo Completo',
          promise: 'Aprenda rápido',
          roma: '',
          differentials: '',
        },
        audienceData: {
          icp: 'Profissionais que querem aprender',
          pains: '',
          desires: '',
          objections: '',
          myths: '',
        },
        brandingData: {
          puv: '',
          muv: '',
          bigIdea: 'Revolucione seu aprendizado',
          positioningPhrase: 'Líder em EAD',
          communicationStyle: 'Inspirador',
          brandPersonality: 'Inovador',
        },
        capacityData: {
          shortVideos: 5,
          longVideos: 2,
          carousels: 3,
          staticPosts: 10,
          weeklyLives: 1,
          dailyStories: 5,
        },
      };

      const result = await service.createFromOnboarding(
        projectId,
        onboardingData,
        userId,
      );

      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('mapa');
      expect(projectRepository.update).toHaveBeenCalled();
      expect(versionRepository.create).toHaveBeenCalled();
      expect(mapaRepository.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EDITORIAL_EVENTS.ONBOARDING_COMPLETED,
        expect.any(Object),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EDITORIAL_EVENTS.VERSION_CREATED,
        expect.any(Object),
      );
    });
  });

  describe('duplicate', () => {
    it('should duplicate version, mapa and emit event', async () => {
      const userId = mockVersion.createdBy;

      const result = await service.duplicate(mockVersion._id, userId);

      expect(result).toBeDefined();
      expect(versionRepository.findById).toHaveBeenCalledWith(mockVersion._id);
      expect(mapaRepository.findByVersionId).toHaveBeenCalledWith(
        mockVersion._id,
      );
      expect(versionRepository.create).toHaveBeenCalled();
      expect(mapaRepository.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EDITORIAL_EVENTS.VERSION_DUPLICATED,
        expect.any(Object),
      );
    });
  });
});
