import React from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './ornaments';
import { QuestScroll } from './v1-quest-scroll';
import { CharacterSheet } from './v2-character-sheet';
import { Toolbar } from './toolbar';
import {
  CHORE_CAP,
  type Theme,
  applyKidSwitch,
  defaultStateForLang,
  listKids,
  renameKid,
  useChoreState,
} from './state';

const THEME_COMPONENTS: Record<Theme, React.ComponentType<any>> = {
  'quest-scroll': QuestScroll,
  'character-sheet': CharacterSheet,
};

function App() {
  const initialDefaults = React.useMemo(() => defaultStateForLang('en'), []);
  const [state, setState] = useChoreState(initialDefaults);

  // stateRef gives event handlers access to the latest state without forcing
  // the `edit` object to re-build every render. Used so renameKid / applyKidSwitch
  // (which touch localStorage) run *once* in an event handler instead of inside
  // a setState updater, which React may double-invoke or replay.
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
      setHeroName: (v: string) => {
        const cur = stateRef.current;
        const next = renameKid(cur, v);
        if (next !== cur) setState(next);
      },
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
  // The persistence effect runs after render, so listKids() can lag by one
  // render after a switch/rename. Union the current kid in so the toolbar
  // datalist always reflects who's active, even pre-flush.
  const knownKids = React.useMemo(() => {
    const stored = listKids();
    if (state.kid && !stored.includes(state.kid)) {
      stored.push(state.kid);
      stored.sort();
    }
    return stored;
  }, [state.kid]);

  return (
    <React.Fragment>
      <Toolbar
        kid={state.kid}
        theme={state.theme}
        lang={state.lang}
        knownKids={knownKids}
        onKidCommit={(v) => {
          const cur = stateRef.current;
          const next = applyKidSwitch(cur, v);
          if (next === cur) return false;
          setState(next);
          return true;
        }}
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
