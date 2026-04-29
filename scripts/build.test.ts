import { describe, expect, test } from 'bun:test';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');

describe('build output shape', () => {
  test('dist contains only index.html and main.js', async () => {
    const proc = Bun.spawn({
      cmd: ['bun', 'scripts/build.ts'],
      cwd: root,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const exit = await proc.exited;
    expect(exit).toBe(0);

    const entries = (await readdir(join(root, 'dist'))).sort();
    expect(entries).toEqual(['index.html', 'main.js']);
  }, 30_000);
});
