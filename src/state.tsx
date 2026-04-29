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

export type Theme = 'quest-scroll' | 'character-sheet';

export type Lang = 'en' | 'ru' | 'nl';

export interface Chore {
  name: string;
  xp: number | null;
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

const VALID_LANGS: ReadonlySet<Lang> = new Set<Lang>(['en', 'ru', 'nl']);
const VALID_THEMES: ReadonlySet<Theme> = new Set<Theme>([
  'quest-scroll',
  'character-sheet',
]);
const LEGACY_THEMES = new Set(['dungeon-map', 'minecraft', 'roblox', 'toca-boca']);

// Numeric ranges mirror the UI clamps in EditableNumber (level + chore XP both
// live in 1..99). decodeState/loadKidState are the trust boundary for hash
// payloads and stored blobs — without these checks, a crafted URL or corrupted
// localStorage entry could inject `level: 0.5` / `xp: -3`, which would render
// once and then keep getting re-persisted until the user happens to edit that
// field. Reject invalid data up front and coerce disabled legacy themes to the
// default active theme so old hashes/storage don't render broken variants.
const LEVEL_MIN = 1;
const LEVEL_MAX = 99;
const XP_MIN = 1;
const XP_MAX = 99;

function isIntInRange(v: unknown, min: number, max: number): boolean {
  return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
}

function normalizeTheme(v: unknown): Theme | null {
  if (typeof v !== 'string') return null;
  if (VALID_THEMES.has(v as Theme)) return v as Theme;
  if (LEGACY_THEMES.has(v)) return 'quest-scroll';
  return null;
}

function normalizeChoreState(v: unknown): ChoreState | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  if (typeof o.kid !== 'string') return null;
  if (!isIntInRange(o.level, LEVEL_MIN, LEVEL_MAX)) return null;
  if (typeof o.levelName !== 'string') return null;
  if (typeof o.classTitle !== 'string') return null;
  if (typeof o.reward !== 'string') return null;
  if (typeof o.lang !== 'string' || !VALID_LANGS.has(o.lang as Lang)) return null;
  const theme = normalizeTheme(o.theme);
  if (!theme) return null;
  if (!Array.isArray(o.chores)) return null;
  // Cap matches the UI's add-button limit (CHORE_CAP). A crafted hash or
  // corrupted blob with thousands of entries would otherwise round-trip
  // through state and re-persist on every effect-side save.
  if (o.chores.length > CHORE_CAP) return null;
  const chores: Chore[] = [];
  for (const c of o.chores) {
    if (!c || typeof c !== 'object') return null;
    const ch = c as Record<string, unknown>;
    if (typeof ch.name !== 'string') return null;
    if (ch.xp !== null && !isIntInRange(ch.xp, XP_MIN, XP_MAX)) return null;
    if (typeof ch.on !== 'boolean') return null;
    chores.push({ name: ch.name, xp: ch.xp, on: ch.on });
  }
  return {
    kid: o.kid,
    level: o.level,
    levelName: o.levelName,
    classTitle: o.classTitle,
    reward: o.reward,
    lang: o.lang as Lang,
    theme,
    chores,
  };
}

