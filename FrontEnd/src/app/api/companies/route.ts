import { NextRequest, NextResponse } from 'next/server';
import { proxyCompanyRequest } from '@/app/api/companies/_proxy';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await proxyCompanyRequest(request, '', {
    method: 'POST',
    body,
  });

  if ('ok' in result) {
    return NextResponse.json(result.data, { status: result.status });
  }
  return NextResponse.json(result, { status: result.status });
}
