'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Lineup } from '@prisma/client';
import { LineupCard } from '@/components/lineup-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LineupForm } from '@/components/lineup-form';

export default function HomePage() {
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/lineups')
      .then(res => res.json())
      .then(data => {
        setLineups(data);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return lineups.filter(l => 
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.map.toLowerCase().includes(search.toLowerCase()) ||
      l.tags.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, lineups]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter' && filtered[selectedIndex]) {
        router.push(`/lineups/${filtered[selectedIndex].id}`);
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [filtered, selectedIndex, router]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <main className="flex flex-col h-screen max-w-[900px] mx-auto bg-background p-4 gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder="Search nades... (/)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-none focus-visible:ring-1"
          />
        </div>
        <Button size="icon" variant="secondary" onClick={() => setShowAdd(true)}>
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground animate-pulse">Loading lineups...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No lineups found.</div>
        ) : (
          filtered.map((lineup, i) => (
            <LineupCard 
              key={lineup.id} 
              lineup={lineup} 
              selected={i === selectedIndex} 
            />
          ))
        )}
      </div>

      {showAdd && <LineupForm onClose={() => {
        setShowAdd(false);
        // Refresh
        fetch('/api/lineups').then(res => res.json()).then(setLineups);
      }} />}
    </main>
  );
}
