import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../_proxy';
import { mockAttachmentsForScript } from '@/lib/mocks/scripts.mock';

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string; scriptId: string }> }) {
  const { projectId, scriptId } = await params;
  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/${scriptId}/attachments`);
  if (result.ok) return NextResponse.json(result.data);
  return NextResponse.json(mockAttachmentsForScript(scriptId));
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string; scriptId: string }> }) {
  const { projectId, scriptId } = await params;
  const formData = await request.formData().catch(() => null);
  const jsonData = formData
    ? JSON.parse(formData.get('data') as string || '{}')
    : await request.json().catch(() => ({}));

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/${scriptId}/attachments`, {
    method: 'POST',
    headers: formData ? {} : { 'Content-Type': 'application/json' },
    body: formData || JSON.stringify(jsonData),
  });
  if (result.ok) return NextResponse.json(result.data, { status: 201 });

  return NextResponse.json(
    {
      id: Math.random().toString(36).slice(2),
      scriptId,
      type: jsonData.type || 'estudo_tema',
      title: jsonData.title || 'Novo anexo',
      description: jsonData.description || '',
      createdAt: new Date(),
      fileName: formData?.get('file')?.name || '',
      mimeType: 'application/pdf',
      source: 'roteiro',
    },
    { status: 201 },
  );
}