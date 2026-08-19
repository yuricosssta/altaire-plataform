//src/component/editorial ...
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy, Archive, RotateCcw, Edit2, FileText, Plus, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { EditorialVersionDTO } from '@/lib/dto/editorial.schema'; // Ajuste o caminho do schema gerado acima
import { editorialService } from '@/lib/services/editorialService';

interface EditorialVersionManagerProps {
  projectId: string;
}

export function EditorialVersionManager({ projectId }: EditorialVersionManagerProps) {
  const [versions, setVersions] = useState<EditorialVersionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadVersions = useCallback(async () => {
    try {
      const data = await editorialService.listVersions(projectId);
      setVersions(data);
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao carregar as versões da linha editorial.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await editorialService.duplicateVersion(id);
      setVersions((prev) => [duplicated, ...prev]);
      toast.success('Linha editorial duplicada com sucesso.');
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao duplicar a linha editorial.');
    }
  };

  const handleArchiveToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'archived' : 'active';
    try {
      const updated = await editorialService.updateVersion(id, { status: nextStatus });
      setVersions((prev) => prev.map((version) => (version.id === id ? updated : version)));
      toast.success(nextStatus === 'archived' ? 'Linha editorial arquivada.' : 'Linha editorial restaurada.');
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao atualizar a linha editorial.');
    }
  };

  const handleRenameStart = (version: EditorialVersionDTO) => {
    setEditingId(version.id);
    setEditingName(version.name);
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleRenameSubmit = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      const updated = await editorialService.updateVersion(id, { name: editingName.trim() });
      setVersions((prev) => prev.map((version) => (version.id === id ? updated : version)));
      toast.success('Nome da linha editorial atualizado.');
      handleRenameCancel();
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao renomear a linha editorial.');
    }
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

      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-10 font-sans text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Carregando versões...
        </div>
      )}

      {!isLoading && versions.length === 0 && (
        <div className="rounded-md border border-border bg-card p-10 text-center font-sans text-muted-foreground">
          Nenhuma linha editorial criada ainda. Clique em "Nova Linha" para começar.
        </div>
      )}

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
                {editingId === version.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit(version.id);
                        if (e.key === 'Escape') handleRenameCancel();
                      }}
                      autoFocus
                      className="rounded-md border border-border bg-background px-3 py-1 font-serif text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <button
                      onClick={() => handleRenameSubmit(version.id)}
                      className="rounded-md p-2 text-primary transition-colors hover:bg-primary/10"
                      title="Salvar"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleRenameCancel}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                      title="Cancelar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
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
                )}
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs text-muted-foreground">
                  <span>Criada: {version.createdAt?.toLocaleDateString('pt-BR')}</span>
                  <span>Atualizada: {version.updatedAt?.toLocaleDateString('pt-BR')}</span>
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
                onClick={() => handleRenameStart(version)}
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