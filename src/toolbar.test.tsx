import { describe, expect, test } from 'bun:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ADD_KID_VALUE, LANGS, THEMES, TOOLBAR_CSS, Toolbar } from './toolbar';

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
  test('renders kid select with known kids and add-new option', () => {
    const html = renderToStaticMarkup(<Toolbar {...baseProps} />);
    expect(html).toContain('<select');
    expect(html).toContain('class="cc-kid-select"');
    expect(html).toContain('aria-label="Kid"');
    expect(html).toMatch(/value="Alex"\s+selected/);
    expect(html).toContain('<option value="Mira"');
    expect(html).toContain(`value="${ADD_KID_VALUE}"`);
    expect(html).toContain('Add new kid...');
    expect(html).not.toContain('<datalist');
  });

  test('renders add-kid dialog markup', () => {
    const html = renderToStaticMarkup(<Toolbar {...baseProps} />);
    expect(html).toContain('<dialog');
    expect(html).toContain('class="cc-kid-dialog"');
    expect(html).toContain('Add new kid');
    expect(html).toContain('placeholder="Kid name"');
  });

  test('renders both active theme options with the active one selected', () => {
    const html = renderToStaticMarkup(
      <Toolbar {...baseProps} theme="character-sheet" />,
    );
    for (const t of THEMES) {
      expect(html).toContain(`value="${t.value}"`);
      expect(html).toContain(t.label);
    }
    // selected="" attribute on the active option
    expect(THEMES).toHaveLength(2);
    expect(html).not.toContain('value="minecraft"');
    expect(html).toMatch(/value="character-sheet"\s+selected/);
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
  test('hides the toolbar in print and styles inputs/buttons/dialog', () => {
    expect(TOOLBAR_CSS).toContain('@media print');
    expect(TOOLBAR_CSS).toContain('.cc-toolbar');
    expect(TOOLBAR_CSS).toContain('.cc-kid-dialog');
    expect(TOOLBAR_CSS).toContain('display:none');
    expect(TOOLBAR_CSS).toContain('position:fixed');
  });
});
