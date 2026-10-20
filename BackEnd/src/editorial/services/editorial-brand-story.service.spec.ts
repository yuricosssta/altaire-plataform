import { Test, TestingModule } from '@nestjs/testing';
import { EditorialBrandStoryService } from './editorial-brand-story.service';
import { EditorialBrandStoryRepository } from '../repositories/editorial-brand-story.repository';

describe('EditorialBrandStoryService', () => {
  let service: EditorialBrandStoryService;
  let brandStoryRepository: Partial<EditorialBrandStoryRepository>;

  const mockBrandStory = {
    organizationId: 'altaire',
    userId: 'user-123',
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
      findByUserId: jest.fn().mockImplementation((userId) => {
        if (userId === 'user-123') return Promise.resolve(mockBrandStory);
        return Promise.resolve(null);
      }),
      upsert: jest.fn().mockImplementation((userId, orgId, data) =>
        Promise.resolve({
          ...mockBrandStory,
          ...data,
          userId,
          organizationId: orgId,
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

  it('deve retornar a BrandStory existente do usuário', async () => {
    const result = await service.get('user-123');
    expect(result.originStory).toBe('Minha história de origem');
    expect(result.usableStories).toHaveLength(1);
  });

  it('deve retornar BrandStory vazia estruturada se não existir para o usuário', async () => {
    const result = await service.get('user-novo');
    expect(result.originStory).toBe('');
    expect(result.keyTurnarounds).toEqual([]);
    expect(result.usableStories).toEqual([]);
  });

  it('deve fazer upsert da BrandStory do usuário', async () => {
    const result = await service.upsert('user-123', 'altaire', {
      originStory: 'História atualizada',
    });
    expect(result.originStory).toBe('História atualizada');
  });
});
