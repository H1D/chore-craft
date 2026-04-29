# Agent Instructions

Persistent context for agents working on this project.

## Project at a Glance

Kids tracking is a gamified chore/learning dashboard for two kids ages 10-12. Output is printable A4 sheets kids mark up by hand with markers. The app is a single-page WYSIWYG editor: one theme is rendered at full A4 size and every chore/name/XP/reward field is inline-editable on the printed sheet itself. A slim toolbar above the artboard holds the kid dropdown, theme picker, language, and Print. State auto-persists to the URL hash (shareable) and to `localStorage` keyed by kid name.

Languages supported: English, Russian, Dutch. All UI strings live in `src/i18n.tsx`. Never hard-code copy in a variant file.

## Hard Rules

- Printable always wins. Every change must survive a B&W laser print at A4 portrait, no margins. No reliance on hover, no JS interactivity in the printed surface, no tiny grayscale gradients that turn to mush.
- Marker-friendly. Checkboxes, progress bars, XP cells, signature lines = outlined empty boxes. Never pre-filled. The kid fills them in.
- Bonus quests are blank by design. Do not pre-populate bonus quest names or their XP. Kids write them in. Daily quests do show their XP value, editable via tweaks.
- A4 dimensions are fixed: every variant root is `width: 794, height: 1123`. Do not change.
- No emoji in printed surfaces. Use SVG. Emoji rendering varies wildly across browsers and printers.
- Use Bun for all local scripts and package operations. No Python or `.mjs` scripts unless there is a real constraint.

## Current Stack

- Runtime/build: Bun native TypeScript/TSX.
- Build script: `scripts/build.ts` (single bundle: `index.html` + `main.js`).
- Source HTML template: `src/index.html`.
- Built output: `dist/`, ignored by git.
- Deployment: Cloudflare Pages via Wrangler.
- Secrets scanning: Gitleaks GitHub Action.
- Tests: `bun:test` (codec + storage + render smoke tests).

## File Conventions

- One variant per file: `src/v1-*.tsx` through `src/v6-*.tsx`.
- Each variant exports its main component and also assigns it to `window` for compatibility, for example `window.QuestScroll = QuestScroll`.
- Each variant accepts `{ data, lang, edit }`. When `edit` is omitted (print/SSR), inline-edit primitives degrade to plain text.
- Style objects must be uniquely named per file: `qsStyles`, `csStyles`, `dmStyles`, `mcStyles`, `rbStyles`, `tbStyles`. Never use `const styles = { ... }`.
- Shared decorative SVG lives in `src/ornaments.tsx`, exported as `Ornament` and assigned to `window.Ornament`.
- All translation strings live in `src/i18n.tsx`, exported as `I18N` and assigned to `window.I18N`.
- Variants read translations via `const t = window.I18N[lang]`.

## Entry Points

- `src/index.html` + `src/main.tsx`: WYSIWYG single-theme app shell with toolbar, persisted state, and inline editing.
- `src/toolbar.tsx`: top toolbar (kid `<select>` with an "Add new kid..." modal, theme select, language select, Print button). Hidden via `@media print`.
- `src/state.tsx`: `ChoreState` type, URL-safe base64 codec (`encodeState` / `decodeState`), per-kid `localStorage` adapter (`loadKidState` / `saveKidState` / `listKids` / `loadLastKid`), and the `useChoreState` hook (URL hash mirror debounced 200ms, fallback to last-kid storage, then to defaults).
- `src/inline.tsx`: `InlineText`, `InlineNumber`, `InlineAddRow`, `InlineRemoveButton` primitives. The `.cc-edit` style block is injected once via `useEffect`; the `.cc-edit-ui` class hides + / × buttons in print.
- Whenever a new variant is added, register it in `src/main.tsx`'s theme map.

## File Map

```text
src/index.html             -> single-page app HTML template
src/main.tsx               -> app shell: useChoreState + Toolbar + active variant
src/toolbar.tsx            -> kid / theme / language / print toolbar
src/state.tsx              -> ChoreState, codec, localStorage, useChoreState hook
src/inline.tsx             -> inline-edit primitives
src/i18n.tsx               -> EN / RU / NL strings
src/ornaments.tsx          -> shared decorative SVG
src/v1-quest-scroll.tsx    -> variant A
...
src/v6-toca-boca.tsx       -> variant F
src/state.test.ts          -> codec + storage tests
src/inline.test.tsx        -> commit-helper + render smoke tests
src/toolbar.test.tsx       -> toolbar SSR shape test
src/v1-quest-scroll.test.tsx -> variant edit-mode vs print-mode smoke
scripts/build.ts           -> Bun build script
```

