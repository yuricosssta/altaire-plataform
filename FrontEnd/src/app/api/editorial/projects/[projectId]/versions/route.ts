// src/app/api/editorial/projects/[projectId]/versions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest, normalizeList } from '../../../_proxy';
import { mockVersionsForProject } from '@/lib/mocks/editorial.mock';
import { EditorialVersionSchema } from '@/lib/dto/editorial.schema';

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { projectId } = await params;

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/versions`);

  if (result.ok) {
    const versions = normalizeList(result.data as any[]).map((version: any) => ({
      ...version,
      createdAt: version.createdAt ? new Date(version.createdAt) : undefined,
      updatedAt: version.updatedAt ? new Date(version.updatedAt) : undefined,
    }));
    return NextResponse.json(versions);
  }

  const fallback = mockVersionsForProject(projectId);
  const parsed = EditorialVersionSchema.array().safeParse(fallback);
  return NextResponse.json(parsed.success ? parsed.data : fallback);
}