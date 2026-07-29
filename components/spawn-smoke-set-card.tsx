'use client';

import { SpawnSmokeSet } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Cloud, MapPin } from 'lucide-react';
import { getMediaUrl } from '@/lib/media';

interface SpawnSmokeSetCardProps {
  set: SpawnSmokeSet;
  selected: boolean;
}

export function SpawnSmokeSetCard({ set, selected }: SpawnSmokeSetCardProps) {
  const router = useRouter();
  const previewPath = set.positions[0]?.screenshotPath;

  return (
    <button
      type="button"
      onClick={() =>
        router.push(
          `/spawns/${set.id}?map=${encodeURIComponent(set.map)}`,
        )
      }
      className={cn(
        'w-full text-left flex items-center gap-4 p-3 rounded-xl border transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
          ? 'bg-accent border-accent-foreground/25 shadow-sm'
          : 'bg-card/60 border-border/60 hover:bg-card hover:border-border/80',
      )}
    >
      <div className="relative w-28 h-[4.5rem] rounded-lg overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border/50">
        {previewPath ? (
          <img
            src={getMediaUrl(previewPath)}
            alt=""
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {set.positions.length}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider',
              set.side === 'CT'
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-amber-500/20 text-amber-300',
            )}
          >
            {set.side}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Cloud className="w-3 h-3" />
            Spawn Smokes
          </span>
        </div>
        <h3 className="text-sm font-semibold text-foreground truncate mt-1">{set.title}</h3>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>{set.map}</span>
          <span aria-hidden>·</span>
          <span>{set.positions.length} spawns</span>
        </div>
      </div>
    </button>
  );
}