## Layout Traps

- Quest tables in v4 Minecraft and v5 Roblox must align header columns with row columns exactly:
  - same `gridTemplateColumns` on header and rows
  - `min-width: 0` plus `text-overflow: ellipsis` on the quest-name cell so long names do not blow out column 1
  - no `aspect-ratio` on grid cells, because it forces square sizing that fights the columns
  - `align-items: end` on header so day labels sit on the same baseline as the row centers below
- Do not use bare inline siblings for UI elements. Use flex/grid plus `gap`.

## Styling DNA

| Variant | Palette | Type | Border style |
|---|---|---|---|
| Quest Scroll | Parchment + ink `#7a3a2a`, `#f5e6c8` | Cinzel + Crimson Pro | Hand-drawn, ornamental |
| Character Sheet | Cream + ink + ruled lines | Cinzel + Crimson Pro | D&D form fields |
| Dungeon Map | Aged map, warm tan | Crimson Pro | Hand-inked tiles |
| Minecraft | Sky blue + dirt browns | Press Start 2P + JetBrains Mono | 3px hard edges + offset shadow |
| Roblox | Bright primary red/blue/yellow | Nunito 800-900 | 4px black border + 6px offset shadow |
| Toca Boca | Pastels `#ffadc6`, `#ffe17e`, etc. | Baloo 2 | 3px brown border + 5px offset shadow |

Do not mix these. A pastel sticker does not go on the Minecraft sheet.

## Inline Editing

Editable fields are: hero name, level number, level title, class title, reward, and each daily quest's name + XP. Add a quest with the `+` button at the end of the daily quest list (capped at 7). Remove a quest with the row's leading `×` button. Both buttons carry the `cc-edit-ui` class and are hidden via `@media print`.

Bonus quests are not editable. They are meant to be blank on the print. Do not add inline primitives there.

Inline edits must not change layout height. Use `contentEditable` + `min-width`; never grow rows past their existing footprint.

## Persistence

- URL hash: state is JSON-stringified, base64url-encoded (no padding, `-`/`_` alphabet) and written to `location.hash` via `useChoreState` debounced 200ms. Reload restores from hash.
- localStorage: each kid's state is saved under `chorecraft:kid:<name>`. The most recently used kid is tracked under `chorecraft:lastKid`.
- Resolution order on mount: URL hash → last-kid storage → defaults from `DEFAULT_CHORES[lang]`.
- Switching kids in the toolbar dropdown persists the current state under the old kid name first, then loads the new kid. Choosing "Add new kid..." opens a modal and seeds defaults for the new name.

## Printing

Build first:

```bash
bun run build
```

Open `dist/index.html`, edit fields inline, hit the toolbar's Print button (or `Cmd/Ctrl-P`). Print A4 portrait, no margins, scale 100%. Print CSS hides the toolbar, removes the artboard's shadow, and uses `@page { size: A4 portrait; margin: 0 }` so only the active variant's 794×1123 surface ends up on paper.

## Add a New Variant

1. Copy the closest existing variant as a starting point.
2. Build it at 794 x 1123, fill the page, leave room for marker checkboxes.
3. Use `t.days`, `t.dailyQuests`, `t.bonusQuests`, `t.levelLabel`, `t.signature`, `t.witness`, etc. from `window.I18N[lang]`.
4. Bonus quest names and bonus quest XP must be blank fillable lines.
5. Daily quest XP should be `+{c.xp}` or the variant's equivalent. Wrap it in `InlineNumber` when `edit` is provided so it stays editable on screen and prints cleanly when `edit` is `undefined`.
6. Export the component and assign it to `window`.
7. Register it in `src/main.tsx`'s theme map and add an option to the toolbar's theme `<select>`.

## Localize a New Language

1. Add a top-level key to `I18N` in `src/i18n.tsx`. Mirror the EN object's shape exactly.
2. Add an `<option>` for it in the toolbar's language `<select>` (`src/toolbar.tsx`).
3. Test that day abbreviations fit in the narrow day columns of v4/v5.

## Validation

Run before committing meaningful changes:

```bash
bun test
bun run build
gitleaks detect --source . --config .gitleaks.toml --no-git --redact --verbose
go run github.com/rhysd/actionlint/cmd/actionlint@latest .github/workflows/*.yml
```

## Documentation Drift

Agents must keep documentation current while changing the project.

- Update `AGENTS.md` when architecture, file layout, workflows, commands, deployment, constraints, or agent-facing rules change.
- Update `README.md` when user-facing setup, usage, deployment, file map, or feature behavior changes.
- Before finishing a task, check whether the code changes made existing docs stale. If they did, update docs in the same change.
