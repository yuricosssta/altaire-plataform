'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Loader2, FileText } from 'lucide-react';
import { FORMAT_LABELS, FORMAT_DESCRIPTIONS, FORMAT_ICONS, FORMAT_ROUTE } from '@/lib/mocks/scripts.mock';
import type { ScriptFormat, ScriptMode } from '@/lib/dto/editorial.schema';

const ICON_MAP: Record<string, typeof ArrowLeft> = { Video: ArrowLeft, Film: ArrowLeft, Radio: ArrowLeft, Columns: ArrowLeft, Image: ArrowLeft, Square: ArrowLeft };
const FORMATS: ScriptFormat[] = ['video_curto', 'video_longo', 'live', 'carrossel', 'post_estatico', 'stories_sequence'];

const MODE_DESCRIPTIONS: Record<ScriptMode, string> = {
  seguranca: 'Roteiro escrito palavra por palavra — ideal para iniciantes ou temas técnicos.',
  conexao: 'Bullet points de alta retenção — ideal para criadores que já dominam o assunto.',
};

export default function CreateScriptPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();

  const [step, setStep] = useState<'format' | 'mode' | 'source'>('format');
  const [selectedFormat, setSelectedFormat] = useState<ScriptFormat | null>(null);
  const [selectedMode, setSelectedMode] = useState<ScriptMode>('conexao');
  const [sourceType] = useState<'slot' | 'theme'>('slot');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!selectedFormat) return;
    setCreating(true);
    try {
      const { scriptsService } = await import('@/lib/services/scriptsService');
      const script = await scriptsService.createScript(params.projectId, { format: selectedFormat, mode: selectedMode });
      router.push(`/dashboard/editorial/${params.projectId}/roteiros/${FORMAT_ROUTE[selectedFormat]}/${script.id}`);
    } catch (err: any) {
      const { toast } = await import('sonner');
      toast.error(err?.message || 'Erro');
    } finally { setCreating(false); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link href={`/dashboard/editorial/${params.projectId}?tab=roteiros`} className="rounded-md p-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="font-heading text-xl text-foreground">Novo Roteiro</h1>
      </div>

      {step === 'format' && (
        <>
          <p className="font-sans text-sm text-muted-foreground">Escolha o formato do roteiro:</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FORMATS.map((format) => (
              <button key={format} onClick={() => { setSelectedFormat(format); setStep('mode'); }} className={`rounded-md border p-4 text-left transition-all ${selectedFormat === format ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                <h3 className="font-serif text-base text-foreground mt-3">{FORMAT_LABELS[format]}</h3>
                <p className="mt-1 font-sans text-xs text-muted-foreground">{FORMAT_DESCRIPTIONS[format]}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'mode' && selectedFormat && (
        <>
          <p className="font-sans text-sm text-muted-foreground">{FORMAT_LABELS[selectedFormat]} — Escolha o modo:</p>
          <div className="space-y-3">
            {(['conexao', 'seguranca'] as ScriptMode[]).map((mode) => (
              <button key={mode} onClick={() => { setSelectedMode(mode); setStep('source'); }} className={`w-full rounded-md border p-4 text-left transition-all ${selectedMode === mode ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base text-foreground">{mode === 'conexao' ? 'Modo Conexão — Bullet Points' : 'Modo Segurança — Palavra por palavra'}</h3>
                    <p className="mt-1 font-sans text-sm text-muted-foreground">{MODE_DESCRIPTIONS[mode]}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-primary shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'source' && selectedFormat && (
        <>
          <p className="font-sans text-sm text-muted-foreground">Criar roteiro em {FORMAT_LABELS[selectedFormat]} no modo {selectedMode === 'conexao' ? 'Conexão' : 'Segurança'}.</p>
          <div className="flex justify-end pt-4">
            <button onClick={handleCreate} disabled={creating} className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 font-sans text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Criando...</> : <><ChevronRight className="h-4 w-4" /> Criar Roteiro</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}