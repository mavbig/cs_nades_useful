# Design Doc: Nade Type Filtering

- **Date:** 2026-03-22
- **Topic:** Utility Filtering for CS2 Lineups
- **Status:** Approved

## Goal
Implement a visually appealing, "state-of-the-art" filter for nade types (Smoke, Flash, Molly, HE, Decoy) on the map-specific lineup list page.

## Requirements
- Quick filtering by nade type.
- Visually distinct icons and colors for each utility.
- Integrated into the existing search and side (T/CT) filtering logic.
- Responsive design (horizontal scroll on mobile).

## Components

### UtilityFilter Component
A new component (or integrated into `app/page.tsx`) that displays a row of pill buttons:
- **All**: `layout-grid` icon, Blue theme.
- **Smoke**: `cloud` icon, Slate theme.
- **Flash**: `zap` icon, Yellow theme.
- **Molly**: `flame` icon, Orange theme.
- **HE**: `bomb` icon, Red theme.
- **Decoy**: `circle-dashed` icon, Green/Cyan theme.

### LineupCard Enhancement
Update `LineupCard` to show the utility icon next to the utility type label for better visual recognition.

## Data Flow
- A new state `selectedUtility` in `HomePageInner`.
- The `filtered` useMemo will depend on `selectedUtility`.
- Clicking a utility button updates `selectedUtility`.

## Implementation Details
- Use `lucide-react` for icons.
- Use `tailwind` for styling (e.g., `bg-slate-500/20 text-slate-400 border-slate-500/30` for smoke).
- Ensure the filter is only visible when a map is selected.
