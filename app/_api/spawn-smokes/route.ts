import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { saveSpawnSmokeSetImage } from '@/lib/spawn-smoke-media';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

function normalizeMapName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '');
}

type PositionInput = {
  label: string;
  description?: string;
  throwType?: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mapParam = searchParams.get('map');

  let sets = await prisma.spawnSmokeSet.findMany({
    include: {
      positions: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (mapParam) {
    const normalized = normalizeMapName(mapParam);
    sets = sets.filter((set) => normalizeMapName(set.map) === normalized);
  }

  return NextResponse.json(sets);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const positionsJson = formData.get('positions') as string | null;

    if (!positionsJson) {
      return NextResponse.json({ error: 'Missing positions' }, { status: 400 });
    }

    const positions = JSON.parse(positionsJson) as PositionInput[];
    if (!Array.isArray(positions) || positions.length === 0) {
      return NextResponse.json({ error: 'At least one position is required' }, { status: 400 });
    }

    const setId = uuidv4();
    const createdPositions = [];

    for (let index = 0; index < positions.length; index += 1) {
      const position = positions[index];
      const screenshot = formData.get(`screenshot_${index}`) as File | null;

      if (!screenshot || screenshot.size === 0) {
        return NextResponse.json({ error: `Missing screenshot for position ${index + 1}` }, { status: 400 });
      }

      const positionId = uuidv4();
      const screenshotExt = path.extname(screenshot.name) || '.jpg';
      const mediaDir = path.join(DATA_DIR, 'media', 'spawn-smokes', setId, positionId);
      await mkdir(mediaDir, { recursive: true });

      const screenshotRelPath = `media/spawn-smokes/${setId}/${positionId}/screenshot${screenshotExt}`;
      await writeFile(
        path.join(DATA_DIR, screenshotRelPath),
        Buffer.from(await screenshot.arrayBuffer()),
      );

      createdPositions.push({
        id: positionId,
        label: position.label,
        description: position.description || null,
        throwType: position.throwType || 'STAND',
        sortOrder: index,
        screenshotPath: screenshotRelPath,
      });
    }

    let overviewImagePath: string | null = null;
    let thumbnailPath: string | null = null;

    const overview = formData.get('overview_image') as File | null;
    if (overview && overview.size > 0) {
      overviewImagePath = await saveSpawnSmokeSetImage(setId, overview, 'overview');
    }

    const thumbnail = formData.get('thumbnail_image') as File | null;
    if (thumbnail && thumbnail.size > 0) {
      thumbnailPath = await saveSpawnSmokeSetImage(setId, thumbnail, 'thumbnail');
    }

    const set = await prisma.spawnSmokeSet.create({
      data: {
        id: setId,
        map: formData.get('map') as string,
        side: formData.get('side') as string,
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || null,
        overviewImagePath,
        thumbnailPath,
        positions: {
          create: createdPositions,
        },
      },
      include: {
        positions: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json(set);
  } catch (error: unknown) {
    console.error('Spawn smoke set upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
