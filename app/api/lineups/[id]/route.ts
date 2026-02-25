import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rm } from 'fs/promises';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lineup = await prisma.lineup.findUnique({
    where: { id: params.id }
  });
  if (!lineup) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(lineup);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lineup = await prisma.lineup.findUnique({ where: { id: params.id } });
    if (lineup) {
      const mediaDir = path.join(DATA_DIR, 'media', params.id);
      await rm(mediaDir, { recursive: true, force: true });
      await prisma.lineup.delete({ where: { id: params.id } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
