'use client';

import { useEffect, useState } from 'react';
import { SpawnSmokeSet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';
import { SpawnSmokeSetForm } from '@/components/spawn-smoke-set-form';

export default function DetailPageClient({ set: initialSet }: { set: SpawnSmokeSet }) {
  const [set, setSet] = useState<SpawnSmokeSet>(initialSet);
  const [showEditForm, setShowEditForm] = useState(false);
  const router = useRouter();
  const isDynamic = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const handleClose = () => setShowEditForm(false);
    window.addEventListener('app:close-form', handleClose);
    return () => window.removeEventListener('app:close-form', handleClose);
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
            <h1 className="text-base font-semibold truncate">{set.title}</h1>
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
              <span className="text-xs text-muted-foreground">{set.positions.length} spawns</span>
            </div>
            </div>
        </div>
        {isDynamic && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setShowEditForm(true)}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        {set.description && (
          <p className="text-sm text-muted-foreground mb-4 max-w-3xl">{set.description}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {set.positions.map((position) => (
            <article
              key={position.id}
              className="rounded-xl border border-border/80 bg-card/60 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-border/60">
                <h2 className="text-sm font-semibold">{position.label}</h2>
                {position.description && (
                  <p className="text-xs text-muted-foreground mt-1">{position.description}</p>
                )}
              </div>
              <div className="aspect-[16/10] bg-black">
                <img
                  src={getMediaUrl(position.screenshotPath)}
                  alt={position.label}
                  className="w-full h-full object-contain"
                />
              </div>
            </article>
          ))}
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
