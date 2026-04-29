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
  renameKid,
  saveKidState,
  saveLastKid,
  toggleChoreDayMask,
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
  weekStart: 0,
  weekCount: 1,
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
    // arrays at top-level rejected
    const badShape = btoa('[]').replace(/=+$/, '');
    expect(decodeState(badShape)).toBeNull();
  });

  test('rejects partial / wrong-shape objects (no fields, missing fields, bad types)', () => {
    expect(decodeState(encodeState({} as any))).toBeNull();
    expect(decodeState(encodeState({ chores: [] } as any))).toBeNull();
    // wrong types on each required field
    expect(decodeState(encodeState({ ...sampleState(), kid: 123 } as any))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), level: '3' } as any))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), lang: 'fr' } as any))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), theme: 'unknown' } as any))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), chores: 'nope' } as any))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), chores: [{ name: 'x' }] } as any))).toBeNull();
  });

  test('coerces disabled legacy themes to quest-scroll when loading saved data', () => {
    const decoded = decodeState(encodeState({ ...sampleState(), theme: 'minecraft' } as any));
    expect(decoded).not.toBeNull();
    expect(decoded!.theme).toBe('quest-scroll');
    expect(decoded!.kid).toBe('Alex');
  });

  test('round-trips nullable chore XP', () => {
    const s = sampleState({
      chores: [{ name: 'Blank XP chore', xp: null, on: true }],
    });
    expect(decodeState(encodeState(s))).toEqual(s);
  });

  test('round-trips custom chore day masks and expands 7-day masks to two weeks', () => {
    const days = Array.from({ length: 14 }, (_, i) => i % 2 === 0);
    const s = sampleState({
      chores: [{ name: 'Custom schedule', xp: 10, on: true, days }],
    });
    expect(decodeState(encodeState(s))).toEqual(s);

    const seven = decodeState(
      encodeState({
        ...sampleState(),
        chores: [{ name: 'Legacy custom schedule', xp: 10, on: true, days: [true, false, true, false, true, false, true] }],
      }),
    );
    expect(seven!.chores[0].days).toEqual([true, false, true, false, true, false, true, true, false, true, false, true, false, true]);
  });

  test('rejects invalid chore day masks', () => {
    expect(
      decodeState(
        encodeState({ ...sampleState(), chores: [{ name: 'x', xp: 5, on: true, days: [true, false] }] } as any),
      ),
    ).toBeNull();
    expect(
      decodeState(
        encodeState({ ...sampleState(), chores: [{ name: 'x', xp: 5, on: true, days: [true, 'nope'] }] } as any),
      ),
    ).toBeNull();
  });

  test('defaults missing legacy week settings on load', () => {
    const legacy = { ...sampleState() } as any;
    delete legacy.weekStart;
    delete legacy.weekCount;
    const decoded = decodeState(encodeState(legacy));
    expect(decoded).not.toBeNull();
    expect(decoded!.weekStart).toBe(0);
    expect(decoded!.weekCount).toBe(1);
  });

  test('rejects invalid week settings', () => {
    expect(decodeState(encodeState({ ...sampleState(), weekStart: -1 } as any))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), weekStart: 7 } as any))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), weekStart: 1.5 } as any))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), weekCount: 0 } as any))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), weekCount: 3 } as any))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), weekCount: '2' } as any))).toBeNull();
  });

  test('rejects numeric fields outside the UI clamp range (level/xp must be int 1..99)', () => {
    // Without this, a crafted URL hash or corrupted localStorage entry could
    // inject impossible values and have them re-persisted until the user
    // happens to edit that specific field. Match the EditableNumber clamps.
    expect(decodeState(encodeState({ ...sampleState(), level: 0 }))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), level: 100 }))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), level: -3 }))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), level: 0.5 }))).toBeNull();
    expect(decodeState(encodeState({ ...sampleState(), level: NaN } as any))).toBeNull();
    expect(
      decodeState(
        encodeState({ ...sampleState(), chores: [{ name: 'x', xp: 0, on: true }] }),
      ),
    ).toBeNull();
    expect(
      decodeState(
        encodeState({ ...sampleState(), chores: [{ name: 'x', xp: 100, on: true }] }),
      ),
    ).toBeNull();
    expect(
      decodeState(
        encodeState({ ...sampleState(), chores: [{ name: 'x', xp: -3, on: true }] }),
      ),
    ).toBeNull();
    expect(
      decodeState(
        encodeState({ ...sampleState(), chores: [{ name: 'x', xp: 1.5, on: true }] }),
      ),
    ).toBeNull();
    expect(
      decodeState(
        encodeState({ ...sampleState(), chores: [{ name: 'x', xp: '5', on: true }] } as any),
      ),
    ).toBeNull();
  });

  test('rejects chores arrays exceeding the UI cap (CHORE_CAP)', () => {
    // Without this, a crafted hash could persist hundreds of chores: main.tsx
    // slices to CHORE_CAP for display so the user never sees the tail, but the
    // storage effect re-saves the full array on every state change.
    const tooMany = Array.from({ length: 50 }, (_, i) => ({
      name: `c${i}`,
      xp: 5,
      on: true,
    }));
    expect(decodeState(encodeState({ ...sampleState(), chores: tooMany }))).toBeNull();
  });
});

