import { describe, expect, test } from 'bun:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ADD_KID_VALUE, LANGS, TOOLBAR_CSS, Toolbar } from './toolbar';

const noop = () => {};

const baseProps = {
  kid: 'Alex',
  lang: 'en' as const,
  weekStart: 0,
  weekCount: 1 as const,
  knownKids: ['Alex', 'Mira'],
  highlightFields: false,
  onKidCommit: noop,
  onLangChange: noop,
  onWeekStartChange: noop,
  onWeekCountChange: noop,
  onHighlightFieldsChange: noop,
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

  test('does not render a theme picker because Character Sheet is the only theme', () => {
    const html = renderToStaticMarkup(<Toolbar {...baseProps} />);
    expect(html).not.toContain('aria-label="Theme"');
    expect(html).not.toContain('Quest Scroll');
    expect(html).not.toContain('Character Sheet');
  });

  test('renders all language options with flags and the active one selected', () => {
    const html = renderToStaticMarkup(<Toolbar {...baseProps} lang="ru" />);
    for (const l of LANGS) {
      expect(html).toContain(l.label);
    }
    expect(LANGS).toHaveLength(8);
    expect(html).toContain('🇺🇦 Українська');
    expect(html).toContain('🇩🇪 Deutsch');
    expect(html).toContain('🇫🇷 Français');
    expect(html).toContain('🇪🇸 Español');
    expect(html).toContain('🇮🇹 Italiano');
    expect(html).toMatch(/value="ru"\s+selected/);
  });

  test('renders week start and week count controls', () => {
    const html = renderToStaticMarkup(<Toolbar {...baseProps} weekStart={6} weekCount={2} />);
    expect(html).toContain('aria-label="Week starts"');
    expect(html).toContain('aria-label="Weeks"');
    expect(html).toMatch(/value="6"\s+selected/);
    expect(html).toMatch(/value="2"\s+selected/);
    expect(html).toContain('Sunday');
    expect(html).toContain('2 weeks');
  });

  test('renders a Print button', () => {
    const html = renderToStaticMarkup(<Toolbar {...baseProps} />);
    expect(html).toContain('<button');
    expect(html).toContain('aria-label="Print"');
    expect(html).toContain('>Print</button>');
  });

  test('renders highlight-fields checkbox', () => {
    const html = renderToStaticMarkup(<Toolbar {...baseProps} highlightFields />);
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('aria-label="Highlight fields"');
    expect(html).toContain('checked=""');
    expect(html).toContain('Highlight fields');
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
    expect(TOOLBAR_CSS).toContain('input[type="checkbox"]');
    expect(TOOLBAR_CSS).toContain('display:none');
    expect(TOOLBAR_CSS).toContain('position:fixed');
  });
});
