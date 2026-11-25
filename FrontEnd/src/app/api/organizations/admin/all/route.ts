import { NextRequest, NextResponse } from 'next/server';
import { proxyOrgRequest } from '@/app/api/organizations/_proxy';

export async function GET(request: NextRequest) {
  const result = await proxyOrgRequest(request, '/admin/all');
  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}
