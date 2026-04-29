import React from 'react';
import type { Lang, Theme } from './state';
import { I18N } from './i18n';

// toolbar.tsx
// Slim top bar for kid switching, theme + language pickers, and Print.
// Hidden via @media print so the printed sheet stays clean. The kid selector
// switches saved kids directly; "add new" opens a dialog so new names commit
// once instead of polluting localStorage with one entry per character typed.

export const THEMES: { value: Theme; label: string }[] = [
  { value: 'quest-scroll', label: 'Quest Scroll' },
  { value: 'character-sheet', label: 'Character Sheet' },
];

export const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'nl', label: 'Nederlands' },
];

export const TOOLBAR_STYLE_ID = 'cc-toolbar-styles';
export const ADD_KID_VALUE = '__cc_add_kid__';
export const TOOLBAR_CSS =
  '.cc-toolbar{position:fixed;top:0;left:0;right:0;z-index:10;display:flex;flex-wrap:wrap;gap:14px;padding:10px 16px;background:rgba(255,255,255,0.96);border-bottom:1px solid #d8d4cc;align-items:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;font-size:13px;backdrop-filter:blur(6px);box-shadow:0 1px 0 rgba(0,0,0,0.04)}' +
  '.cc-toolbar label{display:inline-flex;align-items:center;gap:6px;color:#555;font-weight:500}' +
  '.cc-toolbar input,.cc-toolbar select{font:inherit;padding:4px 8px;border:1px solid #c5c0b8;border-radius:4px;background:#fff;color:#222;min-width:0}' +
  '.cc-toolbar input:focus,.cc-toolbar select:focus{outline:none;border-color:#c96442;box-shadow:0 0 0 2px rgba(201,100,66,0.2)}' +
  '.cc-toolbar input[type="checkbox"]{width:16px;height:16px;padding:0;margin:0;accent-color:#c96442}' +
  '.cc-toolbar .cc-kid-select{width:180px}' +
  '.cc-toolbar button{font:inherit;padding:5px 14px;border:1px solid #c96442;border-radius:4px;background:#c96442;color:#fff;cursor:pointer;font-weight:600;letter-spacing:0.02em}' +
  '.cc-toolbar button:hover{background:#b3502f;border-color:#b3502f}' +
  '.cc-toolbar button.cc-secondary{background:#fff;color:#5e5148;border-color:#c5c0b8}' +
  '.cc-toolbar button.cc-secondary:hover{background:#f7f3ed;border-color:#a99f94}' +
  '.cc-toolbar .cc-spacer{flex:1}' +
  '.cc-kid-dialog{border:1px solid #d8d4cc;border-radius:8px;padding:18px;box-shadow:0 18px 60px rgba(0,0,0,0.24);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;color:#222;min-width:min(340px,calc(100vw - 32px))}' +
  '.cc-kid-dialog::backdrop{background:rgba(32,28,24,0.38)}' +
  '.cc-kid-dialog h2{margin:0 0 14px;font-size:18px;line-height:1.2}' +
  '.cc-kid-dialog form{display:grid;gap:12px}' +
  '.cc-kid-dialog label{display:grid;gap:6px;font-size:13px;font-weight:600;color:#555}' +
  '.cc-kid-dialog input{font:inherit;padding:8px 10px;border:1px solid #c5c0b8;border-radius:4px}' +
  '.cc-kid-dialog input:focus{outline:none;border-color:#c96442;box-shadow:0 0 0 2px rgba(201,100,66,0.2)}' +
  '.cc-kid-dialog .cc-error{min-height:18px;margin:0;color:#9f2d20;font-size:12px}' +
  '.cc-kid-dialog .cc-dialog-actions{display:flex;justify-content:flex-end;gap:8px}' +
  '.cc-kid-dialog button{font:inherit;padding:6px 14px;border:1px solid #c96442;border-radius:4px;background:#c96442;color:#fff;cursor:pointer;font-weight:600}' +
  '.cc-kid-dialog button:hover{background:#b3502f;border-color:#b3502f}' +
  '.cc-kid-dialog button.cc-secondary{background:#fff;color:#5e5148;border-color:#c5c0b8}' +
  '.cc-kid-dialog button.cc-secondary:hover{background:#f7f3ed;border-color:#a99f94}' +
  '@media print{.cc-toolbar{display:none!important}}';

