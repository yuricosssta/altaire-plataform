import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string; scriptId: string }> }) {
  const { projectId, scriptId } = await params;

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/${scriptId}/export`);
  if (result.ok) return NextResponse.json(result.data);

  const all = Object.values(mockScripts).flat();
  const script = all.find((s) => s.id === scriptId);
  if (!script) return NextResponse.json({ error: 'Roteiro não encontrado' }, { status: 404 });

  const exportData = {
    blocks: script.blocks,
    caption: script.caption,
    titles: script.titles,
    thumbnailPrompts: script.thumbnailPrompts,
  };
  return NextResponse.json(exportData);
}