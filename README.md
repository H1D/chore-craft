# Kids Tracking — RPG Chore & Learning Dashboard

A printable, gamified chore and learning dashboard for kids. Six visual variants, three languages, edited inline in the browser, marker-friendly when printed.

## What's Inside

Six A4 portrait dashboards, each 794 x 1123 px and printable on a single sheet. The app shows one of them at a time at full size; the toolbar above the sheet picks which:

| File | Style | Vibe |
|---|---|---|
| `src/v1-quest-scroll.tsx` | A · Quest Scroll | Aged parchment, ink, wax seal |
| `src/v2-character-sheet.tsx` | B · Character Sheet | D&D-style stat block |
| `src/v3-dungeon-map.tsx` | C · Dungeon Map | Tabletop dungeon grid + rooms |
| `src/v4-minecraft.tsx` | D · Minecraft | Pixel blocks, inventory grid, HUD |
| `src/v5-roblox.tsx` | E · Roblox | Chunky avatar, thick borders, coin XP |
| `src/v6-toca-boca.tsx` | F · Toca Boca | Soft pastels, stickers, cute character |

All variants share the same data model: hero name, level, daily quests with XP, reward. Bonus quest slots stay blank by design — kids fill them in by hand.

Languages: English, Russian, Dutch.

## Quick Start

```bash
bun install
bun run build
bunx serve dist
```

Open the local URL printed by `serve`. You'll see one A4 sheet centered under a slim toolbar.

1. Type the kid's name in the toolbar (autocomplete suggests previously saved kids).
2. Click any field on the sheet (hero name, level, quest names, XP, reward) and type to edit. Use the `+` row to add a quest, the `×` button to remove one.
3. Pick a theme and language from the toolbar.
4. Hit Print (or `Cmd/Ctrl-P`). Only the artboard prints — the toolbar and edit chrome are hidden.

## Persistence

- The URL hash encodes the full state. Copy the URL, paste it anywhere, the page rebuilds the same sheet.
- Each kid's state is auto-saved to `localStorage` under `chorecraft:kid:<name>`. Switching kids in the toolbar restores their last setup; switching to a brand-new name starts from defaults.
- The most recently used kid is restored on next page load if the URL has no hash.

## File Map

```text
src/index.html             -> single-page app HTML template
src/main.tsx               -> app shell: useChoreState + Toolbar + active variant
src/toolbar.tsx            -> kid / theme / language / print toolbar
src/state.tsx              -> ChoreState, codec, localStorage, useChoreState hook
src/inline.tsx             -> InlineText / InlineNumber / +Add / ×Remove primitives
src/i18n.tsx               -> EN / RU / NL strings
src/ornaments.tsx          -> shared decorative SVG
src/v1-quest-scroll.tsx    -> variant A
src/v2-character-sheet.tsx -> variant B
src/v3-dungeon-map.tsx     -> variant C
src/v4-minecraft.tsx       -> variant D
src/v5-roblox.tsx          -> variant E
src/v6-toca-boca.tsx       -> variant F
scripts/build.ts           -> Bun build script (single bundle)
dist/                      -> generated static site, ignored by git
```

## Deployment

Cloudflare Pages deploys via GitHub Actions and Wrangler. Production deploy runs on each merge/push to `main`.

Production hostname:

```text
https://chorecraft.artems.net
```

Required GitHub secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

See `DEPLOYMENT.md` for setup details.

## Design Notes

- Marker-friendly: checkboxes, progress bars, XP cells, and signature lines are outlined and empty.
- Bonus quest names and XP are blank on purpose.
- A4 portrait is fixed at 794 x 1123 px. Inline edits never change layout height.
- No emoji in print. Iconography is SVG.

## License

Private project. Feel free to fork for personal/family use.