type ToolbarCopy = (typeof I18N)['en']['toolbar'];

function getToolbarCopy(lang: Lang): ToolbarCopy {
  return I18N[lang]?.toolbar ?? I18N.en.toolbar;
}

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
  highlightFields: boolean;
  onKidCommit: (next: string) => boolean;
  onThemeChange: (next: Theme) => void;
  onLangChange: (next: Lang) => void;
  onHighlightFieldsChange: (next: boolean) => void;
  onPrint: () => void;
}

export function Toolbar({
  kid,
  theme,
  lang,
  knownKids,
  highlightFields,
  onKidCommit,
  onThemeChange,
  onLangChange,
  onHighlightFieldsChange,
  onPrint,
}: ToolbarProps) {
  useInjectToolbarStyles();
  const copy = getToolbarCopy(lang);
  const [addOpen, setAddOpen] = React.useState(false);
  const [draftKid, setDraftKid] = React.useState('');
  const [error, setError] = React.useState('');
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (addOpen) {
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      }
      window.setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }
    if (dialog.open) dialog.close();
  }, [addOpen]);

  const closeAddDialog = () => {
    setAddOpen(false);
    setDraftKid('');
    setError('');
  };

  const submitNewKid = () => {
    const trimmed = draftKid.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    const accepted = onKidCommit(trimmed);
    if (accepted) closeAddDialog();
    else setError(copy.kidSaveError);
  };

  return (
    <React.Fragment>
      <div className="cc-toolbar" role="toolbar" aria-label="Chore Craft toolbar">
        <label>
          {copy.kid}
          <select
            className="cc-kid-select"
            value={kid || ''}
            aria-label={copy.kid}
            onChange={(e) => {
              const next = e.target.value;
              if (next === ADD_KID_VALUE) {
                setDraftKid('');
                setError('');
                setAddOpen(true);
                return;
              }
              if (next) onKidCommit(next);
            }}
          >
            {!kid && (
              <option value="" disabled>
                {copy.selectKid}
              </option>
            )}
            {knownKids.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
            <option value={ADD_KID_VALUE}>{copy.addKid}</option>
          </select>
        </label>

        <label>
          {copy.theme}
          <select
            value={theme}
            aria-label={copy.theme}
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
          {copy.language}
          <select
            value={lang}
            aria-label={copy.language}
            onChange={(e) => onLangChange(e.target.value as Lang)}
          >
            {LANGS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={highlightFields}
            aria-label={copy.highlightFields}
            onChange={(e) => onHighlightFieldsChange(e.currentTarget.checked)}
          />
          {copy.highlightFields}
        </label>

        <span className="cc-spacer" aria-hidden="true" />

        <button type="button" onClick={onPrint} aria-label={copy.print}>
          {copy.print}
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="cc-kid-dialog"
        aria-labelledby="cc-kid-dialog-title"
        onClose={closeAddDialog}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitNewKid();
          }}
        >
          <h2 id="cc-kid-dialog-title">{copy.newKidTitle}</h2>
          <label>
            {copy.newKidName}
            <input
              ref={inputRef}
              type="text"
              value={draftKid}
              placeholder={copy.newKidPlaceholder}
              aria-label={copy.newKidName}
              onChange={(e) => {
                setDraftKid(e.target.value);
                if (error) setError('');
              }}
            />
          </label>
          <p className="cc-error" role={error ? 'alert' : undefined}>
            {error}
          </p>
          <div className="cc-dialog-actions">
            <button type="button" className="cc-secondary" onClick={closeAddDialog}>
              {copy.cancel}
            </button>
            <button type="submit">{copy.add}</button>
          </div>
        </form>
      </dialog>
    </React.Fragment>
  );
}
