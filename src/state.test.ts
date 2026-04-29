import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  KID_PREFIX,
  LAST_KID_KEY,
  applyKidSwitch,
  decodeState,
  defaultStateForLang,
  encodeState,
  getStarterChores,
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

describe('defaultStateForLang', () => {
  test('returns starter chores for the requested language with on=true', () => {
    const s = defaultStateForLang('en', 'Alex');
    expect(s.kid).toBe('Alex');
    expect(s.lang).toBe('en');
    expect(s.theme).toBe('quest-scroll');
    expect(s.level).toBe(1);
    expect(s.chores.length).toBeGreaterThan(0);
    for (const c of s.chores) {
      expect(c.on).toBe(true);
      expect(typeof c.name).toBe('string');
      expect(typeof c.xp).toBe('number');
    }
  });

  test('blank kid is allowed (used for very first mount)', () => {
    expect(defaultStateForLang('ru').kid).toBe('');
  });

  test('getStarterChores prefers window.DEFAULT_CHORES when present', () => {
    (globalThis as any).window = globalThis;
    (globalThis as any).DEFAULT_CHORES = {
      en: [{ name: 'Custom chore', xp: 42 }],
    };
    try {
      expect(getStarterChores('en')).toEqual([{ name: 'Custom chore', xp: 42 }]);
    } finally {
      delete (globalThis as any).DEFAULT_CHORES;
      delete (globalThis as any).window;
    }
  });
});

describe('applyKidSwitch', () => {
  test('returns prev unchanged when name is blank or equal', () => {
    const prev = sampleState({ kid: 'Alex' });
    expect(applyKidSwitch(prev, '   ')).toBe(prev);
    expect(applyKidSwitch(prev, 'Alex')).toBe(prev);
  });

  test('persists previous state under previous kid name before switching', () => {
    const prev = sampleState({ kid: 'Alex', reward: 'Pillow fort' });
    applyKidSwitch(prev, 'Mira');
    const reloaded = loadKidState('Alex');
    expect(reloaded).not.toBeNull();
    expect(reloaded!.reward).toBe('Pillow fort');
  });

  test('loads saved state for the new kid when one exists', () => {
    saveKidState('Mira', sampleState({ kid: 'Mira', reward: 'Frietjes' }));
    const next = applyKidSwitch(sampleState({ kid: 'Alex' }), 'Mira');
    expect(next.kid).toBe('Mira');
    expect(next.reward).toBe('Frietjes');
  });

  test('seeds defaults for an unknown new kid, keeping the parent-chosen theme', () => {
    const prev = sampleState({ kid: 'Alex', theme: 'minecraft', lang: 'ru' });
    const next = applyKidSwitch(prev, 'Newcomer');
    expect(next.kid).toBe('Newcomer');
    expect(next.theme).toBe('minecraft');
    expect(next.lang).toBe('ru');
    expect(next.reward).toBe('');
    expect(next.chores.length).toBeGreaterThan(0);
  });

  test('trims surrounding whitespace before comparing or switching', () => {
    const prev = sampleState({ kid: 'Alex' });
    const next = applyKidSwitch(prev, '  Mira  ');
    expect(next.kid).toBe('Mira');
  });
});
