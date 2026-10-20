import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const url = new URL(request.url);
  const search = url.search;
  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/scripts${search}`,
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: 502 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const body = await request.json().catch(() => null);

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/scripts`,
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
