'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Trash2, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { SpawnSmokeSet } from '@/lib/types';
import { MAPS } from '@/lib/maps';

type PositionRow = {
  id?: string;
  label: string;
  description: string;
  screenshotPath?: string;
  file: File | null;
};

function createDefaultRows(count = 5): PositionRow[] {
  return Array.from({ length: count }, (_, index) => ({
    label: `Spawn ${index + 1}`,
    description: '',
    file: null,
  }));
}

function rowsFromSet(set?: SpawnSmokeSet): PositionRow[] {
  if (!set || set.positions.length === 0) {
    return createDefaultRows();
  }

  return set.positions.map((position) => ({
    id: position.id,
    label: position.label,
    description: position.description || '',
    screenshotPath: position.screenshotPath,
    file: null,
  }));
}

export function SpawnSmokeSetForm({
  onClose,
  initialMap,
  spawnSmokeSet,
}: {
  onClose: (updated?: SpawnSmokeSet) => void;
  initialMap?: string;
  spawnSmokeSet?: SpawnSmokeSet;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: spawnSmokeSet?.title ?? '',
    map: spawnSmokeSet?.map ?? initialMap ?? (MAPS[0]?.name ?? ''),
    side: spawnSmokeSet?.side ?? 'T',
    description: spawnSmokeSet?.description ?? '',
  });
  const [positions, setPositions] = useState<PositionRow[]>(() => rowsFromSet(spawnSmokeSet));

  useEffect(() => {
    const handleClose = () => onClose();
    window.addEventListener('app:close-form', handleClose);
    return () => {
      window.removeEventListener('app:close-form', handleClose);
    };
  }, [onClose]);

  const updatePosition = (index: number, patch: Partial<PositionRow>) => {
    setPositions((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  };

  const addPosition = () => {
    setPositions((current) => [
      ...current,
      { label: `Spawn ${current.length + 1}`, description: '', file: null },
    ]);
  };

  const removePosition = (index: number) => {
    setPositions((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (positions.length === 0) {
      alert('Add at least one spawn position.');
      return;
    }

    for (const [index, position] of positions.entries()) {
      if (!position.label.trim()) {
        alert(`Position ${index + 1} needs a label.`);
        return;
      }
      if (!spawnSmokeSet && !position.file) {
        alert(`Position ${index + 1} needs a screenshot.`);
        return;
      }
      if (spawnSmokeSet && !position.file && !position.screenshotPath) {
        alert(`Position ${index + 1} needs a screenshot.`);
        return;
      }
    }

    setLoading(true);
    const data = new FormData();
    data.append('map', formData.map);
    data.append('side', formData.side);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append(
      'positions',
      JSON.stringify(
        positions.map((position) => ({
          id: position.id,
          label: position.label,
          description: position.description || undefined,
          screenshotPath: position.screenshotPath,
        })),
      ),
    );

    positions.forEach((position, index) => {
      if (position.file) {
        data.append(`screenshot_${index}`, position.file);
      }
    });

    try {
      const url = spawnSmokeSet ? `/api/spawn-smokes/${spawnSmokeSet.id}` : '/api/spawn-smokes';
      const method = spawnSmokeSet ? 'PATCH' : 'POST';
      const response = await fetch(url, { method, body: data });

      if (response.ok) {
        const updated = await response.json();
        onClose(updated);
        return;
      }

      alert('Error saving spawn smoke set');
    } catch {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
      <div className="bg-card w-full max-w-2xl border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold tracking-tight">
            {spawnSmokeSet ? 'Edit spawn smoke set' : 'Add spawn smoke set'}
          </h2>
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
                    onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                    placeholder="e.g. Red Room Smokes"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Map</Label>
                  <Select
                    value={formData.map}
                    onValueChange={(value) => setFormData({ ...formData, map: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Map" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAPS.map((map) => (
                        <SelectItem key={map.slug} value={map.name}>
                          {map.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                      <SelectItem value="T">T</SelectItem>
                      <SelectItem value="CT">CT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    placeholder="Optional notes"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Spawn positions
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addPosition} className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add spawn
                </Button>
              </div>
              <div className="space-y-3">
                {positions.map((position, index) => (
                  <div key={`${position.id ?? 'new'}-${index}`} className="rounded-xl border border-border/80 p-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Position {index + 1}
                      </span>
                      {positions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removePosition(index)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Label</Label>
                        <Input
                          required
                          value={position.label}
                          onChange={(event) => updatePosition(index, { label: event.target.value })}
                          placeholder={`Spawn ${index + 1}`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Screenshot</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            updatePosition(index, { file: event.target.files?.[0] ?? null })
                          }
                        />
                      </div>
                    </div>
                    {position.screenshotPath && !position.file && (
                      <p className="text-xs text-muted-foreground">Current screenshot will be kept unless replaced.</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="shrink-0 px-5 py-4 border-t border-border bg-card">
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Saving…' : spawnSmokeSet ? 'Update spawn smoke set' : 'Save spawn smoke set'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
