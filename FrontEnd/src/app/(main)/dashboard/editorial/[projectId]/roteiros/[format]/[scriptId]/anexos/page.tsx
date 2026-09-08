'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Trash2, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { scriptsService } from '@/lib/services/scriptsService';
import { mockBrandStory } from '@/lib/mocks/scripts.mock';
import type { ScriptAttachment } from '@/lib/dto/editorial.schema';

const ATTACHMENT_TABS = [
  { type: 'brand_story' as const, label: 'História da Marca' },
  { type: 'referencia_validada' as const, label: 'Referências Validadas' },
  { type: 'estudo_tema' as const, label: 'Estudos do Tema' },
  { type: 'material_existente' as const, label: 'Materiais Existentes' },
];

export default function ScriptAttachmentsPage() {
  const params = useParams<{ projectId: string; scriptId: string; format: string }>();
  const [attachments, setAttachments] = useState<ScriptAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('brand_story');

  const load = useCallback(async () => {
    setLoading(true);
    try { setAttachments(await scriptsService.listAttachments(params.projectId, params.scriptId)); }
    catch (err: any) { toast.error(err?.message || 'Erro'); } finally { setLoading(false); }
  }, [params.projectId, params.scriptId]);

  useEffect(() => { load(); }, [load]);

  const handleRemove = async (attachmentId: string) => {
    try {
      await scriptsService.removeAttachment(params.projectId, params.scriptId, attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      toast.success('Anexo removido.');
    } catch (err: any) { toast.error(err?.message || 'Erro'); }
  };

  const filtered = attachments.filter((a) => a.type === activeTab);
  const brandStory = mockBrandStory;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/editorial/${params.projectId}/roteiros/${params.format}/${params.scriptId}`} className="rounded-md p-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-heading text-xl text-foreground">Anexos e Referências</h1>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {ATTACHMENT_TABS.map((tab) => (
          <button key={tab.type} onClick={() => setActiveTab(tab.type)} className={`px-4 py-3 font-sans text-sm transition-colors border-b-2 ${activeTab === tab.type ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'brand_story' && (
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-foreground">História da Marca / Expert</h2>
            <Link href="/configuracoes/marca" className="font-sans text-sm text-primary underline">Editar nas configurações</Link>
          </div>
          {brandStory && (
            <div className="space-y-4">
              <div>
                <h3 className="font-sans text-xs font-bold text-primary uppercase mb-1">Origem</h3>
                <p className="font-sans text-sm text-foreground">{brandStory.originStory}</p>
              </div>
              <div>
                <h3 className="font-sans text-xs font-bold text-primary uppercase mb-1">Viradas de Chave</h3>
                <ul className="list-inside list-disc font-sans text-sm text-foreground">{brandStory.keyTurnarounds.map((item, i) => <li key={i}>{item}</li>)}</ul>
              </div>
              <div>
                <h3 className="font-sans text-xs font-bold text-primary uppercase mb-1">Histórias Disponíveis</h3>
                <div className="space-y-2">
                  {brandStory.usableStories.map((story, i) => (
                    <div key={i} className="rounded-md bg-background p-3">
                      <h4 className="font-serif text-sm text-foreground mb-1">{story.title}</h4>
                      <p className="font-sans text-xs text-muted-foreground">{story.content.slice(0, 100)}...</p>
                      <div className="mt-1 flex gap-1">{story.tags.map((t) => <span key={t} className="rounded-md bg-primary/10 px-2 py-0.5 font-sans text-[10px] text-primary">{t}</span>)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab !== 'brand_story' && (
        <>
          {loading && <div className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" /></div>}
          {!loading && filtered.length === 0 && (
            <div className="rounded-md border border-border bg-card p-10 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="font-sans text-muted-foreground mb-4">Nenhum anexo adicionado.</p>
              <button onClick={() => toast.info('Upload será implementado em breve')} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-sm font-bold text-primary-foreground"><Upload className="h-4 w-4" /> Adicionar Arquivo</button>
            </div>
          )}
          <div className="space-y-3">
            {filtered.map((attachment) => (
              <div key={attachment.id} className="rounded-md border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><FileText className="h-4 w-4" /></div>
                    <div>
                      <h3 className="font-serif text-sm text-foreground">{attachment.title}</h3>
                      {attachment.description && <p className="font-sans text-xs text-muted-foreground">{attachment.description}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleRemove(attachment.id)} className="rounded-md p-2 text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
                {attachment.parsedContent && (
                  <div className="mt-3 rounded-md bg-background p-3"><pre className="font-sans text-xs text-muted-foreground whitespace-pre-wrap">{attachment.parsedContent}</pre></div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}