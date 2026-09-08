import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { mockScripts } from '@/lib/mocks/scripts.mock';

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string; scriptId: string }> }) {
  const { projectId, scriptId } = await params;

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/${scriptId}/duplicate`, {
    method: 'POST',
  });
  if (result.ok) return NextResponse.json(result.data, { status: 201 });

  const all = Object.values(mockScripts).flat();
  const original = all.find((s) => s.id === scriptId);
  if (!original) return NextResponse.json({ error: 'Roteiro não encontrado' }, { status: 404 });

  return NextResponse.json(
    { ...original, id: Math.random().toString(36).slice(2), title: `${original.title} (cópia)`, version: 1, createdAt: new Date(), updatedAt: new Date() },
    { status: 201 },
  );
}