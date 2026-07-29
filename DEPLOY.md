# Deployment & Development Guide

Dieses Projekt nutzt einen hybriden Ansatz: **Lokal** wird eine dynamische Datenbank (SQLite + Prisma) verwendet, um Lineups einfach über die UI hinzuzufügen. **Live** auf Cloudflare Pages läuft die Seite als rein statischer Export für maximale Performance.

Die API-Umschaltung (`app/api` ↔ `app/_api`) passiert jetzt automatisch über npm-Skripte.

---

## 🛠️ Lokale Entwicklung & Lineups hinzufügen

```bash
npm run dev
```

Das Skript aktiviert automatisch die API-Routen (`app/_api` → `app/api`) und startet den Dev-Server.

Die Seite zeigt oben rechts **"Dynamic Mode"** (blau) an. Das bedeutet:
- Daten werden direkt aus der SQLite-Datenbank gelesen.
- Der **"Add Lineup"**-Button ist sichtbar.
- Bilder/Videos werden lokal aus `data/media` geladen.

Nutze das Formular in der UI, um neue Lineups inklusive Screenshots und Clips hochzuladen.

---

## 🚀 Deployment (Veröffentlichung)

Wenn du fertig mit dem Hinzufügen bist und die Änderungen live bringen willst:

```bash
npm run publish
```

Dieser eine Befehl macht automatisch:
1. API-Routen deaktivieren (`app/api` → `app/_api`)
2. Daten aus SQLite exportieren (`data/static-lineups.json`, `public/data/lineups.json`)
3. Lokalen Static-Build prüfen (`next build`)
4. Neue/geänderte Medien zu Cloudflare R2 hochladen
5. Exportierte JSON-Dateien committen und pushen (löst Cloudflare Pages Deploy aus)

### Nützliche Flags

| Flag | Wirkung |
| :--- | :--- |
| `--no-git` | Kein Commit/Push |
| `--no-push` | Commit, aber kein Push |
| `--no-sync` | Kein R2-Upload |
| `--no-build` | Kein lokaler Build-Check |
| `--dry-run` | Nur Schritte anzeigen |
| `--message "..."` | Eigene Commit-Message |

Beispiele:

```bash
npm run publish -- --no-push
npm run publish -- --no-git --no-sync
npm run sync-media -- --dry-run
```

---

## 📝 Kurzübersicht der Befehle

| Ziel | Befehl |
| :--- | :--- |
| **Lokal entwickeln** | `npm run dev` |
| **Nur Media zu R2 syncen** | `npm run sync-media` |
| **Export & Build lokal** | `npm run build` |
| **Alles veröffentlichen** | `npm run publish` |
| **Datenbank-Schema ändern** | `npx prisma migrate dev` |

---

## ☁️ Cloudflare Setup

### R2 Media Sync

`npm run sync-media` nutzt Wrangler und lädt nur neue/geänderte Dateien hoch.

Voraussetzungen:
1. Einmalig `npx wrangler login`
2. Optional in `.env`: `R2_BUCKET_NAME=cs-nades-useful`

### Cloudflare Pages Build Command

Auf Cloudflare Pages sollte als Build Command stehen:

```bash
npm run pages:build
```

Nicht `npm run build`, weil auf Cloudflare keine lokale SQLite-Datenbank vorhanden ist.

---

## 💡 Tipps & Fehlerbehebung

- **Bilder laden lokal nicht?** Prüfe, ob in deiner `.env`-Datei `NEXT_PUBLIC_MEDIA_BASE_URL` auskommentiert ist. Lokal sollte sie leer sein, damit `/api/media` verwendet wird.
- **Build schlägt fehl?** Führe `npm run publish -- --no-git --no-sync` aus, um den Build-Teil isoliert zu testen.
- **R2 Upload schlägt fehl?** Prüfe `npx wrangler login` und den Bucket-Namen in `R2_BUCKET_NAME`.
