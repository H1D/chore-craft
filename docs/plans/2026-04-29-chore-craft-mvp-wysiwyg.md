# Chore Craft — POC to MVP (WYSIWYG + URL/localStorage persistence)

## Overview

Convert the POC (Figma-style canvas with 6 variants + Tweaks side panel) into a single-page WYSIWYG tool: one theme is rendered at full size, every chore/name/XP/reward field is inline-editable on the printed sheet itself, +/× buttons add/remove rows. A slim top toolbar holds kid switcher, theme picker, language, and print. State auto-persists to URL hash (shareable like easypdf-lite) and to localStorage keyed by kid name (so switching kids restores their last setup).

## Context

- Files involved:
  - Modify: `src/main.tsx` (drop DesignCanvas + TweaksPanel; mount single-theme view + toolbar)
  - Modify: `src/print.html`, `src/print.tsx` (print only the selected theme, not all 6)
  - Modify: `src/v1-quest-scroll.tsx`..`src/v6-toca-boca.tsx` (replace static spans with inline-editable primitives where data flows in)
  - Modify: `scripts/build.ts` (drop the `.design-canvas.state.json` copy step)
  - Modify: `src/index.html` (add print-hide CSS for toolbar)
  - Modify: `AGENTS.md`, `README.md` (reflect new MVP)
  - Create: `src/state.tsx` (useChoreState hook, codec, localStorage adapter)
  - Create: `src/inline.tsx` (InlineText, InlineNumber, InlineAddRow, InlineRemoveButton)
  - Create: `src/toolbar.tsx` (kid switcher datalist, theme picker, language select, print button)
  - Create: `src/state.test.ts` (codec round-trip + storage tests using `bun:test`)
- Related patterns:
  - easypdf-lite encodes app state into the URL hash so the page reload reproduces the screen — same approach here (JSON → base64url in `location.hash`).
  - Existing variants already accept a `data` prop with `{ heroName, level, levelName, classTitle, reward, chores[], bonus[] }`. Keep that contract; only swap how each field renders.
  - Existing `qsStyles`/`csStyles`/etc. unique-prefix convention stays.
- Dependencies: none new. Use built-in `btoa`/`atob` for encoding (no lz-string). `bun:test` for tests.

## Development Approach

- **Testing approach**: Regular (code first, then tests). Variants are visual; testable units are codec + storage + state hook.
- Complete each task fully before moving to the next.
- Project-specific:
  - A4 dimensions stay 794×1123. Inline edits must not change layout height (use `contentEditable` + `min-width`, never grow rows past their existing footprint).
  - No emoji in printed surface — use SVG glyphs or simple typography for +/× buttons; toolbar may use any chars since it's hidden when printing.
  - Hard rule: marker-friendly outlined boxes stay outlined. Inline editing changes text only, never the printed checkbox grid.
- **CRITICAL: every task MUST include new/updated tests**
- **CRITICAL: all tests must pass before starting next task**

## Implementation Steps

### Task 1: State, codec, and per-kid storage layer

**Files:**
- Create: `src/state.tsx`
- Create: `src/state.test.ts`

- [ ] Define `ChoreState` type: `{ kid, level, levelName, classTitle, reward, lang, theme, chores: {name,xp,on}[] }` (drop bonus — it stays empty per AGENTS.md)
- [ ] Implement `encodeState(state) → string` and `decodeState(string) → state | null` using `JSON.stringify` + `btoa` with URL-safe base64 (`-`/`_`, no padding); decode returns null on any throw
- [ ] Implement `loadKidState(name)` / `saveKidState(name, state)` against `localStorage` under key `chorecraft:kid:<name>`; `listKids()` returns sorted names; `loadLastKid()` / `saveLastKid(name)` under `chorecraft:lastKid`
- [ ] Implement `useChoreState(defaults)` React hook: state held in `useState`, mirrored to `location.hash` (debounced 200ms) and to localStorage for the current `kid` name; on mount, prefer hash → fallback to last-kid storage → fallback to defaults
- [ ] Write `src/state.test.ts`: codec round-trip on a fully-populated state, codec returns null for malformed input, kid storage save/load/list using a polyfilled `localStorage`
- [ ] Run `bun test src/state.test.ts` — must pass
- [ ] Run `bun run build` — must succeed

### Task 2: Inline edit primitives

**Files:**
- Create: `src/inline.tsx`
- Create: `src/inline.test.tsx` (smoke test only — render + dispatch)

- [ ] `InlineText({ value, onChange, style })` — `contentEditable` span; commits on blur and on Enter (preventDefault); strips newlines on paste; preserves print-correct styling
- [ ] `InlineNumber({ value, min, max, onChange, style })` — same as InlineText but parses integer on commit, clamps, reverts on bad input
- [ ] `InlineAddRow({ onAdd, label })` — small `+` button rendered inside a row; hidden via `@media print`
- [ ] `InlineRemoveButton({ onRemove })` — small `×` button at row start; hidden via `@media print`
- [ ] Inject one `<style>` block via `useEffect` once: `.cc-edit{outline:none;border-radius:2px} .cc-edit:focus{box-shadow:0 0 0 1.5px #c96442;background:#fff} @media print{.cc-edit-ui{display:none!important}}`
- [ ] Smoke test: rendering each primitive into JSDOM, firing input/blur, asserting onChange called with expected value
- [ ] Run `bun test` — all suites pass
- [ ] Run `bun run build` — must succeed

