import { spawn } from 'child_process';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const WRANGLER_CLI = path.join(process.cwd(), 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const MEDIA_DIR = path.join(process.cwd(), 'data', 'media');
const MANIFEST_PATH = path.join(process.cwd(), 'data', '.r2-sync-manifest.json');

type ManifestEntry = {
  size: number;
  mtimeMs: number;
  hash: string;
};

type Manifest = Record<string, ManifestEntry>;

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
};

function parseArgs(argv: string[]) {
  return {
    dryRun: argv.includes('--dry-run'),
    force: argv.includes('--force'),
  };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadManifest(): Promise<Manifest> {
  if (!(await fileExists(MANIFEST_PATH))) {
    return {};
  }

  const raw = await fs.readFile(MANIFEST_PATH, 'utf-8');
  return JSON.parse(raw) as Manifest;
}

async function saveManifest(manifest: Manifest): Promise<void> {
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function hashFile(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function toObjectKey(filePath: string): string {
  const relativePath = path.relative(path.join(process.cwd(), 'data'), filePath);
  return relativePath.split(path.sep).join('/');
}

function getContentType(filePath: string): string | undefined {
  return MIME_TYPES[path.extname(filePath).toLowerCase()];
}

function runWrangler(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [WRANGLER_CLI, ...args], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`wrangler exited with code ${code ?? 'unknown'}`));
    });
  });
}

async function main() {
  const { dryRun, force } = parseArgs(process.argv.slice(2));
  const bucket = process.env.R2_BUCKET_NAME || 'cs-nades-useful';

  if (!(await fileExists(MEDIA_DIR))) {
    console.log('No local media directory found at data/media. Nothing to sync.');
    return;
  }

  const files = await walkFiles(MEDIA_DIR);
  if (files.length === 0) {
    console.log('No media files found in data/media. Nothing to sync.');
    return;
  }

  const manifest = await loadManifest();
  const nextManifest: Manifest = { ...manifest };
  let uploaded = 0;
  let skipped = 0;

  console.log(`Syncing media to R2 bucket "${bucket}"${dryRun ? ' (dry run)' : ''}...`);

  for (const filePath of files) {
    const objectKey = toObjectKey(filePath);
    const stats = await fs.stat(filePath);
    const hash = await hashFile(filePath);
    const previous = manifest[objectKey];

    const unchanged =
      !force &&
      previous &&
      previous.size === stats.size &&
      previous.mtimeMs === stats.mtimeMs &&
      previous.hash === hash;

    if (unchanged) {
      skipped += 1;
      continue;
    }

    const remotePath = `${bucket}/${objectKey}`;
    const contentType = getContentType(filePath);
    const args = ['r2', 'object', 'put', remotePath, '--file', filePath, '--remote'];

    if (contentType) {
      args.push('--content-type', contentType);
    }

    if (dryRun) {
      console.log(`[dry-run] upload ${objectKey}`);
      uploaded += 1;
      nextManifest[objectKey] = {
        size: stats.size,
        mtimeMs: stats.mtimeMs,
        hash,
      };
      continue;
    }

    console.log(`Uploading ${objectKey}...`);
    await runWrangler(args);

    nextManifest[objectKey] = {
      size: stats.size,
      mtimeMs: stats.mtimeMs,
      hash,
    };
    uploaded += 1;
  }

  if (!dryRun) {
    await saveManifest(nextManifest);
  }

  console.log(`Media sync complete. Uploaded: ${uploaded}, skipped: ${skipped}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
