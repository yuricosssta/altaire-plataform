'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { scriptsService } from '@/lib/services/scriptsService';
import type { ScriptVersion } from '@/lib/dto/editorial.schema';

export default function ScriptVersionsPage() {
  const params = useParams<{ projectId: string; scriptId: string; format: string }>();
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setVersions(await scriptsService.listVersions(params.projectId, params.scriptId)); }
    catch (err: any) { toast.error(err?.message || 'Erro'); } finally { setLoading(false); }
  }, [params.projectId, params.scriptId]);

  useEffect(() => { load(); }, [load]);

  const handleCreateVersion = async () => {
    try {
      const newVersion = await scriptsService.createVersion(params.projectId, params.scriptId, 'Nova versão');
      setVersions((prev) => [newVersion, ...prev]);
      toast.success('Nova versão criada!');
    } catch (err: any) { toast.error(err?.message || 'Erro'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/editorial/${params.projectId}/roteiros/${params.format}/${params.scriptId}`} className="rounded-md p-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-heading text-xl text-foreground">Versões do Roteiro</h1>
        </div>
        <button onClick={handleCreateVersion} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-sm font-bold text-primary-foreground"><Plus className="h-4 w-4" /> Nova Versão</button>
      </div>

      {loading && <div className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" /></div>}

      {!loading && versions.length === 0 && (
        <div className="rounded-md border border-border bg-card p-10 text-center font-sans text-muted-foreground">Nenhuma versão criada ainda.</div>
      )}

      <div className="space-y-3">
        {versions.map((v) => (
          <div key={v.id} className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Clock className="h-4 w-4" /></div>
                <div>
                  <h3 className="font-serif text-base text-foreground">v{v.versionNumber}</h3>
                  {v.comment && <p className="font-sans text-xs text-muted-foreground">{v.comment}</p>}
                  <p className="font-sans text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}