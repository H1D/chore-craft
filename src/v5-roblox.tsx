import React from 'react';
import { EditableNumber, EditableText, InlineAddRow, InlineRemoveButton } from './inline';
import { CHORE_CAP } from './state';

// Variation 5: Roblox-style — chunky 3D blocky avatars, vibrant primary palette, robux-coin XP
// A4 portrait: 794 × 1123 px

// Roblox-y blocky avatar (axonometric-ish, with simple shading)
function BloxAvatar({ size = 110, skin = '#ffe1b8', shirt = '#ff5a3c', pants = '#3a6df0' }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 110 143">
      <defs>
        <linearGradient id="ba-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(0,0,0,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.18)" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="55" cy="138" rx="32" ry="4" fill="rgba(0,0,0,0.18)" />
      {/* Head */}
      <g>
        <rect x="33" y="6" width="44" height="38" fill={skin} stroke="#1a0f08" strokeWidth="2" />
        <rect x="33" y="6" width="44" height="38" fill="url(#ba-shade)" />
        {/* Eyes */}
        <rect x="42" y="20" width="6" height="8" fill="#1a0f08" />
        <rect x="62" y="20" width="6" height="8" fill="#1a0f08" />
        {/* Smile */}
        <path d="M 44 32 Q 55 38 66 32" fill="none" stroke="#1a0f08" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Torso */}
      <rect x="34" y="46" width="42" height="40" fill={shirt} stroke="#1a0f08" strokeWidth="2" />
      <rect x="34" y="46" width="42" height="40" fill="url(#ba-shade)" />
      {/* Shirt detail */}
      <rect x="50" y="50" width="10" height="32" fill="rgba(0,0,0,0.15)" />
      {/* Arms */}
      <rect x="14" y="46" width="18" height="40" fill={skin} stroke="#1a0f08" strokeWidth="2" />
      <rect x="78" y="46" width="18" height="40" fill={skin} stroke="#1a0f08" strokeWidth="2" />
      <rect x="14" y="46" width="18" height="40" fill="url(#ba-shade)" />
      <rect x="78" y="46" width="18" height="40" fill="url(#ba-shade)" />
      {/* Legs */}
      <rect x="34" y="88" width="20" height="44" fill={pants} stroke="#1a0f08" strokeWidth="2" />
      <rect x="56" y="88" width="20" height="44" fill={pants} stroke="#1a0f08" strokeWidth="2" />
      <rect x="34" y="88" width="20" height="44" fill="url(#ba-shade)" />
      <rect x="56" y="88" width="20" height="44" fill="url(#ba-shade)" />
    </svg>
  );
}

// Robux-style coin (rotated cube glyph)
function RobuxCoin({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26">
      <defs>
        <linearGradient id="rb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe17e" />
          <stop offset="1" stopColor="#d4a420" />
        </linearGradient>
      </defs>
      <circle cx="13" cy="13" r="12" fill="url(#rb)" stroke="#5a3a08" strokeWidth="2" />
      <circle cx="13" cy="13" r="9" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      {/* Cube glyph — Roblox-ish */}
      <g transform="translate(13 13)">
        <polygon points="-5,-2 0,-5 5,-2 0,1" fill="#5a3a08" opacity="0.85" />
        <polygon points="-5,-2 0,1 0,6 -5,3" fill="#7a4f0a" opacity="0.85" />
        <polygon points="5,-2 0,1 0,6 5,3" fill="#3a2a05" opacity="0.85" />
      </g>
    </svg>
  );
}

// Star/badge
function BloxBadge({ size = 32, color = '#ff5a3c', label = '★' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <polygon points="16,2 19,12 30,12 21,18 24,29 16,22 8,29 11,18 2,12 13,12"
        fill={color} stroke="#1a0f08" strokeWidth="2" strokeLinejoin="round" />
      <text x="16" y="20" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff" stroke="#1a0f08" strokeWidth="0.5">{label}</text>
    </svg>
  );
}