describe('chore day masks', () => {
  test('toggleChoreDayMask defaults missing masks to daily and mirrors week two in one-week mode', () => {
    const days = toggleChoreDayMask(undefined, 2, true);
    expect(days[2]).toBe(false);
    expect(days[9]).toBe(false);
    expect(days.filter(Boolean)).toHaveLength(12);
  });

  test('toggleChoreDayMask toggles a single cell in two-week mode', () => {
    const days = toggleChoreDayMask(undefined, 2, false);
    expect(days[2]).toBe(false);
    expect(days[9]).toBe(true);
  });

  test('toggleChoreDayMask ignores out-of-range indexes', () => {
    expect(toggleChoreDayMask(undefined, -1, true)).toEqual(Array.from({ length: 14 }, () => true));
    expect(toggleChoreDayMask(undefined, 14, true)).toEqual(Array.from({ length: 14 }, () => true));
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

  test('loadKidState rejects malformed / partial stored entries', () => {
    const ls = (globalThis as any).localStorage as Storage;
    // legacy/partial entry missing required fields → must NOT be cast to ChoreState
    ls.setItem(KID_PREFIX + 'Legacy', JSON.stringify({ kid: 'Legacy' }));
    expect(loadKidState('Legacy')).toBeNull();
    // wrong-shape chores would crash variants on render → must be rejected
    ls.setItem(
      KID_PREFIX + 'Bad',
      JSON.stringify({ ...sampleState({ kid: 'Bad' }), chores: 'oops' }),
    );
    expect(loadKidState('Bad')).toBeNull();
    // not-an-object payloads (numbers, arrays, null) get dropped
    ls.setItem(KID_PREFIX + 'Num', '42');
    expect(loadKidState('Num')).toBeNull();
    ls.setItem(KID_PREFIX + 'Arr', '[]');
    expect(loadKidState('Arr')).toBeNull();
    // unparseable JSON also returns null (caught try/catch)
    ls.setItem(KID_PREFIX + 'Junk', '{not-json');
    expect(loadKidState('Junk')).toBeNull();
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
    expect(s.weekStart).toBe(0);
    expect(s.weekCount).toBe(1);
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

  test('getStarterChores clamps xp into the validator range and caps length', () => {
    // A host-injected DEFAULT_CHORES with out-of-range xp would otherwise seed
    // a default state that fails isValidChoreState on the very next reload.
    (globalThis as any).window = globalThis;
    (globalThis as any).DEFAULT_CHORES = {
      en: [
        { name: 'Zero xp', xp: 0 },
        { name: 'Negative xp', xp: -5 },
        { name: 'Huge xp', xp: 9999 },
        { name: 'Fractional xp', xp: 1.7 },
        { name: 'NaN xp', xp: NaN },
        { name: 'String xp', xp: 'oops' as any },
        ...Array.from({ length: 20 }, (_, i) => ({ name: `extra${i}`, xp: 5 })),
      ],
    };
    try {
      const out = getStarterChores('en');
      // length capped at CHORE_CAP (7)
      expect(out.length).toBeLessThanOrEqual(7);
      // every xp is an integer in [1, 99]
      for (const c of out) {
        expect(Number.isInteger(c.xp)).toBe(true);
        expect(c.xp).toBeGreaterThanOrEqual(1);
        expect(c.xp).toBeLessThanOrEqual(99);
      }
      // resulting default state passes the same validator the codec uses
      const seeded = defaultStateForLang('en', 'Alex');
      expect(decodeState(encodeState(seeded))).toEqual(seeded);
    } finally {
      delete (globalThis as any).DEFAULT_CHORES;
      delete (globalThis as any).window;
    }
  });
});

describe('renameKid', () => {
  test('returns prev unchanged when name is blank or equal', () => {
    const prev = sampleState({ kid: 'Alex' });
    expect(renameKid(prev, '   ')).toBe(prev);
    expect(renameKid(prev, 'Alex')).toBe(prev);
  });

  test('updates only the kid field, preserving chores and other state', () => {
    const prev = sampleState({ kid: 'Alex', reward: 'Pillow fort' });
    const next = renameKid(prev, 'Alec');
    expect(next.kid).toBe('Alec');
    expect(next.reward).toBe('Pillow fort');
    expect(next.chores).toEqual(prev.chores);
    expect(next.theme).toBe(prev.theme);
    expect(next.level).toBe(prev.level);
  });

  test('refuses rename when target name already has saved state (no clobber)', () => {
    // Mira's saved state must not be overwritten by an inline rename of Alex.
    saveKidState('Mira', sampleState({ kid: 'Mira', reward: 'Frietjes' }));
    const prev = sampleState({ kid: 'Alex', reward: 'Pillow fort' });
    const next = renameKid(prev, 'Mira');
    // Refused: returns prev unchanged so the storage effect keeps writing
    // under 'Alex', preserving both kids' data.
    expect(next).toBe(prev);
    expect(loadKidState('Mira')!.reward).toBe('Frietjes');
  });

  test('atomically writes the new key before removing the old one', () => {
    // The storage swap happens here (not in a post-render effect) so an
    // unload/crash between the state change and the next React commit
    // can't lose the kid's data.
    saveKidState('Alex', sampleState({ kid: 'Alex', reward: 'Pillow fort' }));
    const prev = sampleState({ kid: 'Alex', reward: 'Pillow fort' });
    const next = renameKid(prev, 'Bob');
    expect(next.kid).toBe('Bob');
    expect(loadKidState('Alex')).toBeNull();
    const moved = loadKidState('Bob');
    expect(moved).not.toBeNull();
    expect(moved!.kid).toBe('Bob');
    expect(moved!.reward).toBe('Pillow fort');
  });

  test('updates lastKid pointer when migrating storage', () => {
    // Without this, an unload/crash after the key move but before the
    // useChoreState effect runs would leave readInitial() pointing at the
    // now-deleted old name, falling through to defaults.
    saveKidState('Alex', sampleState({ kid: 'Alex', reward: 'Pillow fort' }));
    saveLastKid('Alex');
    const prev = sampleState({ kid: 'Alex', reward: 'Pillow fort' });
    renameKid(prev, 'Bob');
    expect(loadLastKid()).toBe('Bob');
  });

  test('does not touch lastKid when migration bails on quota error', () => {
    // Quota failure leaves the old key intact, so the lastKid pointer must
    // also stay on the old name — flipping it to the new name would point
    // at a missing entry on next reload.
    saveKidState('Alex', sampleState({ kid: 'Alex' }));
    saveLastKid('Alex');
    const inner = (globalThis as any).localStorage as MemoryStorage;
    const trapped: Storage = {
      get length() {
        return inner.length;
      },
      key: (i: number) => inner.key(i),
      getItem: (k: string) => inner.getItem(k),
      setItem: (k: string, v: string) => {
        if (k === KID_PREFIX + 'Bob') throw new Error('QuotaExceeded');
        inner.setItem(k, v);
      },
      removeItem: (k: string) => inner.removeItem(k),
      clear: () => inner.clear(),
    };
    (globalThis as any).localStorage = trapped;
    try {
      renameKid(sampleState({ kid: 'Alex' }), 'Bob');
    } finally {
      (globalThis as any).localStorage = inner;
    }
    expect(loadLastKid()).toBe('Alex');
  });

  test('rolls back when the lastKid pointer write fails after the new key was saved', () => {
    // Storage accepts the new kid key but rejects the lastKid pointer update
    // (quota race / transient failure between the two setItem calls). Without
    // a rollback, removeKidState would still delete the old key while lastKid
    // points at the now-missing old name, and reload falls through to defaults.
    saveKidState('Alex', sampleState({ kid: 'Alex', reward: 'Pillow fort' }));
    saveLastKid('Alex');
    const inner = (globalThis as any).localStorage as MemoryStorage;
    const trapped: Storage = {
      get length() {
        return inner.length;
      },
      key: (i: number) => inner.key(i),
      getItem: (k: string) => inner.getItem(k),
      setItem: (k: string, v: string) => {
        if (k === LAST_KID_KEY && v === 'Bob') throw new Error('QuotaExceeded');
        inner.setItem(k, v);
      },
      removeItem: (k: string) => inner.removeItem(k),
      clear: () => inner.clear(),
    };
    (globalThis as any).localStorage = trapped;
    try {
      const prev = sampleState({ kid: 'Alex', reward: 'Pillow fort' });
      const next = renameKid(prev, 'Bob');
      expect(next).toBe(prev);
    } finally {
      (globalThis as any).localStorage = inner;
    }
    // Old key + lastKid intact; orphan new key cleaned up so a retry isn't
    // blocked by the "target already has saved state" guard.
    expect(loadKidState('Alex')).not.toBeNull();
    expect(loadKidState('Alex')!.reward).toBe('Pillow fort');
    expect(loadKidState('Bob')).toBeNull();
    expect(loadLastKid()).toBe('Alex');
  });

  test('refuses rename and preserves data when storing the new key fails', () => {
    // Quota exceeded / private-mode storage / serialization failure must NOT
    // trigger removeKidState on the old key — that would silently destroy the
    // kid's data while the rename is also rejected at the React level.
    saveKidState('Alex', sampleState({ kid: 'Alex', reward: 'Pillow fort' }));
    const inner = (globalThis as any).localStorage as MemoryStorage;
    const trapped: Storage = {
      get length() {
        return inner.length;
      },
      key: (i: number) => inner.key(i),
      getItem: (k: string) => inner.getItem(k),
      setItem: (k: string, v: string) => {
        if (k === KID_PREFIX + 'Bob') throw new Error('QuotaExceeded');
        inner.setItem(k, v);
      },
      removeItem: (k: string) => inner.removeItem(k),
      clear: () => inner.clear(),
    };
    (globalThis as any).localStorage = trapped;
    try {
      const prev = sampleState({ kid: 'Alex', reward: 'Pillow fort' });
      const next = renameKid(prev, 'Bob');
      expect(next).toBe(prev);
    } finally {
      (globalThis as any).localStorage = inner;
    }
    // Old key intact, new key never written → no data lost.
    expect(loadKidState('Alex')).not.toBeNull();
    expect(loadKidState('Alex')!.reward).toBe('Pillow fort');
    expect(loadKidState('Bob')).toBeNull();
  });

  test('rolls back when removing the old key fails after migration committed', () => {
    // Migration succeeded (new key written, lastKid pointer updated) but the
    // cleanup delete of the old key fails (security exception, extension,
    // etc.). Without rollback the orphan entry under prev.kid would surface
    // as stale data the next time the user switches back via the toolbar.
    saveKidState('Alex', sampleState({ kid: 'Alex', reward: 'Pillow fort' }));
    saveLastKid('Alex');
    const inner = (globalThis as any).localStorage as MemoryStorage;
    const trapped: Storage = {
      get length() {
        return inner.length;
      },
      key: (i: number) => inner.key(i),
      getItem: (k: string) => inner.getItem(k),
      setItem: (k: string, v: string) => inner.setItem(k, v),
      removeItem: (k: string) => {
        if (k === KID_PREFIX + 'Alex') throw new Error('SecurityError');
        inner.removeItem(k);
      },
      clear: () => inner.clear(),
    };
    (globalThis as any).localStorage = trapped;
    try {
      const prev = sampleState({ kid: 'Alex', reward: 'Pillow fort' });
      const next = renameKid(prev, 'Bob');
      expect(next).toBe(prev);
    } finally {
      (globalThis as any).localStorage = inner;
    }
    // Old key + lastKid intact so applyKidSwitch back to Alex still works.
    expect(loadKidState('Alex')).not.toBeNull();
    expect(loadKidState('Alex')!.reward).toBe('Pillow fort');
    expect(loadKidState('Bob')).toBeNull();
    expect(loadLastKid()).toBe('Alex');
  });

  test('rollback resyncs storage with the in-memory payload (no stale data on reload)', () => {
    // Memory may be ahead of storage when a previous effect-side save was
    // rejected and swallowed (saveKidState catches and returns false). Returning
    // prev is a same-reference no-op for React, so the storage effect won't fire
    // again and the divergence would stick until the next edit. Each rollback
    // path must resync storage to prev before returning.
    saveKidState('Alex', sampleState({ kid: 'Alex', reward: 'OLD' }));
    saveLastKid('Alex');
    const inner = (globalThis as any).localStorage as MemoryStorage;
    const trapped: Storage = {
      get length() {
        return inner.length;
      },
      key: (i: number) => inner.key(i),
      getItem: (k: string) => inner.getItem(k),
      setItem: (k: string, v: string) => {
        if (k === LAST_KID_KEY && v === 'Bob') throw new Error('QuotaExceeded');
        inner.setItem(k, v);
      },
      removeItem: (k: string) => inner.removeItem(k),
      clear: () => inner.clear(),
    };
    (globalThis as any).localStorage = trapped;
    try {
      const prev = sampleState({ kid: 'Alex', reward: 'NEW' });
      const next = renameKid(prev, 'Bob');
      expect(next).toBe(prev);
    } finally {
      (globalThis as any).localStorage = inner;
    }
    // Storage now matches the in-memory payload — reload won't surface stale OLD.
    expect(loadKidState('Alex')!.reward).toBe('NEW');
    expect(loadKidState('Bob')).toBeNull();
    expect(loadLastKid()).toBe('Alex');
  });

  test('rollback after lastKid failure removes the orphan new key', () => {
    // Stricter version of the earlier rollback test: assert that the orphan
    // 'Bob' key is actually gone, not just that loadKidState reports null.
    // If removeKidState swallows failures the next renameKid(_, 'Bob') would
    // be blocked by the loadKidState guard.
    saveKidState('Alex', sampleState({ kid: 'Alex', reward: 'Pillow fort' }));
    saveLastKid('Alex');
    const inner = (globalThis as any).localStorage as MemoryStorage;
    const trapped: Storage = {
      get length() {
        return inner.length;
      },
      key: (i: number) => inner.key(i),
      getItem: (k: string) => inner.getItem(k),
      setItem: (k: string, v: string) => {
        if (k === LAST_KID_KEY && v === 'Bob') throw new Error('QuotaExceeded');
        inner.setItem(k, v);
      },
      removeItem: (k: string) => inner.removeItem(k),
      clear: () => inner.clear(),
    };
    (globalThis as any).localStorage = trapped;
    try {
      renameKid(sampleState({ kid: 'Alex', reward: 'Pillow fort' }), 'Bob');
    } finally {
      (globalThis as any).localStorage = inner;
    }
    // Retry must not be blocked by the orphan-target guard.
    const retry = renameKid(sampleState({ kid: 'Alex', reward: 'Pillow fort' }), 'Bob');
    expect(retry.kid).toBe('Bob');
  });

  test('does not write a new entry when no old entry existed', () => {
    // Without a previous kid name there's nothing to migrate; the storage
    // effect will write under the new key on next render.
    const prev = sampleState({ kid: '' });
    const next = renameKid(prev, 'Bob');
    expect(next.kid).toBe('Bob');
    expect(loadKidState('Bob')).toBeNull();
  });

  test('renames in memory when localStorage is unavailable', () => {
    // Private-mode browsers / SSR / disabled storage: there is no persisted
    // data to protect, so the rename must proceed in memory rather than
    // rolling back. Other inline edits already degrade this way.
    delete (globalThis as any).localStorage;
    try {
      const prev = sampleState({ kid: 'Alex', reward: 'Pillow fort' });
      const next = renameKid(prev, 'Bob');
      expect(next.kid).toBe('Bob');
      expect(next.reward).toBe('Pillow fort');
    } finally {
      (globalThis as any).localStorage = new MemoryStorage();
    }
  });

  test('renames in memory when old kid has no saved entry yet', () => {
    // The kid name was just typed — never persisted. There is nothing under
    // the old key to migrate, so the rename must not roll back.
    const prev = sampleState({ kid: 'Alex' });
    expect(loadKidState('Alex')).toBeNull();
    const next = renameKid(prev, 'Bob');
    expect(next.kid).toBe('Bob');
  });

  test('trims surrounding whitespace before applying', () => {
    const prev = sampleState({ kid: 'Alex' });
    expect(renameKid(prev, '  Bob  ').kid).toBe('Bob');
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
    const prev = sampleState({ kid: 'Alex', theme: 'character-sheet', lang: 'ru' });
    const next = applyKidSwitch(prev, 'Newcomer');
    expect(next.kid).toBe('Newcomer');
    expect(next.theme).toBe('character-sheet');
    expect(next.lang).toBe('ru');
    expect(next.reward).toBe('');
    expect(next.chores.length).toBeGreaterThan(0);
  });

  test('trims surrounding whitespace before comparing or switching', () => {
    const prev = sampleState({ kid: 'Alex' });
    const next = applyKidSwitch(prev, '  Mira  ');
    expect(next.kid).toBe('Mira');
  });

  test('refuses switch when persisting prev kid fails and prev had saved data', () => {
    // If the latest in-memory state for the old kid can't be persisted (quota,
    // private mode after a write succeeded once, etc.) we must not silently
    // switch — those edits would vanish, leaving stale data under the old key.
    saveKidState('Alex', sampleState({ kid: 'Alex', reward: 'Stale fort' }));
    const inner = (globalThis as any).localStorage as MemoryStorage;
    const trapped: Storage = {
      get length() {
        return inner.length;
      },
      key: (i: number) => inner.key(i),
      getItem: (k: string) => inner.getItem(k),
      setItem: (k: string, v: string) => {
        if (k === KID_PREFIX + 'Alex') throw new Error('QuotaExceeded');
        inner.setItem(k, v);
      },
      removeItem: (k: string) => inner.removeItem(k),
      clear: () => inner.clear(),
    };
    (globalThis as any).localStorage = trapped;
    try {
      const prev = sampleState({ kid: 'Alex', reward: 'Latest unsaved fort' });
      const next = applyKidSwitch(prev, 'Mira');
      expect(next).toBe(prev);
    } finally {
      (globalThis as any).localStorage = inner;
    }
    // Old saved entry left intact; user stays on Alex and can retry / clean up.
    expect(loadKidState('Alex')!.reward).toBe('Stale fort');
    expect(loadKidState('Mira')).toBeNull();
  });

  test('switches in memory when prev kid has no saved entry yet (private mode / brand new)', () => {
    // No persisted data to protect → proceed even if the in-memory save would
    // be a no-op. Mirrors renameKid's "renames in memory when storage
    // unavailable" branch.
    delete (globalThis as any).localStorage;
    try {
      const prev = sampleState({ kid: 'Alex', reward: 'Pillow fort' });
      const next = applyKidSwitch(prev, 'Mira');
      expect(next.kid).toBe('Mira');
    } finally {
      (globalThis as any).localStorage = new MemoryStorage();
    }
  });
});
