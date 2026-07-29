import spawnSmokesData from '@/data/static-spawn-smokes.json';
import { getSpawnSmokeSetById } from '@/lib/spawn-smoke-data';
import DetailPageClient from './detail-page-client';
import { SpawnSmokeSet } from '@/lib/types';

const PLACEHOLDER_SPAWN_ID = '00000000-0000-0000-0000-000000000000';

export function generateStaticParams() {
  const sets = spawnSmokesData as SpawnSmokeSet[];
  if (sets.length === 0) {
    return [{ id: PLACEHOLDER_SPAWN_ID }];
  }
  return sets.map((set) => ({ id: set.id }));
}

export default async function SpawnSmokeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const set = await getSpawnSmokeSetById(id);

  if (!set) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Spawn smoke set not found.</p>
      </main>
    );
  }

  return <DetailPageClient set={set} />;
}
