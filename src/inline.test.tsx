import { describe, expect, test } from 'bun:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  InlineAddRow,
  InlineNumber,
  InlineRemoveButton,
  InlineText,
  STYLE_CSS,
  commitNumberValue,
  commitNullableNumberValue,
  commitTextValue,
  parseClampInt,
  sanitizeText,
} from './inline';

describe('sanitizeText', () => {
  test('strips newlines, tabs, and carriage returns', () => {
    expect(sanitizeText('hello\nworld')).toBe('hello world');
    expect(sanitizeText('a\r\nb\tc')).toBe('a b c');
  });

  test('collapses runs of whitespace and trims edges', () => {
    expect(sanitizeText('  a   b  ')).toBe('a b');
  });

  test('empty/whitespace-only returns empty', () => {
    expect(sanitizeText('')).toBe('');
    expect(sanitizeText('   ')).toBe('');
    expect(sanitizeText('\n\n')).toBe('');
  });

  test('preserves unicode (Cyrillic, Dutch diacritics)', () => {
    expect(sanitizeText('Прочитать  30\nминут')).toBe('Прочитать 30 минут');
    expect(sanitizeText('Frietjes\tmet mayonaise')).toBe('Frietjes met mayonaise');
  });
});

describe('parseClampInt', () => {
  test('parses and clamps to range', () => {
    expect(parseClampInt('5', 1, 10)).toBe(5);
    expect(parseClampInt('20', 1, 10)).toBe(10);
    expect(parseClampInt('-3', 1, 10)).toBe(1);
  });

  test('returns null for non-integer or empty input', () => {
    expect(parseClampInt('abc', 1, 10)).toBeNull();
    expect(parseClampInt('', 1, 10)).toBeNull();
    expect(parseClampInt('1.5', 1, 10)).toBeNull();
    expect(parseClampInt('   ', 1, 10)).toBeNull();
  });

  test('strips surrounding whitespace before parsing', () => {
    expect(parseClampInt('  7  ', 1, 10)).toBe(7);
  });
});

describe('commitTextValue', () => {
  test('calls onChange with sanitized value when it differs', () => {
    let captured: string | null = null;
    const result = commitTextValue('  Hello\nworld  ', 'Old', (v) => {
      captured = v;
    });
    expect(result).toBe('Hello world');
    expect(captured).toBe('Hello world');
  });

  test('does not call onChange when sanitized value equals current', () => {
    let called = false;
    commitTextValue('Hello', 'Hello', () => {
      called = true;
    });
    expect(called).toBe(false);
  });

  test('returns sanitized empty string for whitespace-only input', () => {
    let captured: string | null = null;
    const result = commitTextValue('   ', 'Old', (v) => {
      captured = v;
    });
    expect(result).toBe('');
    expect(captured).toBe('');
  });
});

describe('commitNumberValue', () => {
  test('clamps high values and dispatches onChange', () => {
    let captured: number | null = null;
    const result = commitNumberValue('150', 10, 1, 99, (v) => {
      captured = v;
    });
    expect(result).toBe(99);
    expect(captured).toBe(99);
  });

  test('clamps low values and dispatches onChange', () => {
    let captured: number | null = null;
    const result = commitNumberValue('0', 10, 1, 99, (v) => {
      captured = v;
    });
    expect(result).toBe(1);
    expect(captured).toBe(1);
  });

  test('reverts to current value on invalid input and skips onChange', () => {
    let called = false;
    const result = commitNumberValue('abc', 10, 1, 99, () => {
      called = true;
    });
    expect(result).toBe(10);
    expect(called).toBe(false);
  });

  test('does not dispatch when parsed value equals current', () => {
    let called = false;
    commitNumberValue('10', 10, 1, 99, () => {
      called = true;
    });
    expect(called).toBe(false);
  });
});

describe('commitNullableNumberValue', () => {
  test('commits null for empty input', () => {
    let captured: number | null | undefined;
    const result = commitNullableNumberValue('', 10, 1, 99, (v) => {
      captured = v;
    });
    expect(result).toBeNull();
    expect(captured).toBeNull();
  });

  test('keeps null unchanged without dispatch', () => {
    let called = false;
    const result = commitNullableNumberValue('   ', null, 1, 99, () => {
      called = true;
    });
    expect(result).toBeNull();
    expect(called).toBe(false);
  });

  test('parses and clamps non-empty input', () => {
    let captured: number | null | undefined;
    const result = commitNullableNumberValue('150', null, 1, 99, (v) => {
      captured = v;
    });
    expect(result).toBe(99);
    expect(captured).toBe(99);
  });

  test('reverts invalid non-empty input', () => {
    let called = false;
    const result = commitNullableNumberValue('abc', null, 1, 99, () => {
      called = true;
    });
    expect(result).toBeNull();
    expect(called).toBe(false);
  });
});

describe('InlineText render', () => {
  test('produces a contenteditable span carrying the initial value', () => {
    const html = renderToStaticMarkup(<InlineText value="Hello" onChange={() => {}} />);
    expect(html).toContain('contenteditable="true"');
    expect(html).toContain('Hello');
    expect(html).toContain('cc-edit');
    expect(html).toContain('role="textbox"');
  });

  test('forwards aria-label and inline style overrides', () => {
    const html = renderToStaticMarkup(
      <InlineText
        value="Reward"
        onChange={() => {}}
        ariaLabel="Reward field"
        style={{ fontWeight: 700 }}
      />,
    );
    expect(html).toContain('aria-label="Reward field"');
    expect(html).toContain('font-weight:700');
  });
});

describe('InlineNumber render', () => {
  test('produces a numeric contenteditable span', () => {
    const html = renderToStaticMarkup(
      <InlineNumber value={42} min={1} max={99} onChange={() => {}} />,
    );
    expect(html).toContain('contenteditable="true"');
    expect(html).toContain('42');
    expect(html.toLowerCase()).toContain('inputmode="numeric"');
  });

  test('renders nullable number as empty content', () => {
    const html = renderToStaticMarkup(
      <InlineNumber value={null} min={1} max={99} nullable onChange={() => {}} />,
    );
    expect(html).toContain('contenteditable="true"');
    expect(html).not.toContain('>null<');
  });
});

describe('InlineAddRow render', () => {
  test('renders a cc-edit-ui button with the supplied label', () => {
    const html = renderToStaticMarkup(<InlineAddRow onAdd={() => {}} label="Add chore" />);
    expect(html).toContain('cc-edit-ui');
    expect(html).toContain('aria-label="Add chore"');
    expect(html).toContain('<button');
    expect(html).toContain('<svg');
  });

  test('falls back to the default aria-label when none is provided', () => {
    const html = renderToStaticMarkup(<InlineAddRow onAdd={() => {}} />);
    expect(html).toContain('aria-label="Add row"');
  });
});

describe('InlineRemoveButton render', () => {
  test('renders a cc-edit-ui button with an aria-label and svg glyph', () => {
    const html = renderToStaticMarkup(<InlineRemoveButton onRemove={() => {}} />);
    expect(html).toContain('cc-edit-ui');
    expect(html).toContain('aria-label="Remove row"');
    expect(html).toContain('<svg');
  });
});

describe('STYLE_CSS', () => {
  test('hides cc-edit-ui controls in print and removes focus chrome', () => {
    expect(STYLE_CSS).toContain('@media print');
    expect(STYLE_CSS).toContain('.cc-edit-ui');
    expect(STYLE_CSS).toContain('display:none');
    expect(STYLE_CSS).toContain('.cc-edit:focus');
    expect(STYLE_CSS).toContain('.cc-highlight-fields .cc-edit');
  });
});
