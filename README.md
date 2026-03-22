# CS2 Nades Useful 🎯

Ein lokales, extrem schnelles Browser-Tool für CS2 Nade-Lineups, optimiert für das **Steam Overlay**.

## Features
- **Keyboard-First:** Blitzschnelle Navigation via Tastatur.
- **Nade-Filtering:** Schnelles Filtern nach Utility-Typ (Smoke, Flash, etc.) mit Hotkeys.
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
- `1-6` : Utility-Filter (All, Smoke, Flash, Molly, HE, Decoy)
- `↑ / ↓` : Navigieren in der Liste
- `Enter` : Ausgewähltes Lineup öffnen
- `g` oder `Esc` : Zurück zur Liste / Suche
- `p` : Im Detail-View zurück zur Liste

## Troubleshooting (Windows)
- **Pfadrechte:** Das Tool speichert Daten im `./data` Ordner. Stelle sicher, dass der Ordner Schreibrechte hat (nicht in `C:\Program Files` installieren).
- **OneDrive:** Nutze keinen Ordner, der von OneDrive synchronisiert wird, da dies die SQLite-Datenbank blockieren kann.
- **Defender:** Wenn Uploads hängen, schließe den `./data` Ordner vom Echtzeit-Scan des Windows Defenders aus.

## Deployment (Cloudflare Pages + R2)

Dieses Tool kann als rein statische Webseite auf **Cloudflare Pages** gehostet werden. Die Medien (Videos/Bilder) liegen dabei in einem **Cloudflare R2** Bucket.

### Kurzanleitung:
1. **R2 vorbereiten:** Lade den Inhalt von `data/media` in einen R2-Bucket hoch.
2. **Environment Variable:** 
   - **Lokal:** Erstelle eine `.env` Datei mit `NEXT_PUBLIC_MEDIA_BASE_URL=https://deine-r2-url.com`.
   - **Cloudflare:** Füge die Variable `NEXT_PUBLIC_MEDIA_BASE_URL` in den Pages-Settings hinzu.
3. **Build:** Führe `npm run build` aus. Das Tool exportiert alle Daten aus der SQLite-Datenbank automatisch in eine statische JSON-Datei.
4. **Upload:** Lade den `out/` Ordner zu Cloudflare Pages hoch.

Detaillierte Anweisungen findest du in der [DEPLOY.md](./DEPLOY.md).

## Stack
- Next.js 15 (App Router)
- Tailwind CSS + shadcn/ui
- Prisma + SQLite
- Lucide Icons
