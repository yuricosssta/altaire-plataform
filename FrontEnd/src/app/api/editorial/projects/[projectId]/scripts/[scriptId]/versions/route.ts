import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../_proxy';
import { mockVersionsForScript } from '@/lib/mocks/scripts.mock';

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string; scriptId: string }> }) {
  const { projectId, scriptId } = await params;
  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/${scriptId}/versions`);
  if (result.ok) return NextResponse.json(result.data);
  return NextResponse.json(mockVersionsForScript(scriptId));
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string; scriptId: string }> }) {
  const { projectId, scriptId } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/${scriptId}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (result.ok) return NextResponse.json(result.data, { status: 201 });

  const versions = mockVersionsForScript(scriptId);
  const latestVersion = versions.reduce((max, v) => Math.max(max, v.versionNumber), 0);
  const newVersion = {
    id: Math.random().toString(36).slice(2),
    scriptId,
    versionNumber: latestVersion + 1,
    comment: body?.comment || '',
    blocks: versions[0]?.blocks || [],
    caption: versions[0]?.caption || '',
    createdAt: new Date(),
    createdBy: 'mock-user-id',
  };
  return NextResponse.json(newVersion, { status: 201 });
}