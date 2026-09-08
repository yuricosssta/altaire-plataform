import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../_proxy';
import { mockScripts, mockGenerationResult } from '@/lib/mocks/scripts.mock';
import type { ScriptFormat, ScriptMode } from '@/lib/dto/editorial.schema';

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string; scriptId: string }> }) {
  const { projectId, scriptId } = await params;
  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/${scriptId}`);
  if (result.ok) return NextResponse.json(result.data);

  const all = Object.values(mockScripts).flat();
  const script = all.find((s) => s.id === scriptId);
  if (!script) return NextResponse.json({ error: 'Roteiro não encontrado' }, { status: 404 });
  return NextResponse.json(script);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ projectId: string; scriptId: string }> }) {
  const { projectId, scriptId } = await params;
  const body = await request.json().catch(() => null);
  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/${scriptId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (result.ok) return NextResponse.json(result.data);

  const all = Object.values(mockScripts).flat();
  const index = all.findIndex((s) => s.id === scriptId);
  if (index === -1) return NextResponse.json({ error: 'Roteiro não encontrado' }, { status: 404 });
  const updated = { ...all[index], ...body, updatedAt: new Date() };
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string; scriptId: string }> }) {
  const { projectId, scriptId } = await params;
  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/${scriptId}`, { method: 'DELETE' });
  if (result.ok) return NextResponse.json({ success: true });
  return NextResponse.json({ success: true });
}