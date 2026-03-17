import { Lineup, MapCount } from './types';
import { normalizeMapName } from './utils';

// For the static export, we will fetch the JSON file at build time (and client-side for lists)
// During next build, this will be used by generateStaticParams
// In the client, it can be used via fetch() or bundled if small

let cachedData: Lineup[] | null = null;

async function fetchLineups(): Promise<Lineup[]> {
  if (cachedData) return cachedData;

  // In Next.js build environment (Node), we can read directly from the filesystem
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', 'data', 'lineups.json');
      const content = await fs.readFile(filePath, 'utf-8');
      cachedData = JSON.parse(content);
      return cachedData || [];
    } catch (e) {
      console.warn('Failed to read lineups.json from filesystem', e);
      return [];
    }
  }

  // In the browser, we fetch it
  try {
    const res = await fetch('/data/lineups.json');
    if (!res.ok) throw new Error('Failed to fetch data');
    cachedData = await res.json();
    return cachedData || [];
  } catch (e) {
    console.error('Failed to fetch lineups.json', e);
    return [];
  }
}

export async function getAllLineups(): Promise<Lineup[]> {
  return fetchLineups();
}

export async function getLineupById(id: string): Promise<Lineup | null> {
  const lineups = await fetchLineups();
  return lineups.find((l) => l.id === id) || null;
}

export async function getLineupsByMap(mapName: string): Promise<Lineup[]> {
  const lineups = await fetchLineups();
  const normalizedMap = normalizeMapName(mapName);
  return lineups.filter(
    (l) => normalizeMapName(l.map) === normalizedMap
  );
}

export async function getMapCounts(): Promise<MapCount[]> {
  const lineups = await fetchLineups();
  const counts: Record<string, number> = {};

  lineups.forEach((l) => {
    const map = l.map;
    counts[map] = (counts[map] || 0) + 1;
  });

  return Object.entries(counts).map(([map, count]) => ({ map, count }));
}
