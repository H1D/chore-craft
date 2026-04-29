import { cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const src = join(root, 'src');
const dist = join(root, 'dist');

async function buildEntrypoints() {
  const result = await Bun.build({
    entrypoints: [join(src, 'main.tsx')],
    outdir: dist,
    target: 'browser',
    format: 'iife',
    minify: true,
    sourcemap: 'none',
    write: true,
  });

  if (!result.success) {
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await cp(join(src, 'index.html'), join(dist, 'index.html'));

await buildEntrypoints();
