import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function writeJson(relativePath: string, data: unknown) {
  const filePath = path.join(process.cwd(), relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function main() {
  console.log('Exporting lineups to JSON...');

  const lineups = await prisma.lineup.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const exportLineups = lineups.map((lineup) => ({
    ...lineup,
    createdAt: lineup.createdAt.toISOString(),
    updatedAt: lineup.updatedAt.toISOString(),
  }));

  await writeJson('public/data/lineups.json', exportLineups);
  await writeJson('data/static-lineups.json', exportLineups);

  console.log(`Successfully exported ${lineups.length} lineups.`);

  console.log('Exporting spawn smoke sets to JSON...');

  const spawnSmokeSets = await prisma.spawnSmokeSet.findMany({
    include: {
      positions: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const exportSpawnSmokes = spawnSmokeSets.map((set) => ({
    id: set.id,
    map: set.map,
    side: set.side,
    title: set.title,
    description: set.description,
    overviewImagePath: set.overviewImagePath,
    thumbnailPath: set.thumbnailPath,
    createdAt: set.createdAt.toISOString(),
    updatedAt: set.updatedAt.toISOString(),
    positions: set.positions.map((position) => ({
      id: position.id,
      label: position.label,
      sortOrder: position.sortOrder,
      throwType: position.throwType,
      screenshotPath: position.screenshotPath,
      description: position.description,
    })),
  }));

  await writeJson('public/data/spawn-smokes.json', exportSpawnSmokes);
  await writeJson('data/static-spawn-smokes.json', exportSpawnSmokes);

  console.log(`Successfully exported ${spawnSmokeSets.length} spawn smoke sets.`);
}

main()
  .catch((error) => {
    console.error('Export failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
