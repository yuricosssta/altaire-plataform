import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function GET(request: NextRequest) {
  const { search } = new URL(request.url);
  const result = await proxyEditorialRequest(
    request,
    `/workspace/activity${search}`,
  );
  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}
