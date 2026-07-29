import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

export async function saveSpawnSmokeSetImage(
  setId: string,
  file: File,
  name: 'overview' | 'thumbnail',
): Promise<string> {
  const ext = path.extname(file.name) || '.jpg';
  const relPath = `media/spawn-smokes/${setId}/${name}${ext}`;
  const mediaDir = path.join(DATA_DIR, 'media', 'spawn-smokes', setId);
  await mkdir(mediaDir, { recursive: true });
  await writeFile(path.join(DATA_DIR, relPath), Buffer.from(await file.arrayBuffer()));
  return relPath;
}
