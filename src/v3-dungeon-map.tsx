import React from 'react';
import { EditableNumber, EditableText, InlineAddRow, InlineRemoveButton } from './inline';
import { CHORE_CAP } from './state';

// Variation 3: Dungeon Map — quest map with rooms (each chore × day = one room)
// A4 portrait: 794 × 1123 px

function DungeonMap({ data, lang, edit }) {
  const t = window.I18N[lang];
  const O = window.Ornament;
  const { heroName, level, levelName, chores, bonus, reward } = data;

  // Map layout: each chore is a "row" of rooms (one per day). End of week = boss room.
  return (
    <div style={dmStyles.page}>
      {/* parchment haze */}
      <div style={dmStyles.haze} />

      {/* Header strip */}
      <div style={dmStyles.headerStrip}>
        <div style={dmStyles.headerLeft}>
          <div style={dmStyles.headerLabel}>{t.questMap}</div>
          <div style={dmStyles.headerTitle}>
            {t.dungeonOf}{' '}
            <EditableText value={heroName} onChange={edit?.setHeroName} ariaLabel="Hero name" />
          </div>
          <div style={dmStyles.headerSub}>
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
        </div>
        <div style={dmStyles.headerRight}>
          <O.D20 size={56} color="#7a3a2a" />
          <div style={dmStyles.headerHint}>{t.clearAllRooms}</div>
        </div>
      </div>

      {/* Day labels row */}
      <div style={dmStyles.dayRow}>
        <div style={dmStyles.dayLabel}></div>
        {t.days.map((d, i) => (
          <div key={i} style={dmStyles.dayCell}>
            <div style={dmStyles.dayDot}>{i + 1}</div>
            <div style={dmStyles.dayName}>{d}</div>
          </div>
        ))}
        <div style={dmStyles.bossLabel}>BOSS</div>
      </div>

      {/* Map: rows of rooms connected by lines */}
      <div style={dmStyles.map}>
        {chores.map((c, ri) => (
          <DungeonRow key={ri} chore={c} rowIndex={ri} t={t} edit={edit} />
        ))}
        {!edit &&
          Array.from({ length: Math.max(0, 5 - chores.length) }, (_, i) => (
            <DungeonRow
              key={`e${i}`}
              chore={{ name: '____________________', xp: '__' }}
              rowIndex={chores.length + i}
              t={t}
              placeholder
            />
          ))}
        {edit && chores.length < CHORE_CAP && (
          <div style={{ ...dmStyles.row, gridTemplateColumns: '1fr', justifyContent: 'flex-start', padding: '6px 12px' }}>
            <InlineAddRow onAdd={edit.addChore} label="Add quest" />
          </div>
        )}
      </div>

      {/* Bonus quest cards as treasure chests */}
      <div style={dmStyles.bonusSection}>
        <div style={dmStyles.bonusHeader}>
          <span style={dmStyles.bonusTitle}>{t.bonusQuests}</span>
          <span style={dmStyles.bonusRule}></span>
          <span style={dmStyles.bonusHint}>treasure</span>
        </div>
        <div style={dmStyles.bonusGrid}>
          {Array.from({ length: 4 }, (_, i) => (
            <TreasureChest key={i} text={bonus[i]} O={O} />
          ))}
        </div>
      </div>

      {/* Boss reward / level-up */}
      <div style={dmStyles.bossBlock}>
        <div style={dmStyles.bossLeft}>
          <O.Seal size={84} color="#3a1f15" text={`L${level}`} />
        </div>
        <div style={dmStyles.bossRight}>
          <div style={dmStyles.bossLabelTop}>{t.bossBattle} · {t.levelUpReward}</div>
          <div style={dmStyles.bossText}>
            {edit ? (
              <EditableText
                value={reward}
                onChange={edit.setReward}
                ariaLabel="Reward"
                style={{ display: 'inline-block', minWidth: '6ch' }}
              />
            ) : (
              reward || <span style={{ opacity: 0.3, fontStyle: 'italic' }}>{t.chosenBy}…</span>
            )}
          </div>
          <div style={dmStyles.bossLine}></div>
          <div style={dmStyles.bossLine}></div>
          <div style={dmStyles.bossSign}>
            <div>
              <div style={dmStyles.signLine}></div>
              <div style={dmStyles.signLabel}>{t.signature}</div>
            </div>
            <div>
              <div style={dmStyles.signLine}></div>
              <div style={dmStyles.signLabel}>{t.witness}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DungeonRow({ chore, rowIndex, t, placeholder, edit }) {
  const O = window.Ornament;
  const editable = !!edit && !placeholder;
  // 7 rooms + 1 boss-ending circle
  return (
    <div style={dmStyles.row}>
      <div style={{ ...dmStyles.rowName, opacity: placeholder ? 0.4 : 1 }}>
        {editable && (
          <InlineRemoveButton
            onRemove={() => edit.removeChore(rowIndex)}
            label={`Remove quest ${rowIndex + 1}`}
          />
        )}
        <span style={dmStyles.rowNum}>{String(rowIndex + 1).padStart(2, '0')}</span>
        <span style={dmStyles.rowText}>
          {editable ? (
            <EditableText
              value={chore.name}
              onChange={(v: string) => edit.setChoreName(rowIndex, v)}
              ariaLabel={`Quest ${rowIndex + 1} name`}
            />
          ) : (
            chore.name
          )}
        </span>
        <span style={dmStyles.rowXp}>
          +
          {editable ? (
            <EditableNumber
              value={chore.xp as number}
              min={1}
              max={99}
              onChange={(v: number) => edit.setChoreXp(rowIndex, v)}
              ariaLabel={`Quest ${rowIndex + 1} XP`}
            />
          ) : (
            chore.xp
          )}
        </span>
      </div>
      <div style={dmStyles.rooms}>
        {/* Connector line behind */}
        <div style={dmStyles.connector} />
        {t.days.map((_, i) => (
          <div key={i} style={dmStyles.room}>
            <O.Checkbox size={22} color="#3a1f15" />
          </div>
        ))}
        {/* Boss room — circle */}
        <div style={dmStyles.bossRoom}>
          <svg width="32" height="32" viewBox="-16 -16 32 32">
            <circle r="14" fill="none" stroke="#7a3a2a" strokeWidth="1.5" />
            <circle r="11" fill="none" stroke="#7a3a2a" strokeWidth="0.5" opacity="0.5" />
            <polygon points="0,-7 6,0 0,7 -6,0" fill="#7a3a2a" opacity="0.15" stroke="#7a3a2a" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function TreasureChest({ text, O }) {
  return (
    <div style={dmStyles.chest}>
      <div style={dmStyles.chestLid}>
        <O.Checkbox size={16} color="#3a1f15" />
      </div>
      <div style={dmStyles.chestBody}>
        <div style={dmStyles.chestText}>
          {text || <span style={{ opacity: 0.3 }}>__________________</span>}
        </div>
        <div style={dmStyles.chestXp}>+10 XP</div>
      </div>
    </div>
  );
}

const dmStyles = {
  page: {
    width: 794,
    height: 1123,
    background: 'oklch(95% 0.025 80)',
    color: 'oklch(20% 0.02 60)',
    fontFamily: '"Crimson Pro", Georgia, serif',
    padding: '32px 40px 28px',
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  haze: {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(ellipse at 20% 10%, transparent 0%, rgba(120,80,40,0.05) 70%, rgba(120,80,40,0.1) 100%)`,
    pointerEvents: 'none',
  },
  headerStrip: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 12,
    borderBottom: '1.5px solid #3a1f15',
    marginBottom: 14,
    position: 'relative',
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: 2 },
  headerLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    letterSpacing: '0.22em',
    color: '#7a3a2a',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  headerTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: 30,
    fontWeight: 700,
    color: '#1a0f08',
    letterSpacing: '0.03em',
    lineHeight: 1.05,
  },
  headerSub: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    letterSpacing: '0.16em',
    color: '#3a1f15',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  headerHint: {
    fontFamily: '"Crimson Pro", serif',
    fontStyle: 'italic',
    fontSize: 11,
    color: '#7a3a2a',
    maxWidth: 200,
    textAlign: 'right',
  },
  dayRow: {
    display: 'grid',
    gridTemplateColumns: '210px repeat(7, 1fr) 60px',
    gap: 0,
    alignItems: 'center',
    paddingBottom: 6,
    marginBottom: 4,
  },
  dayLabel: {},
  dayCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },
  dayDot: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#3a1f15',
    color: '#faf6ec',
    fontFamily: 'Cinzel, serif',
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '0.02em',
  },
  dayName: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 8,
    color: '#7a3a2a',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  bossLabel: {
    fontFamily: 'Cinzel, serif',
    fontSize: 11,
    fontWeight: 700,
    color: '#7a3a2a',
    letterSpacing: '0.18em',
    textAlign: 'center',
  },
  map: {
    border: '1px solid #3a1f15',
    background: 'rgba(255,250,240,0.5)',
    padding: '10px 0',
    marginBottom: 14,
    position: 'relative',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '210px repeat(7, 1fr) 60px',
    alignItems: 'center',
    minHeight: 38,
    borderBottom: '0.5px dashed rgba(58,31,21,0.2)',
    padding: '4px 0',
  },
  rowName: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    fontFamily: '"Crimson Pro", serif',
    fontSize: 12,
    color: '#1a0f08',
  },
  rowNum: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    color: '#7a3a2a',
    opacity: 0.6,
  },
  rowText: { flex: 1, lineHeight: 1.2 },
  rowXp: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    color: '#7a3a2a',
    fontWeight: 600,
    paddingRight: 8,
  },
  rooms: {
    gridColumn: '2 / span 8',
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr) 60px',
    alignItems: 'center',
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    top: '50%',
    height: 0,
    borderTop: '0.5px dashed rgba(122,58,42,0.5)',
    pointerEvents: 'none',
  },
  room: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'oklch(95% 0.025 80)',
    zIndex: 1,
  },
  bossRoom: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'oklch(95% 0.025 80)',
    zIndex: 1,
  },
  bonusSection: {
    marginBottom: 14,
  },
  bonusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  bonusTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#3a1f15',
  },
  bonusRule: {
    flex: 1,
    height: 0,
    borderBottom: '0.5px solid rgba(58,31,21,0.4)',
  },
  bonusHint: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: '#7a3a2a',
  },
  bonusGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  chest: {
    display: 'flex',
    border: '1px solid #3a1f15',
    background: 'rgba(255,250,240,0.4)',
  },
  chestLid: {
    width: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(122,58,42,0.08)',
    borderRight: '1px solid #3a1f15',
  },
  chestBody: {
    flex: 1,
    padding: '6px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  chestText: {
    flex: 1,
    fontFamily: '"Crimson Pro", serif',
    fontSize: 12,
    color: '#1a0f08',
  },
  chestXp: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    color: '#7a3a2a',
    fontWeight: 600,
  },
  bossBlock: {
    display: 'flex',
    gap: 16,
    border: '1.5px double #3a1f15',
    padding: '14px 18px',
    background: 'rgba(58,31,21,0.04)',
    marginTop: 'auto',
  },
  bossLeft: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bossRight: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  bossLabelTop: {
    fontFamily: 'Cinzel, serif',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#3a1f15',
  },
  bossText: {
    fontFamily: '"Crimson Pro", serif',
    fontSize: 16,
    color: '#1a0f08',
    minHeight: 22,
  },
  bossLine: {
    height: 0,
    borderBottom: '0.5px dashed rgba(58,31,21,0.5)',
    marginTop: 6,
  },
  bossSign: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 18,
    marginTop: 8,
  },
  signLine: {
    height: 0,
    borderBottom: '0.5px solid rgba(58,31,21,0.6)',
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

window.DungeonMap = DungeonMap;

export { DungeonMap };
