# Deployment Guide: Cloudflare Pages + R2

This project is configured for **Static Export**. All data is bundled into the `out/` directory during the build process.

## Prerequisites
1.  **Cloudflare Account** with Pages and R2 enabled.
2.  **R2 Bucket** for hosting media (screenshots and videos).
3.  **Public URL** for your R2 bucket (either a custom domain or a `r2.dev` subdomain).

## 1. Prepare Media (Cloudflare R2)
Upload your `data/media` folder to your R2 bucket.
The structure should look like this in R2:
```
media/
  ├── [uuid]/
  │   ├── screenshot.jpg
  │   └── clip.mp4
  └── ...
```

## 2. Environment Variables
In Cloudflare Pages, set the following environment variable:
- `NEXT_PUBLIC_MEDIA_BASE_URL`: The base URL of your R2 bucket (e.g., `https://media.example.com`). **Do not include a trailing slash.**

## 3. Cloudflare Pages Settings
- **Framework preset:** `Next.js` (or `None`)
- **Build command:** `npm run build`
- **Output directory:** `out`
- **Node.js version:** `20` or higher

## 4. Local Development vs. Production
- **Local Mode:** You can still run `npm run dev` to use the local SQLite database and API routes (if you rename `app/_api` back to `app/api`).
- **Static Export:** The build process runs `npm run export-data` which reads from SQLite and generates `public/data/lineups.json`. This JSON is then used to generate the static site.

## 5. Adding New Lineups
1.  Rename `app/_api` to `app/api`.
2.  Run `npm run dev`.
3.  Add lineups via the UI.
4.  Rename `app/api` back to `app/_api` (to avoid build errors).
5.  Run `npm run build` to generate the new static site.
6.  Upload new media files from `data/media` to your R2 bucket.
7.  Deploy to Cloudflare Pages.
