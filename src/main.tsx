import React from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './ornaments';
import { DesignCanvas, DCArtboard, DCSection } from './design-canvas';
import {
  TweakButton,
  TweakNumber,
  TweakSection,
  TweakSelect,
  TweakText,
  TweakToggle,
  TweaksPanel,
  useTweaks,
} from './tweaks-panel';
import { QuestScroll } from './v1-quest-scroll';
import { CharacterSheet } from './v2-character-sheet';
import { DungeonMap } from './v3-dungeon-map';
import { Minecraft } from './v4-minecraft';
import { Roblox } from './v5-roblox';
import { TocaBoca } from './v6-toca-boca';

const TWEAK_DEFAULTS = {
  lang: 'ru',
  heroName: 'Василиса',
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
  chore6_name: 'aaa',
  chore6_xp: 10,
  chore6_on: false,
  bonus0: 'Help with cooking',
  bonus1: 'Random act of kindness',
  bonus2: 'Extra reading chapter',
  bonus3: 'Surprise mom',
  bonus4: '',
  bonus5: '',
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

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const data = buildData(t);
  const lang = t.lang;

  return (
    <React.Fragment>
      <DesignCanvas>
        <DCSection
          id="game"
          title="Game-style Dashboards"
          subtitle="More graphics — Minecraft / Roblox / Toca Boca vibes"
        >
          <DCArtboard id="minecraft" label="D · Minecraft" width={794} height={1123}>
            <Minecraft data={data} lang={lang} />
          </DCArtboard>
          <DCArtboard id="roblox" label="E · Roblox" width={794} height={1123}>
            <Roblox data={data} lang={lang} />
          </DCArtboard>
          <DCArtboard id="toca-boca" label="F · Toca Boca" width={794} height={1123}>
            <TocaBoca data={data} lang={lang} />
          </DCArtboard>
        </DCSection>
        <DCSection
          id="rpg"
          title="RPG / Tabletop Dashboards"
          subtitle="Parchment, scrolls, character sheets"
        >
          <DCArtboard id="quest-scroll" label="A · Quest Scroll" width={794} height={1123}>
            <QuestScroll data={data} lang={lang} />
          </DCArtboard>
          <DCArtboard id="character-sheet" label="B · Character Sheet" width={794} height={1123}>
            <CharacterSheet data={data} lang={lang} />
          </DCArtboard>
          <DCArtboard id="dungeon-map" label="C · Dungeon Map" width={794} height={1123}>
            <DungeonMap data={data} lang={lang} />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="Hero" />
        <TweakSelect
          label="Language"
          value={t.lang}
          options={[
            { value: 'en', label: 'English' },
            { value: 'ru', label: 'Русский' },
            { value: 'nl', label: 'Nederlands' },
          ]}
          onChange={(v: string) => setTweak('lang', v)}
        />
        <TweakText label="Hero name" value={t.heroName} onChange={(v: string) => setTweak('heroName', v)} />
        <TweakNumber label="Level" value={t.level} min={1} max={99} onChange={(v: number) => setTweak('level', v)} />
        <TweakText label="Level title" value={t.levelName} onChange={(v: string) => setTweak('levelName', v)} />
        <TweakText label="Class title" value={t.classTitle} onChange={(v: string) => setTweak('classTitle', v)} />

        <TweakSection label="Level-up reward" />
        <TweakText label="Reward" value={t.reward} onChange={(v: string) => setTweak('reward', v)} />

        <TweakSection label="Daily quests" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ borderTop: i > 0 ? '0.5px solid rgba(0,0,0,0.08)' : 'none', paddingTop: i > 0 ? 8 : 0 }}>
            <TweakToggle
              label={`Quest ${i + 1}`}
              value={t[`chore${i}_on`]}
              onChange={(v: boolean) => setTweak(`chore${i}_on`, v)}
            />
            {t[`chore${i}_on`] && (
              <React.Fragment>
                <TweakText
                  label="Name"
                  value={t[`chore${i}_name`]}
                  onChange={(v: string) => setTweak(`chore${i}_name`, v)}
                />
                <TweakNumber
                  label="XP"
                  value={t[`chore${i}_xp`]}
                  min={1}
                  max={100}
                  onChange={(v: number) => setTweak(`chore${i}_xp`, v)}
                />
              </React.Fragment>
            )}
          </div>
        ))}

        <TweakSection label="Bonus quests" />
        <div style={{ fontSize: 10.5, color: 'rgba(41,38,27,0.7)', lineHeight: 1.5 }}>
          Empty by design — kids fill these in by hand after printing.
        </div>

        <TweakSection label="Tips" />
        <div style={{ fontSize: 10.5, color: 'rgba(41,38,27,0.7)', lineHeight: 1.5 }}>
          Print via File → Print, A4 portrait, no margins. Or use the print-ready file linked below.
        </div>
        <TweakButton
          label="Open print-ready version"
          onClick={() => window.open('Kids RPG Dashboard-print.html', '_blank')}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
