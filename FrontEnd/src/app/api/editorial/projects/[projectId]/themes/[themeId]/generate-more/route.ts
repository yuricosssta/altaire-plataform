import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; themeId: string }> },
) {
  const { projectId, themeId } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/${themeId}/generate-more`,
    { method: 'POST', body },
  );
  if ('ok' in result) {
    return NextResponse.json(result.data, { status: 201 });
  }
  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}
