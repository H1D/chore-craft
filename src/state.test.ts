import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  KID_PREFIX,
  LAST_KID_KEY,
  decodeState,
  encodeState,
  listKids,
  loadKidState,
  loadLastKid,
  saveKidState,
  saveLastKid,
  type ChoreState,
} from './state';

class MemoryStorage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  key(i: number): string | null {
    return Array.from(this.store.keys())[i] ?? null;
  }
  getItem(k: string): string | null {
    return this.store.has(k) ? (this.store.get(k) as string) : null;
  }
  setItem(k: string, v: string): void {
    this.store.set(k, String(v));
  }
  removeItem(k: string): void {
    this.store.delete(k);
  }
  clear(): void {
    this.store.clear();
  }
}

const sampleState = (overrides: Partial<ChoreState> = {}): ChoreState => ({
  kid: 'Alex',
  level: 3,
  levelName: 'The Brave',
  classTitle: 'Apprentice Scholar',
  reward: 'Pillow fort',
  lang: 'en',
  theme: 'quest-scroll',
  chores: [
    { name: 'Read 30 min', xp: 20, on: true },
    { name: 'Math practice', xp: 15, on: true },
    { name: 'Clean kitchen', xp: 25, on: false },
  ],
  ...overrides,
});

beforeEach(() => {
  (globalThis as any).localStorage = new MemoryStorage();
});

afterEach(() => {
  delete (globalThis as any).localStorage;
});

describe('codec', () => {
  test('round-trips a fully-populated state', () => {
    const s = sampleState();
    const encoded = encodeState(s);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);
    expect(decodeState(encoded)).toEqual(s);
  });

  test('round-trips unicode kid names and chore text (Russian, Dutch)', () => {
    const s = sampleState({
      kid: 'Василиса',
      levelName: 'Храбрая',
      reward: 'Пицца',
      lang: 'ru',
      chores: [{ name: 'Прочитать 30 минут', xp: 20, on: true }],
    });
    expect(decodeState(encodeState(s))).toEqual(s);

    const dutch = sampleState({ kid: 'Mira', reward: 'Frietjes met mayonaise', lang: 'nl' });
    expect(decodeState(encodeState(dutch))).toEqual(dutch);
  });

  test('uses URL-safe alphabet (no +, /, or =)', () => {
    const encoded = encodeState(sampleState({ reward: '???>>>///+++===' }));
    expect(encoded).not.toMatch(/[+/=]/);
  });

  test('returns null on malformed input instead of throwing', () => {
    expect(decodeState('')).toBeNull();
    expect(decodeState('not-base64-!!!@@@')).toBeNull();
    expect(decodeState('aGVsbG8=')).toBeNull(); // valid base64 but not JSON
    expect(decodeState(encodeState({ chores: [] } as any))).not.toBeNull(); // partial-but-object passes
    // arrays at top-level rejected
    const badShape = btoa('[]').replace(/=+$/, '');
    expect(decodeState(badShape)).toBeNull();
  });
});

describe('kid storage', () => {
  test('save then load round-trips state', () => {
    const s = sampleState();
    saveKidState('Alex', s);
    expect(loadKidState('Alex')).toEqual(s);
  });

  test('loadKidState returns null when absent', () => {
    expect(loadKidState('Nobody')).toBeNull();
  });

  test('save uses the chorecraft:kid:<name> key', () => {
    saveKidState('Mira', sampleState({ kid: 'Mira' }));
    const raw = (globalThis as any).localStorage.getItem(KID_PREFIX + 'Mira');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw).kid).toBe('Mira');
  });

  test('listKids returns sorted names and ignores unrelated keys', () => {
    saveKidState('Charlie', sampleState({ kid: 'Charlie' }));
    saveKidState('Alex', sampleState({ kid: 'Alex' }));
    saveKidState('Mira', sampleState({ kid: 'Mira' }));
    (globalThis as any).localStorage.setItem('unrelated:key', 'noise');
    expect(listKids()).toEqual(['Alex', 'Charlie', 'Mira']);
  });

  test('listKids on empty storage returns []', () => {
    expect(listKids()).toEqual([]);
  });

  test('last-kid pointer load/save uses chorecraft:lastKid', () => {
    expect(loadLastKid()).toBeNull();
    saveLastKid('Alex');
    expect(loadLastKid()).toBe('Alex');
    expect((globalThis as any).localStorage.getItem(LAST_KID_KEY)).toBe('Alex');
  });

  test('blank name is a no-op for save', () => {
    saveKidState('', sampleState());
    saveLastKid('');
    expect(listKids()).toEqual([]);
    expect(loadLastKid()).toBeNull();
  });
});
