import React from 'react';
import { EditableNumber, EditableText, InlineAddRow, InlineRemoveButton } from './inline';
import { CHORE_CAP } from './state';

// Variation 2: Character Sheet — D&D-style stat block
// A4 portrait: 794 × 1123 px

function CharacterSheet({ data, lang, edit }) {
  const t = window.I18N[lang];
  const O = window.Ornament;
  const {
    heroName,
    level,
    levelName,
    chores,
    bonus,
    reward,
    classTitle,
    dayLabels = t.days,
    dayIndexes = t.days.map((_, i) => i),
  } = data;

  // Pick a "class" derived from the chores (pure flavor)
  return (
    <div style={csStyles.page}>
      {/* Top bar with hero name + class + level */}
      <div style={csStyles.topBar}>
        <div style={csStyles.topLeft}>
          <div style={csStyles.topMicro}>{t.heroLabel}</div>
          <div style={csStyles.topName}>
            <EditableText value={heroName} onChange={edit?.setHeroName} ariaLabel="Hero name" />
          </div>
          <div style={csStyles.topClass}>
            <EditableText
              value={classTitle}
              onChange={edit?.setClassTitle}
              ariaLabel="Class title"
            />
          </div>
        </div>
        <div style={csStyles.topCenter}>
          <O.Swords size={44} color="#3a1f15" />
        </div>
        <div style={csStyles.topRight}>
          <div style={csStyles.topMicro}>{t.levelLabel}</div>
          <div style={csStyles.topLevel}>
            <EditableNumber
              value={level}
              min={1}
              max={99}
              onChange={edit?.setLevel}
              ariaLabel="Level"
            />
          </div>
          <div style={csStyles.topClass}>
            <EditableText value={levelName} onChange={edit?.setLevelName} ariaLabel="Level title" />
          </div>
        </div>
      </div>

      <div style={csStyles.titleRow}>
        <span style={csStyles.titleLine}></span>
        <span style={csStyles.title}>{t.characterSheet}</span>
        <span style={csStyles.titleLine}></span>
      </div>

      {/* Top stats: 3 stat blocks */}
      <div style={csStyles.statRow}>
        <StatBox label={t.totalXP} value="___ / ___" sub="XP" color="#7a3a2a" />
        <StatBox label={t.streak} value="___" sub="DAYS" color="#3d5a4a" />
        <StatBox label={t.achievements} value="___ / 6" sub="EARNED" color="#5a3a6a" />
      </div>

      {/* Skills (chores) */}
      <SectionHeader O={O} t={t} label={t.skills} sub={t.week} />
      <div style={csStyles.skillsBlock}>
        {chores.map((c, i) => (
          <SkillRow
            key={i}
            chore={c}
            index={i}
            t={t}
            dayLabels={dayLabels}
            dayIndexes={dayIndexes}
            edit={edit}
          />
        ))}
        {!edit &&
          Array.from({ length: Math.max(0, 6 - chores.length) }, (_, i) => (
            <SkillRow
              key={`e${i}`}
              chore={{ name: '________________________', xp: '__' }}
              index={chores.length + i}
              t={t}
              dayLabels={dayLabels}
              dayIndexes={dayIndexes}
              placeholder
            />
          ))}
        {edit && chores.length < CHORE_CAP && (
          <div style={{ ...csStyles.skillRow, justifyContent: 'flex-start' }}>
            <InlineAddRow onAdd={edit.addChore} label="Add skill" />
          </div>
        )}
      </div>

      {/* Bonus quests */}
      <SectionHeader O={O} t={t} label={t.bonusQuests} sub="One-off" />
      <div style={csStyles.bonusBlock}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={csStyles.bonusItem}>
            <O.Checkbox size={16} color="#3a1f15" />
            <span style={csStyles.bonusText}>
              {bonus[i] || <span style={{ opacity: 0.3 }}>____________________</span>}
            </span>
            <span style={csStyles.bonusXp}>+____ XP</span>
          </div>
        ))}
      </div>

      {/* XP track */}
      <SectionHeader O={O} t={t} label={t.xpProgress} sub={`${t.levelLabel} ${level} → ${level + 1}`} />
      <div style={csStyles.xpWrap}>
        <O.XPBar width={698} segments={20} filled={0} color="#7a3a2a" />
        <div style={csStyles.xpScale}>
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100%</span>
        </div>
      </div>

      {/* Level-up reward */}
      <div style={csStyles.rewardBlock}>
        <div style={csStyles.rewardHeader}>
          <O.Shield size={28} color="#7a3a2a" />
          <div>
            <div style={csStyles.rewardLabel}>{t.levelUpReward}</div>
            <div style={csStyles.rewardSub}>{t.chosenBy}</div>
          </div>
        </div>
        <div style={csStyles.rewardBody}>
          <div style={csStyles.rewardText}>
            {edit ? (
              <EditableText
                value={reward}
                onChange={edit.setReward}
                ariaLabel="Reward"
                style={{ display: 'inline-block', minWidth: '8ch' }}
              />
            ) : (
              reward || <span style={{ opacity: 0.35, fontStyle: 'italic' }}>__________________________________________________</span>
            )}
          </div>
          <div style={csStyles.rewardLine} />
          <div style={csStyles.rewardLine} />
        </div>
        <div style={csStyles.rewardSign}>
          <div>
            <div style={csStyles.signLine}></div>
            <div style={csStyles.signLabel}>{t.signature}</div>
          </div>
          <div>
            <div style={csStyles.signLine}></div>
            <div style={csStyles.signLabel}>{t.witness}</div>
          </div>
          <div>
            <div style={csStyles.signLine}></div>
            <div style={csStyles.signLabel}>{t.dateFinished}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color }) {
  return (
    <div style={{ ...csStyles.statBox, borderColor: color }}>
      <div style={{ ...csStyles.statLabel, color }}>{label}</div>
      <div style={csStyles.statValue}>{value}</div>
      <div style={{ ...csStyles.statSub, color }}>{sub}</div>
    </div>
  );
}

