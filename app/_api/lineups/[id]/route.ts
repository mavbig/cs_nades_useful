import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rm, writeFile } from 'fs/promises';
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    
    const existingLineup = await prisma.lineup.findUnique({ where: { id } });
    if (!existingLineup) {
      return NextResponse.json({ error: 'Lineup not found' }, { status: 404 });
    }

    const screenshot = formData.get('screenshot') as File | null;
    const clip = formData.get('clip') as File | null;
    
    let screenshotPath = existingLineup.screenshotPath;
    let clipPath = existingLineup.clipPath;

    if (screenshot && screenshot.size > 0) {
      const screenshotExt = path.extname(screenshot.name) || '.jpg';
      screenshotPath = `media/${id}/screenshot${screenshotExt}`;
      await writeFile(path.join(DATA_DIR, screenshotPath), Buffer.from(await screenshot.arrayBuffer()));
    }

    if (clip && clip.size > 0) {
      const clipExt = path.extname(clip.name) || '.mp4';
      clipPath = `media/${id}/clip${clipExt}`;
      await writeFile(path.join(DATA_DIR, clipPath), Buffer.from(await clip.arrayBuffer()));
    }

    const updatedLineup = await prisma.lineup.update({
      where: { id },
      data: {
        map: formData.get('map') as string,
        side: formData.get('side') as string,
        utility: formData.get('utility') as string,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        tags: formData.get('tags') as string,
        startSpot: formData.get('startSpot') as string,
        throwType: formData.get('throwType') as string,
        tickrate: (formData.get('tickrate') as string | null) || existingLineup.tickrate,
        screenshotPath,
        clipPath,
      }
    });

    return NextResponse.json(updatedLineup);
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}
