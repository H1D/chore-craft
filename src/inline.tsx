import React from 'react';
import { flushSync } from 'react-dom';

// inline.tsx
// WYSIWYG primitives for the printable sheet.
//
//   - InlineText / InlineNumber: contentEditable spans that commit on
//     blur and on Enter, sanitize pasted text, and never grow past
//     their existing footprint (A4 layout must not shift).
//   - InlineAddRow / InlineRemoveButton: tiny SVG +/× buttons,
//     hidden by @media print so the printed surface stays clean.
//   - Pure helpers (sanitizeText, parseClampInt, commitTextValue,
//     commitNumberValue) carry the dispatch logic so tests can
//     verify it without a DOM.

// ── Pure helpers ────────────────────────────────────────────────────────────

export function sanitizeText(raw: string): string {
  return String(raw).replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

export function parseClampInt(raw: string, min: number, max: number): number | null {
  const trimmed = String(raw).trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const n = parseInt(trimmed, 10);
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, n));
}

export function commitTextValue(
  rawTextContent: string,
  currentValue: string,
  onChange: (v: string) => void,
): string {
  const next = sanitizeText(rawTextContent);
  if (next !== currentValue) onChange(next);
  return next;
}

export function commitNumberValue(
  rawTextContent: string,
  currentValue: number,
  min: number,
  max: number,
  onChange: (v: number) => void,
): number {
  const parsed = parseClampInt(rawTextContent, min, max);
  if (parsed === null) return currentValue;
  if (parsed !== currentValue) onChange(parsed);
  return parsed;
}

// ── Style injection ─────────────────────────────────────────────────────────

export const STYLE_ID = 'cc-inline-styles';
export const STYLE_CSS =
  '.cc-edit{outline:none;border-radius:2px}' +
  '.cc-edit:focus{box-shadow:0 0 0 1.5px #c96442;background:#fff}' +
  '.cc-edit-ui{appearance:none;background:transparent;border:1px dashed #c96442;color:#c96442;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;line-height:0}' +
  '.cc-edit-ui:hover{background:#fff2ec}' +
  '@media print{.cc-edit-ui{display:none!important}.cc-edit{box-shadow:none!important;background:transparent!important}}';

export function useInjectInlineStyles(): void {
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = STYLE_CSS;
    document.head.appendChild(el);
  }, []);
}

// ── InlineText ──────────────────────────────────────────────────────────────

export interface InlineTextProps {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export function InlineText({ value, onChange, style, ariaLabel }: InlineTextProps) {
  useInjectInlineStyles();
  const ref = React.useRef<HTMLSpanElement>(null);
  const [initial] = React.useState<string>(value);
  // valueRef mirrors the live `value` prop so commit() can read the
  // post-dispatch resolved value synchronously after flushSync (acceptance
  // re-renders us with new value; rejection bails React out of re-rendering).
  const valueRef = React.useRef<string>(value);
  valueRef.current = value;

  // External value changes (e.g. kid switch from the toolbar) sync the DOM.
  // This effect is NOT the rollback path — commit() handles rollback itself,
  // synchronously, so window.print() never reads the stale typed-but-rejected
  // text from the contentEditable.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof document !== 'undefined' && document.activeElement === el) return;
    if (el.textContent !== value) el.textContent = value;
  }, [value]);

  const commit = () => {
    const el = ref.current;
    if (!el) return;
    // flushSync forces the parent's setState to commit before commit() returns,
    // so any sibling sync work (most importantly window.print() in a Print
    // button click) sees the resolved DOM, not the user's typed text. After
    // flushSync, valueRef.current holds the new value on acceptance and the
    // old value on rejection (renameKid conflict, etc.).
    flushSync(() => {
      commitTextValue(el.textContent ?? '', value, onChange);
    });
    if (el.textContent !== valueRef.current) el.textContent = valueRef.current;
  };

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={ariaLabel}
      spellCheck={false}
      className="cc-edit"
      style={{ minWidth: '1ch', display: 'inline-block', ...style }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData?.getData('text/plain') ?? '';
        const cleaned = sanitizeText(text);
        const doc = (e.currentTarget as HTMLElement).ownerDocument;
        if (doc && typeof doc.execCommand === 'function') {
          doc.execCommand('insertText', false, cleaned);
        } else if (e.currentTarget) {
          (e.currentTarget as HTMLElement).textContent =
            ((e.currentTarget as HTMLElement).textContent ?? '') + cleaned;
        }
      }}
    >
      {initial}
    </span>
  );
}

