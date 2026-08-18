//src/component/editorial ...
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Archive, RotateCcw, Edit2, FileText, Plus } from 'lucide-react';
import { EditorialVersionDTO } from '@/lib/dto/editorial.schema'; // Ajuste o caminho do schema gerado acima

// Mock validado pelo DTO
const mockVersions: EditorialVersionDTO[] = [
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

interface EditorialVersionManagerProps {
  projectId: string;
}

export function EditorialVersionManager({ projectId }: EditorialVersionManagerProps) {
  const [versions, setVersions] = useState<EditorialVersionDTO[]>(mockVersions);

  const handleDuplicate = (id: string) => {
    console.log('Disparar mutação para duplicar:', id);
  };

  const handleArchiveToggle = (id: string, currentStatus: string) => {
    console.log(`Disparar mutação para ${currentStatus === 'active' ? 'arquivar (soft delete)' : 'restaurar'}:`, id);
  };

  const handleRename = (id: string) => {
    console.log('Abrir modal/input para renomear:', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Versões da Linha Editorial</h2>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Gerencie o histórico estratégico do projeto.
          </p>
        </div>
        <Link
          href={`/dashboard/editorial/${projectId}/linha-editorial/onboarding`}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nova Linha
        </Link>
      </div>

      <div className="space-y-4">
        {versions.map((version) => (
          <div
            key={version.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-md border p-4 transition-all ${
              version.status === 'active'
                ? 'border-primary/50 bg-card'
                : 'border-border bg-background opacity-80'
            }`}
          >
            <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${
                version.status === 'active' ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'
              }`}>
                <FileText className="h-5 w-5" />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg text-foreground">
                    Linha v{version.versionNumber} — {version.name}
                  </h3>
                  {version.status === 'active' && (
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-primary">
                      Ativa
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs text-muted-foreground">
                  <span>Criada: {version.createdAt.toLocaleDateString('pt-BR')}</span>
                  <span>Atualizada: {version.updatedAt.toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-border pt-3 sm:border-0 sm:pt-0">
              {version.status === 'active' && (
                <Link
                  href={`/dashboard/editorial/${projectId}/linha-editorial/${version.id}/mapa`}
                  className="rounded-md px-3 py-1.5 font-sans text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                >
                  Abrir Mapa
                </Link>
              )}
              
              <button
                onClick={() => handleRename(version.id)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                title="Renomear"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handleDuplicate(version.id)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                title="Duplicar"
              >
                <Copy className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handleArchiveToggle(version.id, version.status)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                title={version.status === 'active' ? 'Arquivar' : 'Restaurar'}
              >
                {version.status === 'active' ? (
                  <Archive className="h-4 w-4" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}