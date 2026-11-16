import { NextRequest, NextResponse } from 'next/server';
import { proxyOrgRequest } from '@/app/api/organizations/_proxy';
import { ERROR_CODES, ErrorCode } from '@/lib/api/response';

function statusFromErrorCode(code?: ErrorCode): number {
  switch (code) {
    case ERROR_CODES.VALIDATION_ERROR:
      return 400;
    case ERROR_CODES.UNAUTHORIZED:
      return 401;
    case ERROR_CODES.FORBIDDEN:
      return 403;
    case ERROR_CODES.NOT_FOUND:
      return 404;
    default:
      return 502;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; functionId: string }> },
) {
  const { orgId, functionId } = await params;
  const body = await request.json().catch(() => ({}));

  const result = await proxyOrgRequest(
    request,
    `/${orgId}/functions/${functionId}`,
    {
      method: 'PATCH',
      body,
    },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, {
    status: statusFromErrorCode(result.error?.code),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; functionId: string }> },
) {
  const { orgId, functionId } = await params;

  const result = await proxyOrgRequest(
    request,
    `/${orgId}/functions/${functionId}`,
    {
      method: 'DELETE',
    },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, {
    status: statusFromErrorCode(result.error?.code),
  });
}
