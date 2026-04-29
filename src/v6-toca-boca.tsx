import React from 'react';

// Variation 6: Toca Boca-style — soft pastels, rounded shapes, cute friendly characters, sticker-feel
// A4 portrait: 794 × 1123 px

// Cute Toca-style character (round head, big eyes, simple body)
function TocaCharacter({ size = 130, hairColor = '#6b4226', skinColor = '#fdd9b5', shirtColor = '#ffadc6', dress = false }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 130 162">
      {/* Shadow */}
      <ellipse cx="65" cy="156" rx="40" ry="5" fill="rgba(0,0,0,0.1)" />
      {/* Body */}
      {dress ? (
        <path d="M 35 100 Q 30 130 22 152 L 108 152 Q 100 130 95 100 Z" fill={shirtColor} stroke="#3a2218" strokeWidth="2.5" strokeLinejoin="round" />
      ) : (
        <>
          <rect x="38" y="100" width="54" height="44" rx="8" fill={shirtColor} stroke="#3a2218" strokeWidth="2.5" />
          <rect x="40" y="140" width="22" height="14" rx="4" fill="#5a87f0" stroke="#3a2218" strokeWidth="2.5" />
          <rect x="68" y="140" width="22" height="14" rx="4" fill="#5a87f0" stroke="#3a2218" strokeWidth="2.5" />
        </>
      )}
      {/* Arms */}
      <ellipse cx="28" cy="115" rx="9" ry="22" fill={shirtColor} stroke="#3a2218" strokeWidth="2.5" />
      <ellipse cx="102" cy="115" rx="9" ry="22" fill={shirtColor} stroke="#3a2218" strokeWidth="2.5" />
      {/* Hands */}
      <circle cx="28" cy="138" r="8" fill={skinColor} stroke="#3a2218" strokeWidth="2.5" />
      <circle cx="102" cy="138" r="8" fill={skinColor} stroke="#3a2218" strokeWidth="2.5" />
      {/* Neck */}
      <rect x="58" y="92" width="14" height="12" fill={skinColor} stroke="#3a2218" strokeWidth="2" />
      {/* Hair back */}
      <path d="M 25 50 Q 20 80 30 92 L 38 88 Q 35 65 40 50 Z" fill={hairColor} stroke="#3a2218" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M 105 50 Q 110 80 100 92 L 92 88 Q 95 65 90 50 Z" fill={hairColor} stroke="#3a2218" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Head */}
      <ellipse cx="65" cy="50" rx="32" ry="36" fill={skinColor} stroke="#3a2218" strokeWidth="2.5" />
      {/* Hair top */}
      <path d="M 32 42 Q 38 14 65 12 Q 92 14 98 42 Q 88 30 65 30 Q 42 30 32 42 Z" fill={hairColor} stroke="#3a2218" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Cheeks */}
      <circle cx="46" cy="58" r="5" fill="#ff9bb5" opacity="0.7" />
      <circle cx="84" cy="58" r="5" fill="#ff9bb5" opacity="0.7" />
      {/* Eyes */}
      <circle cx="52" cy="50" r="5" fill="#3a2218" />
      <circle cx="78" cy="50" r="5" fill="#3a2218" />
      <circle cx="53.5" cy="48.5" r="1.5" fill="#fff" />
      <circle cx="79.5" cy="48.5" r="1.5" fill="#fff" />
      {/* Smile */}
      <path d="M 56 66 Q 65 73 74 66" fill="none" stroke="#3a2218" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Cute sticker — flower, heart, star, rainbow
