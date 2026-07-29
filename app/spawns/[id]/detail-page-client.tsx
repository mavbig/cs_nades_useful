'use client';

import { useEffect, useMemo, useState } from 'react';
import { SpawnSmokeSet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';
import { SpawnSmokeSetForm } from '@/components/spawn-smoke-set-form';

function isPositionConfigured(position: SpawnSmokeSet['positions'][number]) {
  return Boolean(position.screenshotPath);
}

export default function DetailPageClient({ set: initialSet }: { set: SpawnSmokeSet }) {
  const [set, setSet] = useState<SpawnSmokeSet>(initialSet);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const isDynamic = process.env.NODE_ENV === 'development';

  const configuredIndices = useMemo(
    () => set.positions.map((position, index) => (isPositionConfigured(position) ? index : -1)).filter((index) => index >= 0),
    [set.positions],
  );

  const activeIndex = useMemo(() => {
    if (set.positions.length === 0) return 0;
    if (set.positions[selectedIndex] && isPositionConfigured(set.positions[selectedIndex])) {
      return selectedIndex;
    }
    return configuredIndices[0] ?? 0;
  }, [configuredIndices, selectedIndex, set.positions]);

  const selectedPosition = set.positions[activeIndex];

  useEffect(() => {
    const handleClose = () => setShowEditForm(false);
    window.addEventListener('app:close-form', handleClose);
    return () => window.removeEventListener('app:close-form', handleClose);
  }, []);

  useEffect(() => {
    const handleSpawnSelect = (event: Event) => {
      const detail = (event as CustomEvent<{ index: number }>).detail;
      if (detail.index >= 0 && detail.index < set.positions.length) {
        setSelectedIndex(detail.index);
      }
    };

    window.addEventListener('app:spawn-select', handleSpawnSelect);
    return () => window.removeEventListener('app:spawn-select', handleSpawnSelect);
  }, [set.positions.length]);

  return (
    <main className="flex flex-col h-screen bg-background overflow-hidden">
      <header className="shrink-0 flex items-center justify-between gap-3 px-3 py-2 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0 rounded-lg h-8 w-8"
            aria-label="Back to list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">{set.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  'text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase',
                  set.side === 'CT' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300',
                )}
              >
                {set.side}
              </span>
              <span className="text-xs text-muted-foreground">{set.map}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="text-xs text-muted-foreground">
                {configuredIndices.length}/{set.positions.length} spawns
              </span>
            </div>
          </div>
        </div>
        {isDynamic && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => setShowEditForm(true)}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </Button>
        )}
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 custom-scrollbar">
        {set.description && (
          <p className="text-xs text-muted-foreground mb-3 max-w-3xl">{set.description}</p>
        )}

        <div className="flex flex-col md:flex-row gap-3 md:items-start max-w-5xl">
          <section className="md:w-[240px] lg:w-[280px] shrink-0 space-y-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Spawn overview
            </h2>
            <div className="rounded-lg border border-border/80 bg-card/60 overflow-hidden">
              {set.overviewImagePath ? (
                <img
                  src={getMediaUrl(set.overviewImagePath)}
                  alt="Spawn overview"
                  className="w-full max-h-[min(220px,32vh)] object-contain bg-black"
                />
              ) : (
                <div className="flex items-center justify-center h-[140px] bg-muted/40 text-xs text-muted-foreground px-3 text-center">
                  No overview image yet. Upload a top-down map with numbered spawns when editing.
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {set.positions.map((position, index) => {
                const configured = isPositionConfigured(position);
                const selected = index === activeIndex;

                return (
                  <button
                    key={position.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    disabled={!configured}
                    aria-pressed={selected}
                    className={cn(
                      'rounded-md border px-2 py-1.5 text-xs font-medium transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      !configured && 'border-border/50 bg-muted/30 text-muted-foreground/60 cursor-not-allowed',
                      configured && !selected && 'border-border/70 bg-card/50 text-foreground hover:bg-card hover:border-border',
                      selected && configured && 'border-accent-foreground/25 bg-accent text-accent-foreground ring-2 ring-ring',
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold border',
                          configured
                            ? selected
                              ? 'border-accent-foreground/30 bg-background/80 text-accent-foreground'
                              : 'border-border bg-background/80 text-foreground'
                            : 'bg-muted border-border/50 text-muted-foreground',
                        )}
                      >
                        {index + 1}
                      </span>
                      {position.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex-1 min-w-0 space-y-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Throw position
            </h2>
            {selectedPosition && isPositionConfigured(selectedPosition) ? (
              <article className="rounded-lg border border-border/80 bg-card/60 overflow-hidden">
                <div className="px-3 py-2 border-b border-border/60 flex flex-wrap items-center gap-2 justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">{selectedPosition.label}</h3>
                    {selectedPosition.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedPosition.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider bg-muted text-muted-foreground">
                    {selectedPosition.throwType || 'STAND'}
                  </span>
                </div>
                <div className="bg-black flex items-center justify-center">
                  <img
                    src={getMediaUrl(selectedPosition.screenshotPath)}
                    alt={selectedPosition.label}
                    className="w-full max-h-[min(420px,52vh)] object-contain"
                  />
                </div>
              </article>
            ) : (
              <div className="rounded-lg border border-dashed border-border/80 bg-card/30 px-3 py-8 text-center text-xs text-muted-foreground">
                Select a configured spawn to see where to aim and throw.
              </div>
            )}
          </section>
        </div>
      </div>

      {showEditForm && (
        <SpawnSmokeSetForm
          spawnSmokeSet={set}
          onClose={(updated) => {
            setShowEditForm(false);
            if (updated) {
              setSet(updated);
            }
          }}
        />
      )}
    </main>
  );
}
