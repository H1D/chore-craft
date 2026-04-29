# Agent Instructions

Persistent context for agents working on this project.

## Project at a Glance

Kids tracking is a gamified chore/learning dashboard for two kids ages 10-12. Output is printable A4 sheets kids mark up by hand with markers. Six visual variants are exposed on a design canvas; one of them is what the family actually prints.

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
- Build script: `scripts/build.ts`.
- Source HTML templates: `src/index.html`, `src/print.html`.
- Built output: `dist/`, ignored by git.
- Deployment: Cloudflare Pages via Wrangler.
- Secrets scanning: Gitleaks GitHub Action.

## File Conventions

- One variant per file: `src/v1-*.tsx` through `src/v6-*.tsx`.
- Each variant exports its main component and also assigns it to `window` for compatibility, for example `window.QuestScroll = QuestScroll`.
- Style objects must be uniquely named per file: `qsStyles`, `csStyles`, `dmStyles`, `mcStyles`, `rbStyles`, `tbStyles`. Never use `const styles = { ... }`.
- Shared decorative SVG lives in `src/ornaments.tsx`, exported as `Ornament` and assigned to `window.Ornament`.
- All translation strings live in `src/i18n.tsx`, exported as `I18N` and assigned to `window.I18N`.
- Variants read translations via `const t = window.I18N[lang]`.

## Entry Points

- `src/index.html` + `src/main.tsx`: design canvas authoring view. Includes the Tweaks panel.
- `src/print.html` + `src/print.tsx`: flat stack of all 6 variants for printing.
- Whenever a new variant is added, register it in both `src/main.tsx` and `src/print.tsx`.

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

## Tweaks Panel

Tweakable fields are language, hero name, level, level title, class title, 7 quest slots with toggle/name/XP, and reward.

Bonus quests are not tweakable. They are meant to be blank on the print. Keep the hint card in the panel reminding the user.

## Printing

Build first:

```bash
bun run build
```

Then open `dist/Kids RPG Dashboard-print.html`, print A4 portrait, no margins, scale 100%. Each variant is a `.page-wrap` with `page-break-after: always`.

## Add a New Variant

1. Copy the closest existing variant as a starting point.
2. Build it at 794 x 1123, fill the page, leave room for marker checkboxes.
3. Use `t.days`, `t.dailyQuests`, `t.bonusQuests`, `t.levelLabel`, `t.signature`, `t.witness`, etc. from `window.I18N[lang]`.
4. Bonus quest names and bonus quest XP must be blank fillable lines.
5. Daily quest XP should be `+{c.xp}` or the variant's equivalent.
6. Export the component and assign it to `window`.
7. Register it in both `src/main.tsx` and `src/print.tsx`.

## Localize a New Language

1. Add a top-level key to `I18N` in `src/i18n.tsx`. Mirror the EN object's shape exactly.
2. Add a tweak option for it in the Tweaks panel language `TweakSelect`.
3. Test that day abbreviations fit in the narrow day columns of v4/v5.

## Validation

Run before committing meaningful changes:

```bash
bun run build
gitleaks detect --source . --config .gitleaks.toml --no-git --redact --verbose
go run github.com/rhysd/actionlint/cmd/actionlint@latest .github/workflows/*.yml
```

## Documentation Drift

Agents must keep documentation current while changing the project.

- Update `AGENTS.md` when architecture, file layout, workflows, commands, deployment, constraints, or agent-facing rules change.
- Update `README.md` when user-facing setup, usage, deployment, file map, or feature behavior changes.
- Before finishing a task, check whether the code changes made existing docs stale. If they did, update docs in the same change.
