import React from 'react';

// state.tsx
// Single source of truth for the printable sheet's editable data.
//
//   - ChoreState: the shape the sheet renders from and stores.
//   - encodeState / decodeState: URL-safe base64 codec, used for
//     `location.hash` so a copied URL reproduces the screen.
//   - load/saveKidState, list/load/saveLastKid: per-kid localStorage
//     persistence keyed by kid name.
//   - useChoreState: React hook that mirrors state to both hash
//     (debounced) and per-kid localStorage, and rehydrates on mount
//     in priority order: hash → last-kid storage → defaults.

export type Theme =
  | 'quest-scroll'
  | 'character-sheet'
  | 'dungeon-map'
  | 'minecraft'
  | 'roblox'
  | 'toca-boca';

export type Lang = 'en' | 'ru' | 'nl';

export interface Chore {
  name: string;
  xp: number;
  on: boolean;
}

export interface ChoreState {
  kid: string;
  level: number;
  levelName: string;
  classTitle: string;
  reward: string;
  lang: Lang;
  theme: Theme;
  chores: Chore[];
}

export const KID_PREFIX = 'chorecraft:kid:';
export const LAST_KID_KEY = 'chorecraft:lastKid';
export const HASH_DEBOUNCE_MS = 200;
export const CHORE_CAP = 7;

// ── Codec ───────────────────────────────────────────────────────────────────

function toUrlSafeB64(bin: string): string {
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafeB64(s: string): string {
  const std = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = std.length % 4;
  return atob(pad ? std + '='.repeat(4 - pad) : std);
}

export function encodeState(state: ChoreState): string {
  const json = JSON.stringify(state);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return toUrlSafeB64(bin);
}

export function decodeState(s: string): ChoreState | null {
  try {
    if (!s) return null;
    const bin = fromUrlSafeB64(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as ChoreState;
  } catch {
    return null;
  }
}

// ── Per-kid localStorage ────────────────────────────────────────────────────

function getStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function loadKidState(name: string): ChoreState | null {
  const ls = getStorage();
  if (!ls || !name) return null;
  try {
    const raw = ls.getItem(KID_PREFIX + name);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as ChoreState) : null;
  } catch {
    return null;
  }
}

export function saveKidState(name: string, state: ChoreState): void {
  const ls = getStorage();
  if (!ls || !name) return;
  try {
    ls.setItem(KID_PREFIX + name, JSON.stringify(state));
  } catch {
    /* quota or serialization error — drop silently */
  }
}

export function listKids(): string[] {
  const ls = getStorage();
  if (!ls) return [];
  const out: string[] = [];
  try {
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i);
      if (k && k.startsWith(KID_PREFIX)) out.push(k.slice(KID_PREFIX.length));
    }
  } catch {
    return [];
  }
  return out.sort();
}

export function loadLastKid(): string | null {
  const ls = getStorage();
  if (!ls) return null;
  try {
    return ls.getItem(LAST_KID_KEY);
  } catch {
    return null;
  }
}

export function saveLastKid(name: string): void {
  const ls = getStorage();
  if (!ls || !name) return;
  try {
    ls.setItem(LAST_KID_KEY, name);
  } catch {
    /* ignore */
  }
}

// ── Defaults + kid-switch helpers ──────────────────────────────────────────
// Read DEFAULT_CHORES from window so state.tsx stays decoupled from i18n's
// module side effects (i18n.tsx mutates `window` at import). main.tsx imports
// './i18n' before mounting, so the global is populated by the time any of
// these helpers runs in production. Tests can stub it on globalThis.

const FALLBACK_STARTER_CHORES: Record<Lang, { name: string; xp: number }[]> = {
  en: [
    { name: 'Read for 30 minutes', xp: 20 },
    { name: 'Make your bed', xp: 5 },
  ],
  ru: [
    { name: 'Читать 30 минут', xp: 20 },
    { name: 'Заправить кровать', xp: 5 },
  ],
  nl: [
    { name: 'Lees 30 minuten', xp: 20 },
    { name: 'Bed opmaken', xp: 5 },
  ],
};

export function getStarterChores(lang: Lang): { name: string; xp: number }[] {
  const w: any = typeof window !== 'undefined' ? window : null;
  const list = w?.DEFAULT_CHORES?.[lang];
  if (Array.isArray(list) && list.length > 0) {
    return list.map((c: any) => ({ name: String(c.name ?? ''), xp: Number(c.xp ?? 0) }));
  }
  return FALLBACK_STARTER_CHORES[lang] ?? FALLBACK_STARTER_CHORES.en;
}

export function defaultStateForLang(lang: Lang, kid: string = ''): ChoreState {
  return {
    kid,
    level: 1,
    levelName: '',
    classTitle: '',
    reward: '',
    lang,
    theme: 'quest-scroll',
    chores: getStarterChores(lang).map((c) => ({ name: c.name, xp: c.xp, on: true })),
  };
}

// applyKidSwitch persists the previous state under its old kid name, then
// either loads the new kid's saved state or seeds defaults. Theme stays put
// so switching kids doesn't yank the parent's chosen visual.
export function applyKidSwitch(prev: ChoreState, rawNewKid: string): ChoreState {
  const next = String(rawNewKid ?? '').trim();
  if (!next || next === prev.kid) return prev;
  if (prev.kid) saveKidState(prev.kid, prev);
  const saved = loadKidState(next);
  if (saved) return { ...saved, kid: next };
  return { ...defaultStateForLang(prev.lang, next), theme: prev.theme };
}

// ── useChoreState hook ──────────────────────────────────────────────────────

function readInitial(defaults: ChoreState): ChoreState {
  if (typeof window === 'undefined') return defaults;
  const hash = window.location.hash.replace(/^#/, '');
  if (hash) {
    const fromHash = decodeState(hash);
    if (fromHash) return fromHash;
  }
  const last = loadLastKid();
  if (last) {
    const saved = loadKidState(last);
    if (saved) return saved;
  }
  return defaults;
}

export function useChoreState(
  defaults: ChoreState,
): [ChoreState, React.Dispatch<React.SetStateAction<ChoreState>>] {
  const [state, setState] = React.useState<ChoreState>(() => readInitial(defaults));

  // Mirror to hash, debounced so rapid keystrokes don't spam history.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = setTimeout(() => {
      const next = '#' + encodeState(state);
      if (window.location.hash !== next) {
        const url = window.location.pathname + window.location.search + next;
        window.history.replaceState(null, '', url);
      }
    }, HASH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [state]);

  // Mirror to per-kid localStorage. Skipped when kid name is blank
  // so we don't pollute storage with an empty key.
  React.useEffect(() => {
    if (!state.kid) return;
    saveKidState(state.kid, state);
    saveLastKid(state.kid);
  }, [state]);

  return [state, setState];
}
