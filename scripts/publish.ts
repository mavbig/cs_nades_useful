import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const TRACKED_EXPORT_FILES = [
  'data/static-lineups.json',
  'data/static-spawn-smokes.json',
  'public/data/lineups.json',
  'public/data/spawn-smokes.json',
];

const TSX_CLI = path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
const NEXT_CLI = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');

type PublishOptions = {
  dryRun: boolean;
  skipBuild: boolean;
  skipSync: boolean;
  skipGit: boolean;
  noPush: boolean;
  message?: string;
};

function parseArgs(argv: string[]): PublishOptions {
  const messageFlagIndex = argv.findIndex((arg) => arg === '--message');
  const message =
    messageFlagIndex >= 0 ? argv[messageFlagIndex + 1] : undefined;

  return {
    dryRun: argv.includes('--dry-run'),
    skipBuild: argv.includes('--no-build'),
    skipSync: argv.includes('--no-sync'),
    skipGit: argv.includes('--no-git'),
    noPush: argv.includes('--no-push'),
    message,
  };
}

function formatLabel(command: string, args: string[]): string {
  return `${command} ${args.map((arg) => (/\s/.test(arg) ? `"${arg}"` : arg)).join(' ')}`.trim();
}

function runProcess(
  command: string,
  args: string[],
  dryRun: boolean,
  env?: NodeJS.ProcessEnv,
): Promise<void> {
  const label = formatLabel(command, args);

  if (dryRun) {
    console.log(`[dry-run] ${label}`);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: false,
      env: env ? { ...process.env, ...env } : process.env,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed (${code ?? 'unknown'}): ${label}`));
    });
  });
}

function runTsx(script: string, args: string[] = [], dryRun = false): Promise<void> {
  return runProcess(process.execPath, [TSX_CLI, script, ...args], dryRun);
}

async function ensureExportFilesExist(): Promise<void> {
  for (const relativePath of TRACKED_EXPORT_FILES) {
    const fullPath = path.join(process.cwd(), relativePath);
    await fs.access(fullPath);
  }
}

async function hasExportFileChanges(): Promise<boolean> {
  const status = await new Promise<string>((resolve, reject) => {
    const child = spawn('git', ['status', '--porcelain', '--', ...TRACKED_EXPORT_FILES], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'inherit'],
      shell: false,
    });

    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(output);
        return;
      }
      reject(new Error(`git status failed with code ${code ?? 'unknown'}`));
    });
  });

  return status.trim().length > 0;
}

async function publishGit(options: PublishOptions): Promise<void> {
  const commitMessage =
    options.message ||
    `feat: publish lineups and static data (${new Date().toISOString().slice(0, 10)})`;

  const changes = await hasExportFileChanges();
  if (!changes) {
    console.log('No exported lineup changes detected. Skipping commit and push.');
    return;
  }

  await runProcess('git', ['add', '-f', ...TRACKED_EXPORT_FILES], options.dryRun);
  await runProcess('git', ['commit', '-m', commitMessage], options.dryRun);

  if (!options.noPush) {
    await runProcess('git', ['push'], options.dryRun);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  console.log('Starting publish workflow...');

  await runTsx('scripts/toggle-api.ts', ['disable'], options.dryRun);
  await runTsx('scripts/export-lineups.ts', [], options.dryRun);

  if (!options.skipBuild) {
    await runProcess(process.execPath, [NEXT_CLI, 'build'], options.dryRun, {
      NODE_ENV: 'production',
    });
  }

  if (!options.skipSync) {
    const syncArgs = ['scripts/sync-media.ts'];
    if (options.dryRun) {
      syncArgs.push('--dry-run');
    }
    await runTsx(syncArgs[0], syncArgs.slice(1), false);
  }

  if (!options.skipGit) {
    if (!options.dryRun) {
      await ensureExportFilesExist();
    }
    await publishGit(options);
  }

  console.log('Publish workflow complete.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
