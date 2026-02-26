'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

import { Lineup } from '@prisma/client';

export function LineupForm({ onClose, initialMap, lineup }: { onClose: (updatedLineup?: Lineup) => void; initialMap?: string; lineup?: Lineup }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: lineup?.title ?? '',
    map: lineup?.map ?? initialMap ?? '',
    side: lineup?.side ?? 'ANY',
    utility: lineup?.utility ?? 'SMOKE',
    startSpot: lineup?.startSpot ?? '',
    throwType: lineup?.throwType ?? 'STAND',
    tags: lineup?.tags ?? '',
    description: lineup?.description ?? '',
    tickrate: lineup?.tickrate ?? 'ANY',
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [clip, setClip] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineup && (!screenshot || !clip)) return alert('Please select both media files');

    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    if (screenshot) data.append('screenshot', screenshot);
    if (clip) data.append('clip', clip);

    try {
      const url = lineup ? `/api/lineups/${lineup.id}` : '/api/lineups';
      const method = lineup ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        const updated = await res.json();
        onClose(updated);
      }
      else alert('Error saving lineup');
    } catch {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
      <div className="bg-card w-full max-w-lg border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold tracking-tight">{lineup ? 'Edit lineup' : 'Add new lineup'}</h2>
          <Button variant="ghost" size="icon" onClick={() => onClose()} className="rounded-lg">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar">
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Basics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. A-Site Smoke from Stairs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Map</Label>
                  <Input
                    required
                    value={formData.map}
                    onChange={(e) => setFormData({ ...formData, map: e.target.value })}
                    placeholder="e.g. Mirage"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Side</Label>
                  <Select
                    value={formData.side}
                    onValueChange={(value) => setFormData({ ...formData, side: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Side" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANY">Any</SelectItem>
                      <SelectItem value="T">T</SelectItem>
                      <SelectItem value="CT">CT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Utility</Label>
                  <Select
                    value={formData.utility}
                    onValueChange={(value) => setFormData({ ...formData, utility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Utility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMOKE">Smoke</SelectItem>
                      <SelectItem value="FLASH">Flash</SelectItem>
                      <SelectItem value="MOLLY">Molly</SelectItem>
                      <SelectItem value="HE">HE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Spots</h3>
              <div className="space-y-1.5">
                <Label>Start spot</Label>
                <Input
                  required
                  value={formData.startSpot}
                  onChange={(e) => setFormData({ ...formData, startSpot: e.target.value })}
                  placeholder="e.g. T-Spawn"
                />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Throw</h3>
              <div className="space-y-1.5">
                <Label>Throw type</Label>
                <Select
                  value={formData.throwType}
                  onValueChange={(value) => setFormData({ ...formData, throwType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Throw type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAND">Stand</SelectItem>
                    <SelectItem value="JUMP">Jump</SelectItem>
                    <SelectItem value="JUMPTHROW">Jump throw</SelectItem>
                    <SelectItem value="RUN">Run</SelectItem>
                    <SelectItem value="WALK">Walk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Media {lineup && '(Optional)'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Screenshot (aim)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                    className={cn(!screenshot && 'text-muted-foreground')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Clip (video)</Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setClip(e.target.files?.[0] ?? null)}
                    className={cn(!clip && 'text-muted-foreground')}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <Label>Tags (comma separated)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="entry, fast, standard"
              />
            </section>
          </div>

          <div className="shrink-0 px-5 py-4 border-t border-border bg-card">
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Saving…' : lineup ? 'Update lineup' : 'Save lineup'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
