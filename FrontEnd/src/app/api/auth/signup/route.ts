import { NextRequest, NextResponse } from 'next/server';
import {
  AuthBackendError,
  registerBackendUser,
} from '@/lib/auth/userProvision';
import { success, error, ERROR_CODES } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'E-mail e senha são obrigatórios.'),
      { status: 400 },
    );
  }

  try {
    const provisioned = await registerBackendUser({
      email: String(body.email),
      fullName: String(body.name || body.fullName || body.email.split('@')[0]),
      password: String(body.password),
    });

    return NextResponse.json(success(provisioned), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof AuthBackendError) {
      return NextResponse.json(
        error(ERROR_CODES.EXTERNAL_ERROR, err.message),
        { status: err.statusCode },
      );
    }
    const message =
      err instanceof Error ? err.message : 'Erro ao conectar com o servidor';
    return NextResponse.json(
      error(ERROR_CODES.INTERNAL_ERROR, message),
      { status: 502 },
    );
  }
}