// ── InlineNumber ────────────────────────────────────────────────────────────

export interface InlineNumberProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export function InlineNumber({ value, min, max, onChange, style, ariaLabel }: InlineNumberProps) {
  useInjectInlineStyles();
  const ref = React.useRef<HTMLSpanElement>(null);
  const [initial] = React.useState<string>(String(value));
  // See InlineText: ref-mirrored value lets commit() read the resolved value
  // synchronously after flushSync, so the rollback (invalid input → revert
  // to current) lands before any sibling click handler runs window.print().
  const valueRef = React.useRef<number>(value);
  valueRef.current = value;

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof document !== 'undefined' && document.activeElement === el) return;
    const want = String(value);
    if (el.textContent !== want) el.textContent = want;
  }, [value]);

  const commit = () => {
    const el = ref.current;
    if (!el) return;
    flushSync(() => {
      commitNumberValue(el.textContent ?? '', value, min, max, onChange);
    });
    const want = String(valueRef.current);
    if (el.textContent !== want) el.textContent = want;
  };

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={ariaLabel}
      inputMode="numeric"
      spellCheck={false}
      className="cc-edit"
      style={{ minWidth: '2ch', display: 'inline-block', ...style }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData?.getData('text/plain') ?? '';
        const cleaned = sanitizeText(text);
        const doc = (e.currentTarget as HTMLElement).ownerDocument;
        if (doc && typeof doc.execCommand === 'function') {
          doc.execCommand('insertText', false, cleaned);
        } else if (e.currentTarget) {
          (e.currentTarget as HTMLElement).textContent =
            ((e.currentTarget as HTMLElement).textContent ?? '') + cleaned;
        }
      }}
    >
      {initial}
    </span>
  );
}

// ── Edit-aware wrappers ─────────────────────────────────────────────────────
// In print mode the variants pass no `edit` prop, so `onChange` is undefined
// and these render plain inert text — keeps callsites in variants tidy.

export interface EditableTextProps {
  value: string;
  onChange?: (v: string) => void;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export function EditableText({ value, onChange, style, ariaLabel }: EditableTextProps) {
  if (!onChange) return <span style={style}>{value}</span>;
  return <InlineText value={value} onChange={onChange} style={style} ariaLabel={ariaLabel} />;
}

export interface EditableNumberProps {
  value: number;
  min: number;
  max: number;
  onChange?: (v: number) => void;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export function EditableNumber({
  value,
  min,
  max,
  onChange,
  style,
  ariaLabel,
}: EditableNumberProps) {
  if (!onChange) return <span style={style}>{value}</span>;
  return (
    <InlineNumber
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      style={style}
      ariaLabel={ariaLabel}
    />
  );
}

// ── InlineAddRow / InlineRemoveButton ───────────────────────────────────────

export interface InlineAddRowProps {
  onAdd: () => void;
  label?: string;
  style?: React.CSSProperties;
}

export function InlineAddRow({ onAdd, label, style }: InlineAddRowProps) {
  useInjectInlineStyles();
  return (
    <button
      type="button"
      className="cc-edit-ui"
      aria-label={label ?? 'Add row'}
      onClick={onAdd}
      style={{ width: 18, height: 18, borderRadius: 4, ...style }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export interface InlineRemoveButtonProps {
  onRemove: () => void;
  label?: string;
  style?: React.CSSProperties;
}

export function InlineRemoveButton({ onRemove, label, style }: InlineRemoveButtonProps) {
  useInjectInlineStyles();
  return (
    <button
      type="button"
      className="cc-edit-ui"
      aria-label={label ?? 'Remove row'}
      onClick={onRemove}
      style={{ width: 14, height: 14, borderRadius: 4, ...style }}
    >
      <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}
