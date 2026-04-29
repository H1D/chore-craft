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
import { Toolbar } from './toolbar';
import {
  CHORE_CAP,
  type Theme,
  applyKidSwitch,
  defaultStateForLang,
  listKids,
  useChoreState,
} from './state';

const THEME_COMPONENTS: Record<Theme, React.ComponentType<any>> = {
  'quest-scroll': QuestScroll,
  'character-sheet': CharacterSheet,
  'dungeon-map': DungeonMap,
  minecraft: Minecraft,
  roblox: Roblox,
  'toca-boca': TocaBoca,
};

function App() {
  const initialDefaults = React.useMemo(() => defaultStateForLang('en'), []);
  const [state, setState] = useChoreState(initialDefaults);

  const ThemeComp = THEME_COMPONENTS[state.theme] ?? QuestScroll;

  // The variants share a single `data` shape inherited from the POC; only the
  // fields actually rendered are populated. Bonus stays empty by AGENTS.md
  // hard rule. Chores are passed through 1:1 so edit-mode indices line up.
  const data = React.useMemo(
    () => ({
      heroName: state.kid,
      level: state.level,
      levelName: state.levelName,
      classTitle: state.classTitle,
      reward: state.reward,
      chores: state.chores.slice(0, CHORE_CAP).map((c) => ({ name: c.name, xp: c.xp })),
      bonus: [] as string[],
    }),
    [state],
  );

  const edit = React.useMemo(
    () => ({
      setHeroName: (v: string) => setState((prev) => applyKidSwitch(prev, v)),
      setLevel: (v: number) => setState((prev) => ({ ...prev, level: v })),
      setLevelName: (v: string) => setState((prev) => ({ ...prev, levelName: v })),
      setClassTitle: (v: string) => setState((prev) => ({ ...prev, classTitle: v })),
      setReward: (v: string) => setState((prev) => ({ ...prev, reward: v })),
      setChoreName: (i: number, v: string) =>
        setState((prev) => ({
          ...prev,
          chores: prev.chores.map((c, ci) => (ci === i ? { ...c, name: v } : c)),
        })),
      setChoreXp: (i: number, v: number) =>
        setState((prev) => ({
          ...prev,
          chores: prev.chores.map((c, ci) => (ci === i ? { ...c, xp: v } : c)),
        })),
      addChore: () =>
        setState((prev) =>
          prev.chores.length >= CHORE_CAP
            ? prev
            : { ...prev, chores: [...prev.chores, { name: '', xp: 5, on: true }] },
        ),
      removeChore: (i: number) =>
        setState((prev) => ({
          ...prev,
          chores: prev.chores.filter((_, ci) => ci !== i),
        })),
    }),
    [setState],
  );

  // Re-read kid list whenever current kid changes (storage may have grown).
  const knownKids = React.useMemo(() => listKids(), [state.kid]);

  return (
    <React.Fragment>
      <Toolbar
        kid={state.kid}
        theme={state.theme}
        lang={state.lang}
        knownKids={knownKids}
        onKidCommit={(v) => setState((prev) => applyKidSwitch(prev, v))}
        onThemeChange={(v) => setState((prev) => ({ ...prev, theme: v }))}
        onLangChange={(v) => setState((prev) => ({ ...prev, lang: v }))}
        onPrint={() => {
          if (typeof window !== 'undefined') window.print();
        }}
      />
      <div className="cc-stage">
        <div className="cc-artboard">
          <ThemeComp data={data} lang={state.lang} edit={edit} />
        </div>
      </div>
    </React.Fragment>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
