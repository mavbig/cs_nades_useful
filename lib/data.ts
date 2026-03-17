import { Lineup, MapCount } from './types';
import { normalizeMapName } from './utils';
import lineupsData from '../public/data/lineups.json';

// We cast the imported JSON to Lineup[]
const lineups: Lineup[] = lineupsData as Lineup[];

export async function getAllLineups(): Promise<Lineup[]> {
  return lineups;
}

export async function getLineupById(id: string): Promise<Lineup | null> {
  return lineups.find((l) => l.id === id) || null;
}

export async function getLineupsByMap(mapName: string): Promise<Lineup[]> {
  const normalizedMap = normalizeMapName(mapName);
  return lineups.filter(
    (l) => normalizeMapName(l.map) === normalizedMap
  );
}

export async function getMapCounts(): Promise<MapCount[]> {
  const counts: Record<string, number> = {};

  lineups.forEach((l) => {
    const map = l.map;
    counts[map] = (counts[map] || 0) + 1;
  });

  return Object.entries(counts).map(([map, count]) => ({ map, count }));
}
