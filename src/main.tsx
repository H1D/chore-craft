import React from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './ornaments';
import { CharacterSheet } from './v2-character-sheet';
import { Toolbar } from './toolbar';
import {
  CHORE_DAY_COUNT,
  CHORE_CAP,
  type Theme,
  type WeekCount,
  applyKidSwitch,
  defaultStateForLang,
  listKids,
  renameKid,
  resolveChoreDays,
  toggleChoreDayMask,
  useChoreState,
} from './state';
import { I18N } from './i18n';

const THEME_COMPONENTS: Record<Theme, React.ComponentType<any>> = {
  'character-sheet': CharacterSheet,
};

function buildDayColumns(
  lang: keyof typeof I18N,
  weekStart: number,
  weekCount: WeekCount,
): { labels: string[]; indexes: number[] } {
  const days = I18N[lang].days;
  const labels: string[] = [];
  const indexes: number[] = [];
  for (let week = 0; week < weekCount; week++) {
    for (let offset = 0; offset < 7; offset++) {
      const day = (weekStart + offset) % 7;
      labels.push(days[day]);
      indexes.push(week * 7 + day);
    }
  }
  return { labels, indexes };
}

function App() {
  const initialDefaults = React.useMemo(() => defaultStateForLang('en'), []);
  const [state, setState] = useChoreState(initialDefaults);
  const [highlightFields, setHighlightFields] = React.useState(false);

  // stateRef gives event handlers access to the latest state without forcing
  // the `edit` object to re-build every render. Used so renameKid / applyKidSwitch
  // (which touch localStorage) run *once* in an event handler instead of inside
  // a setState updater, which React may double-invoke or replay.
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const ThemeComp = THEME_COMPONENTS[state.theme] ?? CharacterSheet;

  // The variants share a single `data` shape inherited from the POC; only the
  // fields actually rendered are populated. Bonus stays empty by AGENTS.md
  // hard rule. Chores are passed through 1:1 so edit-mode indices line up.
  const data = React.useMemo(
    () => {
      const dayColumns = buildDayColumns(state.lang, state.weekStart, state.weekCount);
      return {
        heroName: state.kid,
        level: state.level,
        levelName: state.levelName,
        classTitle: state.classTitle,
        reward: state.reward,
        chores: state.chores.slice(0, CHORE_CAP).map((c) => ({
          name: c.name,
          xp: c.xp,
          days: resolveChoreDays(c.days),
        })),
        bonus: [] as string[],
        dayLabels: dayColumns.labels,
        dayIndexes: dayColumns.indexes,
        weekCount: state.weekCount,
      };
    },
    [state],
  );

  const edit = React.useMemo(
    () => ({
      setHeroName: (v: string) => {
        const cur = stateRef.current;
        const next = renameKid(cur, v);
        if (next !== cur) setState(next);
      },
      setLevel: (v: number | null) => {
        if (v !== null) setState((prev) => ({ ...prev, level: v }));
      },
      setLevelName: (v: string) => setState((prev) => ({ ...prev, levelName: v })),
      setClassTitle: (v: string) => setState((prev) => ({ ...prev, classTitle: v })),
      setReward: (v: string) => setState((prev) => ({ ...prev, reward: v })),
      setChoreName: (i: number, v: string) =>
        setState((prev) => ({
          ...prev,
          chores: prev.chores.map((c, ci) => (ci === i ? { ...c, name: v } : c)),
        })),
      setChoreXp: (i: number, v: number | null) =>
        setState((prev) => ({
          ...prev,
          chores: prev.chores.map((c, ci) => (ci === i ? { ...c, xp: v } : c)),
        })),
      toggleChoreDay: (i: number, dayIndex: number) =>
        setState((prev) => ({
          ...prev,
          chores: prev.chores.map((c, ci) => {
            if (ci !== i || dayIndex < 0 || dayIndex >= CHORE_DAY_COUNT) return c;
            const days = toggleChoreDayMask(c.days, dayIndex, prev.weekCount === 1);
            return { ...c, days };
          }),
        })),
      addChore: () =>
        setState((prev) =>
          prev.chores.length >= CHORE_CAP
            ? prev
            : { ...prev, chores: [...prev.chores, { name: '', xp: null, on: true }] },
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
        lang={state.lang}
        weekStart={state.weekStart}
        weekCount={state.weekCount}
        knownKids={knownKids}
        highlightFields={highlightFields}
        onKidCommit={(v) => {
          const cur = stateRef.current;
          const next = applyKidSwitch(cur, v);
          if (next === cur) return false;
          setState(next);
          return true;
        }}
        onLangChange={(v) => setState((prev) => ({ ...prev, lang: v }))}
        onWeekStartChange={(v) => setState((prev) => ({ ...prev, weekStart: v }))}
        onWeekCountChange={(v) => setState((prev) => ({ ...prev, weekCount: v }))}
        onHighlightFieldsChange={setHighlightFields}
        onPrint={() => {
          if (typeof window !== 'undefined') window.print();
        }}
      />
      <div className="cc-stage">
        <div className={`cc-artboard${highlightFields ? ' cc-highlight-fields' : ''}`}>
          <ThemeComp data={data} lang={state.lang} edit={edit} />
        </div>
      </div>
    </React.Fragment>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
