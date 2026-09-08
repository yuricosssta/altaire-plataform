import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest, normalizeList } from '../../../_proxy';
import { mockScripts, FORMAT_LABELS } from '@/lib/mocks/scripts.mock';
import type { ScriptFormat } from '@/lib/dto/editorial.schema';

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const match = pathname.match(/\/projects\/([^/]+)\/scripts$/);
  const projectId = match?.[1];
  if (!projectId) return NextResponse.json({ error: 'projectId ausente' }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') as ScriptFormat | null;

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts`);
  if (result.ok) {
    const scripts = normalizeList(result.data as any[]);
    return NextResponse.json(scripts);
  }

  if (format && mockScripts[format]) {
    return NextResponse.json(mockScripts[format]);
  }
  return NextResponse.json(Object.values(mockScripts).flat());
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const match = pathname.match(/\/projects\/([^/]+)\/scripts$/);
  const projectId = match?.[1];
  if (!projectId) return NextResponse.json({ error: 'projectId ausente' }, { status: 400 });

  const body = await request.json().catch(() => null);
  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (result.ok) return NextResponse.json(result.data, { status: 201 });

  const mock = mockScripts[body?.format as ScriptFormat]?.[0];
  if (!mock) return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
  return NextResponse.json(
    { ...mock, id: Math.random().toString(36).slice(2), provisionalName: body?.title || mock.provisionalName },
    { status: 201 },
  );
}