export function decodeState(s: string): ChoreState | null {
  try {
    if (!s) return null;
    const bin = fromUrlSafeB64(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    return normalizeChoreState(parsed);
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
    return normalizeChoreState(parsed);
  } catch {
    return null;
  }
}

// Returns true on a confirmed write so callers that need to chain a
// destructive step (renameKid → removeKidState) can bail when the write
// fails (quota / private mode / serialization). Other callers ignore it.
export function saveKidState(name: string, state: ChoreState): boolean {
  const ls = getStorage();
  if (!ls || !name) return false;
  try {
    ls.setItem(KID_PREFIX + name, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// Returns true on a confirmed delete (or a no-op when storage is unavailable
// or the name is blank, which is what callers want anyway). renameKid uses
// the boolean to attempt rollback if cleanup of the old key fails after the
// migration was committed — without this, an orphan key under the previous
// name would surface as stale data the next time the user switches back.
export function removeKidState(name: string): boolean {
  const ls = getStorage();
  if (!ls || !name) return true;
  try {
    ls.removeItem(KID_PREFIX + name);
    return true;
  } catch {
    return false;
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

// Returns true on a confirmed write so renameKid can detect a pointer-update
// failure between writing the new kid key and removing the old one — that
// window would otherwise leave the lastKid pointer aimed at the deleted old
// name, dropping the user back to defaults on reload.
export function saveLastKid(name: string): boolean {
  const ls = getStorage();
  if (!ls || !name) return false;
  try {
    ls.setItem(LAST_KID_KEY, name);
    return true;
  } catch {
    return false;
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
  // Clamp xp into the same range isValidChoreState enforces, otherwise a
  // host-injected DEFAULT_CHORES with xp: 0 / NaN / fractional would seed
  // a default state that fails revalidation on next reload — and silently
  // get replaced by a fresh FALLBACK on load.
  const clampXp = (v: unknown): number => {
    const n = Number(v);
    if (!Number.isFinite(n)) return XP_MIN;
    return Math.max(XP_MIN, Math.min(XP_MAX, Math.trunc(n)));
  };
  if (Array.isArray(list) && list.length > 0) {
    return list
      .slice(0, CHORE_CAP)
      .map((c: any) => ({ name: String(c.name ?? ''), xp: clampXp(c?.xp) }));
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

// renameKid renames the current kid in-place. Used for inline hero-name edits
// on the sheet, where the user is correcting a typo or renaming the current
// kid — not switching to a different kid's saved state.
//
// Refuses the rename when the target name already has a saved state, to avoid
// silently clobbering a sibling's data via the storage effect on next render.
// In that case the user must use the toolbar's kid switcher (applyKidSwitch),
// which preserves both entries.
//
// When the previous kid has saved data, we move it atomically: write under the
// new key first, update the lastKid pointer to the new name, then remove the
// old key. Doing all three here (instead of relying on the post-render effect
// to write later) keeps data safe across an unload/crash window between this
// state change and the next React commit — without the lastKid update, a crash
// after the move would leave readInitial() pointing at the now-deleted old
// name, falling through to defaults and silently "losing" the kid's data.
// If the write under the new key fails (quota, etc.) we bail before removing
// the old key — silently completing the state change while the new key is
// missing would destroy the kid's data on next reload. If only the lastKid
// pointer write fails (storage rejects the second setItem after accepting the
// first), we roll back the new key and bail too, otherwise the pointer would
// still aim at the soon-to-be-deleted old name and reload would fall through
// to defaults.
//
// Every rollback re-saves prev under prev.kid before returning. Returning the
// same reference makes React skip the re-render, which means the post-render
// storage effect won't fire — so if memory is ahead of storage (e.g. a prior
// effect-side save was rejected and silently swallowed), the divergence would
// stick until the user happens to edit again. The compensating write keeps
// storage and memory aligned even when the migration aborts.
//
// When the previous kid has NO saved data (e.g. storage unavailable in private
// mode, or the kid was just typed and not yet persisted), the rename proceeds
// in memory and the storage effect writes under the new key on next render.
// Failing the rename in that case would be inconsistent with how other inline
// edits degrade when storage is unavailable.
//
// This helper reads (and may write) localStorage. Callers MUST invoke it
// outside React setState updaters — updaters are required to be pure, and
// React may double-invoke them in dev or replay them under concurrent
// rendering, which would either repeat the storage writes or take a different
// branch on the second invocation.
export function renameKid(prev: ChoreState, rawNewKid: string): ChoreState {
  const next = String(rawNewKid ?? '').trim();
  if (!next || next === prev.kid) return prev;
  if (loadKidState(next)) return prev;
  const renamed = { ...prev, kid: next };
  if (prev.kid && loadKidState(prev.kid)) {
    if (!saveKidState(next, renamed)) {
      // Resync storage with memory: prev may carry edits the effect-side
      // save dropped. Best-effort — if this also fails, storage is broken
      // and we accept divergence.
      saveKidState(prev.kid, prev);
      return prev;
    }
    if (!saveLastKid(next)) {
      // Best-effort rollback. If removeKidState also fails (catastrophic
      // storage breakdown — every removeItem throws), the orphan new key
      // remains and a future renameKid(_, next) will be blocked by the
      // line-295 guard. Tolerable: storage is broken regardless.
      removeKidState(next);
      saveKidState(prev.kid, prev);
      return prev;
    }
    if (!removeKidState(prev.kid)) {
      // Migration committed (new key written, lastKid points to it) but
      // the old key wouldn't delete. Without rollback the leftover entry
      // would surface as stale data if the user later switches back to
      // prev.kid via applyKidSwitch. Restore the pointer first so a reload
      // mid-rollback still finds saved state, then drop the new key. If
      // either step fails (storage broken), accept divergence and keep the
      // rename — at least lastKid points at a real key.
      if (saveLastKid(prev.kid) && removeKidState(next)) {
        saveKidState(prev.kid, prev);
        return prev;
      }
    }
  }
  return renamed;
}

// applyKidSwitch persists the previous state under its old kid name, then
// either loads the new kid's saved state or seeds defaults. Theme stays put
// so switching kids doesn't yank the parent's chosen visual.
//
// Like renameKid, this helper writes localStorage and MUST NOT be called
// from inside a React setState updater — see renameKid's note for why.
//
// If saveKidState fails for the previous kid AND that kid already had a
// stored entry, we bail. Otherwise the user's latest in-memory edits would
// vanish and the still-stored entry would re-load as stale data on next
// reload. When prev had no stored entry yet (private mode, brand-new kid),
// the save being a no-op is fine — there's no data divergence to protect —
// and we proceed so storage-unavailable browsers can still switch kids.
export function applyKidSwitch(prev: ChoreState, rawNewKid: string): ChoreState {
  const next = String(rawNewKid ?? '').trim();
  if (!next || next === prev.kid) return prev;
  if (prev.kid) {
    const hadSavedState = loadKidState(prev.kid) !== null;
    if (!saveKidState(prev.kid, prev) && hadSavedState) return prev;
  }
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
