import { describe, expect, test } from 'bun:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// The variants read window.I18N / window.Ornament at render time, so the
// test runtime needs `window` to point at globalThis before those modules
// load and assign their globals.
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}
await import('./i18n');
await import('./ornaments');
const { QuestScroll } = await import('./v1-quest-scroll');

const baseData = {
  heroName: 'Alex',
  level: 3,
  levelName: 'The Brave',
  classTitle: 'Apprentice Scholar',
  reward: 'Pillow fort & movie night',
  chores: [
    { name: 'Read 30 min', xp: 20 },
    { name: 'Math practice', xp: null },
  ],
  bonus: [],
};

describe('QuestScroll edit-mode wiring', () => {
  test('renders inline edit UI (remove + add buttons) when `edit` is provided', () => {
    const edit = {
      setHeroName: () => {},
      setLevel: () => {},
      setLevelName: () => {},
      setClassTitle: () => {},
      setReward: () => {},
      setChoreName: () => {},
      setChoreXp: () => {},
      addChore: () => {},
      removeChore: () => {},
    };
    const html = renderToStaticMarkup(
      React.createElement(QuestScroll, { data: baseData, lang: 'en', edit }),
    );
    expect(html).toContain('cc-edit-ui');
    expect(html).toContain('aria-label="Add quest"');
    expect(html).toContain('aria-label="Remove quest 1"');
    expect(html).toContain('aria-label="Hero name"');
    expect(html).toContain('aria-label="Level"');
    expect(html).toContain('aria-label="Reward"');
    expect(html).toContain('contenteditable="true"');
  });

  test('renders no edit UI in print mode (no `edit` prop)', () => {
    const html = renderToStaticMarkup(
      React.createElement(QuestScroll, { data: baseData, lang: 'en' }),
    );
    expect(html).not.toContain('cc-edit-ui');
    expect(html).not.toContain('contenteditable="true"');
    expect(html).not.toContain('aria-label="Add quest"');
    expect(html).not.toContain('aria-label="Remove quest 1"');
    expect(html).toContain('Alex');
    expect(html).toContain('Read 30 min');
    expect(html).not.toContain('null');
  });

  test('keeps the Dutch reward block anchored inside the printable page', () => {
    const html = renderToStaticMarkup(
      React.createElement(QuestScroll, { data: baseData, lang: 'nl' }),
    );
    expect(html).toContain('Level-Up Beloning');
    expect(html).toContain('margin-top:34px');
    expect(html).not.toContain('margin-top:auto');
  });

  test('hides the add-row button when chores hit the cap of 7', () => {
    const fullChores = Array.from({ length: 7 }, (_, i) => ({
      name: `Chore ${i + 1}`,
      xp: 10,
    }));
    const edit = {
      setHeroName: () => {},
      setLevel: () => {},
      setLevelName: () => {},
      setClassTitle: () => {},
      setReward: () => {},
      setChoreName: () => {},
      setChoreXp: () => {},
      addChore: () => {},
      removeChore: () => {},
    };
    const html = renderToStaticMarkup(
      React.createElement(QuestScroll, {
        data: { ...baseData, chores: fullChores },
        lang: 'en',
        edit,
      }),
    );
    expect(html).not.toContain('aria-label="Add quest"');
    expect(html).toContain('aria-label="Remove quest 7"');
  });

  test('renders supplied repeated day labels for shifted/two-week quest grids', () => {
    const html = renderToStaticMarkup(
      React.createElement(QuestScroll, {
        data: { ...baseData, dayLabels: ['Sun', 'Mon', 'Sun', 'Mon'] },
        lang: 'en',
      }),
    );
    expect((html.match(/Sun/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect((html.match(/Mon/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  test('renders inactive chore days as dashes and active days as checkboxes', () => {
    const html = renderToStaticMarkup(
      React.createElement(QuestScroll, {
        data: {
          ...baseData,
          chores: [{ name: 'Piano', xp: 10, days: [true, false] }],
          dayLabels: ['Mon', 'Tue'],
          dayIndexes: [0, 1],
        },
        lang: 'en',
      }),
    );
    expect(html).toContain('Piano');
    expect(html).toContain('—');
    expect(html).toContain('<svg');
  });
});
