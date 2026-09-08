import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../_proxy';
import { mockGenerationResult } from '@/lib/mocks/scripts.mock';

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string; scriptId: string }> }) {
  const { projectId, scriptId } = await params;
  const body = await request.json().catch(() => null);

  // Tenta enviar ao backend
  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/${scriptId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (result.ok) return NextResponse.json(result.data);

  // Fallback mock com delay
  const briefing = body?.briefing;
  const format = briefing?.bloco1?.format || 'video_curto';
  const mode = briefing?.bloco2?.scriptMode || 'conexao';
  const tema = briefing?.bloco1?.theme || 'crescimento digital';

  // Simula progressão: 3 fases com delay de 1.5s cada
  await new Promise((resolve) => setTimeout(resolve, 4000));

  return NextResponse.json(mockGenerationResult(format, mode, tema));
}