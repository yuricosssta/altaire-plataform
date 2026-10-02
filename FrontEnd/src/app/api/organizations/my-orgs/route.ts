import { NextRequest, NextResponse } from 'next/server';
import { proxyOrgRequest } from '@/app/api/organizations/_proxy';
import { error, ERROR_CODES } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const result = await proxyOrgRequest(request, '/my-orgs');

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: 502 });
}