// Block check (chunky 3D-ish)
function BloxCheck({ size = 26, filled = false, color = '#3a6df0' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26">
      <rect x="2" y="2" width="22" height="22" rx="4" fill="#fff" stroke="#1a0f08" strokeWidth="2" />
      <rect x="4" y="4" width="18" height="18" rx="3" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
      {filled && (
        <path d="M 6 13 L 11 19 L 21 7" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function Roblox({ data, lang, edit }) {
  const t = window.I18N[lang];
  const { heroName, level, levelName, chores, bonus, reward } = data;

  const palette = {
    primary: '#ff5a3c',     // brand-red
    secondary: '#3a6df0',   // deep blue
    accent: '#ffd836',      // yellow
    green: '#4ec453',
    pink: '#ff6fb3',
    purple: '#9c5dff',
    bg: '#f4f0e6',
    ink: '#1a0f08',
  };

  const choreColors = ['#ff5a3c', '#3a6df0', '#4ec453', '#ffd836', '#ff6fb3', '#9c5dff', '#ff8a3c'];

  return (
    <div style={{ ...rbStyles.page, background: palette.bg }}>
      {/* Confetti dots */}
      <ConfettiBg />

      {/* Top hero card */}
      <div style={rbStyles.heroCard}>
        <div style={rbStyles.heroAvatarWrap}>
          <BloxAvatar size={110} shirt={palette.primary} pants={palette.secondary} />
        </div>
        <div style={rbStyles.heroInfo}>
          <div style={rbStyles.heroTopRow}>
            <span style={rbStyles.heroPill}>● ONLINE</span>
            <span style={rbStyles.heroFriends}>{lang === 'ru' ? 'ИГРОК' : lang === 'nl' ? 'SPELER' : 'PLAYER'}</span>
          </div>
          <div style={rbStyles.heroName}>
            <EditableText value={heroName} onChange={edit?.setHeroName} ariaLabel="Hero name" />
          </div>
          <div style={rbStyles.heroSub}>
            "
            <EditableText
              value={levelName}
              onChange={edit?.setLevelName}
              ariaLabel="Level title"
            />
            "
          </div>
          <div style={rbStyles.heroStats}>
            <div style={rbStyles.heroStat}>
              <span style={{ ...rbStyles.heroStatNum, color: palette.primary }}>
                <EditableNumber
                  value={level}
                  min={1}
                  max={99}
                  onChange={edit?.setLevel}
                  ariaLabel="Level"
                />
              </span>
              <span style={rbStyles.heroStatLabel}>{t.levelLabel}</span>
            </div>
            <div style={rbStyles.heroStat}>
              <RobuxCoin size={20} />
              <span style={{ ...rbStyles.heroStatNum, color: '#d4a420' }}>___</span>
              <span style={rbStyles.heroStatLabel}>{t.totalXP}</span>
            </div>
            <div style={rbStyles.heroStat}>
              <span style={{ ...rbStyles.heroStatNum, color: palette.green }}>___</span>
              <span style={rbStyles.heroStatLabel}>{t.streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Big XP bar */}
      <div style={rbStyles.xpBlock}>
        <div style={rbStyles.xpHeader}>
          <span style={rbStyles.xpTitle}>⚡ {t.xpProgress}</span>
          <span style={rbStyles.xpSubtitle}>{t.levelLabel} {level} → {level + 1}</span>
        </div>
        <div style={rbStyles.xpBarOuter}>
          <div style={{ ...rbStyles.xpBarFill, width: '0%' }} />
          <div style={rbStyles.xpBarTicks}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={rbStyles.xpBarTick} />
            ))}
          </div>
          <div style={rbStyles.xpBarText}>FILL ME IN!</div>
        </div>
      </div>

      {/* Daily quests — game-style cards */}
      <div style={rbStyles.sectionHeader}>
        <span style={{ ...rbStyles.sectionPill, background: palette.primary }}>QUESTS</span>
        <span style={rbStyles.sectionTitle}>{t.dailyQuests}</span>
      </div>
      <div style={rbStyles.questGrid}>
        {/* Day header */}
        <div style={rbStyles.questHeaderRow}>
          <div style={rbStyles.questHeaderCell}>QUEST</div>
          <div style={rbStyles.questHeaderXP}>XP</div>
          {t.days.map((d, i) => (
            <div key={i} style={rbStyles.questHeaderDay}>{d}</div>
          ))}
        </div>
        {chores.map((c, i) => {
          const col = choreColors[i % choreColors.length];
          return (
            <div key={i} style={rbStyles.questRow}>
              <div style={{ ...rbStyles.questCard, borderColor: col }}>
                {edit && (
                  <InlineRemoveButton
                    onRemove={() => edit.removeChore(i)}
                    label={`Remove quest ${i + 1}`}
                  />
                )}
                <div style={{ ...rbStyles.questDot, background: col }} />
                <span style={rbStyles.questName}>
                  <EditableText
                    value={c.name}
                    onChange={edit ? (v: string) => edit.setChoreName(i, v) : undefined}
                    ariaLabel={`Quest ${i + 1} name`}
                  />
                </span>
              </div>
              <div style={rbStyles.questXp}>
                <RobuxCoin size={16} />
                <EditableNumber
                  value={c.xp}
                  min={1}
                  max={99}
                  onChange={edit ? (v: number) => edit.setChoreXp(i, v) : undefined}
                  ariaLabel={`Quest ${i + 1} XP`}
                />
              </div>
              {t.days.map((_, di) => (
                <div key={di} style={rbStyles.questCheckCell}>
                  <BloxCheck size={22} color={col} />
                </div>
              ))}
            </div>
          );
        })}
        {!edit &&
          Array.from({ length: Math.max(0, 6 - chores.length) }, (_, i) => (
            <div key={`e${i}`} style={rbStyles.questRow}>
              <div style={{ ...rbStyles.questCard, borderColor: '#ccc', opacity: 0.6 }}>
                <div style={{ ...rbStyles.questDot, background: '#ccc' }} />
                <span style={{ ...rbStyles.questName, color: '#999' }}>____________</span>
              </div>
              <div style={{ ...rbStyles.questXp, opacity: 0.4 }}>
                <RobuxCoin size={16} />
                <span>__</span>
              </div>
              {t.days.map((_, di) => (
                <div key={di} style={rbStyles.questCheckCell}>
                  <BloxCheck size={22} color="#aaa" />
                </div>
              ))}
            </div>
          ))}
        {edit && chores.length < CHORE_CAP && (
          <div style={{ ...rbStyles.questRow, gridTemplateColumns: '1fr' }}>
            <InlineAddRow onAdd={edit.addChore} label="Add quest" />
          </div>
        )}
      </div>

      {/* Bonus quests + badges */}
      <div style={rbStyles.bottomRow}>
        <div style={rbStyles.bonusBlock}>
          <div style={rbStyles.sectionHeader}>
            <span style={{ ...rbStyles.sectionPill, background: palette.secondary }}>BONUS</span>
            <span style={rbStyles.sectionTitle}>{t.bonusQuests}</span>
          </div>
          <div style={rbStyles.bonusList}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={rbStyles.bonusItem}>
                <BloxCheck size={18} color={palette.secondary} />
                <span style={rbStyles.bonusText}>
                  {bonus[i] || <span style={{ opacity: 0.35 }}>______________</span>}
                </span>
                <span style={rbStyles.bonusXp}>+____</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reward — big game-modal */}
      <div style={rbStyles.rewardModal}>
        <div style={rbStyles.rewardConfetti}>★ ◆ ★ ◆ ★ ◆ ★ ◆ ★ ◆ ★</div>
        <div style={rbStyles.rewardTitle}>🎉 {t.levelUpReward} 🎉</div>
        <div style={rbStyles.rewardBody}>
          {edit ? (
            <EditableText
              value={reward}
              onChange={edit.setReward}
              ariaLabel="Reward"
              style={{ display: 'inline-block', minWidth: '8ch' }}
            />
          ) : (
            reward || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>{t.chosenBy}…</span>
          )}
        </div>
        <div style={rbStyles.rewardSign}>
          <div style={rbStyles.signCol}>
            <div style={rbStyles.signLine}></div>
            <div style={rbStyles.signLabel}>{t.signature}</div>
          </div>
          <div style={rbStyles.signCol}>
            <div style={rbStyles.signLine}></div>
            <div style={rbStyles.signLabel}>{t.witness}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfettiBg() {
  // deterministic confetti dots
  const dots = [];
  let s = 1234;
  const colors = ['#ff5a3c', '#3a6df0', '#ffd836', '#4ec453', '#ff6fb3', '#9c5dff'];
  for (let i = 0; i < 28; i++) {
    s = (s * 9301 + 49297) % 233280;
    const x = (s / 233280) * 100;
    s = (s * 9301 + 49297) % 233280;
    const y = (s / 233280) * 100;
    s = (s * 9301 + 49297) % 233280;
    const r = ((s / 233280) * 8) + 3;
    s = (s * 9301 + 49297) % 233280;
    const c = colors[Math.floor((s / 233280) * colors.length)];
    s = (s * 9301 + 49297) % 233280;
    const rot = (s / 233280) * 60 - 30;
    dots.push({ x, y, r, c, rot });
  }
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.18 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {dots.map((d, i) => (
        <rect key={i} x={d.x} y={d.y} width={d.r * 0.5} height={d.r * 0.2} fill={d.c} transform={`rotate(${d.rot} ${d.x} ${d.y})`} />
      ))}
    </svg>
  );
}

const rbStyles = {
  page: {
    width: 794,
    height: 1123,
    fontFamily: '"Nunito", "Baloo 2", system-ui, sans-serif',
    color: '#1a0f08',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px 28px 28px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  heroCard: {
    background: '#fff',
    border: '4px solid #1a0f08',
    borderRadius: 20,
    boxShadow: '0 6px 0 #1a0f08',
    padding: '14px 18px',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: 18,
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  heroAvatarWrap: {
    background: 'linear-gradient(135deg, #cfe7ff, #e8f0ff)',
    border: '3px solid #1a0f08',
    borderRadius: 14,
    padding: 6,
    display: 'flex',
  },
  heroInfo: {},
  heroTopRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    marginBottom: 4,
  },
  heroPill: {
    background: '#4ec453',
    color: '#fff',
    fontSize: 9,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 999,
    border: '2px solid #1a0f08',
  },
  heroFriends: {
    fontSize: 9,
    fontWeight: 800,
    color: '#666',
    letterSpacing: '0.1em',
  },
  heroName: {
    fontSize: 32,
    fontWeight: 900,
    color: '#1a0f08',
    lineHeight: 1.05,
    letterSpacing: '-0.01em',
  },
  heroSub: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  heroStats: {
    display: 'flex',
    gap: 18,
    marginTop: 6,
  },
  heroStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0,
  },
  heroStatNum: {
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 1,
  },
  heroStatLabel: {
    fontSize: 8.5,
    fontWeight: 800,
    color: '#888',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  xpBlock: {
    background: '#fff',
    border: '3px solid #1a0f08',
    borderRadius: 14,
    boxShadow: '0 4px 0 #1a0f08',
    padding: '10px 14px',
    marginBottom: 14,
    position: 'relative',
  },
  xpHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  xpTitle: { fontSize: 13, fontWeight: 800, color: '#1a0f08' },
  xpSubtitle: { fontSize: 9, fontWeight: 800, color: '#888', letterSpacing: '0.12em' },
  xpBarOuter: {
    height: 26,
    background: 'linear-gradient(#eee, #ddd)',
    border: '2px solid #1a0f08',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  xpBarFill: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    background: 'linear-gradient(#3a6df0, #2c54c0)',
  },
  xpBarTicks: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
  },
  xpBarTick: {
    flex: 1,
    borderRight: '1.5px dashed rgba(0,0,0,0.25)',
  },
  xpBarText: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 10,
    color: '#1a0f08',
    letterSpacing: '0.18em',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionPill: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 900,
    padding: '4px 10px',
    borderRadius: 999,
    border: '2px solid #1a0f08',
    letterSpacing: '0.1em',
  },
  sectionTitle: { fontSize: 14, fontWeight: 800 },
  questGrid: {
    background: '#fff',
    border: '3px solid #1a0f08',
    borderRadius: 14,
    boxShadow: '0 4px 0 #1a0f08',
    padding: 10,
    marginBottom: 14,
    position: 'relative',
  },
  questHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '1.7fr 0.45fr repeat(7, 1fr)',
    gap: 4,
    alignItems: 'end',
    padding: '4px 0',
    borderBottom: '2px dashed #ccc',
  },
  questHeaderCell: {
    fontSize: 8.5,
    fontWeight: 900,
    color: '#888',
    letterSpacing: '0.12em',
    paddingLeft: 6,
  },
  questHeaderXP: {
    fontSize: 8.5,
    fontWeight: 900,
    color: '#888',
    textAlign: 'center',
    letterSpacing: '0.12em',
  },
  questHeaderDay: {
    fontSize: 8.5,
    fontWeight: 900,
    color: '#888',
    textAlign: 'center',
    letterSpacing: '0.06em',
  },
  questRow: {
    display: 'grid',
    gridTemplateColumns: '1.7fr 0.45fr repeat(7, 1fr)',
    gap: 4,
    alignItems: 'center',
    padding: '4px 0',
  },
  questCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#fafafa',
    border: '2.5px solid',
    borderRadius: 10,
    padding: '5px 10px',
    minWidth: 0,
  },
  questDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    border: '1.5px solid #1a0f08',
    flexShrink: 0,
  },
  questName: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1a0f08',
    lineHeight: 1.2,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  questXp: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    fontWeight: 800,
    fontSize: 11,
    color: '#d4a420',
  },
  questCheckCell: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRow: {
    display: 'block',
    gap: 12,
    marginBottom: 14,
  },
  bonusBlock: {},
  bonusList: {
    background: '#fff',
    border: '3px solid #1a0f08',
    borderRadius: 14,
    boxShadow: '0 4px 0 #1a0f08',
    padding: '8px 12px',
  },
  bonusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 0',
    borderBottom: '1px dashed #ddd',
    fontSize: 11,
    fontWeight: 600,
  },
  bonusText: { flex: 1, color: '#1a0f08' },
  bonusXp: { fontWeight: 900, color: '#d4a420', fontSize: 10 },
  badgeBlock: {},
  badgeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 6,
    background: '#fff',
    border: '3px solid #1a0f08',
    borderRadius: 14,
    boxShadow: '0 4px 0 #1a0f08',
    padding: '8px 10px',
  },
  badge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: 2,
  },
  badgeSub: {
    fontSize: 7.5,
    fontWeight: 900,
    color: '#666',
    letterSpacing: '0.06em',
  },
  rewardModal: {
    background: 'linear-gradient(135deg, #ffd836, #ff8a3c)',
    border: '4px solid #1a0f08',
    borderRadius: 20,
    boxShadow: '0 6px 0 #1a0f08',
    padding: '14px 20px',
    marginTop: 'auto',
    position: 'relative',
    overflow: 'hidden',
  },
  rewardConfetti: {
    fontSize: 9,
    color: '#1a0f08',
    opacity: 0.4,
    letterSpacing: '0.4em',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: 800,
  },
  rewardTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 900,
    color: '#1a0f08',
    letterSpacing: '0.04em',
    marginBottom: 8,
  },
  rewardBody: {
    background: 'rgba(255,255,255,0.7)',
    border: '2px dashed #1a0f08',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    fontWeight: 700,
    color: '#1a0f08',
    minHeight: 30,
    lineHeight: 1.3,
  },
  rewardSign: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginTop: 10,
  },
  signCol: {},
  signLine: {
    height: 0,
    borderBottom: '1.5px solid #1a0f08',
    marginBottom: 3,
  },
  signLabel: {
    fontSize: 8,
    fontWeight: 900,
    color: '#1a0f08',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
};

window.Roblox = Roblox;

export { Roblox };
