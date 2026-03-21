# Deployment & Development Guide

Dieses Projekt nutzt einen hybriden Ansatz: **Lokal** wird eine dynamische Datenbank (SQLite + Prisma) verwendet, um Lineups einfach über die UI hinzuzufügen. **Live** auf Cloudflare Pages läuft die Seite als rein statischer Export für maximale Performance.

---

## 🛠️ Lokale Entwicklung & Lineups hinzufügen

Wenn du neue Lineups hinzufügen oder bestehende bearbeiten möchtest:

### 1. Vorbereitung (Ordner umbenennen)
Benenne den Ordner `app/_api` wieder in `app/api` um.  
*Warum? Next.js ignoriert Ordner mit Unterstrich (`_`) beim Build. Zum Entwickeln brauchen wir aber die API-Routen.*

### 2. Dev-Server starten
```bash
npm run dev
```
Die Seite zeigt oben rechts jetzt **"Dynamic Mode"** (blau) an. Das bedeutet:
- Daten werden direkt aus der SQLite-Datenbank gelesen.
- Der **"Add Lineup"**-Button ist sichtbar.
- Bilder/Videos werden lokal aus `data/media` geladen.

### 3. Lineups hinzufügen
Nutze das Formular in der UI, um neue Lineups inklusive Screenshots und Clips hochzuladen. Diese werden automatisch in `prisma/data/db.sqlite` und `data/media/` gespeichert.

---

## 🚀 Deployment (Veröffentlichung)

Wenn du fertig mit dem Hinzufügen bist und die Änderungen live bringen willst:

### 1. API deaktivieren (Wichtig!)
Benenne den Ordner `app/api` wieder zurück in **`app/_api`**.
*Hinweis: Wenn du das vergisst, wird `npm run build` fehlschlagen, da dynamische API-Routen nicht statisch exportiert werden können.*

### 2. Media zu Cloudflare R2 hochladen
Lade die neuen Ordner aus deinem lokalen Verzeichnis `data/media/` in deinen Cloudflare R2 Bucket (`cs-nades-useful`) hoch.
- **Einfachste Methode:** Per Drag & Drop im Cloudflare Dashboard.
- **Wichtig:** Behalte die Struktur `media/[UUID]/...` bei.

### 3. Build & Export ausführen
```bash
npm run build
```
Dieser Befehl macht zwei Dinge:
1. Er führt `npm run export-data` aus: Die Daten aus deiner SQLite-DB werden in die statischen Dateien `public/data/lineups.json` und `data/static-lineups.json` geschrieben.
2. Er generiert die statische Seite im Ordner `out/`.

### 4. Committen & Pushen
Übertrage die Änderungen an Git, damit Cloudflare Pages den automatischen Deploy startet:
```bash
git add .
git commit -m "feat: add new lineups and update static data"
git push
```

---

## 📝 Kurzübersicht der Befehle

| Ziel | Befehl |
| :--- | :--- |
| **Lokal entwickeln** | `app/api` (ohne `_`) + `npm run dev` |
| **Media Sync** | Manuell zu R2 Dashboard hochladen |
| **Export & Build** | `app/_api` (mit `_`) + `npm run build` |
| **Datenbank-Schema ändern** | `npx prisma migrate dev` |

---

## 💡 Tipps & Fehlerbehebung

- **Bilder laden lokal nicht?** Prüfe, ob in deiner `.env`-Datei `NEXT_PUBLIC_MEDIA_BASE_URL` auskommentiert ist. Lokal sollte sie leer sein, damit `/api/media` verwendet wird.
- **Build schlägt fehl?** Prüfe, ob der Ordner wirklich `_api` heißt. Next.js darf im Export-Modus keine aktiven API-Routen im `app`-Verzeichnis finden.
