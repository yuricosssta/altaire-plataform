import { Test, TestingModule } from '@nestjs/testing';
import { EditorialProjectService } from './editorial-project.service';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import { NotFoundException } from '@nestjs/common';

describe('EditorialProjectService', () => {
  let service: EditorialProjectService;
  let repository: Partial<EditorialProjectRepository>;

  const mockProject = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Projeto Teste',
    niche: 'Marketing',
    subniche: 'Marketing Digital',
    currentObjective: 'Criar conteúdo',
    editorialLineStatus: 'active',
    calendarStatus: 'pending',
    createdBy: '507f1f77bcf86cd799439012',
    orgId: 'altaire',
    isActive: true,
  };

  beforeEach(async () => {
    repository = {
      findAll: jest.fn().mockResolvedValue([mockProject]),
      findById: jest.fn().mockResolvedValue(mockProject),
      create: jest.fn().mockResolvedValue(mockProject),
      update: jest.fn().mockResolvedValue(mockProject),
      softDelete: jest.fn().mockResolvedValue(mockProject),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditorialProjectService,
        { provide: EditorialProjectRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<EditorialProjectService>(EditorialProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all projects for an orgId', async () => {
      const result = await service.findAll('altaire');
      expect(result).toEqual([mockProject]);
      expect(repository.findAll).toHaveBeenCalledWith('altaire');
    });
  });

  describe('findById', () => {
    it('should return a project when found', async () => {
      const result = await service.findById(mockProject._id);
      expect(result).toEqual(mockProject);
      expect(repository.findById).toHaveBeenCalledWith(mockProject._id);
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findById = jest.fn().mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const input = {
        name: 'Novo Projeto',
        niche: 'Educação',
        subniche: 'EAD',
        currentObjective: 'Lançar curso',
        createdBy: '507f1f77bcf86cd799439012',
      };
      const result = await service.create(input);
      expect(result).toEqual(mockProject);
      expect(repository.create).toHaveBeenCalledWith(input);
    });
  });

  describe('update', () => {
    it('should update a project when found', async () => {
      const input = { name: 'Atualizado' };
      const result = await service.update(mockProject._id, input);
      expect(result).toEqual(mockProject);
      expect(repository.update).toHaveBeenCalledWith(mockProject._id, input);
    });

    it('should throw NotFoundException when project not found', async () => {
      repository.update = jest.fn().mockResolvedValue(null);
      await expect(
        service.update('nonexistent', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete a project when found', async () => {
      const result = await service.delete(mockProject._id);
      expect(result).toEqual({
        message: 'Projeto editorial removido com sucesso.',
      });
      expect(repository.softDelete).toHaveBeenCalledWith(mockProject._id);
    });

    it('should throw NotFoundException when project not found', async () => {
      repository.softDelete = jest.fn().mockResolvedValue(null);
      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