### Task 3: Wire inline editing into all six variants

**Files:**
- Modify: `src/v1-quest-scroll.tsx`, `src/v2-character-sheet.tsx`, `src/v3-dungeon-map.tsx`, `src/v4-minecraft.tsx`, `src/v5-roblox.tsx`, `src/v6-toca-boca.tsx`

- [ ] Each variant now receives `{ data, lang, edit }` where `edit = { setHeroName, setLevel, setLevelName, setClassTitle, setReward, setChoreName(i,v), setChoreXp(i,v), addChore, removeChore(i) }` (no-ops in print mode)
- [ ] Replace the hero name span with `<InlineText value={data.heroName} onChange={edit.setHeroName} />`
- [ ] Replace the level number with `<InlineNumber min={1} max={99} ... />`
- [ ] Replace level title, class title, reward with `InlineText`
- [ ] In each variant's quest-table render, wrap the chore name and `+{xp}` cells in inline primitives; add a left-edge `InlineRemoveButton` and a trailing `InlineAddRow` row at the end of the daily quest list (hidden when at chore cap of 7)
- [ ] Bonus quests stay blank by design (AGENTS.md hard rule) — no inline edit there
- [ ] Smoke test: snapshot or simple render assertion for one variant proving the edit-mode buttons exist in DOM and disappear when `edit` prop is undefined (print mode)
- [ ] Run `bun test` — pass
- [ ] Run `bun run build` — must succeed

### Task 4: Toolbar (kid / theme / language / print) and single-theme app shell

**Files:**
- Create: `src/toolbar.tsx`
- Modify: `src/main.tsx`
- Modify: `src/index.html`

- [ ] `Toolbar` component renders fixed top bar: kid name input (with `<datalist>` populated by `listKids()`), theme select (6 options), language select (en/ru/nl), Print button. Hidden via `@media print`
- [ ] Rewrite `src/main.tsx`: drop `DesignCanvas`/`DCArtboard`/`DCSection`/`TweaksPanel` imports and usage. Use `useChoreState`. Render a single centered artboard at 794×1123 for the selected theme, with `Toolbar` above it
- [ ] Map `state.theme` → component: `'quest-scroll' → QuestScroll`, etc. Pass `data`, `lang`, `edit` props
- [ ] On kid name change in toolbar: persist current state to old kid (if any), load saved state for new kid (or seed from `DEFAULT_CHORES[lang]`), update URL hash
- [ ] Print button calls `window.print()` and CSS guarantees only the artboard is visible (toolbar hidden, body padding zeroed in print)
- [ ] Update `src/index.html`: add minimal CSS for centered layout, plus `@page { size: A4 portrait; margin: 0 }` and print rules (toolbar hidden, artboard has no shadow, no scaling)
- [ ] Test: render `<App />` into JSDOM, simulate hash change → state updates; simulate kid change → localStorage write observed
- [ ] Run `bun test` — pass
- [ ] Run `bun run build`, open `dist/index.html`, manually verify: edit a chore name, refresh page, edits restored via hash; copy URL into incognito, edits restored

### Task 5: Retire the print-all-six page; print uses live state

**Files:**
- Modify: `src/print.html`, `src/print.tsx` (or delete if unused)
- Modify: `scripts/build.ts`
- Delete from main flow: `src/design-canvas.tsx`, `src/tweaks-panel.tsx` (only if no other consumer; otherwise leave on disk untouched — verify with grep before deleting)

- [ ] Print is now triggered from the live page (`window.print()`), so the standalone `print.html` flat-stack is obsolete. Remove the print entrypoint from `scripts/build.ts` and delete `src/print.html` + `src/print.tsx`
- [ ] Remove the `.design-canvas.state.json` copy from `scripts/build.ts` (no canvas anymore). Also remove the file from repo root if it exists
- [ ] After grep-confirming nothing else imports them, delete `src/design-canvas.tsx` and `src/tweaks-panel.tsx`
- [ ] Update test: ensure build still produces only `index.html` + `main.js`
- [ ] Run `bun test` — pass
- [ ] Run `bun run build` — must succeed; `dist/` should contain index.html + main.js (+ favicon if any), nothing else

### Task 6: Verify acceptance criteria

- [ ] Run `bun test` — full suite passes
- [ ] Run `bun run build` — succeeds with no warnings
- [ ] Run `gitleaks detect --source . --config .gitleaks.toml --no-git --redact --verbose` — clean

### Task 7: Update documentation

- [ ] Update `AGENTS.md`: replace "design canvas + Tweaks panel" sections with "single-theme WYSIWYG + toolbar"; update file map; note URL hash + localStorage persistence; note tweakable fields are now inline; remove print.html section
- [ ] Update `README.md`: rewrite Quick Start (open page, edit, print); document URL share + per-kid localStorage; remove references to print.html / design canvas
- [ ] Move this plan to `docs/plans/completed/`

## Post-Completion Manual Verification

- Open `dist/index.html`, type kid name "Alex", edit a chore, switch theme to Minecraft, switch lang to RU; print preview shows only the artboard A4-sized with toolbar hidden
- Reload page → state restored from hash
- Type kid name "Mira" → fresh defaults, then edit; switch back to "Alex" → Alex's saved state returns
- Copy URL into incognito → edits restored
