'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { X } from 'lucide-react';

export function LineupForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    map: '',
    side: 'ANY',
    utility: 'SMOKE',
    startSpot: '',
    aimSpot: '',
    throwType: 'STAND',
    tickrate: 'ANY',
    tags: '',
    description: '',
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [clip, setClip] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot || !clip) return alert('Please select both media files');
    
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    data.append('screenshot', screenshot);
    data.append('clip', clip);

    try {
      const res = await fetch('/api/lineups', {
        method: 'POST',
        body: data,
      });
      if (res.ok) onClose();
      else alert('Error saving lineup');
    } catch (err) {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-xl border rounded-lg shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Add New Lineup</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="A-Site Smoke from Stairs" />
            </div>
            <div className="space-y-2">
              <Label>Map</Label>
              <Input required value={formData.map} onChange={e => setFormData({...formData, map: e.target.value})} placeholder="Mirage" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Side</Label>
              <select className="w-full bg-secondary rounded p-1.5 text-sm" value={formData.side} onChange={e => setFormData({...formData, side: e.target.value})}>
                <option value="ANY">ANY</option>
                <option value="T">T</option>
                <option value="CT">CT</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Utility</Label>
              <select className="w-full bg-secondary rounded p-1.5 text-sm" value={formData.utility} onChange={e => setFormData({...formData, utility: e.target.value})}>
                <option value="SMOKE">SMOKE</option>
                <option value="FLASH">FLASH</option>
                <option value="MOLLY">MOLLY</option>
                <option value="HE">HE</option>
                <option value="DECOY">DECOY</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tickrate</Label>
              <select className="w-full bg-secondary rounded p-1.5 text-sm" value={formData.tickrate} onChange={e => setFormData({...formData, tickrate: e.target.value})}>
                <option value="ANY">ANY</option>
                <option value="TR64">64</option>
                <option value="TR128">128</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Spot</Label>
              <Input required value={formData.startSpot} onChange={e => setFormData({...formData, startSpot: e.target.value})} placeholder="T-Spawn" />
            </div>
            <div className="space-y-2">
              <Label>Aim Spot</Label>
              <Input required value={formData.aimSpot} onChange={e => setFormData({...formData, aimSpot: e.target.value})} placeholder="Top of chimney" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Throw Type</Label>
            <select className="w-full bg-secondary rounded p-1.5 text-sm" value={formData.throwType} onChange={e => setFormData({...formData, throwType: e.target.value})}>
              <option value="STAND">STAND</option>
              <option value="JUMP">JUMP</option>
              <option value="JUMPTHROW">JUMPTHROW</option>
              <option value="RUN">RUN</option>
              <option value="WALK">WALK</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Screenshot</Label>
              <Input type="file" accept="image/*" onChange={e => setScreenshot(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label>Clip (Video)</Label>
              <Input type="file" accept="video/*" onChange={e => setClip(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags (comma separated)</Label>
            <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="entry, fast, standard" />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Lineup'}
          </Button>
        </form>
      </div>
    </div>
  );
}
