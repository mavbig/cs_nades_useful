'use client';
import { useState, useRef, useEffect } from 'react';
import { Lineup } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, MoveUp, Tag, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';

type MediaView = 'video' | 'screenshot';

export default function DetailPageClient({ lineup }: { lineup: Lineup }) {
  const [mediaView, setMediaView] = useState<MediaView>('video');
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;

      if (isTyping) return;

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setMediaView((v) => (v === 'video' ? 'screenshot' : 'video'));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <main className="flex flex-col h-screen bg-background overflow-hidden">
      <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0 rounded-lg"
            aria-label="Back to list"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base font-semibold truncate">{lineup.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  'text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase',
                  lineup.side === 'CT' ? 'bg-blue-500/20 text-blue-300' : lineup.side === 'T' ? 'bg-amber-500/20 text-amber-300' : 'bg-muted text-muted-foreground',
                )}
              >
                {lineup.side}
              </span>
              <span className="text-xs text-muted-foreground">{lineup.map}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="text-xs text-muted-foreground">{lineup.utility}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b border-border bg-card/95 backdrop-blur-sm px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <InfoChip icon={<MapPin className="w-3.5 h-3.5" />} label="Start" value={lineup.startSpot} />
            <InfoChip icon={<MoveUp className="w-3.5 h-3.5" />} label="Throw" value={lineup.throwType} />
            <InfoChip icon={<Zap className="w-3.5 h-3.5" />} label="Utility" value={lineup.utility} />
            <InfoChip icon={<Tag className="w-3.5 h-3.5" />} label="Tags" value={lineup.tags || '—'} />
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col bg-black">
          {mediaView === 'screenshot' ? (
            <div className="flex-1 relative w-full overflow-hidden">
              <img
                src={getMediaUrl(lineup.screenshotPath)}
                alt="Screenshot"
                className="w-full h-full object-contain"
              />
              <span className="absolute top-3 left-3 rounded-md bg-black/70 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm z-10">
                Screenshot (aim) — S to switch to video
              </span>

              {/* Zoom Magnifier Overlay */}
              <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 w-96 h-96 md:w-[600px] md:h-[600px] rounded-full border-2 border-white/20 shadow-2xl overflow-hidden bg-black pointer-events-none z-10 ring-4 ring-black/40">
                <div 
                  className="w-full h-full bg-no-repeat bg-center"
                  style={{
                    backgroundImage: `url(${getMediaUrl(lineup.screenshotPath)})`,
                    backgroundSize: '500%',
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 relative w-full flex flex-col min-h-0">
              <video
                ref={videoRef}
                src={getMediaUrl(lineup.clipPath)}
                controls
                preload="metadata"
                className="w-full h-full object-contain"
              />
              <span className="absolute top-3 left-3 rounded-md bg-black/70 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
                Clip — S to switch to screenshot
              </span>
            </div>
          )}

          {lineup.description && (
            <div className="shrink-0 max-w-2xl mx-auto w-full px-4 py-3 border-t border-border bg-card/60">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Notes</h4>
              <p className="text-sm text-foreground/90 leading-relaxed">{lineup.description}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0">{label}:</span>
      <span className="text-foreground truncate" title={value}>{value}</span>
    </div>
  );
}
