// src/app/api/editorial/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest, normalizeList } from '../_proxy';
import { mockProjects } from '@/lib/mocks/editorial.mock';
import { ProjectCardSchema } from '@/lib/dto/editorial.schema';

export async function GET(request: NextRequest) {
  const result = await proxyEditorialRequest(request, '/projects');

  if (result.ok) {
    const projects = normalizeList(result.data as any[]).map((project: any) => ({
      ...project,
      updatedAt: project.updatedAt ? new Date(project.updatedAt) : undefined,
    }));
    return NextResponse.json(projects);
  }

  const fallback = mockProjects.map((project) => ({
    ...project,
    id: project.id,
  }));
  const parsed = ProjectCardSchema.array().safeParse(fallback);
  return NextResponse.json(parsed.success ? parsed.data : fallback);
}