# CS2 Nades Useful 🎯

Ein lokales, extrem schnelles Browser-Tool für CS2 Nade-Lineups, optimiert für das **Steam Overlay**.

## Features
- **Keyboard-First:** Blitzschnelle Navigation via Tastatur.
- **Overlay Optimized:** Clean Dark UI, perfekt für kleine Fenster (900x600).
- **Offline-First:** Alles bleibt lokal auf deinem Rechner (SQLite + Lokale Medien).
- **Media Support:** Pro Lineup ein Screenshot (Aiming) und ein Clip (Video).

## Setup & Installation

1. **Repository klonen** oder Dateien in einen Ordner kopieren.
2. **Abhängigkeiten installieren:**
   ```powershell
   npm install
   ```
3. **Datenbank initialisieren:**
   ```powershell
   npx prisma migrate dev --name init
   ```
4. **Tool starten:**
   ```powershell
   npm run dev
   ```
   Öffne danach `http://localhost:3000` in deinem Browser (oder im Steam Overlay).

## Steam Overlay Integration
1. Starte CS2.
2. Öffne das Steam Overlay (`Shift + Tab`).
3. Öffne den Browser im Overlay.
4. Gib `http://localhost:3000` ein.
5. **Pro Tip:** Fixiere das Fenster oder stelle es so ein, dass du es während des Spiels schnell aufrufen kannst.

## Tastenkombinationen (Hotkeys)
- `/` : Fokus auf das Suchfeld
- `↑ / ↓` : Navigieren in der Liste
- `Enter` : Ausgewähltes Lineup öffnen
- `g` oder `Esc` : Zurück zur Liste / Suche
- `p` : Im Detail-View zurück zur Liste

## Troubleshooting (Windows)
- **Pfadrechte:** Das Tool speichert Daten im `./data` Ordner. Stelle sicher, dass der Ordner Schreibrechte hat (nicht in `C:\Program Files` installieren).
- **OneDrive:** Nutze keinen Ordner, der von OneDrive synchronisiert wird, da dies die SQLite-Datenbank blockieren kann.
- **Defender:** Wenn Uploads hängen, schließe den `./data` Ordner vom Echtzeit-Scan des Windows Defenders aus.

## Stack
- Next.js 15 (App Router)
- Tailwind CSS + shadcn/ui
- Prisma + SQLite
- Lucide Icons
