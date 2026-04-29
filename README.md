# Kids Tracking — RPG Chore & Learning Dashboard

A printable, gamified chore and learning dashboard for kids. Six visual variants, three languages, customizable in-browser, marker-friendly when printed.

## What's Inside

Six A4 portrait dashboards, each 794 x 1123 px and printable on a single sheet:

| File | Style | Vibe |
|---|---|---|
| `src/v1-quest-scroll.tsx` | A · Quest Scroll | Aged parchment, ink, wax seal |
| `src/v2-character-sheet.tsx` | B · Character Sheet | D&D-style stat block |
| `src/v3-dungeon-map.tsx` | C · Dungeon Map | Tabletop dungeon grid + rooms |
| `src/v4-minecraft.tsx` | D · Minecraft | Pixel blocks, inventory grid, HUD |
| `src/v5-roblox.tsx` | E · Roblox | Chunky avatar, thick borders, coin XP |
| `src/v6-toca-boca.tsx` | F · Toca Boca | Soft pastels, stickers, cute character |

All variants share the same data model: hero name, level, quests, reward. Language toggle supports English, Russian, and Dutch.

## Running Locally

```bash
bun install
bun run build
bunx serve dist
```

Then open the local URL printed by `serve`.

## Entry Points

- `dist/index.html` — interactive design canvas. Pan/zoom across all variants and tweak content live.
- `dist/Kids RPG Dashboard-print.html` — print-ready stack of all 6 variants, one per page.

Source templates live in `src/index.html` and `src/print.html`. Source entry points are `src/main.tsx` and `src/print.tsx`.

## Customizing

Open the design canvas and use the Tweaks panel:

- Language: EN / RU / NL
- Hero name, level, level title, class title
- Quests 1-7: toggle on/off, edit name, set XP
- Reward

Bonus quests are intentionally blank on the print so kids can fill them in by hand.

## File Map

```text
src/index.html                 -> design canvas HTML template
src/main.tsx                   -> design canvas app entry
src/print.html                 -> print HTML template
src/print.tsx                  -> print app entry
src/i18n.tsx                   -> EN / RU / NL strings
src/ornaments.tsx              -> shared decorative SVG
src/design-canvas.tsx          -> pan/zoom canvas component
src/tweaks-panel.tsx           -> tweaks panel and form controls
src/v1-quest-scroll.tsx        -> variant A
src/v2-character-sheet.tsx     -> variant B
src/v3-dungeon-map.tsx         -> variant C
src/v4-minecraft.tsx           -> variant D
src/v5-roblox.tsx              -> variant E
src/v6-toca-boca.tsx           -> variant F
scripts/build.ts               -> Bun build script
dist/                          -> generated static site, ignored by git
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
- A4 portrait is fixed at 794 x 1123 px.
- No emoji in print. Iconography is SVG.

## License

Private project. Feel free to fork for personal/family use.
