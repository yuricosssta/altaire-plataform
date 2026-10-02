import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { error, ERROR_CODES } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const result = await proxyEditorialRequest(request, `/projects/${projectId}`);

  if ('ok' in result) {
    return NextResponse.json({
      ...(result.data as any),
      id: (result.data as any)?.id || (result.data as any)?._id,
    });
  }

  return NextResponse.json(result, { status: 502 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const body = await request.json().catch(() => null);

  const result = await proxyEditorialRequest(request, `/projects/${projectId}`, {
    method: 'PUT',
    body,
  });

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: 502 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const result = await proxyEditorialRequest(request, `/projects/${projectId}`, {
    method: 'DELETE',
  });

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: 502 });
}