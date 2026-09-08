'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Loader2, Search, Copy, Archive, ArrowLeft, Eye,
  Video, Film, Radio, Columns, Image, Square, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { scriptsService } from '@/lib/services/scriptsService';
import { FORMAT_LABELS, FORMAT_ICONS, FORMAT_DESCRIPTIONS, FORMAT_ROUTE } from '@/lib/mocks/scripts.mock';
import type { Script, ScriptFormat, ScriptStatus, RetinaType, Platform } from '@/lib/dto/editorial.schema';

const ICON_MAP: Record<string, typeof Video> = { Video, Film, Radio, Columns, Image, Square };

const STATUS_BADGE: Record<ScriptStatus, { label: string; color: string }> = {
  rascunho: { label: 'Rascunho', color: 'bg-zinc-400/20 text-zinc-400' },
  pronto: { label: 'Pronto', color: 'bg-primary/20 text-primary' },
  publicado: { label: 'Publicado', color: 'bg-emerald-500/20 text-emerald-500' },
  teste_ab: { label: 'Teste A/B', color: 'bg-amber-500/20 text-amber-500' },
};

const RETINA_LABELS: Record<RetinaType, string> = {
  relacionamento: 'Relacionamento', engajamento: 'Engajamento', transformacao: 'Transformação',
  interacao: 'Interação', nivel_consciencia: 'Níveis de Consciência', autoridade: 'Autoridade',
};

const FILTER_RETINA: { value: RetinaType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  ...Object.entries(RETINA_LABELS).map(([value, label]) => ({ value: value as RetinaType, label })),
];

const FILTER_STATUS: { value: ScriptStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' }, { value: 'rascunho', label: 'Rascunho' },
  { value: 'pronto', label: 'Pronto' }, { value: 'publicado', label: 'Publicado' },
  { value: 'teste_ab', label: 'Teste A/B' },
];

export default function FormatListPage() {
  const params = useParams<{ projectId: string; format: string }>();
  const formatFromRoute = Object.entries(FORMAT_ROUTE).find(
    ([, route]) => route === params.format,
  )?.[0] as ScriptFormat | undefined;

  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRetina, setFilterRetina] = useState<RetinaType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ScriptStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadScripts = useCallback(async () => {
    if (!formatFromRoute) return;
    setLoading(true);
    try {
      const data = await scriptsService.listScripts(params.projectId, formatFromRoute);
      setScripts(data);
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao carregar roteiros');
    } finally {
      setLoading(false);
    }
  }, [params.projectId, formatFromRoute]);

  useEffect(() => { loadScripts(); }, [loadScripts]);

  const handleDuplicate = async (scriptId: string) => {
    try {
      const duplicated = await scriptsService.duplicateScript(params.projectId, scriptId);
      setScripts((prev) => [duplicated, ...prev]);
      toast.success('Roteiro duplicado com sucesso.');
    } catch (err: any) { toast.error(err?.message || 'Erro ao duplicar'); }
  };

  const handleArchive = async (scriptId: string) => {
    try {
      await scriptsService.archiveScript(params.projectId, scriptId);
      setScripts((prev) => prev.filter((s) => s.id !== scriptId));
      toast.success('Roteiro arquivado.');
    } catch (err: any) { toast.error(err?.message || 'Erro ao arquivar'); }
  };

  if (!formatFromRoute) return <div className="py-20 text-center font-sans text-muted-foreground">Formato inválido.</div>;

  const IconComponent = ICON_MAP[FORMAT_ICONS[formatFromRoute]] || FileText;

  const filtered = scripts.filter((s) => {
    if (filterRetina !== 'all' && s.briefing?.bloco1?.retinaType !== filterRetina) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      if (!(s.title || '').toLowerCase().includes(t) && !(s.provisionalName || '').toLowerCase().includes(t)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/editorial/${params.projectId}?tab=roteiros`} className="rounded-md p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-xl text-foreground">{FORMAT_LABELS[formatFromRoute]}</h1>
            <p className="font-sans text-xs text-muted-foreground">{FORMAT_DESCRIPTIONS[formatFromRoute]}</p>
          </div>
        </div>
        <Link href={`/dashboard/editorial/${params.projectId}/roteiros/criar`} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-sm font-bold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo Roteiro
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar roteiro..." className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        <select value={filterRetina} onChange={(e) => setFilterRetina(e.target.value as RetinaType | 'all')} className="rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground">
          {FILTER_RETINA.map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ScriptStatus | 'all')} className="rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground">
          {FILTER_STATUS.map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}
        </select>
      </div>

      {loading && <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}

      {!loading && filtered.length === 0 && (
        <div className="rounded-md border border-border bg-card p-10 text-center font-sans text-muted-foreground">
          {scripts.length === 0 ? 'Nenhum roteiro criado ainda neste formato.' : 'Nenhum roteiro corresponde aos filtros.'}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((script) => {
          const badge = STATUS_BADGE[script.status];
          return (
            <div key={script.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-md border border-border bg-card p-4 hover:border-primary/30">
              <div className="flex items-start gap-4 mb-4 sm:mb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Link href={`/dashboard/editorial/${params.projectId}/roteiros/${params.format}/${script.id}`} className="font-serif text-base text-foreground hover:text-primary">
                    {script.title || script.provisionalName || 'Sem título'}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs text-muted-foreground">
                    <span>v{script.version}</span>
                    <span>{script.mode === 'seguranca' ? 'Palavra por palavra' : 'Conexão'}</span>
                    {script.createdAt && <span>{new Date(script.createdAt).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-border pt-3 sm:border-0 sm:pt-0">
                {badge && <span className={`rounded-md px-2 py-0.5 font-sans text-xs font-medium ${badge.color}`}>{badge.label}</span>}
                <Link href={`/dashboard/editorial/${params.projectId}/roteiros/${params.format}/${script.id}`} className="rounded-md p-2 text-muted-foreground hover:bg-card hover:text-foreground" title="Abrir"><Eye className="h-4 w-4" /></Link>
                <button onClick={() => handleDuplicate(script.id)} className="rounded-md p-2 text-muted-foreground hover:bg-card hover:text-foreground" title="Duplicar"><Copy className="h-4 w-4" /></button>
                <button onClick={() => handleArchive(script.id)} className="rounded-md p-2 text-muted-foreground hover:bg-card hover:text-foreground" title="Arquivar"><Archive className="h-4 w-4" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}