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
const { CharacterSheet } = await import('./v2-character-sheet');

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

const edit = {
  setHeroName: () => {},
  setLevel: () => {},
  setLevelName: () => {},
  setClassTitle: () => {},
  setReward: () => {},
  setChoreName: () => {},
  setChoreXp: () => {},
  toggleChoreDay: () => {},
  addChore: () => {},
  removeChore: () => {},
};

describe('CharacterSheet edit-mode wiring', () => {
  test('renders inline edit UI when `edit` is provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(CharacterSheet, { data: baseData, lang: 'en', edit }),
    );
    expect(html).toContain('cc-edit-ui');
    expect(html).toContain('aria-label="Add skill"');
    expect(html).toContain('aria-label="Remove skill 1"');
    expect(html).toContain('aria-label="Hero name"');
    expect(html).toContain('aria-label="Level"');
    expect(html).toContain('aria-label="Reward"');
    expect(html).toContain('contenteditable="true"');
  });

  test('renders no edit UI in print mode', () => {
    const html = renderToStaticMarkup(
      React.createElement(CharacterSheet, { data: baseData, lang: 'en' }),
    );
    expect(html).not.toContain('cc-edit-ui');
    expect(html).not.toContain('contenteditable="true"');
    expect(html).not.toContain('aria-label="Add skill"');
    expect(html).not.toContain('aria-label="Remove skill 1"');
    expect(html).toContain('Alex');
    expect(html).toContain('Read 30 min');
    expect(html).not.toContain('null');
  });

  test('renders localized total column as empty outlined boxes', () => {
    const html = renderToStaticMarkup(
      React.createElement(CharacterSheet, { data: baseData, lang: 'ru' }),
    );
    expect(html).toContain('Итого');
    expect(html).toContain('width:34px;height:16px;border:1px solid #3a1f15');
  });

  test('renders every supported language without crashing', () => {
    for (const lang of ['en', 'ru', 'nl', 'uk', 'de', 'fr', 'es', 'it']) {
      const html = renderToStaticMarkup(
        React.createElement(CharacterSheet, { data: baseData, lang }),
      );
      expect(html).toContain(baseData.heroName);
    }
  });

  test('hides the add-row button when chores hit the cap of 7', () => {
    const fullChores = Array.from({ length: 7 }, (_, i) => ({
      name: `Chore ${i + 1}`,
      xp: 10,
    }));
    const html = renderToStaticMarkup(
      React.createElement(CharacterSheet, {
        data: { ...baseData, chores: fullChores },
        lang: 'en',
        edit,
      }),
    );
    expect(html).not.toContain('aria-label="Add skill"');
    expect(html).toContain('aria-label="Remove skill 7"');
  });

  test('renders supplied repeated day labels for shifted/two-week grids', () => {
    const html = renderToStaticMarkup(
      React.createElement(CharacterSheet, {
        data: { ...baseData, dayLabels: ['Sun', 'Mon', 'Sun', 'Mon'] },
        lang: 'en',
      }),
    );
    expect((html.match(/Sun/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect((html.match(/Mon/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  test('renders inactive chore days as dashes and active days as checkboxes', () => {
    const html = renderToStaticMarkup(
      React.createElement(CharacterSheet, {
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
