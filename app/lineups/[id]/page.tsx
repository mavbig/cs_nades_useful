import { Lineup } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Target, MoveUp, Tag, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getAllLineups, getLineupById } from '@/lib/data';
import { getMediaUrl } from '@/lib/media';
import DetailPageClient from './detail-page-client';

export async function generateStaticParams() {
  const lineups = await getAllLineups();
  return lineups.map((lineup) => ({
    id: lineup.id,
  }));
}

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lineup = await getLineupById(id);

  if (!lineup) {
    return (
      <main className="flex flex-col h-screen bg-background items-center justify-center px-4">
        <p className="text-muted-foreground text-sm">Lineup not found.</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            Back to list
          </Button>
        </Link>
      </main>
    );
  }

  return <DetailPageClient lineup={lineup} />;
}
