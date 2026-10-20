import { StubThemeGenerator } from './stub-theme.generator';

describe('StubThemeGenerator', () => {
  let generator: StubThemeGenerator;

  beforeEach(() => {
    generator = new StubThemeGenerator();
  });

  it('deve gerar a quantidade solicitada de temas', async () => {
    const result = await generator.generate(
      {
        projectId: '507f1f77bcf86cd799439011',
        niche: 'Finanças',
        subniche: 'Investimentos',
        pillars: ['Renda Fixa', 'Ações', 'Reserva de Emergência'],
      },
      {
        mode: 'roma_avatar',
        count: 20,
        batchId: 'batch-123',
        platforms: ['instagram'],
      },
    );

    expect(result).toHaveLength(20);
    expect(result[0]).toHaveProperty('title');
    expect(result[0].projectId).toBe('507f1f77bcf86cd799439011');
    expect(result[0].batchId).toBe('batch-123');
    expect(result[0].origin).toBe('roma_avatar');
    expect(result[0].status).toBe('active');
  });

  it('deve priorizar tipo RETINA quando configurado', async () => {
    const result = await generator.generate(
      {
        projectId: '507f1f77bcf86cd799439011',
        pillars: ['Conteúdo'],
      },
      {
        mode: 'roma_avatar',
        count: 10,
        batchId: 'batch-retina',
        platforms: ['instagram'],
        retinaPriority: 'autoridade',
      },
    );

    const autoridadeCount = result.filter(
      (t) => t.retinaType === 'autoridade',
    ).length;
    expect(autoridadeCount).toBeGreaterThanOrEqual(5);
  });

  it('deve utilizar pilares de fallback quando o contexto estiver vazio', async () => {
    const result = await generator.generate(
      {
        projectId: '507f1f77bcf86cd799439011',
        pillars: [],
      },
      {
        mode: 'objective',
        count: 5,
        batchId: 'batch-fallback',
        platforms: ['instagram'],
      },
    );

    expect(result).toHaveLength(5);
    expect(result[0].pillar).toBeDefined();
    expect(result[0].title).toBeTruthy();
  });
});
