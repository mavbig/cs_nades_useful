import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rm } from 'fs/promises';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lineup = await prisma.lineup.findUnique({
    where: { id }
  });
  if (!lineup) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(lineup);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lineup = await prisma.lineup.findUnique({ where: { id } });
    if (lineup) {
      const mediaDir = path.join(DATA_DIR, 'media', id);
      await rm(mediaDir, { recursive: true, force: true });
      await prisma.lineup.delete({ where: { id } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
