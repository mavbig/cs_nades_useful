'use client';
import { useState, useEffect, useRef } from 'react';
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
import { MAPS } from '@/lib/maps';

export function LineupForm({ onClose, initialMap, lineup }: { onClose: (updatedLineup?: Lineup) => void; initialMap?: string; lineup?: Lineup }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: lineup?.title ?? '',
    map: lineup?.map ?? initialMap ?? (MAPS[0]?.name ?? ''),
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

  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/tags').then(res => res.json()).then(setAvailableTags).catch(console.error);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const target = e.target as HTMLElement;
        const isTyping = 
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.isContentEditable;
        
        if (!isTyping) {
          e.stopPropagation();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tagsArray.includes(t)) {
      setFormData({ ...formData, tags: [...tagsArray, t].join(', ') });
    }
    setTagInput('');
    setShowTagSuggestions(false);
    tagInputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: tagsArray.filter(t => t !== tagToRemove).join(', ') });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && tagInput === '') {
      e.preventDefault();
      if (tagsArray.length > 0) {
        removeTag(tagsArray[tagsArray.length - 1]);
      }
    }
  };

  const filteredTags = availableTags.filter(t => t.includes(tagInput.toLowerCase()) && !tagsArray.includes(t));

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
                  <Select
                    value={formData.map}
                    onValueChange={(value) => setFormData({ ...formData, map: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Map" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAPS.map((m) => (
                        <SelectItem key={m.slug} value={m.name}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1.5 col-span-1">
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
                <div className="space-y-1.5 col-span-1">
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
                <div className="space-y-1.5 col-span-2">
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
                      <SelectItem value="WALK">Walk</SelectItem>
                      <SelectItem value="RUN">Run</SelectItem>
                      <SelectItem value="JUMPTHROW">Jump throw</SelectItem>
                      <SelectItem value="A JUMPTHROW">A Jump throw</SelectItem>
                      <SelectItem value="D JUMPTHROW">D Jump throw</SelectItem>
                      <SelectItem value="RUN JUMPTHROW">Run Jump throw</SelectItem>
                      <SelectItem value="WALK JUMPTHROW">Walk Jump throw</SelectItem>
                      <SelectItem value="RIGHT CLICK">Right click</SelectItem>
                      <SelectItem value="LEFT+RIGHT CLICK">Left+Right click</SelectItem>
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
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Media</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Screenshot</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                    className={cn(!screenshot && 'text-muted-foreground')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Clip</Label>
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
              <Label>Tags</Label>
              <div className="relative">
                <div
                  className="flex flex-wrap items-center gap-1.5 min-h-10 w-full rounded-lg border border-input bg-secondary/30 px-2 py-1.5 text-sm transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background cursor-text"
                  onClick={() => tagInputRef.current?.focus()}
                >
                  {tagsArray.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-medium">
                      {tag}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                        className="hover:text-destructive focus:outline-none rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowTagSuggestions(true);
                    }}
                    onKeyDown={handleTagKeyDown}
                    onFocus={() => setShowTagSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                    placeholder={tagsArray.length === 0 ? "e.g. entry, fast (press Space to add)" : ""}
                    className="flex-1 bg-transparent outline-none min-w-[120px] text-sm placeholder:text-muted-foreground"
                  />
                </div>
                {showTagSuggestions && filteredTags.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-md border border-border bg-popover shadow-md z-50 custom-scrollbar">
                    {filteredTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted focus:bg-muted outline-none"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          addTag(tag);
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
