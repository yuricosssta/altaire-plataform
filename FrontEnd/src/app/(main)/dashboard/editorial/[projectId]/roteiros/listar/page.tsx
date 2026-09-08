'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2, Eye, Copy, Archive, FileVideo } from 'lucide-react';
import { toast } from 'sonner';
import { scriptsService } from '@/lib/services/scriptsService';
import { FORMAT_LABELS, FORMAT_ROUTE } from '@/lib/mocks/scripts.mock';
import type { Script, ScriptFormat, ScriptStatus } from '@/lib/dto/editorial.schema';

const STATUS_BADGE: Record<ScriptStatus, { label: string; color: string }> = {
  rascunho: { label: 'Rascunho', color: 'bg-zinc-400/20 text-zinc-400' },
  pronto: { label: 'Pronto', color: 'bg-primary/20 text-primary' },
  publicado: { label: 'Publicado', color: 'bg-emerald-500/20 text-emerald-500' },
  teste_ab: { label: 'Teste A/B', color: 'bg-amber-500/20 text-amber-500' },
};

export default function ListAllScriptsPage() {
  const params = useParams<{ projectId: string }>();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setScripts(await scriptsService.listScripts(params.projectId)); }
    catch (err: any) { toast.error(err?.message || 'Erro'); } finally { setLoading(false); }
  }, [params.projectId]);

  useEffect(() => { load(); }, [load]);

  const filtered = scripts.filter((s) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (s.title || '').toLowerCase().includes(t) || (s.provisionalName || '').toLowerCase().includes(t) || FORMAT_LABELS[s.format].toLowerCase().includes(t);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="font-heading text-xl text-foreground">Todos os Roteiros</h1>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
      </div>

      {loading && <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></div>}

      {!loading && filtered.length === 0 && (
        <div className="rounded-md border border-border bg-card p-10 text-center font-sans text-muted-foreground">Nenhum roteiro encontrado.</div>
      )}

      <div className="space-y-3">
        {filtered.map((script) => {
          const formatRoute = FORMAT_ROUTE[script.format];
          const badge = STATUS_BADGE[script.status];
          return (
            <div key={script.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-md border border-border bg-card p-4">
              <div className="flex items-start gap-4 mb-4 sm:mb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><FileVideo className="h-5 w-5" /></div>
                <div>
                  <Link href={`/dashboard/editorial/${params.projectId}/roteiros/${formatRoute}/${script.id}`} className="font-serif text-base text-foreground hover:text-primary">{script.title || script.provisionalName || 'Sem título'}</Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs text-muted-foreground">
                    <span className="rounded-md bg-primary/5 px-2 py-0.5 text-primary">{FORMAT_LABELS[script.format]}</span>
                    <span>v{script.version}</span>
                    {script.createdAt && <span>{new Date(script.createdAt).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {badge && <span className={`rounded-md px-2 py-0.5 font-sans text-xs font-medium ${badge.color}`}>{badge.label}</span>}
                <Link href={`/dashboard/editorial/${params.projectId}/roteiros/${formatRoute}/${script.id}`} className="rounded-md p-2 text-muted-foreground hover:text-foreground"><Eye className="h-4 w-4" /></Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}