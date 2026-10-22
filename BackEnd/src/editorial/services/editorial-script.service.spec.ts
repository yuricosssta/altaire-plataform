import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditorialScriptService } from './editorial-script.service';
import { EditorialScriptRepository } from '../repositories/editorial-script.repository';
import { EditorialScriptVersionRepository } from '../repositories/editorial-script-version.repository';
import { EditorialThemeRepository } from '../repositories/editorial-theme.repository';
import { EditorialCalendarRepository } from '../repositories/editorial-calendar.repository';
import { ScriptGenerator } from '../generators/script-generator';
import { EDITORIAL_EVENTS } from '../../shared/events/editorial.events';

describe('EditorialScriptService', () => {
  let service: EditorialScriptService;
  let scriptRepository: Partial<EditorialScriptRepository>;
  let scriptVersionRepository: Partial<EditorialScriptVersionRepository>;
  let themeRepository: Partial<EditorialThemeRepository>;
  let calendarRepository: Partial<EditorialCalendarRepository>;
  let scriptGenerator: Partial<ScriptGenerator>;
  let eventEmitter: Partial<EventEmitter2>;

  const mockScript = {
    _id: '507f1f77bcf86cd799439061',
    id: '507f1f77bcf86cd799439061',
    projectId: '507f1f77bcf86cd799439011',
    format: 'reel' as const,
    version: 1,
    mode: 'conexao' as const,
    status: 'rascunho' as const,
    title: 'Roteiro de Reels',
    blocks: [
      {
        order: 0,
        type: 'gancho' as const,
        title: 'Gancho',
        content: 'Conteúdo gancho',
      },
    ],
    createdBy: 'user-123',
    isActive: true,
  };

  beforeEach(async () => {
    scriptRepository = {
      findAllByProject: jest.fn().mockResolvedValue([mockScript]),
      findById: jest.fn().mockResolvedValue(mockScript),
      create: jest
        .fn()
        .mockImplementation((data) =>
          Promise.resolve({ ...mockScript, ...data }),
        ),
      update: jest
        .fn()
        .mockImplementation((id, data) =>
          Promise.resolve({ ...mockScript, ...data }),
        ),
      softDelete: jest.fn().mockResolvedValue(mockScript),
      addAttachment: jest
        .fn()
        .mockResolvedValue({ _id: 'att-1', title: 'Anexo' }),
      removeAttachment: jest.fn().mockResolvedValue(true),
    };

    scriptVersionRepository = {
      findAllByScriptId: jest.fn().mockResolvedValue([]),
      findMaxVersionNumber: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    };

    themeRepository = {
      findById: jest.fn().mockResolvedValue({
        title: 'Tema Vinculado',
        retinaType: 'autoridade',
      }),
      findAllByProject: jest.fn().mockResolvedValue([]),
    };

    calendarRepository = {
      findAllByProject: jest.fn().mockResolvedValue([]),
    };

    scriptGenerator = {
      generate: jest.fn().mockResolvedValue({
        blocks: mockScript.blocks,
        caption: 'Legenda gerada',
        titles: [{ title: 'Título gerado', hookType: 'metodo' }],
        thumbnailPrompts: [],
        complementaryMaterials: [],
        explanationMaterials: [],
      }),
      regenerateBlock: jest.fn().mockImplementation((b) => Promise.resolve(b)),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditorialScriptService,
        { provide: EditorialScriptRepository, useValue: scriptRepository },
        {
          provide: EditorialScriptVersionRepository,
          useValue: scriptVersionRepository,
        },
        { provide: EditorialThemeRepository, useValue: themeRepository },
        { provide: EditorialCalendarRepository, useValue: calendarRepository },
        { provide: ScriptGenerator, useValue: scriptGenerator },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<EditorialScriptService>(EditorialScriptService);
  });

  it('deve criar um roteiro e emitir evento SCRIPT_CREATED', async () => {
    const created = await service.create('project-1', 'user-1', {
      format: 'reel',
      mode: 'conexao',
      title: 'Novo Roteiro',
    });

    expect(created.title).toBe('Novo Roteiro');
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EDITORIAL_EVENTS.SCRIPT_CREATED,
      expect.anything(),
    );
  });

  it('deve gerar roteiro com stub e emitir SCRIPT_GENERATED', async () => {
    const generated = await service.generate(
      'project-1',
      '507f1f77bcf86cd799439061',
    );
    expect(generated.status).toBe('pronto');
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EDITORIAL_EVENTS.SCRIPT_GENERATED,
      expect.anything(),
    );
  });

  it('deve duplicar um roteiro resetando a versão para 1', async () => {
    const duplicated = await service.duplicate(
      '507f1f77bcf86cd799439061',
      'user-2',
    );
    expect(duplicated.version).toBe(1);
    expect(duplicated.status).toBe('rascunho');
    expect(duplicated.title).toContain('(Cópia)');
  });

  it('deve exportar o roteiro em formato markdown string', async () => {
    const markdown = await service.export('507f1f77bcf86cd799439061');
    expect(markdown).toContain('# Roteiro de Reels');
    expect(markdown).toContain('## Blocos do Roteiro');
  });

  it('deve criar uma nova versão incrementada', async () => {
    const version = await service.createVersion(
      '507f1f77bcf86cd799439061',
      'user-1',
      'Versão ajustada',
    );
    expect(version.versionNumber).toBe(2);
    expect(scriptRepository.update).toHaveBeenCalled();
  });
});
