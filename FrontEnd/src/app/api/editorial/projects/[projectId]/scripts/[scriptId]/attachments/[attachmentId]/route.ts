import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      projectId: string;
      scriptId: string;
      attachmentId: string;
    }>;
  },
) {
  const { projectId, scriptId, attachmentId } = await params;
  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/scripts/${scriptId}/attachments/${attachmentId}`,
    { method: 'DELETE' },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: 502 });
}
