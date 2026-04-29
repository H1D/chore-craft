import React from 'react';
import type { Lang, Theme } from './state';

// toolbar.tsx
// Slim top bar for kid switching, theme + language pickers, and Print.
// Hidden via @media print so the printed sheet stays clean. The kid input
// commits on blur / Enter — never on every keystroke — so we don't pollute
// localStorage with one entry per character typed.

export const THEMES: { value: Theme; label: string }[] = [
  { value: 'quest-scroll', label: 'Quest Scroll' },
  { value: 'character-sheet', label: 'Character Sheet' },
  { value: 'dungeon-map', label: 'Dungeon Map' },
  { value: 'minecraft', label: 'Minecraft' },
  { value: 'roblox', label: 'Roblox' },
  { value: 'toca-boca', label: 'Toca Boca' },
];

export const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'nl', label: 'Nederlands' },
];

export const TOOLBAR_STYLE_ID = 'cc-toolbar-styles';
export const TOOLBAR_CSS =
  '.cc-toolbar{position:fixed;top:0;left:0;right:0;z-index:10;display:flex;flex-wrap:wrap;gap:14px;padding:10px 16px;background:rgba(255,255,255,0.96);border-bottom:1px solid #d8d4cc;align-items:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;font-size:13px;backdrop-filter:blur(6px);box-shadow:0 1px 0 rgba(0,0,0,0.04)}' +
  '.cc-toolbar label{display:inline-flex;align-items:center;gap:6px;color:#555;font-weight:500}' +
  '.cc-toolbar input,.cc-toolbar select{font:inherit;padding:4px 8px;border:1px solid #c5c0b8;border-radius:4px;background:#fff;color:#222;min-width:0}' +
  '.cc-toolbar input:focus,.cc-toolbar select:focus{outline:none;border-color:#c96442;box-shadow:0 0 0 2px rgba(201,100,66,0.2)}' +
  '.cc-toolbar input{width:140px}' +
  '.cc-toolbar button{font:inherit;padding:5px 14px;border:1px solid #c96442;border-radius:4px;background:#c96442;color:#fff;cursor:pointer;font-weight:600;letter-spacing:0.02em}' +
  '.cc-toolbar button:hover{background:#b3502f;border-color:#b3502f}' +
  '.cc-toolbar .cc-spacer{flex:1}' +
  '@media print{.cc-toolbar{display:none!important}}';

export function useInjectToolbarStyles(): void {
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(TOOLBAR_STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = TOOLBAR_STYLE_ID;
    el.textContent = TOOLBAR_CSS;
    document.head.appendChild(el);
  }, []);
}

export interface ToolbarProps {
  kid: string;
  theme: Theme;
  lang: Lang;
  knownKids: string[];
  onKidCommit: (next: string) => void;
  onThemeChange: (next: Theme) => void;
  onLangChange: (next: Lang) => void;
  onPrint: () => void;
}

export function Toolbar({
  kid,
  theme,
  lang,
  knownKids,
  onKidCommit,
  onThemeChange,
  onLangChange,
  onPrint,
}: ToolbarProps) {
  useInjectToolbarStyles();
  const [draft, setDraft] = React.useState<string>(kid);

  // External kid changes (loaded from hash, datalist pick, etc.) should sync
  // back into the input unless the user is mid-edit (input owns the value).
  const focused = React.useRef(false);
  React.useEffect(() => {
    if (!focused.current) setDraft(kid);
  }, [kid]);

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(kid);
      return;
    }
    if (trimmed !== kid) onKidCommit(trimmed);
  };

  return (
    <div className="cc-toolbar" role="toolbar" aria-label="Chore Craft toolbar">
      <label>
        Kid
        <input
          type="text"
          list="cc-kids"
          value={draft}
          placeholder="Enter name"
          aria-label="Kid name"
          onFocus={() => {
            focused.current = true;
          }}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            focused.current = false;
            commit();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
        />
        <datalist id="cc-kids">
          {knownKids.map((k) => (
            <option key={k} value={k} />
          ))}
        </datalist>
      </label>

      <label>
        Theme
        <select
          value={theme}
          aria-label="Theme"
          onChange={(e) => onThemeChange(e.target.value as Theme)}
        >
          {THEMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Language
        <select
          value={lang}
          aria-label="Language"
          onChange={(e) => onLangChange(e.target.value as Lang)}
        >
          {LANGS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </label>

      <span className="cc-spacer" aria-hidden="true" />

      <button type="button" onClick={onPrint} aria-label="Print">
        Print
      </button>
    </div>
  );
}
