// src/app/api/editorial/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest, normalizeList } from '../_proxy';
import { mockCreateProject, mockProjects } from '@/lib/mocks/editorial.mock';
import { ProjectCardSchema, ProjectCreateSchema } from '@/lib/dto/editorial.schema';

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

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = ProjectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload do projeto inválido.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, '/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  const fallback = mockCreateProject(parsed.data);
  const validated = ProjectCardSchema.safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback, { status: 201 });
}