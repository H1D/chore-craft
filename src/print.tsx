import React from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './ornaments';
import { QuestScroll } from './v1-quest-scroll';
import { CharacterSheet } from './v2-character-sheet';
import { DungeonMap } from './v3-dungeon-map';
import { Minecraft } from './v4-minecraft';
import { Roblox } from './v5-roblox';
import { TocaBoca } from './v6-toca-boca';

const TWEAK_DEFAULTS = {
  lang: 'en',
  heroName: 'Alexei',
  level: 3,
  levelName: 'The Brave',
  classTitle: 'Apprentice Scholar',
  reward: 'Build a giant pillow fort & movie night',
  chore0_name: 'Read for 30 minutes',
  chore0_xp: 20,
  chore0_on: true,
  chore1_name: 'Math practice (15 min)',
  chore1_xp: 15,
  chore1_on: true,
  chore2_name: 'Clean the kitchen',
  chore2_xp: 25,
  chore2_on: true,
  chore3_name: 'Make your bed',
  chore3_xp: 5,
  chore3_on: true,
  chore4_name: 'Practice instrument',
  chore4_xp: 15,
  chore4_on: true,
  chore5_name: 'Outdoor play (1 hr)',
  chore5_xp: 10,
  chore5_on: true,
  chore6_name: '',
  chore6_xp: 10,
  chore6_on: false,
};

function buildData(t: Record<string, any>) {
  const chores = [];
  for (let i = 0; i < 7; i++) {
    if (t[`chore${i}_on`] && t[`chore${i}_name`]) {
      chores.push({ name: t[`chore${i}_name`], xp: t[`chore${i}_xp`] });
    }
  }

  return {
    heroName: t.heroName,
    level: t.level,
    levelName: t.levelName,
    classTitle: t.classTitle,
    reward: t.reward,
    chores,
    bonus: [],
  };
}

const data = buildData(TWEAK_DEFAULTS);
const lang = TWEAK_DEFAULTS.lang;

function App() {
  return (
    <div className="print-shell">
      <div className="page-wrap"><QuestScroll data={data} lang={lang} /></div>
      <div className="page-wrap"><CharacterSheet data={data} lang={lang} /></div>
      <div className="page-wrap"><DungeonMap data={data} lang={lang} /></div>
      <div className="page-wrap"><Minecraft data={data} lang={lang} /></div>
      <div className="page-wrap"><Roblox data={data} lang={lang} /></div>
      <div className="page-wrap"><TocaBoca data={data} lang={lang} /></div>
    </div>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);

(async () => {
  try {
    await document.fonts.ready;
  } catch {
  }
  await new Promise((resolve) => setTimeout(resolve, 600));
  window.print();
})();
