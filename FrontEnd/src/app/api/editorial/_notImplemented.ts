import { NextResponse } from 'next/server';
import { error, ERROR_CODES } from '@/lib/api/response';

export function notImplemented(name: string) {
  return NextResponse.json(
    error(ERROR_CODES.NOT_IMPLEMENTED, `Rota não implementada: ${name}`),
    { status: 501 },
  );
}
