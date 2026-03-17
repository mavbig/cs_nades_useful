import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Exporting lineups to JSON...');

  const lineups = await prisma.lineup.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const exportData = lineups.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  const publicDataDir = path.join(process.cwd(), 'public', 'data');
  await fs.mkdir(publicDataDir, { recursive: true });

  const filePath = path.join(publicDataDir, 'lineups.json');
  await fs.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf-8');

  console.log(`Successfully exported ${lineups.length} lineups to ${filePath}`);
}

main()
  .catch((e) => {
    console.error('Export failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
