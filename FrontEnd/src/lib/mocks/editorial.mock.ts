// src/lib/mocks/editorial.mock.ts
// Dados mock do módulo editorial — usados como fallback do BFF enquanto o
// backend NestJS não expõe o contrato /editorial/*.

import {
  EditorialMapaDTO,
  EditorialVersionDTO,
  OnboardingFormDTO,
  ProjectCardDTO,
} from '@/lib/dto/editorial.schema';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

function generateObjectId(): string {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 24; i += 1) {
    id += hex[Math.floor(Math.random() * 16)];
  }
  return id;
}

export const mockProjects: ProjectCardDTO[] = [
  {
    id: '64f1b2c3e4b0a1c2d3e4f5a6',
    name: 'Autoridade Imperial — Orgânico',
    niche: 'Desenvolvimento Pessoal',
    subniche: 'Alta Performance',
    currentObjective: 'Aquecimento de Audiência',
    editorialLineStatus: 'active',
    calendarStatus: 'pending',
    updatedAt: new Date('2026-08-01T10:00:00Z'),
  },
  {
    id: '64f1b2c3e4b0a1c2d3e4f5a7',
    name: 'Produto X — Lançamento Semente',
    niche: 'Finanças',
    subniche: 'Algorithmic Trading',
    currentObjective: 'Conversão',
    editorialLineStatus: 'active',
    calendarStatus: 'active',
    updatedAt: new Date('2026-08-05T14:30:00Z'),
  },
];

export const mockVersions: EditorialVersionDTO[] = [
  {
    id: '64f1b2c3e4b0a1c2d3e4f5a8',
    projectId: '64f1b2c3e4b0a1c2d3e4f5a6',
    versionNumber: 3,
    name: 'Fase de Conversão',
    status: 'active',
    createdAt: new Date('2026-08-05T10:00:00Z'),
    updatedAt: new Date('2026-08-07T14:30:00Z'),
  },
  {
    id: '64f1b2c3e4b0a1c2d3e4f5a9',
    projectId: '64f1b2c3e4b0a1c2d3e4f5a6',
    versionNumber: 2,
    name: 'Campanha de Crescimento',
    status: 'archived',
    createdAt: new Date('2026-07-20T09:00:00Z'),
    updatedAt: new Date('2026-08-05T09:59:00Z'),
  },
  {
    id: '64f1b2c3e4b0a1c2d3e4f5b0',
    projectId: '64f1b2c3e4b0a1c2d3e4f5a6',
    versionNumber: 1,
    name: 'Base',
    status: 'archived',
    createdAt: new Date('2026-07-01T08:00:00Z'),
    updatedAt: new Date('2026-07-19T18:00:00Z'),
  },
];

export const mockMapa: EditorialMapaDTO = {
  versionId: '64f1b2c3e4b0a1c2d3e4f5a8',
  versionNumber: 3,
  name: 'Campanha de Crescimento',
  mensagemCentral:
    'A estagnação profissional não é falta de esforço, é falta de alinhamento estratégico. Defendemos a construção de autoridade baseada em execução real e metodologias validadas, combatendo o "achismo" no mercado digital.',
  pilares: [
    {
      title: 'Quebra de mitos do mercado',
      description: 'Desconstruir ideias falsas sobre atalhos no SaaS e na Engenharia.',
    },
    {
      title: 'Bastidores da execução',
      description: 'Mostrar o processo de desenvolvimento e tomada de decisão técnica.',
    },
    {
      title: 'Educação prática',
      description: 'Tutoriais rápidos e conceitos de arquitetura aplicados.',
    },
    {
      title: 'Narrativas de autoridade',
      description: 'Estudos de caso, resultados de projetos anteriores e histórico profissional.',
    },
  ],
  tomDeVoz: {
    traits: ['Direto', 'Professoral', 'Elegante', 'Incisivo'],
    rules: [
      'Evite jargões excessivos sem explicação imediata.',
      'Nunca faça promessas de ganhos fáceis.',
      'Abra raciocínios com dados ou constatações contraintuitivas.',
    ],
  },
  retina: [
    { label: 'Relacionamento', weight: 15 },
    { label: 'Engajamento', weight: 20 },
    { label: 'Transformação', weight: 30 },
    { label: 'Interação', weight: 10 },
    { label: 'Níveis de Consciência', weight: 15 },
    { label: 'Autoridade', weight: 10 },
  ],
};

export function mockVersionsForProject(projectId: string): EditorialVersionDTO[] {
  return mockVersions.filter((version) => version.projectId === projectId);
}

export function mockVersionById(versionId: string): EditorialVersionDTO | undefined {
  return mockVersions.find((version) => version.id === versionId);
}

export function mockCreateVersion(
  projectId: string,
  name: string,
  status: 'active' | 'archived' = 'active',
): EditorialVersionDTO {
  const highest = mockVersions.reduce(
    (max, version) => (version.projectId === projectId ? Math.max(max, version.versionNumber) : max),
    0,
  );
  const now = new Date();
  return {
    id: generateObjectId(),
    projectId,
    versionNumber: highest + 1,
    name,
    status,
    createdAt: now,
    updatedAt: now,
  };
}

export function mockDuplicateVersion(version: EditorialVersionDTO): EditorialVersionDTO {
  const now = new Date();
  return {
    ...version,
    id: generateObjectId(),
    name: `${version.name} (cópia)`,
    status: 'archived',
    createdAt: now,
    updatedAt: now,
  };
}

export function mockPatchVersion(
  version: EditorialVersionDTO,
  patch: { name?: string; status?: 'active' | 'archived' },
): EditorialVersionDTO {
  return {
    ...version,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    updatedAt: new Date(),
  };
}

export function mockMapaFromOnboarding(
  version: EditorialVersionDTO,
  data: OnboardingFormDTO,
): EditorialMapaDTO {
  return {
    versionId: version.id,
    versionNumber: version.versionNumber,
    name: `${data.nicheData.niche} — ${data.offerData.product}`,
    mensagemCentral: data.offerData.promise,
    pilares: [
      {
        title: data.brandingData.bigIdea || 'Ideia central da marca',
        description: data.brandingData.puv || data.offerData.roma || '',
      },
      {
        title: 'Educação prática',
        description: `Tutoriais e conteúdo voltado para ${data.audienceData.icp}.`,
      },
      {
        title: 'Bastidores da execução',
        description: data.audienceData.desires || 'Processos e bastidores da operação.',
      },
      {
        title: 'Narrativas de autoridade',
        description: data.audienceData.pains || 'Estudos de caso e resultados.',
      },
    ],
    tomDeVoz: {
      traits: [data.brandingData.communicationStyle || 'Direto', 'Professoral', 'Elegante'],
      rules: [
        'Evite jargões excessivos sem explicação imediata.',
        'Nunca faça promessas de ganhos fáceis.',
        'Abra raciocínios com dados ou constatações contraintuitivas.',
      ],
    },
    retina: [
      { label: 'Relacionamento', weight: 15 },
      { label: 'Engajamento', weight: 20 },
      { label: 'Transformação', weight: 30 },
      { label: 'Interação', weight: 10 },
      { label: 'Níveis de Consciência', weight: 15 },
      { label: 'Autoridade', weight: 10 },
    ],
  };
}

export function isValidObjectId(value: string): boolean {
  return OBJECT_ID_REGEX.test(value);
}