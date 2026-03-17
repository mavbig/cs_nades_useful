import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';
import { MAPS, getMapImageExt } from '@/lib/maps';

const TEMP_DIR = path.join(process.cwd(), 'temp');
const VALID_SLUGS = new Set(MAPS.map((m) => m.slug));

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug || !VALID_SLUGS.has(slug as (typeof MAPS)[number]['slug'])) {
    return NextResponse.json({ error: 'Unknown map' }, { status: 404 });
  }

  const ext = getMapImageExt(slug as (typeof MAPS)[number]['slug']);
  const filename = `800px-CS2_de_${slug}${ext}`;
  const filePath = path.join(TEMP_DIR, filename);

  try {
    const buffer = await readFile(filePath);
    const contentType = ext === '.jpg' ? 'image/jpeg' : 'image/png';
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
