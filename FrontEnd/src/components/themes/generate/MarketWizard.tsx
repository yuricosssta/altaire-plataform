// src/components/themes/generate/MarketWizard.tsx
'use client';

import { useState } from 'react';
import { ExternalLink, Loader2, MessageSquareQuote, Star, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { GenerationRequest, MarketParams } from '@/lib/dto/themes.schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VOLUME_OPTIONS } from '@/lib/constants/themes';

interface MarketWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (request: GenerationRequest) => Promise<void> | void;
  generating?: boolean;
}

const inputClassName =
  'w-full rounded-md border border-border bg-background px-4 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const labelClassName = 'font-sans text-sm font-bold text-foreground';
const instructionClassName = 'mt-1 rounded-md border border-border bg-background p-3 font-sans text-xs leading-relaxed text-muted-foreground';

export function MarketWizard({ open, onOpenChange, onGenerate, generating }: MarketWizardProps) {
  const [videoLinks, setVideoLinks] = useState('');
  const [comments, setComments] = useState('');
  const [reviews, setReviews] = useState('');
  const [volume, setVolume] = useState<MarketParams['volume']>('20');

  const reset = () => {
    setVideoLinks('');
    setComments('');
    setReviews('');
    setVolume('20');
  };

  const submit = () => {
    const links = videoLinks
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 5);
    const commentList = comments
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 10);
    const reviewList = reviews
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 10);

    void onGenerate({
      mode: 'market',
      params: {
        volume,
        videoLinks: links,
        comments: commentList,
        reviews: reviewList,
      },
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dados de Mercado (Internet)</DialogTitle>
          <DialogDescription>
            A IA atua como radar de mercado: lê o nicho do projeto, consulta vídeos, reviews e
            comentários e cruza com técnicas internas para encontrar temas que o mercado ignorou.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className={labelClassName}>Links de vídeos ou posts importantes do seu nicho</label>
            <textarea
              value={videoLinks}
              onChange={(e) => setVideoLinks(e.target.value)}
              rows={3}
              className={`${inputClassName} resize-none`}
              placeholder="Cole aqui até 5 links de vídeos (YouTube/TikTok/Reels) que o seu público consome muito."
            />
            <div className={instructionClassName}>
              <p className="mb-1 flex items-center gap-1.5 font-bold text-foreground">
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                Como coletar
              </p>
              Entre no YouTube, TikTok ou Instagram e pesquise pelo seu nicho. No YouTube, filtre por
              &quot;Mais vistos&quot;. No TikTok e Instagram, escolha posts com muitas visualizações,
              comentários e salvamentos. Copie o link de até 5 conteúdos que você considera
              representativos do seu mercado. A IA vai analisar os comentários e extrair temas que os
              criadores ignoraram.
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClassName}>Comentários do seu público (dúvidas, críticas, objeções)</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className={`${inputClassName} resize-none`}
              placeholder="Cole aqui comentários que você recebeu ou encontrou, especialmente aqueles com 'mas', 'porém' ou perguntas."
            />
            <div className={instructionClassName}>
              <p className="mb-1 flex items-center gap-1.5 font-bold text-foreground">
                <MessageSquareQuote className="h-3.5 w-3.5 text-primary" />
                Para encontrar comentários relevantes
              </p>
              Acesse os 5 vídeos mais vistos do seu nicho no YouTube ou posts virais no TikTok e
              Instagram. Vá direto para os comentários e use o comando Ctrl + F para buscar termos
              como &quot;mas&quot;, &quot;porém&quot;, &quot;tenho dúvida&quot;, &quot;esqueceu&quot;.
              O concorrente fez um vídeo sobre &quot;Como fazer dieta&quot;, mas o comentário com 500
              curtidas diz: &quot;Mas e se eu trabalho à noite e não tenho como cozinhar na
              madrugada?&quot;. Seu próximo tema está pronto.
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClassName}>Reviews e feedbacks que você considera importantes</label>
            <textarea
              value={reviews}
              onChange={(e) => setReviews(e.target.value)}
              rows={3}
              className={`${inputClassName} resize-none`}
              placeholder="Cole aqui trechos de reviews (Amazon, Hotmart, área de alunos) e feedbacks dos seus clientes."
            />
            <div className={instructionClassName}>
              <p className="mb-1 flex items-center gap-1.5 font-bold text-foreground">
                <Star className="h-3.5 w-3.5 text-primary" />
                Para reviews
              </p>
              1. Vá até a Amazon ou plataformas de cursos. 2. Busque os livros mais vendidos do seu
              segmento. 3. Filtre as avaliações de 1 e 2 estrelas: veja o que faltou, o que frustrou
              ou o que foi confuso. 4. Filtre as avaliações de 5 estrelas: veja o que gerou a
              &quot;virada de chave&quot; no cliente.
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClassName}>Volume de temas</label>
            <select
              value={volume}
              onChange={(e) => setVolume(e.target.value as MarketParams['volume'])}
              className={inputClassName}
            >
              {VOLUME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            className="rounded-md border border-border px-4 py-2 font-sans text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                submit();
              } catch (error: any) {
                toast.error(error?.message || 'Verifique os dados informados.');
              }
            }}
            disabled={generating}
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'Gerando temas...' : 'Gerar temas de mercado'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}