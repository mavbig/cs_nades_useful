'use client';
import { Lineup } from '@prisma/client';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';

interface LineupCardProps {
  lineup: Lineup;
  selected: boolean;
}

export function LineupCard({ lineup, selected }: LineupCardProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() =>
        router.push(
          `/lineups/${lineup.id}?map=${encodeURIComponent(lineup.map)}`
        )
      }
      className={cn(
        "w-full text-left flex items-center gap-4 p-3 rounded-xl border transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "bg-accent border-accent-foreground/25 shadow-sm"
          : "bg-card/60 border-border/60 hover:bg-card hover:border-border/80",
      )}
    >
      <div className="relative w-28 h-[4.5rem] rounded-lg overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border/50">
        <img
          src={`/api/media/${lineup.screenshotPath}`}
          alt=""
          className="object-cover w-full h-full scale-[7] origin-center"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider",
              lineup.side === "CT"
                ? "bg-blue-500/20 text-blue-300"
                : lineup.side === "T"
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {lineup.side}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {lineup.utility}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-foreground truncate mt-1">{lineup.title}</h3>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>{lineup.map}</span>
          <span aria-hidden>·</span>
          <span>{lineup.throwType}</span>
        </div>
      </div>
    </button>
  );
}
