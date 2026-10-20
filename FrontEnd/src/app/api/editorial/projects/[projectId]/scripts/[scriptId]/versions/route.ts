import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; scriptId: string }> },
) {
  const { projectId, scriptId } = await params;
  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/scripts/${scriptId}/versions`,
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: 502 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; scriptId: string }> },
) {
  const { projectId, scriptId } = await params;
  const body = await request.json().catch(() => ({}));

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/scripts/${scriptId}/versions`,
    {
      method: 'POST',
      body,
    },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data, { status: 201 });
  }
  return NextResponse.json(result, { status: 502 });
}