function SectionHeader({ O, t, label, sub }) {
  return (
    <div style={csStyles.sectionHeader}>
      <span style={csStyles.sectionLabel}>{label}</span>
      <span style={csStyles.sectionRule}></span>
      <span style={csStyles.sectionSub}>{sub}</span>
    </div>
  );
}

function SkillRow({ chore, index, t, dayLabels, dayIndexes, placeholder, edit }) {
  const O = window.Ornament;
  // proficiency tier dot — for visual richness
  const editable = !!edit && !placeholder;
  const longDays = dayLabels.length > 7;
  return (
    <div style={csStyles.skillRow}>
      <div style={csStyles.skillName}>
        {editable && (
          <InlineRemoveButton
            onRemove={() => edit.removeChore(index)}
            label={`Remove skill ${index + 1}`}
          />
        )}
        <span style={{ ...csStyles.skillBullet, opacity: placeholder ? 0.2 : 1 }}>◆</span>
        {editable ? (
          <EditableText
            value={chore.name}
            onChange={(v: string) => edit.setChoreName(index, v)}
            ariaLabel={`Skill ${index + 1} name`}
          />
        ) : (
          <span style={{ opacity: placeholder ? 0.3 : 1 }}>{chore.name}</span>
        )}
      </div>
      <div style={csStyles.skillXp}>
        {editable ? (
          <>
            +
            <EditableNumber
              value={chore.xp}
              min={1}
              max={99}
              nullable
              onChange={(v: number | null) => edit.setChoreXp(index, v)}
              ariaLabel={`Skill ${index + 1} XP`}
            />
          </>
        ) : (
          <>+{chore.xp}</>
        )}
      </div>
      <div
        style={{
          ...csStyles.skillDays,
          gridTemplateColumns: `repeat(${dayLabels.length}, ${longDays ? 24 : 32}px)`,
        }}
      >
        {dayLabels.map((d, i) => (
          <div key={i} style={csStyles.skillDayCell}>
            <div style={{ ...csStyles.skillDayLabel, fontSize: longDays ? 6.5 : 7.5 }}>
              {d}
            </div>
            <DayToggle
              O={O}
              active={chore.days?.[dayIndexes[i] ?? i] !== false}
              editable={!!edit?.toggleChoreDay && !placeholder}
              onToggle={() => edit.toggleChoreDay(index, dayIndexes[i] ?? i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function DayToggle({ O, active, editable, onToggle }) {
  const content = active ? (
    <O.Checkbox size={16} color="#3a1f15" />
  ) : (
    <span style={csStyles.inactiveDay}>—</span>
  );
  if (!editable) return content;
  return (
    <button
      type="button"
      className="cc-edit"
      aria-label={active ? 'Disable chore on this day' : 'Enable chore on this day'}
      aria-pressed={active}
      onClick={onToggle}
      style={csStyles.dayToggle}
    >
      {content}
    </button>
  );
}

const csStyles = {
  page: {
    width: 794,
    height: 1123,
    background: 'oklch(96% 0.018 80)',
    color: 'oklch(20% 0.02 60)',
    fontFamily: '"Crimson Pro", Georgia, serif',
    padding: '36px 44px 28px',
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: 24,
    paddingBottom: 14,
    borderBottom: '1.5px solid #3a1f15',
  },
  topLeft: { textAlign: 'left' },
  topRight: { textAlign: 'right' },
  topCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  topMicro: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    letterSpacing: '0.22em',
    color: '#7a3a2a',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  topName: {
    fontFamily: 'Cinzel, serif',
    fontSize: 30,
    fontWeight: 700,
    color: '#1a0f08',
    letterSpacing: '0.04em',
    lineHeight: 1.05,
  },
  topLevel: {
    fontFamily: 'Cinzel, serif',
    fontSize: 44,
    fontWeight: 700,
    color: '#7a3a2a',
    lineHeight: 1,
    letterSpacing: '0.04em',
  },
  topClass: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    letterSpacing: '0.16em',
    color: '#3a1f15',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '14px 0 12px',
  },
  titleLine: {
    flex: 1,
    height: 0,
    borderBottom: '0.5px solid rgba(58,31,21,0.4)',
  },
  title: {
    fontFamily: 'Cinzel, serif',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    color: '#3a1f15',
  },
  statRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    border: '1px solid',
    padding: '10px 14px',
    background: 'rgba(255,250,240,0.4)',
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  statValue: {
    fontFamily: 'Cinzel, serif',
    fontSize: 22,
    fontWeight: 700,
    color: '#1a0f08',
    margin: '4px 0 2px',
    letterSpacing: '0.04em',
  },
  statSub: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 8,
    letterSpacing: '0.18em',
    fontWeight: 600,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '12px 0 8px',
  },
  sectionLabel: {
    fontFamily: 'Cinzel, serif',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#3a1f15',
  },
  sectionRule: {
    flex: 1,
    height: 0,
    borderBottom: '0.5px solid rgba(58,31,21,0.4)',
  },
  sectionSub: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: '#7a3a2a',
  },
  skillsBlock: {
    border: '1px solid #3a1f15',
    background: 'rgba(255,250,240,0.4)',
    marginBottom: 14,
  },
  skillRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: 10,
    alignItems: 'center',
    padding: '6px 12px',
    borderBottom: '0.5px dashed rgba(58,31,21,0.25)',
  },
  skillName: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: '"Crimson Pro", serif',
    fontSize: 13,
    color: '#1a0f08',
    minWidth: 0,
  },
  skillBullet: { color: '#7a3a2a', fontSize: 9 },
  skillXp: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: '#7a3a2a',
    fontWeight: 600,
    minWidth: 36,
    textAlign: 'right',
  },
  skillDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 32px)',
    gap: 2,
  },
  skillDayCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },
  skillDayLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 7.5,
    letterSpacing: '0.08em',
    color: '#7a3a2a',
    textTransform: 'uppercase',
  },
  dayToggle: {
    appearance: 'none',
    border: 0,
    background: 'transparent',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 16,
    minHeight: 16,
  },
  inactiveDay: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 16,
    minHeight: 16,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12,
    color: '#7a3a2a',
    fontWeight: 700,
  },
  bonusBlock: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px 24px',
    border: '1px solid #3a1f15',
    padding: '10px 14px',
    background: 'rgba(255,250,240,0.4)',
    marginBottom: 14,
  },
  bonusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
  },
  bonusText: { flex: 1, fontFamily: '"Crimson Pro", serif' },
  bonusXp: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    color: '#7a3a2a',
    fontWeight: 600,
  },
  xpWrap: {
    marginBottom: 14,
  },
  xpScale: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 8,
    color: '#7a3a2a',
    letterSpacing: '0.1em',
    marginTop: 2,
  },
  rewardBlock: {
    border: '1.5px double #7a3a2a',
    padding: '14px 18px',
    background: 'rgba(122,58,42,0.04)',
    marginTop: 'auto',
  },
  rewardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  rewardLabel: {
    fontFamily: 'Cinzel, serif',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#7a3a2a',
  },
  rewardSub: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#3a1f15',
    opacity: 0.7,
  },
  rewardBody: { marginBottom: 10 },
  rewardText: {
    fontFamily: '"Crimson Pro", serif',
    fontSize: 16,
    color: '#1a0f08',
    minHeight: 22,
  },
  rewardLine: {
    height: 0,
    borderBottom: '0.5px dashed rgba(122,58,42,0.5)',
    marginTop: 8,
  },
  rewardSign: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 18,
  },
  signLine: {
    height: 0,
    borderBottom: '0.5px solid rgba(122,58,42,0.6)',
    marginBottom: 3,
  },
  signLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 8,
    color: '#7a3a2a',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
};

window.CharacterSheet = CharacterSheet;

export { CharacterSheet };
