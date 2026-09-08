import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { mockBrandStory } from '@/lib/mocks/scripts.mock';

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/brand-story`);
  if (result.ok) return NextResponse.json(result.data);
  return NextResponse.json(mockBrandStory);
}