import { describe, expect, test } from 'bun:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LANGS, THEMES, TOOLBAR_CSS, Toolbar } from './toolbar';

const noop = () => {};

const baseProps = {
  kid: 'Alex',
  theme: 'quest-scroll' as const,
  lang: 'en' as const,
  knownKids: ['Alex', 'Mira'],
  onKidCommit: noop,
  onThemeChange: noop,
  onLangChange: noop,
  onPrint: noop,
};

describe('Toolbar render', () => {
  test('renders kid input wired to a datalist of known kids', () => {
    const html = renderToStaticMarkup(<Toolbar {...baseProps} />);
    expect(html.toLowerCase()).toContain('list="cc-kids"');
    expect(html).toContain('<datalist id="cc-kids">');
    expect(html).toContain('<option value="Alex"');
    expect(html).toContain('<option value="Mira"');
    expect(html).toContain('aria-label="Kid name"');
    expect(html).toContain('value="Alex"');
  });

  test('renders all six theme options with the active one selected', () => {
    const html = renderToStaticMarkup(
      <Toolbar {...baseProps} theme="minecraft" />,
    );
    for (const t of THEMES) {
      expect(html).toContain(`value="${t.value}"`);
      expect(html).toContain(t.label);
    }
    // selected="" attribute on the active option
    expect(html).toMatch(/value="minecraft"\s+selected/);
  });

  test('renders all three language options with the active one selected', () => {
    const html = renderToStaticMarkup(<Toolbar {...baseProps} lang="ru" />);
    for (const l of LANGS) {
      expect(html).toContain(l.label);
    }
    expect(html).toMatch(/value="ru"\s+selected/);
  });

  test('renders a Print button', () => {
    const html = renderToStaticMarkup(<Toolbar {...baseProps} />);
    expect(html).toContain('<button');
    expect(html).toContain('aria-label="Print"');
    expect(html).toContain('>Print</button>');
  });

  test('toolbar root carries the cc-toolbar class and ARIA toolbar role', () => {
    const html = renderToStaticMarkup(<Toolbar {...baseProps} />);
    expect(html).toContain('class="cc-toolbar"');
    expect(html).toContain('role="toolbar"');
  });
});

describe('Toolbar style sheet', () => {
  test('hides the toolbar in print and styles inputs/buttons', () => {
    expect(TOOLBAR_CSS).toContain('@media print');
    expect(TOOLBAR_CSS).toContain('.cc-toolbar');
    expect(TOOLBAR_CSS).toContain('display:none');
    expect(TOOLBAR_CSS).toContain('position:fixed');
  });
});
