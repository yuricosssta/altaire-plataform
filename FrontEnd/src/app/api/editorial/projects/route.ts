import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { ProjectCreateSchema } from '@/lib/dto/editorial.schema';
import { error, ERROR_CODES } from '@/lib/api/response';
import { getAuthTokenFromRequest, verifyInternalToken } from '@/lib/auth/token.service';

export async function GET(request: NextRequest) {
  const brandId = request.nextUrl.searchParams.get('brandId');
  const query = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';
  const result = await proxyEditorialRequest(request, `/projects${query}`);

  if ('ok' in result) {
    const rawList = Array.isArray(result.data) ? (result.data as any[]) : [];
    const projects = rawList.map((p: any) => ({
      ...p,
      id: p.id || p._id,
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
    }));
    return NextResponse.json(projects);
  }

  return NextResponse.json(result, { status: result.status });
}

export async function POST(request: NextRequest) {
  const token = await getAuthTokenFromRequest(request);
  const payload = token ? await verifyInternalToken(token) : null;
  const role = String(payload?.role || 'member').toLowerCase();
  if (role === 'client' || role === 'external') {
    return NextResponse.json(
      error(
        ERROR_CODES.FORBIDDEN,
        'Usuários clientes ou externos não têm permissão para criar projetos.',
      ),
      { status: 403 },
    );
  }
  const body = await request.json().catch(() => null);
  const parsed = ProjectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Payload do projeto inválido.', parsed.error.flatten()),
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, '/projects', {
    method: 'POST',
    body: parsed.data,
  });

  if ('ok' in result) {
    const project = result.data as any;
    return NextResponse.json(
      {
        ...project,
        id: project.id || project._id,
      },
      { status: 201 },
    );
  }

  return NextResponse.json(result, { status: result.status });
}
