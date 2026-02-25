'use client';
import { useEffect, useState, useRef } from 'react';
import { Lineup } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trash2, MapPin, Target, MoveUp, Timer, Tag } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function DetailPage() {
  const [lineup, setLineup] = useState<Lineup | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch(`/api/lineups/${id}`)
      .then(res => res.json())
      .then(data => {
        setLineup(data);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    window.addEventListener('app:delete-lineup', handleDelete);
    return () => window.removeEventListener('app:delete-lineup', handleDelete);
  }, [lineup]);

  const handleDelete = async () => {
    if (!confirm('Delete this lineup?')) return;
    await fetch(`/api/lineups/${id}`, { method: 'DELETE' });
    router.push('/');
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading...</div>;
  if (!lineup) return <div className="p-10 text-center">Not found.</div>;

  return (
    <main className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}><ChevronLeft /></Button>
          <div>
            <h1 className="text-base font-bold leading-none">{lineup.title}</h1>
            <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{lineup.map} • {lineup.side}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Media Section */}
        <div className="flex flex-col gap-1 bg-black">
          <div className="relative aspect-video w-full overflow-hidden border-b border-white/5">
             <img 
              src={`/api/media/${lineup.screenshotPath}`} 
              alt="Aim Spot" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10">Screenshot (Aim)</div>
          </div>
          
          <div className="relative aspect-video w-full bg-black">
            <video 
              ref={videoRef}
              src={`/api/media/${lineup.clipPath}`} 
              controls 
              preload="metadata"
              className="w-full h-full"
            />
            <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10">Clip</div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4 grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="space-y-4">
            <InfoItem icon={<MapPin className="w-4 h-4" />} label="Start Spot" value={lineup.startSpot} />
            <InfoItem icon={<Target className="w-4 h-4" />} label="Aim Spot" value={lineup.aimSpot} />
            <InfoItem icon={<MoveUp className="w-4 h-4" />} label="Throw" value={lineup.throwType} />
          </div>
          <div className="space-y-4">
            <InfoItem icon={<Timer className="w-4 h-4" />} label="Tickrate" value={lineup.tickrate} />
            <InfoItem icon={<Tag className="w-4 h-4" />} label="Tags" value={lineup.tags || '-'} />
            <InfoItem icon={<ChevronLeft className="w-4 h-4" />} label="Utility" value={lineup.utility} />
          </div>

          {lineup.description && (
            <div className="col-span-2 mt-2 pt-4 border-t">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Notes</h4>
              <p className="text-sm text-foreground/90 leading-relaxed">{lineup.description}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <div className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-1">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
