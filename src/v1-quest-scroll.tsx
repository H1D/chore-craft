import React from 'react';
import { EditableNumber, EditableText, InlineAddRow, InlineRemoveButton } from './inline';
import { CHORE_CAP } from './state';

// Variation 1: Quest Scroll
// Parchment scroll layout — quest log with daily checkbox grid + XP bars + reward seal.
// A4 portrait: 794 × 1123 px

function QuestScroll({ data, lang, edit }) {
  const t = window.I18N[lang];
  const O = window.Ornament;
  const {
    heroName,
    level,
    levelName,
    chores,
    bonus,
    reward,
    dayLabels = t.days,
    dayIndexes = t.days.map((_, i) => i),
  } = data;
  const longQuestHeader = dayLabels.length > 7;

  return (
    <div style={qsStyles.page}>
      {/* Parchment texture (subtle) */}
      <div style={qsStyles.parchment} />

      {/* Top corner ornaments */}
      <div style={{ position: 'absolute', top: 16, left: 16 }}>
        <O.Corner size={56} color="#7a3a2a" rotate={0} />
      </div>
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <O.Corner size={56} color="#7a3a2a" rotate={90} />
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
        <O.Corner size={56} color="#7a3a2a" rotate={270} />
      </div>
      <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
        <O.Corner size={56} color="#7a3a2a" rotate={180} />
      </div>

      {/* Header */}
      <div style={qsStyles.header}>
        <div style={qsStyles.heroLine}>
          <O.Diamond size={6} color="#7a3a2a" />
          <span style={qsStyles.heroLabel}>{t.heroLabel}</span>
          <EditableText
            value={heroName}
            onChange={edit?.setHeroName}
            ariaLabel="Hero name"
            style={qsStyles.heroName}
          />
          <O.Diamond size={6} color="#7a3a2a" />
        </div>
        <h1 style={qsStyles.title}>{t.questLog}</h1>
        <div style={qsStyles.subtitle}>
          {t.levelLabel}{' '}
          <EditableNumber
            value={level}
            min={1}
            max={99}
            onChange={edit?.setLevel}
            ariaLabel="Level"
          />{' '}
          ·{' '}
          <EditableText
            value={levelName}
            onChange={edit?.setLevelName}
            ariaLabel="Level title"
          />
        </div>
        <O.Divider width={420} color="#7a3a2a" />
        <div style={qsStyles.dates}>
          <span>{t.dateStarted}: <span style={qsStyles.dateBlank}>__________</span></span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{t.dateFinished}: <span style={qsStyles.dateBlank}>__________</span></span>
        </div>
      </div>

      {/* XP Master Bar */}
      <div style={qsStyles.xpSection}>
        <div style={qsStyles.xpLabelRow}>
          <span style={qsStyles.sectionLabel}>{t.xpProgress}</span>
          <span style={qsStyles.xpHint}>{t.totalXP}: ____ / ____</span>
        </div>
        <O.XPBar width={730} segments={20} filled={0} color="#7a3a2a" />
      </div>

      {/* Daily Quests Grid */}
      <div style={qsStyles.questsSection}>
        <div style={qsStyles.bannerRow}>
          <O.Banner width={260} height={36} color="#7a3a2a">
            {t.dailyQuests}
          </O.Banner>
        </div>

        <table style={qsStyles.questTable}>
          <thead>
            <tr>
              <th
                style={{
                  ...qsStyles.th,
                  width: longQuestHeader ? '31%' : '38%',
                  textAlign: 'left',
                  paddingLeft: 12,
                }}
              >
                Quest
              </th>
              <th style={{ ...qsStyles.th, width: longQuestHeader ? '7%' : '8%' }}>XP</th>
              {dayLabels.map((d, i) => (
                <th
                  key={i}
                  style={
                    longQuestHeader
                      ? { ...qsStyles.th, fontSize: 7.5, letterSpacing: '0.02em' }
                      : qsStyles.th
                  }
                >
                  {d}
                </th>
              ))}
              <th style={{ ...qsStyles.th, width: longQuestHeader ? '6%' : '7%' }}>Σ</th>
            </tr>
          </thead>
          <tbody>
            {chores.map((c, i) => (
              <tr key={i} style={qsStyles.tr}>
                <td style={qsStyles.tdQuest}>
                  {edit && (
                    <InlineRemoveButton
                      onRemove={() => edit.removeChore(i)}
                      label={`Remove quest ${i + 1}`}
                    />
                  )}
                  <span style={qsStyles.questNum}>{String(i + 1).padStart(2, '0')}</span>
                  <EditableText
                    value={c.name}
                    onChange={edit ? (v: string) => edit.setChoreName(i, v) : undefined}
                    style={qsStyles.questName}
                    ariaLabel={`Quest ${i + 1} name`}
                  />
                </td>
                <td style={qsStyles.tdXp}>
                  +
                  <EditableNumber
                    value={c.xp}
                    min={1}
                    max={99}
                    nullable
                    onChange={edit ? (v: number | null) => edit.setChoreXp(i, v) : undefined}
                    ariaLabel={`Quest ${i + 1} XP`}
                  />
                </td>
                {dayLabels.map((_, di) => (
                  <td key={di} style={qsStyles.tdCheck}>
                    <DayToggle
                      O={O}
                      active={c.days?.[dayIndexes[di] ?? di] !== false}
                      editable={!!edit?.toggleChoreDay}
                      size={longQuestHeader ? 18 : 20}
                      onToggle={() => edit.toggleChoreDay(i, dayIndexes[di] ?? di)}
                    />
                  </td>
                ))}
                <td style={qsStyles.tdSum}></td>
              </tr>
            ))}
            {/* Print mode: pad with placeholder rows so the table feels full */}
            {!edit && Array.from({ length: Math.max(0, CHORE_CAP - chores.length) }, (_, i) => (
              <tr key={`empty-${i}`} style={qsStyles.tr}>
                <td style={qsStyles.tdQuest}>
                  <span style={qsStyles.questNum}>{String(chores.length + i + 1).padStart(2, '0')}</span>
                  <span style={{ ...qsStyles.questName, opacity: 0.25 }}>_______________________</span>
                </td>
                <td style={qsStyles.tdXp}>+__</td>
                {dayLabels.map((_, di) => (
                  <td key={di} style={qsStyles.tdCheck}>
                    <O.Checkbox size={longQuestHeader ? 18 : 20} color="#5a2a1f" />
                  </td>
                ))}
                <td style={qsStyles.tdSum}></td>
              </tr>
            ))}
            {/* Edit mode: trailing add-row button, hidden when at chore cap */}
            {edit && chores.length < CHORE_CAP && (
              <tr style={qsStyles.tr}>
                <td style={qsStyles.tdQuest} colSpan={2 + dayLabels.length + 1}>
                  <InlineAddRow onAdd={edit.addChore} label="Add quest" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bonus Quests */}
      <div style={qsStyles.bonusSection}>
        <div style={qsStyles.bannerRow}>
          <O.Banner width={220} height={32} color="#3d5a4a">
            {t.bonusQuests}
          </O.Banner>
        </div>
        <div style={qsStyles.bonusGrid}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={qsStyles.bonusItem}>
              <O.Checkbox size={18} color="#3d5a4a" />
              <span style={qsStyles.bonusText}>
                {bonus[i] || <span style={{ opacity: 0.3 }}>__________________</span>}
              </span>
              <span style={qsStyles.bonusXp}>+____</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reward seal at bottom */}
      <div style={qsStyles.rewardSection}>
        <div style={qsStyles.sealWrap}>
          <O.Seal size={92} color="#7a3a2a" text={`L${level}`} />
        </div>
        <div style={qsStyles.rewardCard}>
          <div style={qsStyles.rewardLabel}>
            {t.levelUpReward}
          </div>
          <div style={qsStyles.rewardText}>
            {edit ? (
              <EditableText
                value={reward}
                onChange={edit.setReward}
                ariaLabel="Reward"
                style={{ display: 'inline-block', minWidth: '6ch' }}
              />
            ) : (
              reward || <span style={{ opacity: 0.35, fontStyle: 'italic' }}>{t.chosenBy}…</span>
            )}
          </div>
          <div style={qsStyles.rewardLines}>
            <div style={qsStyles.rewardLine}></div>
            <div style={qsStyles.rewardLine}></div>
          </div>
          <div style={qsStyles.signRow}>
            <div>
              <div style={qsStyles.signLine}></div>
              <div style={qsStyles.signLabel}>{t.signature}</div>
            </div>
            <div>
              <div style={qsStyles.signLine}></div>
              <div style={qsStyles.signLabel}>{t.witness}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DayToggle({ O, active, editable, size, onToggle }) {
  const content = active ? (
    <O.Checkbox size={size} color="#5a2a1f" />
  ) : (
    <span style={qsStyles.inactiveDay}>—</span>
  );
  if (!editable) return content;
  return (
    <button
      type="button"
      className="cc-edit"
      aria-label={active ? 'Disable chore on this day' : 'Enable chore on this day'}
      aria-pressed={active}
      onClick={onToggle}
      style={qsStyles.dayToggle}
    >
      {content}
    </button>
  );
}

const qsStyles = {
  page: {
    width: 794,
    height: 1123,
    background: 'oklch(95% 0.025 80)',
    color: 'oklch(22% 0.03 60)',
    fontFamily: '"Crimson Pro", Georgia, serif',
    position: 'relative',
    padding: '40px 48px 36px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  parchment: {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(ellipse at 30% 20%, transparent 0%, rgba(120,80,40,0.04) 60%, rgba(120,80,40,0.09) 100%),
                 radial-gradient(ellipse at 70% 80%, transparent 0%, rgba(100,60,30,0.03) 70%, rgba(100,60,30,0.07) 100%)`,
    pointerEvents: 'none',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 14,
    position: 'relative',
  },
  heroLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    letterSpacing: '0.18em',
    color: '#7a3a2a',
    textTransform: 'uppercase',
  },
  heroLabel: {
    fontWeight: 600,
  },
  heroName: {
    fontFamily: 'Cinzel, serif',
    fontSize: 14,
    letterSpacing: '0.12em',
    color: '#3a1f15',
    fontWeight: 600,
  },
  title: {
    fontFamily: 'Cinzel, serif',
    fontSize: 40,
    fontWeight: 700,
    margin: '4px 0 2px',
    color: '#3a1f15',
    letterSpacing: '0.04em',
  },
  subtitle: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11,
    letterSpacing: '0.18em',
    color: '#7a3a2a',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dates: {
    display: 'flex',
    gap: 16,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: '#5a3a2a',
    marginTop: 6,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  dateBlank: {
    fontFamily: '"Crimson Pro", serif',
    color: 'rgba(60,40,30,0.4)',
    letterSpacing: 0,
  },
  xpSection: {
    margin: '6px 0 14px',
    position: 'relative',
  },
  xpLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  sectionLabel: {
    fontFamily: 'Cinzel, serif',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#3a1f15',
  },
  xpHint: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: '#7a3a2a',
    letterSpacing: '0.1em',
  },
  questsSection: {
    marginBottom: 14,
    position: 'relative',
  },
  bannerRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 10,
  },
  questTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: '"Crimson Pro", serif',
    fontSize: 13,
    border: '1px solid #7a3a2a',
  },
  th: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#7a3a2a',
    padding: '8px 0',
    borderBottom: '1px solid #7a3a2a',
    background: 'rgba(122,58,42,0.06)',
    textAlign: 'center',
  },
  tr: {
    borderBottom: '0.5px solid rgba(122,58,42,0.3)',
  },
  tdQuest: {
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderRight: '0.5px solid rgba(122,58,42,0.25)',
  },
  questNum: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: '#7a3a2a',
    opacity: 0.6,
  },
  questName: {
    fontFamily: '"Crimson Pro", serif',
    fontSize: 13,
    color: '#2a1810',
  },
  tdXp: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: '#7a3a2a',
    textAlign: 'center',
    borderRight: '0.5px solid rgba(122,58,42,0.25)',
    fontWeight: 600,
  },
  tdCheck: {
    textAlign: 'center',
    padding: '4px 0',
    borderRight: '0.5px dashed rgba(122,58,42,0.2)',
    verticalAlign: 'middle',
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
    minWidth: 20,
    minHeight: 20,
  },
  inactiveDay: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    minHeight: 18,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13,
    color: '#7a3a2a',
    fontWeight: 600,
  },
  tdSum: {
    borderRight: 'none',
    background: 'rgba(122,58,42,0.04)',
  },
  bonusSection: {
    marginBottom: 14,
  },
  bonusGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px 24px',
    border: '0.5px solid rgba(61,90,74,0.5)',
    padding: '10px 14px',
    background: 'rgba(61,90,74,0.04)',
  },
  bonusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: '#2a3a32',
  },
  bonusText: {
    flex: 1,
    fontFamily: '"Crimson Pro", serif',
  },
  bonusXp: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: '#3d5a4a',
    fontWeight: 600,
  },
  rewardSection: {
    display: 'flex',
    gap: 16,
    alignItems: 'stretch',
    marginTop: 34,
  },
  sealWrap: {
    width: 110,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardCard: {
    flex: 1,
    border: '1.5px double #7a3a2a',
    padding: '12px 18px 14px',
    background: 'rgba(255,250,240,0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  rewardLabel: {
    fontFamily: 'Cinzel, serif',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#7a3a2a',
  },
  rewardText: {
    fontFamily: '"Crimson Pro", serif',
    fontSize: 17,
    color: '#2a1810',
    minHeight: 22,
    lineHeight: 1.3,
  },
  rewardLines: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 2,
  },
  rewardLine: {
    height: 0,
    borderBottom: '0.5px dashed rgba(122,58,42,0.5)',
  },
  signRow: {
    display: 'flex',
    gap: 24,
    marginTop: 10,
  },
  signLine: {
    width: 160,
    height: 0,
    borderBottom: '0.5px solid rgba(122,58,42,0.6)',
    marginBottom: 4,
  },
  signLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    color: '#7a3a2a',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
};

window.QuestScroll = QuestScroll;

export { QuestScroll };
