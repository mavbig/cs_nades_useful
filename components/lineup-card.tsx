'use client';
import { Lineup } from '@prisma/client';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface LineupCardProps {
  lineup: Lineup;
  selected: boolean;
}

export function LineupCard({ lineup, selected }: LineupCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/lineups/${lineup.id}`)}
      className={cn(
        "group flex items-center gap-3 p-2 rounded-md transition-all cursor-pointer border border-transparent",
        selected ? "bg-accent border-accent-foreground/20" : "hover:bg-accent/50",
      )}
    >
      <div className="relative w-24 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
        <img
          src={`/api/media/${lineup.screenshotPath}`}
          alt={lineup.title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
            lineup.side === 'CT' ? "bg-blue-900/50 text-blue-200" : 
            lineup.side === 'T' ? "bg-orange-900/50 text-orange-200" : "bg-muted text-muted-foreground"
          )}>
            {lineup.side}
          </span>
          <h3 className="text-sm font-medium truncate">{lineup.title}</h3>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground italic">
          <span className="text-foreground/80">{lineup.map}</span>
          <span>•</span>
          <span>{lineup.utility}</span>
          <span>•</span>
          <span>{lineup.throwType}</span>
        </div>
      </div>
    </div>
  );
}