function Sticker({ kind, size = 36, color }) {
  const c = color;
  if (kind === 'flower') {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36">
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <ellipse key={i} cx="18" cy="9" rx="6" ry="9" fill={c || '#ffadc6'} stroke="#3a2218" strokeWidth="1.5"
            transform={`rotate(${deg} 18 18)`} />
        ))}
        <circle cx="18" cy="18" r="5" fill="#ffe17e" stroke="#3a2218" strokeWidth="1.5" />
      </svg>
    );
  }
  if (kind === 'heart') {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36">
        <path d="M 18 32 Q 4 22 4 13 Q 4 6 11 6 Q 16 6 18 11 Q 20 6 25 6 Q 32 6 32 13 Q 32 22 18 32 Z"
          fill={c || '#ff6f8e'} stroke="#3a2218" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="13" cy="13" r="2" fill="rgba(255,255,255,0.6)" />
      </svg>
    );
  }
  if (kind === 'star') {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36">
        <path d="M 18 4 L 22 14 L 33 14 L 24 21 L 27 32 L 18 25 L 9 32 L 12 21 L 3 14 L 14 14 Z"
          fill={c || '#ffd836'} stroke="#3a2218" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === 'rainbow') {
    return (
      <svg width={size * 1.4} height={size} viewBox="0 0 50 36">
        <path d="M 4 32 Q 4 8 25 8 Q 46 8 46 32" fill="none" stroke="#ff6f8e" strokeWidth="4" strokeLinecap="round" />
        <path d="M 9 32 Q 9 12 25 12 Q 41 12 41 32" fill="none" stroke="#ffa84a" strokeWidth="4" strokeLinecap="round" />
        <path d="M 14 32 Q 14 16 25 16 Q 36 16 36 32" fill="none" stroke="#ffd836" strokeWidth="4" strokeLinecap="round" />
        <path d="M 19 32 Q 19 20 25 20 Q 31 20 31 32" fill="none" stroke="#7ad88f" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="6" cy="34" rx="5" ry="2.5" fill="#fff" stroke="#3a2218" strokeWidth="1.5" />
        <ellipse cx="44" cy="34" rx="5" ry="2.5" fill="#fff" stroke="#3a2218" strokeWidth="1.5" />
      </svg>
    );
  }
  if (kind === 'cloud') {
    return (
      <svg width={size * 1.3} height={size} viewBox="0 0 46 36">
        <path d="M 8 28 Q 2 28 2 22 Q 2 16 9 16 Q 9 8 17 8 Q 23 4 28 8 Q 36 8 36 16 Q 44 16 44 22 Q 44 28 38 28 Z"
          fill={c || '#fff'} stroke="#3a2218" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === 'donut') {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="14" fill="#ffadc6" stroke="#3a2218" strokeWidth="2" />
        <circle cx="18" cy="18" r="5" fill={c || '#fff5ea'} stroke="#3a2218" strokeWidth="2" />
        {/* sprinkles */}
        <line x1="10" y1="11" x2="13" y2="13" stroke="#7ad88f" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="22" y1="9" x2="25" y2="11" stroke="#5a87f0" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="27" y1="22" x2="24" y2="24" stroke="#ffd836" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="9" y1="22" x2="12" y2="24" stroke="#ff6f8e" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'icecream') {
    return (
      <svg width={size * 0.8} height={size} viewBox="0 0 28 36">
        <path d="M 14 4 Q 6 4 6 12 Q 6 18 14 22 Q 22 18 22 12 Q 22 4 14 4 Z" fill="#ffadc6" stroke="#3a2218" strokeWidth="2" />
        <circle cx="14" cy="4" r="3" fill="#ff6f8e" stroke="#3a2218" strokeWidth="1.5" />
        <path d="M 7 18 L 14 32 L 21 18 Z" fill="#e8b07a" stroke="#3a2218" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 9 20 L 13 18 M 12 24 L 16 22 M 15 28 L 19 26" stroke="#3a2218" strokeWidth="1" />
      </svg>
    );
  }
  return null;
}

// Bubble check
function BubbleCheck({ size = 28, color = '#ff6f8e' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="12" fill="#fff" stroke="#3a2218" strokeWidth="2.2" />
      <circle cx="14" cy="14" r="9" fill="none" stroke={color} strokeWidth="1.2" opacity="0.45" strokeDasharray="2 2" />
    </svg>
  );
}

