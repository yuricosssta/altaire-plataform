import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function GET(request: NextRequest) {
  const { search } = new URL(request.url);
  const result = await proxyEditorialRequest(request, `/workspace/tasks${search}`);
  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await proxyEditorialRequest(request, '/workspace/tasks', {
    method: 'POST',
    body,
  });
  if ('ok' in result) {
    return NextResponse.json(result.data, { status: 201 });
  }
  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}
