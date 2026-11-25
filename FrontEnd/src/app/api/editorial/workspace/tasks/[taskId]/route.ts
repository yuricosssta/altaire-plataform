import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const body = await request.json().catch(() => null);
  const result = await proxyEditorialRequest(
    request,
    `/workspace/tasks/${taskId}`,
    { method: 'PATCH', body },
  );
  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const result = await proxyEditorialRequest(
    request,
    `/workspace/tasks/${taskId}`,
    { method: 'DELETE' },
  );
  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}
