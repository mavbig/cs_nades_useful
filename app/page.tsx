'use client';
import { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { Lineup, MapCount, SpawnSmokeSet } from '@/lib/types';
import { LineupCard } from '@/components/lineup-card';
import { SpawnSmokeSetCard } from '@/components/spawn-smoke-set-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, Map as MapIcon, Plus, LayoutGrid, Cloud, Zap, Flame, Bomb, CircleDashed } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MAPS } from '@/lib/maps';
import { cn, normalizeMapName } from '@/lib/utils';
import { getMapCounts, getLineupsByMap } from '@/lib/data';
import { getSpawnSmokeSetsByMap } from '@/lib/spawn-smoke-data';
import { getMapImageUrl } from '@/lib/media';
import { LineupForm } from '@/components/lineup-form';
import { SpawnSmokeSetForm } from '@/components/spawn-smoke-set-form';

type ContentView = 'lineups' | 'spawn-smokes';

const UTILITIES = [
  { id: 'ALL', label: 'All', icon: LayoutGrid, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', activeBg: 'bg-blue-500', activeText: 'text-white' },
  { id: 'SMOKE', label: 'Smokes', icon: Cloud, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', activeBg: 'bg-slate-500', activeText: 'text-white' },
  { id: 'FLASH', label: 'Flashes', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', activeBg: 'bg-yellow-500', activeText: 'text-black' },
  { id: 'MOLLY', label: 'Molotovs', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', activeBg: 'bg-orange-500', activeText: 'text-white' },
  { id: 'HE', label: 'HE Grenades', icon: Bomb, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', activeBg: 'bg-red-500', activeText: 'text-white' },
  { id: 'DECOY', label: 'Decoys', icon: CircleDashed, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', activeBg: 'bg-emerald-500', activeText: 'text-white' },
] as const;

function HomePageInner() {
  const searchParams = useSearchParams();
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [selectedUtility, setSelectedUtility] = useState<string>('ALL');
  const [mapCounts, setMapCounts] = useState<MapCount[]>([]);
  const [mapsLoading, setMapsLoading] = useState(true);
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [spawnSmokeSets, setSpawnSmokeSets] = useState<SpawnSmokeSet[]>([]);
  const [lineupsLoading, setLineupsLoading] = useState(false);
  const [spawnSmokesLoading, setSpawnSmokesLoading] = useState(false);
  const [contentView, setContentView] = useState<ContentView>('lineups');
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showLineupForm, setShowLineupForm] = useState(false);
  const [showSpawnForm, setShowSpawnForm] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const isDynamic = process.env.NODE_ENV === 'development';

  // Sync selected map with ?map= query parameter
  useEffect(() => {
    const mapParam = searchParams.get('map');
    if (!mapParam) {
      setSelectedMap(null);
      setSelectedUtility('ALL');
      setContentView('lineups');
      return;
    }
    setSelectedMap(mapParam);
    const viewParam = searchParams.get('view');
    setContentView(viewParam === 'spawn-smokes' ? 'spawn-smokes' : 'lineups');
  }, [searchParams]);

  const refreshMapData = async () => {
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
    refreshMapData();
  }, [isDynamic]);

  useEffect(() => {
    if (!selectedMap) {
      setSpawnSmokeSets([]);
      return;
    }
    setSpawnSmokesLoading(true);
    if (isDynamic) {
      fetch(`/api/spawn-smokes?map=${encodeURIComponent(selectedMap)}`)
        .then((res) => res.json())
        .then((data) => {
          setSpawnSmokeSets(data);
          setSpawnSmokesLoading(false);
        });
    } else {
      getSpawnSmokeSetsByMap(selectedMap).then((data) => {
        setSpawnSmokeSets(data);
        setSpawnSmokesLoading(false);
      });
    }
  }, [selectedMap, isDynamic]);

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
    let result = lineups;

    if (selectedUtility !== 'ALL') {
      result = result.filter(l => l.utility.toUpperCase() === selectedUtility);
    }

    if (!search.trim()) return result;

    const q = search.toLowerCase();
    return result.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.tags.toLowerCase().includes(q) ||
        l.startSpot.toLowerCase().includes(q) ||
        l.utility.toLowerCase().includes(q)
    );
  }, [search, lineups, selectedUtility]);

  const filteredSpawnSmokes = useMemo(() => {
    if (!search.trim()) return spawnSmokeSets;

    const query = search.toLowerCase();
    return spawnSmokeSets.filter(
      (set) =>
        set.title.toLowerCase().includes(query) ||
        set.description?.toLowerCase().includes(query) ||
        set.positions.some((position) => position.label.toLowerCase().includes(query)),
    );
  }, [search, spawnSmokeSets]);

  const tLineups = useMemo(() => filtered.filter(l => l.side === 'T' || l.side === 'ANY'), [filtered]);
  const ctLineups = useMemo(() => filtered.filter(l => l.side === 'CT' || l.side === 'ANY'), [filtered]);
  const tSpawnSmokes = useMemo(() => filteredSpawnSmokes.filter((set) => set.side === 'T'), [filteredSpawnSmokes]);
  const ctSpawnSmokes = useMemo(() => filteredSpawnSmokes.filter((set) => set.side === 'CT'), [filteredSpawnSmokes]);

  const activeItems = contentView === 'lineups' ? filtered : filteredSpawnSmokes;
  const isLoading = contentView === 'lineups' ? lineupsLoading : spawnSmokesLoading;

  const updateMapView = (view: ContentView) => {
    setContentView(view);
    setSelectedIndex(0);
    if (!selectedMap) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('map', selectedMap);
    if (view === 'spawn-smokes') {
      params.set('view', 'spawn-smokes');
    } else {
      params.delete('view');
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  };

  useEffect(() => {
    const handleNext = () => setSelectedIndex((prev) => Math.min(prev + 1, activeItems.length - 1));
    const handlePrev = () => setSelectedIndex((prev) => Math.max(prev - 1, 0));
    const handleSelect = () => {
      if (!activeItems[selectedIndex] || !selectedMap) return;

      if (contentView === 'lineups') {
        const lineup = activeItems[selectedIndex] as Lineup;
        router.push(`/lineups/${lineup.id}?map=${encodeURIComponent(selectedMap)}`);
        return;
      }

      const set = activeItems[selectedIndex] as SpawnSmokeSet;
      router.push(`/spawns/${set.id}?map=${encodeURIComponent(selectedMap)}`);
    };
    const handleGoToMapSelection = () => {
      setSelectedMap(null);
      setSelectedUtility('ALL');
      setContentView('lineups');
      setSearch('');
      const params = new URLSearchParams(searchParams.toString());
      params.delete('map');
      const qs = params.toString();
      router.push(qs ? `/?${qs}` : '/');
    };

    const handleUtilityHotkey = (e: CustomEvent) => {
      if (contentView !== 'lineups') return;
      const { key } = e.detail;
      const index = parseInt(key) - 1;
      if (index >= 0 && index < UTILITIES.length) {
        setSelectedUtility(UTILITIES[index].id);
      }
    };

    window.addEventListener('app:next-lineup', handleNext);
    window.addEventListener('app:prev-lineup', handlePrev);
    window.addEventListener('app:select-lineup', handleSelect);
    window.addEventListener('app:goto-map-selection', handleGoToMapSelection);
    // @ts-ignore
    window.addEventListener('app:utility-hotkey', handleUtilityHotkey);
    return () => {
      window.removeEventListener('app:next-lineup', handleNext);
      window.removeEventListener('app:prev-lineup', handlePrev);
      window.removeEventListener('app:select-lineup', handleSelect);
      window.removeEventListener('app:goto-map-selection', handleGoToMapSelection);
      // @ts-ignore
      window.removeEventListener('app:utility-hotkey', handleUtilityHotkey);
    };
  }, [activeItems, selectedIndex, router, searchParams, selectedMap, contentView]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search, selectedUtility, contentView]);

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
                    onClick={() => setShowLineupForm(true)}
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
                        setSelectedUtility('ALL');
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
                    setSelectedUtility('ALL');
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
                  onClick={() => (contentView === 'lineups' ? setShowLineupForm(true) : setShowSpawnForm(true))}
                >
                  <Plus className="w-4 h-4" />
                  {contentView === 'lineups' ? 'Add Lineup' : 'Add Spawn Smokes'}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateMapView('lineups')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  contentView === 'lineups'
                    ? 'bg-primary text-primary-foreground border-transparent'
                    : 'bg-card text-muted-foreground border-border/60 hover:border-border',
                )}
              >
                Lineups
              </button>
              <button
                type="button"
                onClick={() => updateMapView('spawn-smokes')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  contentView === 'spawn-smokes'
                    ? 'bg-primary text-primary-foreground border-transparent'
                    : 'bg-card text-muted-foreground border-border/60 hover:border-border',
                )}
              >
                Spawn Smokes
              </button>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="search-input"
                  ref={searchRef}
                  placeholder={contentView === 'lineups' ? 'Search lineups... (/)' : 'Search spawn smokes... (/)'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-background/80 border-border/80 focus-visible:ring-2"
                />
              </div>

              {contentView === 'lineups' && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
                {UTILITIES.map((u) => {
                  const Icon = u.icon;
                  const isActive = selectedUtility === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUtility(u.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                        isActive 
                          ? cn(u.activeBg, u.activeText, "border-transparent shadow-sm")
                          : cn(u.bg, "text-muted-foreground border-transparent hover:border-border/50")
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5", isActive ? "text-current" : u.color)} />
                      {u.label}
                    </button>
                  );
                })}
                </div>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin mb-3" />
                <span className="text-sm">
                  {contentView === 'lineups' ? 'Loading lineups...' : 'Loading spawn smokes...'}
                </span>
              </div>
            ) : activeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-muted-foreground text-sm">
                  {search
                    ? `No ${contentView === 'lineups' ? 'lineups' : 'spawn smoke sets'} match your search.`
                    : `No ${contentView === 'lineups' ? 'lineups' : 'spawn smoke sets'} for ${selectedMap} yet.`}
                </p>
                {isDynamic && (
                  <Button
                    variant="link"
                    className="mt-2 text-primary text-xs"
                    onClick={() => (contentView === 'lineups' ? setShowLineupForm(true) : setShowSpawnForm(true))}
                  >
                    {contentView === 'lineups' ? 'Add the first lineup' : 'Add the first spawn smoke set'}
                  </Button>
                )}
                <p className="text-muted-foreground/80 text-xs mt-1">Try another map selection.</p>
              </div>
            ) : contentView === 'lineups' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500 mb-3 px-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    T Side
                  </h2>
                  <ul className="space-y-2" role="list">
                    {tLineups.map((lineup) => {
                      const globalIndex = filtered.findIndex((entry) => entry.id === lineup.id);
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
                      const globalIndex = filtered.findIndex((entry) => entry.id === lineup.id);
                      return (
                        <li key={`ct-${lineup.id}`}>
                          <LineupCard lineup={lineup} selected={globalIndex === selectedIndex} />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500 mb-3 px-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    T Side
                  </h2>
                  <ul className="space-y-2" role="list">
                    {tSpawnSmokes.map((set) => {
                      const globalIndex = filteredSpawnSmokes.findIndex((entry) => entry.id === set.id);
                      return (
                        <li key={`t-spawn-${set.id}`}>
                          <SpawnSmokeSetCard set={set} selected={globalIndex === selectedIndex} />
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
                    {ctSpawnSmokes.map((set) => {
                      const globalIndex = filteredSpawnSmokes.findIndex((entry) => entry.id === set.id);
                      return (
                        <li key={`ct-spawn-${set.id}`}>
                          <SpawnSmokeSetCard set={set} selected={globalIndex === selectedIndex} />
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
      {showLineupForm && (
        <LineupForm
          initialMap={selectedMap || undefined}
          onClose={(newLineup) => {
            setShowLineupForm(false);
            if (newLineup && selectedMap) {
              if (isDynamic) {
                fetch(`/api/lineups?map=${encodeURIComponent(selectedMap)}`)
                  .then((res) => res.json())
                  .then(setLineups)
                  .catch(() => undefined);
              } else {
                getLineupsByMap(selectedMap).then(setLineups);
              }
              refreshMapData();
            }
          }}
        />
      )}
      {showSpawnForm && (
        <SpawnSmokeSetForm
          initialMap={selectedMap || undefined}
          onClose={(updatedSet) => {
            setShowSpawnForm(false);
            if (updatedSet && selectedMap) {
              if (isDynamic) {
                fetch(`/api/spawn-smokes?map=${encodeURIComponent(selectedMap)}`)
                  .then((res) => res.json())
                  .then(setSpawnSmokeSets)
                  .catch(() => undefined);
              } else {
                getSpawnSmokeSetsByMap(selectedMap).then(setSpawnSmokeSets);
              }
            }
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
