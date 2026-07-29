import { SpawnSmokeSet } from './types';
import { normalizeMapName } from './utils';
import spawnSmokesData from '../data/static-spawn-smokes.json';
import { prisma } from './prisma';

const staticSpawnSmokes: SpawnSmokeSet[] = spawnSmokesData as SpawnSmokeSet[];

const isDynamic = process.env.NODE_ENV === 'development';

function serializeSet(
  set: {
    id: string;
    map: string;
    side: string;
    title: string;
    description: string | null;
    overviewImagePath: string | null;
    thumbnailPath: string | null;
    createdAt: Date;
    updatedAt: Date;
    positions: {
      id: string;
      label: string;
      sortOrder: number;
      throwType: string;
      screenshotPath: string;
      description: string | null;
    }[];
  },
): SpawnSmokeSet {
  return {
    id: set.id,
    map: set.map,
    side: set.side,
    title: set.title,
    description: set.description,
    overviewImagePath: set.overviewImagePath,
    thumbnailPath: set.thumbnailPath,
    createdAt: set.createdAt.toISOString(),
    updatedAt: set.updatedAt.toISOString(),
    positions: set.positions
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((position) => ({
        id: position.id,
        label: position.label,
        sortOrder: position.sortOrder,
        throwType: position.throwType,
        screenshotPath: position.screenshotPath,
        description: position.description,
      })),
  };
}

const setInclude = {
  positions: {
    orderBy: { sortOrder: 'asc' as const },
  },
};

export async function getAllSpawnSmokeSets(): Promise<SpawnSmokeSet[]> {
  if (isDynamic && typeof window === 'undefined') {
    const data = await prisma.spawnSmokeSet.findMany({
      include: setInclude,
      orderBy: { createdAt: 'desc' },
    });
    return data.map(serializeSet);
  }
  return staticSpawnSmokes;
}

export async function getSpawnSmokeSetById(id: string): Promise<SpawnSmokeSet | null> {
  if (isDynamic && typeof window === 'undefined') {
    const set = await prisma.spawnSmokeSet.findUnique({
      where: { id },
      include: setInclude,
    });
    return set ? serializeSet(set) : null;
  }
  return staticSpawnSmokes.find((entry) => entry.id === id) || null;
}

export async function getSpawnSmokeSetsByMap(mapName: string): Promise<SpawnSmokeSet[]> {
  const normalizedMap = normalizeMapName(mapName);
  const all = await getAllSpawnSmokeSets();
  return all.filter((entry) => normalizeMapName(entry.map) === normalizedMap);
}
