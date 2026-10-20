import { StubScriptGenerator } from './stub-script.generator';

describe('StubScriptGenerator', () => {
  let generator: StubScriptGenerator;

  beforeEach(() => {
    generator = new StubScriptGenerator();
  });

  it('deve gerar blocos estruturados para formato reel', async () => {
    const result = await generator.generate({
      scriptId: 'script-123',
      projectId: 'project-123',
      format: 'reel',
      mode: 'conexao',
      themeTitle: 'Como criar conteúdo autêntico',
    });

    expect(result.blocks.length).toBeGreaterThanOrEqual(4);
    expect(result.blocks[0].type).toBe('gancho');
    expect(result.caption).toContain('Como criar conteúdo autêntico');
    expect(result.titles?.length).toBeGreaterThan(0);
    expect(result.thumbnailPrompts?.length).toBeGreaterThan(0);
  });

  it('deve gerar slides para formato carousel', async () => {
    const result = await generator.generate({
      scriptId: 'script-456',
      projectId: 'project-123',
      format: 'carousel',
      mode: 'seguranca',
      themeTitle: 'Framework de Vendas',
    });

    expect(result.blocks[0].type).toBe('slide_capa');
    expect(result.blocks.some((b) => b.type === 'slide_cta')).toBe(true);
  });

  it('deve regenerar conteúdo e direção visual de um bloco específico', async () => {
    const originalBlock = {
      order: 0,
      type: 'gancho' as const,
      title: 'Gancho inicial',
      content: 'Conteúdo original',
      visualDirection: 'Direção original',
    };

    const regenerated = await generator.regenerateBlock(
      originalBlock,
      'Mais enérgico',
    );

    expect(regenerated.content).toContain('Conteúdo original');
    expect(regenerated.content).toContain('Mais enérgico');
    expect(regenerated.visualDirection).toMatch(/alternativa visual/i);
  });
});