function TocaBoca({ data, lang }) {
  const t = window.I18N[lang];
  const { heroName, level, levelName, chores, bonus, reward } = data;

  const dayColors = ['#ff9bb5', '#ffc36b', '#ffe17e', '#9bdb88', '#7ec8e3', '#a7a0e8', '#ffadc6'];

  return (
    <div style={tbStyles.page}>
      {/* Soft background dots */}
      <PolkaBg />
      {/* Top wavy strip */}
      <svg style={tbStyles.topWave} viewBox="0 0 794 80" preserveAspectRatio="none">
        <path d="M 0 0 L 794 0 L 794 60 Q 600 90 397 60 Q 200 30 0 60 Z" fill="#ffe9ee" />
      </svg>

      {/* Hero card */}
      <div style={tbStyles.heroRow}>
        <div style={tbStyles.charCard}>
          <TocaCharacter size={130} hairColor="#5a3a22" skinColor="#fdd9b5" shirtColor="#ffadc6" dress />
          <div style={tbStyles.charNameTag}>
            <span>{heroName}</span>
          </div>
        </div>
        <div style={tbStyles.heroCard}>
          <div style={tbStyles.heroBadgeRow}>
            <Sticker kind="star" size={36} color="#ffd836" />
            <div style={tbStyles.levelBubble}>
              <span style={tbStyles.levelBubbleSmall}>{t.levelLabel}</span>
              <span style={tbStyles.levelBubbleNum}>{level}</span>
            </div>
            <Sticker kind="heart" size={36} color="#ff6f8e" />
          </div>
          <div style={tbStyles.heroTitle}>"{levelName}"</div>
          <div style={tbStyles.heroChips}>
            <span style={{ ...tbStyles.chip, background: '#ffe17e' }}>
              <Sticker kind="star" size={16} /> {t.totalXP}: ___
            </span>
            <span style={{ ...tbStyles.chip, background: '#9bdb88' }}>
              <Sticker kind="rainbow" size={16} /> {t.streak}: ___
            </span>
          </div>
        </div>
      </div>

      {/* XP "candy" bar */}
      <div style={tbStyles.xpCard}>
        <div style={tbStyles.xpHeader}>
          <Sticker kind="rainbow" size={28} />
          <span style={tbStyles.xpLabel}>{t.xpProgress}</span>
          <span style={tbStyles.xpHint}>color me in! ✨</span>
        </div>
        <div style={tbStyles.xpBar}>
          {Array.from({ length: 12 }, (_, i) => {
            const colors = ['#ff9bb5', '#ffc36b', '#ffe17e', '#9bdb88', '#7ec8e3', '#a7a0e8'];
            return <div key={i} style={{ ...tbStyles.xpSeg, background: '#fff', borderColor: colors[i % colors.length] }} />;
          })}
        </div>
      </div>

      {/* Quest cards */}
      <div style={tbStyles.questsTitle}>
        <Sticker kind="flower" size={28} />
        <span style={tbStyles.questsTitleText}>{t.dailyQuests}</span>
        <Sticker kind="flower" size={28} color="#7ec8e3" />
      </div>

      <div style={tbStyles.questCard}>
        {/* Day labels */}
        <div style={tbStyles.dayHeaderRow}>
          <div style={tbStyles.dayHeaderLabel}></div>
          {t.days.map((d, i) => (
            <div key={i} style={tbStyles.dayHeaderCell}>
              <div style={{ ...tbStyles.dayBubble, background: dayColors[i] }}>
                {i + 1}
              </div>
              <div style={tbStyles.dayName}>{d}</div>
            </div>
          ))}
        </div>
        {chores.map((c, i) => (
          <div key={i} style={tbStyles.questRow}>
            <div style={tbStyles.questNameCell}>
              <ChoreSticker idx={i} />
              <div>
                <div style={tbStyles.questName}>{c.name}</div>
                <div style={tbStyles.questXp}>+{c.xp} ★</div>
              </div>
            </div>
            {t.days.map((_, di) => (
              <div key={di} style={tbStyles.questDayCell}>
                <BubbleCheck size={26} color={dayColors[di]} />
              </div>
            ))}
          </div>
        ))}
        {Array.from({ length: Math.max(0, 5 - chores.length) }, (_, i) => (
          <div key={`e${i}`} style={tbStyles.questRow}>
            <div style={tbStyles.questNameCell}>
              <div style={{ ...tbStyles.questIconPad, background: '#f5e7d6', borderColor: '#3a2218' }} />
              <div>
                <div style={{ ...tbStyles.questName, opacity: 0.4 }}>______________</div>
                <div style={{ ...tbStyles.questXp, opacity: 0.4 }}>+__</div>
              </div>
            </div>
            {t.days.map((_, di) => (
              <div key={di} style={tbStyles.questDayCell}>
                <BubbleCheck size={26} color={dayColors[di]} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bonus + sticker collection */}
      <div style={tbStyles.bottomRow}>
        <div style={tbStyles.bonusWrap}>
          <div style={tbStyles.bonusHeader}>
            <Sticker kind="cloud" size={22} color="#fff5ea" />
            <span style={tbStyles.bonusTitle}>{t.bonusQuests}</span>
          </div>
          <div style={tbStyles.bonusList}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={tbStyles.bonusItem}>
                <BubbleCheck size={22} color={dayColors[i % dayColors.length]} />
                <span style={tbStyles.bonusText}>
                  {bonus[i] || <span style={{ opacity: 0.35 }}>______________</span>}
                </span>
                <span style={tbStyles.bonusXp}>+10 ★</span>
              </div>
            ))}
          </div>
        </div>
        <div style={tbStyles.stickerWrap}>
          <div style={tbStyles.stickerHeader}>
            <span style={tbStyles.stickerTitle}>{lang === 'ru' ? 'Наклейки' : lang === 'nl' ? 'Stickers' : 'Sticker collection'}</span>
          </div>
          <div style={tbStyles.stickerGrid}>
            {[
              { kind: 'flower', color: '#ffadc6' },
              { kind: 'donut' },
              { kind: 'rainbow' },
              { kind: 'icecream' },
              { kind: 'star', color: '#ffd836' },
              { kind: 'heart', color: '#ff6f8e' },
              { kind: 'cloud' },
              { kind: 'flower', color: '#9bdb88' },
              { kind: 'star', color: '#7ec8e3' },
            ].map((s, i) => (
              <div key={i} style={tbStyles.stickerSlot}>
                <div style={{ opacity: 0.25 }}>
                  <Sticker kind={s.kind} size={28} color={s.color} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reward — soft cloud bubble */}
      <div style={tbStyles.rewardBubble}>
        <svg style={tbStyles.rewardSvg} viewBox="0 0 740 200" preserveAspectRatio="none">
          <path d="M 30 50 Q 30 10 70 12 Q 110 -10 160 14 Q 220 -8 280 14 Q 340 -10 400 14 Q 460 -8 520 14 Q 580 -10 630 14 Q 680 6 700 40 Q 730 60 720 100 Q 730 150 690 170 Q 660 200 600 188 Q 500 210 380 188 Q 260 210 140 188 Q 80 200 50 170 Q 10 160 14 110 Q 8 70 30 50 Z"
            fill="#fff5ea" stroke="#3a2218" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <div style={tbStyles.rewardContent}>
          <div style={tbStyles.rewardStickers}>
            <Sticker kind="icecream" size={42} />
            <Sticker kind="rainbow" size={42} />
            <Sticker kind="donut" size={42} />
          </div>
          <div style={tbStyles.rewardTitle}>{t.levelUpReward}</div>
          <div style={tbStyles.rewardText}>
            {reward || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>{t.chosenBy}…</span>}
          </div>
          <div style={tbStyles.rewardSign}>
            <span>♥ {t.signature}: __________</span>
            <span>{t.witness}: __________ ♥</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChoreSticker({ idx }) {
  const stickers = [
    { kind: 'star', color: '#ffd836' },
    { kind: 'heart', color: '#ff6f8e' },
    { kind: 'flower', color: '#ffadc6' },
    { kind: 'rainbow' },
    { kind: 'cloud', color: '#a7a0e8' },
    { kind: 'donut' },
    { kind: 'icecream' },
  ];
  const s = stickers[idx % stickers.length];
  return (
    <div style={tbStyles.questIconPad}>
      <Sticker kind={s.kind} size={26} color={s.color} />
    </div>
  );
}

function PolkaBg() {
  const dots = [];
  let s = 4321;
  const colors = ['#ffadc6', '#ffe17e', '#9bdb88', '#7ec8e3', '#a7a0e8'];
  for (let i = 0; i < 22; i++) {
    s = (s * 9301 + 49297) % 233280;
    const x = (s / 233280) * 100;
    s = (s * 9301 + 49297) % 233280;
    const y = (s / 233280) * 100;
    s = (s * 9301 + 49297) % 233280;
    const r = ((s / 233280) * 12) + 4;
    s = (s * 9301 + 49297) % 233280;
    const c = colors[Math.floor((s / 233280) * colors.length)];
    dots.push({ x, y, r, c });
  }
  return (
    <svg style={tbStyles.polka} viewBox="0 0 100 141" preserveAspectRatio="none">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r * 0.18} fill={d.c} opacity="0.3" />
      ))}
    </svg>
  );
}

const tbStyles = {
  page: {
    width: 794,
    height: 1123,
    background: '#fff5ea',
    fontFamily: '"Baloo 2", "Nunito", system-ui, sans-serif',
    color: '#3a2218',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px 28px 28px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  polka: { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' },
  topWave: { position: 'absolute', top: 0, left: 0, width: '100%', height: 80 },
  heroRow: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: 14,
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
    zIndex: 1,
  },
  charCard: {
    background: '#fff',
    border: '3px solid #3a2218',
    borderRadius: 24,
    padding: '8px 14px 4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 5px 0 #3a2218',
  },
  charNameTag: {
    background: '#ff6f8e',
    color: '#fff',
    border: '2.5px solid #3a2218',
    borderRadius: 14,
    padding: '3px 12px',
    fontSize: 13,
    fontWeight: 800,
    marginTop: -8,
    marginBottom: 4,
  },
  heroCard: {
    background: '#fff',
    border: '3px solid #3a2218',
    borderRadius: 24,
    padding: '12px 18px',
    boxShadow: '0 5px 0 #3a2218',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  heroBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  levelBubble: {
    background: '#7ec8e3',
    border: '2.5px solid #3a2218',
    borderRadius: 16,
    padding: '4px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#fff',
    flex: 1,
  },
  levelBubbleSmall: {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.18em',
  },
  levelBubbleNum: {
    fontSize: 28,
    fontWeight: 900,
    lineHeight: 0.95,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: 700,
    fontStyle: 'italic',
    color: '#3a2218',
    textAlign: 'center',
  },
  heroChips: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
    marginTop: 4,
  },
  chip: {
    border: '2px solid #3a2218',
    borderRadius: 12,
    padding: '3px 10px',
    fontSize: 11,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  xpCard: {
    background: '#fff',
    border: '3px solid #3a2218',
    borderRadius: 18,
    padding: '8px 14px',
    boxShadow: '0 4px 0 #3a2218',
    marginBottom: 12,
    position: 'relative',
    zIndex: 1,
  },
  xpHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 13,
    fontWeight: 800,
    flex: 1,
  },
  xpHint: {
    fontSize: 10,
    color: '#888',
    fontStyle: 'italic',
  },
  xpBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: 4,
    height: 24,
  },
  xpSeg: {
    border: '2px solid',
    borderRadius: 6,
  },
  questsTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
    position: 'relative',
    zIndex: 1,
  },
  questsTitleText: {
    fontSize: 18,
    fontWeight: 900,
    color: '#3a2218',
  },
  questCard: {
    background: '#fff',
    border: '3px solid #3a2218',
    borderRadius: 18,
    padding: '12px 14px',
    boxShadow: '0 4px 0 #3a2218',
    marginBottom: 12,
    position: 'relative',
    zIndex: 1,
  },
  dayHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '2fr repeat(7, 1fr)',
    gap: 4,
    marginBottom: 8,
  },
  dayHeaderLabel: {},
  dayHeaderCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  dayBubble: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    border: '2px solid #3a2218',
    color: '#3a2218',
    fontWeight: 900,
    fontSize: 11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayName: {
    fontSize: 8.5,
    fontWeight: 800,
    color: '#888',
    letterSpacing: '0.1em',
  },
  questRow: {
    display: 'grid',
    gridTemplateColumns: '2fr repeat(7, 1fr)',
    gap: 4,
    alignItems: 'center',
    padding: '5px 0',
    borderTop: '1.5px dashed #e8d4b8',
  },
  questNameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  questIconPad: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: '#fff5ea',
    border: '2px solid #3a2218',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  questName: {
    fontSize: 12,
    fontWeight: 700,
    color: '#3a2218',
    lineHeight: 1.2,
  },
  questXp: {
    fontSize: 9,
    fontWeight: 900,
    color: '#ff6f8e',
    marginTop: 1,
  },
  questDayCell: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: 12,
    marginBottom: 12,
    position: 'relative',
    zIndex: 1,
  },
  bonusWrap: {
    background: '#fff',
    border: '3px solid #3a2218',
    borderRadius: 18,
    padding: '10px 14px',
    boxShadow: '0 4px 0 #3a2218',
  },
  bonusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bonusTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: '#3a2218',
  },
  bonusList: {},
  bonusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 0',
    borderTop: '1.5px dashed #e8d4b8',
    fontSize: 12,
    fontWeight: 600,
  },
  bonusText: { flex: 1, color: '#3a2218' },
  bonusXp: { fontWeight: 900, color: '#ff6f8e', fontSize: 10 },
  stickerWrap: {
    background: '#fff',
    border: '3px solid #3a2218',
    borderRadius: 18,
    padding: '10px 12px',
    boxShadow: '0 4px 0 #3a2218',
  },
  stickerHeader: {
    textAlign: 'center',
    marginBottom: 6,
  },
  stickerTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: '#3a2218',
  },
  stickerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 6,
  },
  stickerSlot: {
    aspectRatio: '1',
    border: '2px dashed #c8a880',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff5ea',
  },
  rewardBubble: {
    position: 'relative',
    marginTop: 'auto',
    height: 200,
  },
  rewardSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  },
  rewardContent: {
    position: 'relative',
    padding: '20px 40px 18px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    boxSizing: 'border-box',
  },
  rewardStickers: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 2,
  },
  rewardTitle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 900,
    color: '#ff6f8e',
    letterSpacing: '0.04em',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: 700,
    color: '#3a2218',
    textAlign: 'center',
    minHeight: 22,
    padding: '4px 8px',
    borderBottom: '1.5px dashed #c8a880',
  },
  rewardSign: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 9,
    fontWeight: 800,
    color: '#888',
    marginTop: 4,
  },
};

window.TocaBoca = TocaBoca;

export { TocaBoca };
