// src/app/api/editorial/projects/[projectId]/themes/pillars/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../../_proxy';
import { getRomaPillars } from '@/lib/mocks/themes.mock';

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { projectId } = await params;

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/themes/pillars`);

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const fallback = getRomaPillars(projectId);
  return NextResponse.json({ pillars: fallback });
}