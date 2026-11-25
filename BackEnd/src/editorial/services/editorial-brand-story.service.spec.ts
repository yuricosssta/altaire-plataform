import { Test, TestingModule } from '@nestjs/testing';
import { EditorialBrandStoryService } from './editorial-brand-story.service';
import { EditorialBrandStoryRepository } from '../repositories/editorial-brand-story.repository';

describe('EditorialBrandStoryService', () => {
  let service: EditorialBrandStoryService;
  let brandStoryRepository: Partial<EditorialBrandStoryRepository>;

  const companyId = '507f1f77bcf86cd799439010';
  const brandId = '507f1f77bcf86cd799439020';

  const mockBrandStory = {
    organizationId: 'altaire',
    companyId,
    brandId,
    userId: '507f1f77bcf86cd799439012',
    originStory: 'Minha história de origem',
    keyTurnarounds: ['Primeira virada'],
    failures: ['Primeira falha'],
    achievements: ['Primeira conquista'],
    values: ['Integridade'],
    lifestyle: 'Equilíbrio e foco',
    usableStories: [
      {
        title: 'História do café',
        content: 'Conteúdo da história',
        tags: ['resiliencia'],
      },
    ],
  };

  beforeEach(async () => {
    brandStoryRepository = {
      findByBrandId: jest.fn().mockImplementation((bId) => {
        if (bId === brandId) return Promise.resolve(mockBrandStory);
        return Promise.resolve(null);
      }),
      upsertByBrand: jest.fn().mockImplementation((bId, cId, data, updatedBy) =>
        Promise.resolve({
          ...mockBrandStory,
          ...data,
          brandId: bId,
          companyId: cId,
          userId: updatedBy,
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditorialBrandStoryService,
        {
          provide: EditorialBrandStoryRepository,
          useValue: brandStoryRepository,
        },
      ],
    }).compile();

    service = module.get<EditorialBrandStoryService>(
      EditorialBrandStoryService,
    );
  });

  it('deve retornar a BrandStory existente da marca', async () => {
    const result = await service.getByBrand(brandId, companyId);
    expect(result.originStory).toBe('Minha história de origem');
    expect(result.brandId).toBe(brandId);
    expect(result.usableStories).toHaveLength(1);
  });

  it('deve retornar BrandStory vazia estruturada se não existir para a marca', async () => {
    const result = await service.getByBrand(
      '507f1f77bcf86cd799439099',
      companyId,
    );
    expect(result.originStory).toBe('');
    expect(result.keyTurnarounds).toEqual([]);
    expect(result.usableStories).toEqual([]);
    expect(result.brandId).toBe('507f1f77bcf86cd799439099');
  });

  it('deve fazer upsert da BrandStory da marca', async () => {
    const result = await service.upsertByBrand(
      brandId,
      companyId,
      { originStory: 'História atualizada' },
      '507f1f77bcf86cd799439012',
    );
    expect(result.originStory).toBe('História atualizada');
    expect(brandStoryRepository.upsertByBrand).toHaveBeenCalledWith(
      brandId,
      companyId,
      { originStory: 'História atualizada' },
      '507f1f77bcf86cd799439012',
    );
  });
});
