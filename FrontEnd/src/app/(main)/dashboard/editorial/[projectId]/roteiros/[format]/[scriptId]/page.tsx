'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Copy, Save, FileText, RefreshCw, MessageSquareText, Layers, Image, FileDown, Download } from 'lucide-react';
import { toast } from 'sonner';
import { scriptsService } from '@/lib/services/scriptsService';
import { FORMAT_LABELS, FORMAT_ICONS, FORMAT_ROUTE } from '@/lib/mocks/scripts.mock';
import type { Script, ScriptFormat, ScriptBlock, ScriptMode } from '@/lib/dto/editorial.schema';

const ICON_MAP: Record<string, typeof ArrowLeft> = { Video: ArrowLeft, Film: ArrowLeft, Radio: ArrowLeft, Columns: ArrowLeft, Image: ArrowLeft, Square: ArrowLeft };

const MODE_LABEL: Record<ScriptMode, string> = { seguranca: 'Palavra por Palavra', conexao: 'Conexão (Bullets)' };

function VideoCurtoEditor({ script, projectId }: { script: Script; projectId: string }) {
  const [blocks, setBlocks] = useState<ScriptBlock[]>(script.blocks || []);
  const [regeneratingBlock, setRegeneratingBlock] = useState<string | null>(null);

  const handleRegenerateBlock = async (blockId: string) => {
    setRegeneratingBlock(blockId);
    try {
      const updated = await scriptsService.regenerateBlock(projectId, script.id, blockId);
      setBlocks(updated.blocks);
      toast.success('Bloco regenerado.');
    } catch (err: any) { toast.error(err?.message || 'Erro'); } finally { setRegeneratingBlock(null); }
  };

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copiado!'); };

  const isConexao = script.mode === 'conexao';

  return (
    <div className="space-y-4">
      {blocks.map((block) => (
        <div key={block.id} className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-bold text-primary uppercase tracking-wider">{block.title || block.type.replace(/_/g, ' ')}</span>
              {block.timeRange && <span className="font-sans text-xs text-muted-foreground bg-muted rounded-md px-2 py-0.5">{block.timeRange}</span>}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleCopy(block.content)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
              <button onClick={() => handleRegenerateBlock(block.id)} disabled={regeneratingBlock === block.id} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-50">
                {regeneratingBlock === block.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          {isConexao ? (
            <p className="font-sans text-sm text-foreground whitespace-pre-wrap">{block.content}</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-background p-3 font-sans text-sm text-foreground">{block.content}</div>
              <div className="rounded-md bg-muted/30 p-3 font-sans text-sm italic text-muted-foreground">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">🎬 Direção de Cena</span>
                {block.visualDirection}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ScriptEditorPage() {
  const params = useParams<{ projectId: string; format: string; scriptId: string }>();
  const formatFromRoute = Object.entries(FORMAT_ROUTE).find(([, route]) => route === params.format)?.[0] as ScriptFormat | undefined;

  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roteiro' | 'legenda' | 'titulos' | 'thumbnails' | 'materiais'>('roteiro');

  const loadScript = useCallback(async () => {
    if (!formatFromRoute) return;
    setLoading(true);
    try {
      const data = await scriptsService.getScript(params.projectId, params.scriptId);
      setScript(data);
    } catch (err: any) { toast.error(err?.message || 'Erro'); } finally { setLoading(false); }
  }, [params.projectId, params.scriptId, formatFromRoute]);

  useEffect(() => { loadScript(); }, [loadScript]);

  if (!formatFromRoute) return <div className="py-20 text-center font-sans text-muted-foreground">Formato inválido.</div>;

  if (loading) return <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></div>;

  if (!script) return (
    <div className="py-20 text-center font-sans text-muted-foreground">
      Roteiro não encontrado.
      <Link href={`/dashboard/editorial/${params.projectId}/roteiros/${params.format}`} className="block mt-4 text-sm text-primary underline">Voltar</Link>
    </div>
  );

  const IconComponent = ICON_MAP[FORMAT_ICONS[formatFromRoute] as keyof typeof ICON_MAP] || FileText;

  const TABS = [
    { key: 'roteiro', label: 'Roteiro', icon: FileText }, { key: 'legenda', label: 'Legenda', icon: MessageSquareText },
    { key: 'titulos', label: 'Títulos', icon: Layers }, { key: 'thumbnails', label: 'Thumbnails', icon: Image },
    { key: 'materiais', label: 'Materiais', icon: FileDown },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/editorial/${params.projectId}/roteiros/${params.format}`} className="rounded-md p-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <IconComponent className="h-5 w-5 text-primary" />
          <div>
            <h1 className="font-heading text-xl text-foreground">{script.title || script.provisionalName || FORMAT_LABELS[formatFromRoute]}</h1>
            <div className="flex items-center gap-3 mt-1 font-sans text-xs text-muted-foreground">
              <span>{MODE_LABEL[script.mode]}</span>
              <span>v{script.version}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/editorial/${params.projectId}/roteiros/${params.format}/${params.scriptId}/versoes`} className="rounded-md px-3 py-1.5 font-sans text-sm text-muted-foreground hover:text-foreground">Versões</Link>
          <Link href={`/dashboard/editorial/${params.projectId}/roteiros/${params.format}/${params.scriptId}/anexos`} className="rounded-md px-3 py-1.5 font-sans text-sm text-muted-foreground hover:text-foreground">Anexos</Link>
          <button onClick={() => toast.success('Roteiro salvo!')} className="flex items-center gap-2 rounded-md bg-primary px-4 py-1.5 font-sans text-sm font-bold text-primary-foreground hover:opacity-90"><Save className="h-4 w-4" /> Salvar</button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-3 font-sans text-sm transition-colors border-b-2 ${activeTab === tab.key ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              <TabIcon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'roteiro' && <VideoCurtoEditor script={script} projectId={params.projectId} />}

      {activeTab === 'legenda' && script.caption && (
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg text-foreground">Legenda / Descrição</h2>
            <button onClick={() => { navigator.clipboard.writeText(script.caption || ''); toast.success('Copiada!'); }} className="flex items-center gap-2 rounded-md px-3 py-1.5 font-sans text-sm text-primary hover:bg-primary/10"><Copy className="h-4 w-4" /> Copiar</button>
          </div>
          <p className="font-sans text-sm text-foreground whitespace-pre-wrap">{script.caption}</p>
        </div>
      )}

      {activeTab === 'titulos' && script.titles && (
        <div className="space-y-3">
          <h2 className="font-serif text-lg text-foreground">Sugestões de Títulos</h2>
          {script.titles.map((title) => (
            <div key={title.id} className="flex items-center justify-between rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                {title.hookType && <span className="rounded-md bg-primary/10 px-2 py-0.5 font-sans text-xs font-medium text-primary uppercase">{title.hookType}</span>}
                <span className="font-sans text-sm text-foreground">{title.title}</span>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(title.title); toast.success('Título copiado!'); }} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'thumbnails' && script.thumbnailPrompts && (
        <div className="space-y-4">
          <h2 className="font-serif text-lg text-foreground">Prompts para Thumbnail / Capa</h2>
          {script.thumbnailPrompts.map((prompt) => (
            <div key={prompt.id} className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-xs text-muted-foreground">{prompt.format || '9:16'} — {prompt.description || 'Prompt'}</span>
                <button onClick={() => { navigator.clipboard.writeText(prompt.promptEn); toast.success('Prompt copiado!'); }} className="flex items-center gap-2 rounded-md px-3 py-1.5 font-sans text-sm text-primary hover:bg-primary/10"><Copy className="h-4 w-4" /> Copiar Prompt</button>
              </div>
              <p className="font-sans text-sm text-foreground whitespace-pre-wrap">{prompt.promptEn}</p>
              <div className="mt-3 rounded-md bg-muted/30 p-3">
                <p className="font-sans text-xs text-muted-foreground">
                  <strong className="text-primary">Como usar:</strong> Copie o prompt, abra o <a href="https://copilot.microsoft.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Microsoft Copilot</a> (gratuito) e cole para gerar a imagem.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'materiais' && (
        <div className="space-y-6">
          {script.complementaryMaterials?.map((m) => (
            <div key={m.id} className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 font-sans text-xs font-medium text-primary uppercase">{m.type.replace(/_/g, ' ')}</span>
                  <h3 className="font-serif text-base text-foreground">{m.title}</h3>
                </div>
                <button onClick={() => toast.info('Download simulado')} className="flex items-center gap-2 rounded-md px-3 py-1.5 font-sans text-sm text-primary hover:bg-primary/10" disabled={m.status !== 'pronto'}><Download className="h-4 w-4" /> Baixar</button>
              </div>
              <p className="font-sans text-sm text-muted-foreground mb-2">{m.promise}</p>
              <ul className="list-inside list-disc font-sans text-xs text-muted-foreground">{m.structure.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          ))}
          {(!script.complementaryMaterials || script.complementaryMaterials.length === 0) && (
            <div className="rounded-md border border-border bg-card p-8 text-center font-sans text-muted-foreground">Nenhum material complementar gerado.</div>
          )}
        </div>
      )}
    </div>
  );
}