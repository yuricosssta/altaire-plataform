import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string; scriptId: string; attachmentId: string }> }) {
  const { projectId, scriptId, attachmentId } = await params;
  return NextResponse.json({ success: true });
}