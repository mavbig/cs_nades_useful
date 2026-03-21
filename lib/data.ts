import { Lineup, MapCount } from './types';
import { normalizeMapName } from './utils';
import lineupsData from '../data/static-lineups.json';
import { prisma } from './prisma';

// Direct import of JSON data ensures it's bundled at build time.
// This avoids ENOENT errors on Cloudflare Pages.
const staticLineups: Lineup[] = lineupsData as Lineup[];

const isDynamic = process.env.NODE_ENV === 'development';

export async function getAllLineups(): Promise<Lineup[]> {
  if (isDynamic && typeof window === 'undefined') {
    // Server-side dynamic
    const data = await prisma.lineup.findMany({ orderBy: { createdAt: 'desc' } });
    return data.map(l => ({ ...l, createdAt: l.createdAt.toISOString(), updatedAt: l.updatedAt.toISOString() })) as Lineup[];
  }
  return staticLineups;
}

export async function getLineupById(id: string): Promise<Lineup | null> {
  if (isDynamic && typeof window === 'undefined') {
    // Server-side dynamic
    const lineup = await prisma.lineup.findUnique({ where: { id } });
    if (!lineup) return null;
    return { ...lineup, createdAt: lineup.createdAt.toISOString(), updatedAt: lineup.updatedAt.toISOString() } as Lineup;
  }
  return staticLineups.find((l) => l.id === id) || null;
}

export async function getLineupsByMap(mapName: string): Promise<Lineup[]> {
  const normalizedMap = normalizeMapName(mapName);
  
  if (isDynamic && typeof window === 'undefined') {
    // Server-side dynamic
    const all = await getAllLineups();
    return all.filter(l => normalizeMapName(l.map) === normalizedMap);
  }

  return staticLineups.filter(
    (l) => normalizeMapName(l.map) === normalizedMap
  );
}

export async function getMapCounts(): Promise<MapCount[]> {
  const lineups = await getAllLineups();
  const counts: Record<string, number> = {};

  lineups.forEach((l) => {
    const map = l.map;
    counts[map] = (counts[map] || 0) + 1;
  });

  return Object.entries(counts).map(([map, count]) => ({ map, count }));
}
