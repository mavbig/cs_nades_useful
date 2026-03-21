'use client';
import { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { Lineup, MapCount } from '@/lib/types';
import { LineupCard } from '@/components/lineup-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, Map as MapIcon, Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MAPS } from '@/lib/maps';
import { cn, normalizeMapName } from '@/lib/utils';
import { getMapCounts, getLineupsByMap } from '@/lib/data';
import { getMapImageUrl } from '@/lib/media';
import { LineupForm } from '@/components/lineup-form';

function HomePageInner() {
  const searchParams = useSearchParams();
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [mapCounts, setMapCounts] = useState<MapCount[]>([]);
  const [mapsLoading, setMapsLoading] = useState(true);
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [lineupsLoading, setLineupsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const isDynamic = process.env.NODE_ENV === 'development';

  // Sync selected map with ?map= query parameter
  useEffect(() => {
    const mapParam = searchParams.get('map');
    if (!mapParam) {
      setSelectedMap(null);
      return;
    }
    setSelectedMap(mapParam);
  }, [searchParams]);

  const refreshData = async () => {
    if (isDynamic) {
      setMapsLoading(true);
      const res = await fetch('/api/lineups/maps');
      const data = await res.json();
      setMapCounts(data);
      setMapsLoading(false);
    } else {
      getMapCounts().then((data) => {
        setMapCounts(data);
        setMapsLoading(false);
      });
    }
  };

  useEffect(() => {
    refreshData();
  }, [isDynamic]);

  useEffect(() => {
    if (!selectedMap) {
      setLineups([]);
      return;
    }
    setLineupsLoading(true);
    if (isDynamic) {
      fetch(`/api/lineups?map=${encodeURIComponent(selectedMap)}`)
        .then(res => res.json())
        .then(data => {
          setLineups(data);
          setLineupsLoading(false);
        });
    } else {
      getLineupsByMap(selectedMap).then((data) => {
        setLineups(data);
        setLineupsLoading(false);
      });
    }
  }, [selectedMap, isDynamic]);

  const getCountForMap = (mapName: string): number => {
    const normalized = normalizeMapName(mapName);
    const found = mapCounts.find((m) => normalizeMapName(m.map) === normalized);
    return found?.count ?? 0;
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return lineups;
    const q = search.toLowerCase();
    return lineups.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.tags.toLowerCase().includes(q) ||
        l.startSpot.toLowerCase().includes(q) ||
        l.utility.toLowerCase().includes(q)
    );
  }, [search, lineups]);

  const tLineups = useMemo(() => filtered.filter(l => l.side === 'T' || l.side === 'ANY'), [filtered]);
  const ctLineups = useMemo(() => filtered.filter(l => l.side === 'CT' || l.side === 'ANY'), [filtered]);

  useEffect(() => {
    const handleNext = () => setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    const handlePrev = () => setSelectedIndex((prev) => Math.max(prev - 1, 0));
    const handleSelect = () => {
      if (filtered[selectedIndex]) {
        const currentMap = selectedMap ?? filtered[selectedIndex].map;
        router.push(`/lineups/${filtered[selectedIndex].id}?map=${encodeURIComponent(currentMap)}`);
      }
    };
    const handleGoToMapSelection = () => {
      setSelectedMap(null);
      setSearch('');
      const params = new URLSearchParams(searchParams.toString());
      params.delete('map');
      const qs = params.toString();
      router.push(qs ? `/?${qs}` : '/');
    };

    window.addEventListener('app:next-lineup', handleNext);
    window.addEventListener('app:prev-lineup', handlePrev);
    window.addEventListener('app:select-lineup', handleSelect);
    window.addEventListener('app:goto-map-selection', handleGoToMapSelection);
    return () => {
      window.removeEventListener('app:next-lineup', handleNext);
      window.removeEventListener('app:prev-lineup', handlePrev);
      window.removeEventListener('app:select-lineup', handleSelect);
      window.removeEventListener('app:goto-map-selection', handleGoToMapSelection);
    };
  }, [filtered, selectedIndex, router, searchParams, selectedMap]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <main className="flex flex-col h-screen max-w-[1200px] mx-auto bg-background">
      {selectedMap === null ? (
        <>
          <header className="shrink-0 border-b border-border/80 bg-card/50 backdrop-blur-sm px-4 py-4 max-w-[900px] mx-auto w-full">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">CS2 Nades</h1>
              <div className="flex items-center gap-2">
                {isDynamic && (
                  <Button
                    size="sm"
                    className="h-7 rounded-md px-2 text-xs gap-1"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="w-3 h-3" /> Add Lineup
                  </Button>
                )}
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                  isDynamic ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-muted text-muted-foreground border-border/50"
                )}>
                  {isDynamic ? 'Dynamic Mode' : 'Static Mode'}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Choose a map</p>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar max-w-[900px] mx-auto w-full">
            {mapsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin mb-3" />
                <span className="text-sm">Loading maps...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MAPS.map((m) => {
                  const count = getCountForMap(m.name);
                  return (
                    <button
                      key={m.slug}
                      type="button"
                      onClick={() => {
                        setSelectedMap(m.name);
                        setSearch('');
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('map', m.name);
                        const qs = params.toString();
                        router.push(qs ? `/?${qs}` : '/');
                      }}
                      className={cn(
                        'group relative flex flex-col rounded-xl overflow-hidden border-2 border-border/80',
                        'bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      )}
                    >
                      <div className="aspect-[4/3] relative bg-muted">
                        <img
                          src={getMapImageUrl(m.slug)}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <span className="block text-base font-semibold text-white drop-shadow-md">{m.name}</span>
                          <span className="text-xs text-white/80">
                            {count === 0 ? 'No lineups' : `${count} lineup${count !== 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <header className="shrink-0 border-b border-border/80 bg-card/50 backdrop-blur-sm px-4 py-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedMap(null);
                    setSearch('');
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('map');
                    const qs = params.toString();
                    router.push(qs ? `/?${qs}` : '/');
                  }}
                  className="shrink-0 rounded-lg"
                  aria-label="Back to map selection"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2 min-w-0">
                  <MapIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <h1 className="text-lg font-semibold tracking-tight truncate">{selectedMap}</h1>
                </div>
              </div>
              {isDynamic && (
                <Button
                  size="sm"
                  className="h-8 rounded-md px-3 text-xs gap-1.5"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="w-4 h-4" /> Add Lineup
                </Button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="search-input"
                ref={searchRef}
                placeholder="Search lineups... (/)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background/80 border-border/80 focus-visible:ring-2"
              />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
            {lineupsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin mb-3" />
                <span className="text-sm">Loading lineups...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-muted-foreground text-sm">
                  {search ? 'No lineups match your search.' : `No lineups for ${selectedMap} yet.`}
                </p>
                {isDynamic && (
                  <Button
                    variant="link"
                    className="mt-2 text-primary text-xs"
                    onClick={() => setShowForm(true)}
                  >
                    Add the first lineup
                  </Button>
                )}
                <p className="text-muted-foreground/80 text-xs mt-1">Try another map selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500 mb-3 px-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    T Side
                  </h2>
                  <ul className="space-y-2" role="list">
                    {tLineups.map((lineup) => {
                      const globalIndex = filtered.findIndex(l => l.id === lineup.id);
                      return (
                        <li key={`t-${lineup.id}`}>
                          <LineupCard lineup={lineup} selected={globalIndex === selectedIndex} />
                        </li>
                      );
                    })}
                  </ul>
                </section>
                <section>
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 px-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    CT Side
                  </h2>
                  <ul className="space-y-2" role="list">
                    {ctLineups.map((lineup) => {
                      const globalIndex = filtered.findIndex(l => l.id === lineup.id);
                      return (
                        <li key={`ct-${lineup.id}`}>
                          <LineupCard lineup={lineup} selected={globalIndex === selectedIndex} />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </div>
            )}
          </div>
        </>
      )}
      {showForm && (
        <LineupForm
          initialMap={selectedMap || undefined}
          onClose={(newLineup) => {
            setShowForm(false);
            if (newLineup) refreshData();
          }}
        />
      )}
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageInner />
    </Suspense>
  );
}
