import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { mockScripts } from '@/lib/mocks/scripts.mock';

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string; scriptId: string; blockId: string }> }) {
  const { projectId, scriptId, blockId } = await params;
  const body = await request.json().catch(() => ({}));

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/${scriptId}/blocks/${blockId}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (result.ok) return NextResponse.json(result.data);

  const all = Object.values(mockScripts).flat();
  const script = all.find((s) => s.id === scriptId);
  if (!script) return NextResponse.json({ error: 'Roteiro não encontrado' }, { status: 404 });

  const updatedBlocks = script.blocks.map((b) =>
    b.id === blockId
      ? { ...b, content: `[REGENERADO] ${b.content.slice(0, 50)}... [Nova versão baseada no contexto adicional]` }
      : b,
  );
  return NextResponse.json({ ...script, blocks: updatedBlocks });
}