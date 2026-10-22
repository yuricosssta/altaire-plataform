import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException } from '@nestjs/common';
import { EditorialThemeService } from './editorial-theme.service';
import { EditorialThemeRepository } from '../repositories/editorial-theme.repository';
import { EditorialCalendarRepository } from '../repositories/editorial-calendar.repository';
import { EditorialCalendarThemeVersionRepository } from '../repositories/editorial-calendar-theme-version.repository';
import { EditorialVersionRepository } from '../repositories/editorial-version.repository';
import { EditorialMapaRepository } from '../repositories/editorial-mapa.repository';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import { ThemeGenerator } from '../generators/theme-generator';

describe('EditorialThemeService', () => {
  let service: EditorialThemeService;
  let themeRepository: Partial<EditorialThemeRepository>;
  let calendarRepository: Partial<EditorialCalendarRepository>;
  let themeVersionRepository: Partial<EditorialCalendarThemeVersionRepository>;
  let versionRepository: Partial<EditorialVersionRepository>;
  let mapaRepository: Partial<EditorialMapaRepository>;
  let projectRepository: Partial<EditorialProjectRepository>;
  let themeGenerator: Partial<ThemeGenerator>;
  let eventEmitter: Partial<EventEmitter2>;

  const mockTheme = {
    _id: '507f1f77bcf86cd799439051',
    id: '507f1f77bcf86cd799439051',
    projectId: '507f1f77bcf86cd799439011',
    origin: 'roma_avatar' as const,
    title: 'Tema Teste',
    pillar: 'Vendas',
    retinaType: 'autoridade' as const,
    consciousnessLevel: 'solucao' as const,
    journeyStage: 'consideracao' as const,
    format: 'reel' as const,
    platforms: ['instagram' as const],
    status: 'active' as const,
    isActive: true,
  };

  const mockCalendar = {
    _id: '507f1f77bcf86cd799439041',
    id: '507f1f77bcf86cd799439041',
    projectId: '507f1f77bcf86cd799439011',
    period: {
      type: 'two_weeks' as const,
      label: '2 semanas',
      startDate: new Date(),
      endDate: new Date(),
    },
    days: [
      {
        date: new Date(),
        items: [
          {
            _id: 'item-1',
            id: 'item-1',
            date: new Date(),
            format: 'reel' as const,
            retinaType: 'autoridade' as const,
            platforms: ['instagram' as const],
            objective: 'Crescer',
            suggestedTime: '07:00',
            status: 'planned' as const,
            themeId: '507f1f77bcf86cd799439051',
            theme: 'Tema Teste',
          },
        ],
        storySequences: [],
      },
    ],
  };

  beforeEach(async () => {
    themeRepository = {
      findAllByProject: jest.fn().mockResolvedValue([mockTheme]),
      findById: jest.fn().mockResolvedValue(mockTheme),
      findByIds: jest.fn().mockResolvedValue([mockTheme]),
      createMany: jest.fn().mockImplementation((arr) => Promise.resolve(arr)),
      update: jest.fn().mockResolvedValue(mockTheme),
      bulkUpdateStatus: jest.fn().mockResolvedValue(1),
      softDelete: jest.fn().mockResolvedValue(mockTheme),
    };

    calendarRepository = {
      findById: jest.fn().mockResolvedValue(mockCalendar),
      assignItemTheme: jest.fn().mockResolvedValue(mockCalendar),
      countItemsByThemeId: jest.fn().mockResolvedValue(0),
    };

    themeVersionRepository = {
      findAllByCalendar: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    };

    projectRepository = {
      findById: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        niche: 'Finanças',
        subniche: 'Ações',
      }),
    };

    versionRepository = {
      findAllByProject: jest.fn().mockResolvedValue([
        {
          _id: 'version-1',
          status: 'active',
        },
      ]),
    };

    mapaRepository = {
      findByVersionId: jest.fn().mockResolvedValue({
        pilares: [{ title: 'Vendas' }, { title: 'Liderança' }],
        mensagemCentral: 'Mensagem central',
      }),
    };

    themeGenerator = {
      generate: jest.fn().mockResolvedValue([mockTheme]),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditorialThemeService,
        { provide: EditorialThemeRepository, useValue: themeRepository },
        { provide: EditorialCalendarRepository, useValue: calendarRepository },
        {
          provide: EditorialCalendarThemeVersionRepository,
          useValue: themeVersionRepository,
        },
        { provide: EditorialVersionRepository, useValue: versionRepository },
        { provide: EditorialMapaRepository, useValue: mapaRepository },
        { provide: EditorialProjectRepository, useValue: projectRepository },
        { provide: ThemeGenerator, useValue: themeGenerator },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<EditorialThemeService>(EditorialThemeService);
  });

  it('deve listar temas por projeto', async () => {
    const themes = await service.findAll('507f1f77bcf86cd799439011');
    expect(themes).toHaveLength(1);
  });

  it('deve gerar temas e emitir evento THEME_GENERATED', async () => {
    const result = await service.generate(
      '507f1f77bcf86cd799439011',
      {
        mode: 'roma_avatar',
        params: {
          volume: '20',
          pillars: ['Vendas'],
          retinaPriority: 'balanced',
        },
      },
      'user-1',
    );

    expect(result.themes).toHaveLength(1);
    expect(eventEmitter.emit).toHaveBeenCalled();
  });

  it('deve impedir exclusão e lançar ConflictException se o tema estiver em calendário ativo', async () => {
    calendarRepository.countItemsByThemeId = jest.fn().mockResolvedValue(1);

    await expect(service.delete('507f1f77bcf86cd799439051')).rejects.toThrow(
      ConflictException,
    );
  });

  it('deve excluir suavemente se o tema não tiver vínculos', async () => {
    calendarRepository.countItemsByThemeId = jest.fn().mockResolvedValue(0);

    const result = await service.delete('507f1f77bcf86cd799439051');
    expect(result.message).toContain('removido');
    expect(themeRepository.softDelete).toHaveBeenCalled();
  });

  it('deve calcular o balance do calendário', async () => {
    const report = await service.getBalance(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439041',
    );

    expect(report.totalSlots).toBe(1);
    expect(report.filledSlots).toBe(1);
    expect(report.retina.length).toBe(6);
  });
});
