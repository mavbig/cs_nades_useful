import fs from 'fs/promises';
import path from 'path';

const APP_DIR = path.join(process.cwd(), 'app');
const API_DIR = path.join(APP_DIR, 'api');
const DISABLED_API_DIR = path.join(APP_DIR, '_api');

type Mode = 'enable' | 'disable';

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function removeDir(dirPath: string): Promise<void> {
  await fs.rm(dirPath, { recursive: true, force: true });
}

async function toggle(mode: Mode): Promise<void> {
  const apiExists = await exists(API_DIR);
  const disabledExists = await exists(DISABLED_API_DIR);

  if (mode === 'enable') {
    if (apiExists && !disabledExists) {
      console.log('API routes already enabled (app/api exists).');
      return;
    }

    if (apiExists && disabledExists) {
      // Prefer the active api folder; drop the stale disabled copy.
      await removeDir(DISABLED_API_DIR);
      console.log('API routes already enabled; removed leftover app/_api.');
      return;
    }

    if (!disabledExists) {
      throw new Error('Cannot enable API routes: app/_api was not found.');
    }

    await fs.rename(DISABLED_API_DIR, API_DIR);
    console.log('Enabled API routes: app/_api -> app/api');
    return;
  }

  // disable
  if (!apiExists && disabledExists) {
    console.log('API routes already disabled (app/_api exists).');
    return;
  }

  if (apiExists && disabledExists) {
    // Keep the active api contents as the disabled source of truth.
    await removeDir(DISABLED_API_DIR);
    await fs.rename(API_DIR, DISABLED_API_DIR);
    console.log('Disabled API routes: replaced app/_api with app/api (both existed).');
    return;
  }

  if (!apiExists) {
    throw new Error('Cannot disable API routes: app/api was not found.');
  }

  await fs.rename(API_DIR, DISABLED_API_DIR);
  console.log('Disabled API routes: app/api -> app/_api');
}

const mode = process.argv[2];

if (mode !== 'enable' && mode !== 'disable') {
  console.error('Usage: tsx scripts/toggle-api.ts <enable|disable>');
  process.exit(1);
}

toggle(mode).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
