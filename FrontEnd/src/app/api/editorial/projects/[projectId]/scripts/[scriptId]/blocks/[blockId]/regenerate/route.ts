import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      projectId: string;
      scriptId: string;
      blockId: string;
    }>;
  },
) {
  const { projectId, scriptId, blockId } = await params;
  const body = await request.json().catch(() => ({}));

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/scripts/${scriptId}/blocks/${blockId}/regenerate`,
    {
      method: 'POST',
      body,
    },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: 502 });
}
