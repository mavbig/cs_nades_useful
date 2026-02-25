import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const map = searchParams.get('map');
  const utility = searchParams.get('utility');
  const query = searchParams.get('q');

  const lineups = await prisma.lineup.findMany({
    where: {
      AND: [
        map ? { map } : {},
        utility ? { utility } : {},
        query ? {
          OR: [
            { title: { contains: query } },
            { tags: { contains: query } },
            { startSpot: { contains: query } },
          ]
        } : {},
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(lineups);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = uuidv4();
    
    const screenshot = formData.get('screenshot') as File;
    const clip = formData.get('clip') as File;
    
    if (!screenshot || !clip) {
      return NextResponse.json({ error: 'Missing media files' }, { status: 400 });
    }

    const mediaDir = path.join(DATA_DIR, 'media', id);
    await mkdir(mediaDir, { recursive: true });

    const screenshotExt = path.extname(screenshot.name) || '.jpg';
    const clipExt = path.extname(clip.name) || '.mp4';
    
    const screenshotRelPath = `media/${id}/screenshot${screenshotExt}`;
    const clipRelPath = `media/${id}/clip${clipExt}`;

    await writeFile(path.join(DATA_DIR, screenshotRelPath), Buffer.from(await screenshot.arrayBuffer()));
    await writeFile(path.join(DATA_DIR, clipRelPath), Buffer.from(await clip.arrayBuffer()));

    const lineup = await prisma.lineup.create({
      data: {
        id,
        map: formData.get('map') as string,
        side: formData.get('side') as string,
        utility: formData.get('utility') as string,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        tags: formData.get('tags') as string,
        startSpot: formData.get('startSpot') as string,
        aimSpot: formData.get('aimSpot') as string,
        throwType: formData.get('throwType') as string,
        tickrate: formData.get('tickrate') as string,
        screenshotPath: screenshotRelPath,
        clipPath: clipRelPath,
      }
    });

    return NextResponse.json(lineup);
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
