# Nade Type Filtering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a utility type filter (Smoke, Flash, etc.) with a "state-of-the-art" look.

**Architecture:** Add a new filter state to the map view in `app/page.tsx` and update the `filtered` useMemo. Enhance `LineupCard` with icons for each utility type.

**Tech Stack:** Next.js, Tailwind CSS, Lucide React, Prisma/Zod.

---

### Task 1: Update LineupCard with Utility Icons

**Files:**
- Modify: `components/lineup-card.tsx`

- [ ] **Step 1: Add utility icon mapping and update UI**

```tsx
// Inside LineupCard.tsx
import { MapPin, Cloud, Zap, Flame, Bomb, CircleDashed, LayoutGrid } from 'lucide-react';

const UTILITY_ICONS: Record<string, any> = {
  SMOKE: Cloud,
  FLASH: Zap,
  MOLLY: Flame,
  HE: Bomb,
  DECOY: CircleDashed,
};

// ... in the JSX, replace the utility text span with:
const Icon = UTILITY_ICONS[lineup.utility] || CircleDashed;
// ...
<span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
  <Icon className="w-3 h-3" />
  {lineup.utility}
</span>
```

- [ ] **Step 2: Commit**

```bash
git add components/lineup-card.tsx
git commit -m "feat: add utility icons to LineupCard"
```

### Task 2: Add Utility Filter State and UI to HomePage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add selectedUtility state**

```tsx
const [selectedUtility, setSelectedUtility] = useState<string>('ALL');
```

- [ ] **Step 2: Define UTILITIES constant with styles**

```tsx
const UTILITIES = [
  { id: 'ALL', label: 'All', icon: LayoutGrid, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', activeBg: 'bg-blue-500', activeText: 'text-white' },
  { id: 'SMOKE', label: 'Smokes', icon: Cloud, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', activeBg: 'bg-slate-500', activeText: 'text-white' },
  { id: 'FLASH', label: 'Flashes', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', activeBg: 'bg-yellow-500', activeText: 'text-black' },
  { id: 'MOLLY', label: 'Molotovs', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', activeBg: 'bg-orange-500', activeText: 'text-white' },
  { id: 'HE', label: 'HE Grenades', icon: Bomb, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', activeBg: 'bg-red-500', activeText: 'text-white' },
  { id: 'DECOY', label: 'Decoys', icon: CircleDashed, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', activeBg: 'bg-emerald-500', activeText: 'text-white' },
];
```

- [ ] **Step 3: Render UtilityFilter below search bar**

```tsx
<div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
  {UTILITIES.map((u) => {
    const Icon = u.icon;
    const isActive = selectedUtility === u.id;
    return (
      <button
        key={u.id}
        onClick={() => setSelectedUtility(u.id)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
          isActive 
            ? cn(u.activeBg, u.activeText, "border-transparent shadow-sm scale-105") 
            : cn("bg-card/50 text-muted-foreground border-border/50 hover:bg-card hover:border-border")
        )}
      >
        <Icon className={cn("w-3.5 h-3.5", isActive ? "text-current" : u.color)} />
        {u.label}
      </button>
    );
  })}
</div>
```

- [ ] **Step 4: Update filtered useMemo logic**

```tsx
const filtered = useMemo(() => {
  let result = lineups;
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.tags.toLowerCase().includes(q) ||
        l.startSpot.toLowerCase().includes(q) ||
        l.utility.toLowerCase().includes(q)
    );
  }
  if (selectedUtility !== 'ALL') {
    result = result.filter((l) => l.utility === selectedUtility);
  }
  return result;
}, [search, lineups, selectedUtility]);
```

- [ ] **Step 5: Reset utility filter when changing maps**

```tsx
// Inside handleGoToMapSelection and map button click
setSelectedUtility('ALL');
```

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat: implement nade type filter on map view"
```

### Task 3: Final Touches and Verification

- [ ] **Step 1: Test the filter by selecting different nade types**
- [ ] **Step 2: Verify search and utility filter work together**
- [ ] **Step 3: Verify side (T/CT) sections update correctly**
- [ ] **Step 4: Commit any final tweaks**
