import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { error, ERROR_CODES } from '@/lib/api/response';
import {
  getAuthTokenFromRequest,
  verifyInternalToken,
} from '@/lib/auth/token.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const result = await proxyEditorialRequest(request, `/projects/${projectId}`);
  if ('ok' in result) {
    const p = result.data as any;
    return NextResponse.json({
      ...p,
      id: p.id || p._id,
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
    });
  }
  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const token = await getAuthTokenFromRequest(request);
  const payload = token ? await verifyInternalToken(token) : null;
  const role = String(payload?.role || 'member').toLowerCase();
  if (role === 'client' || role === 'external') {
    return NextResponse.json(
      error(ERROR_CODES.FORBIDDEN, 'Sem permissão para editar projeto.'),
      { status: 403 },
    );
  }
  const { projectId } = await params;
  const body = await request.json().catch(() => null);
  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}`,
    { method: 'PUT', body },
  );
  if ('ok' in result) {
    const p = result.data as any;
    return NextResponse.json({
      ...p,
      id: p.id || p._id,
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
    });
  }
  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const token = await getAuthTokenFromRequest(request);
  const payload = token ? await verifyInternalToken(token) : null;
  const role = String(payload?.role || 'member').toLowerCase();
  if (role === 'client' || role === 'external') {
    return NextResponse.json(
      error(ERROR_CODES.FORBIDDEN, 'Sem permissão para editar projeto.'),
      { status: 403 },
    );
  }
  const { projectId } = await params;
  const body = await request.json().catch(() => null);
  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}`,
    { method: 'PATCH', body },
  );
  if ('ok' in result) {
    const p = result.data as any;
    return NextResponse.json({
      ...p,
      id: p.id || p._id,
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
    });
  }
  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const token = await getAuthTokenFromRequest(request);
  const payload = token ? await verifyInternalToken(token) : null;
  const role = String(payload?.role || 'member').toLowerCase();
  if (role === 'client' || role === 'external') {
    return NextResponse.json(
      error(ERROR_CODES.FORBIDDEN, 'Sem permissão para excluir projeto.'),
      { status: 403 },
    );
  }
  const { projectId } = await params;
  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}`,
    { method: 'DELETE' },
  );
  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}
