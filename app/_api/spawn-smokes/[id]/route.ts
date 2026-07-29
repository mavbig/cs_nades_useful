import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mkdir, rm, writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

type PositionInput = {
  id?: string;
  label: string;
  description?: string;
  screenshotPath?: string;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const set = await prisma.spawnSmokeSet.findUnique({
    where: { id },
    include: {
      positions: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!set) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(set);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const set = await prisma.spawnSmokeSet.findUnique({ where: { id } });

    if (set) {
      const mediaDir = path.join(DATA_DIR, 'media', 'spawn-smokes', id);
      await rm(mediaDir, { recursive: true, force: true });
      await prisma.spawnSmokeSet.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Spawn smoke set delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const positionsJson = formData.get('positions') as string | null;

    const existingSet = await prisma.spawnSmokeSet.findUnique({
      where: { id },
      include: { positions: true },
    });

    if (!existingSet) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!positionsJson) {
      const set = await prisma.spawnSmokeSet.update({
        where: { id },
        data: {
          map: formData.get('map') as string,
          side: formData.get('side') as string,
          title: formData.get('title') as string,
          description: (formData.get('description') as string) || null,
        },
        include: {
          positions: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      return NextResponse.json(set);
    }

    const positions = JSON.parse(positionsJson) as PositionInput[];
    if (!Array.isArray(positions) || positions.length === 0) {
      return NextResponse.json({ error: 'At least one position is required' }, { status: 400 });
    }

    const nextPositions = [];

    for (let index = 0; index < positions.length; index += 1) {
      const position = positions[index];
      const screenshot = formData.get(`screenshot_${index}`) as File | null;
      let screenshotPath = position.screenshotPath || null;

      if (screenshot && screenshot.size > 0) {
        const positionId = position.id || uuidv4();
        const screenshotExt = path.extname(screenshot.name) || '.jpg';
        const mediaDir = path.join(DATA_DIR, 'media', 'spawn-smokes', id, positionId);
        await mkdir(mediaDir, { recursive: true });
        screenshotPath = `media/spawn-smokes/${id}/${positionId}/screenshot${screenshotExt}`;
        await writeFile(
          path.join(DATA_DIR, screenshotPath),
          Buffer.from(await screenshot.arrayBuffer()),
        );
      }

      if (!screenshotPath) {
        return NextResponse.json({ error: `Missing screenshot for position ${index + 1}` }, { status: 400 });
      }

      nextPositions.push({
        id: position.id || uuidv4(),
        label: position.label,
        description: position.description || null,
        sortOrder: index,
        screenshotPath,
      });
    }

    await prisma.spawnSmokePosition.deleteMany({ where: { setId: id } });
    const set = await prisma.spawnSmokeSet.update({
      where: { id },
      data: {
        map: formData.get('map') as string,
        side: formData.get('side') as string,
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || null,
        positions: {
          create: nextPositions,
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
    console.error('Spawn smoke set update error:', error);
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
