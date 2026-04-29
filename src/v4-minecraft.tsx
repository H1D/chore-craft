import React from 'react';

// Variation 4: Minecraft-style — pixel blocks, dirt/stone/grass textures, achievement banners
// A4 portrait: 794 × 1123 px

// Pixel block component — renders a block as a CSS gradient grid using box-shadows
function PixelBlock({ size = 40, kind = 'grass' }) {
  const palettes = {
    grass:    ['#5fa442', '#4a8a30', '#7a3', '#3f7027', '#7d5a3a', '#8b6a45'],
    dirt:     ['#8b6a45', '#7d5a3a', '#a17a52', '#6b4a2f', '#9c7649', '#74522e'],
    stone:    ['#9a9a9a', '#7e7e7e', '#b0b0b0', '#666', '#a4a4a4', '#888'],
    cobble:   ['#8a8a8a', '#5e5e5e', '#a8a8a8', '#454545', '#7a7a7a', '#6b6b6b'],
    wood:     ['#a87c4a', '#7d5a30', '#b88e5d', '#65461f', '#9a6c3d', '#704e28'],
    plank:    ['#c89a5e', '#a07840', '#d6a86a', '#8e6a36', '#b8884e', '#956c3a'],
    diamond:  ['#7be8ec', '#3ab8c4', '#a8f4f6', '#2d97a2', '#5dd2dc', '#33a4af'],
    gold:     ['#ffd84a', '#d8a818', '#ffe674', '#b88a00', '#f0c33a', '#c69810'],
    redstone: ['#c44536', '#8a2a1c', '#e2614f', '#641a10', '#a83327', '#761e14'],
    netherite:['#3a3340', '#22202a', '#4a4452', '#16141c', '#2e2a36', '#1c1a24'],
    emerald:  ['#3fc46a', '#1f8a44', '#5fe082', '#0e6028', '#2ea957', '#177636'],
    sand:     ['#e8d8a4', '#c8b478', '#f0e0b0', '#a89358', '#dcc88c', '#b89e62'],
  };
  const p = palettes[kind] || palettes.stone;
  // 8x8 pixel pattern keyed off a deterministic noise
  const px = size / 8;
  // Build a simple 2-tone noise pattern based on (x*7+y*3+kind) parity
  const cells = [];
  let seed = kind.charCodeAt(0) + (kind.charCodeAt(1) || 0);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const r = (seed % 100) / 100;
      let c;
      if (kind === 'grass' && y < 2) {
        c = r < 0.5 ? p[0] : (r < 0.85 ? p[1] : p[2]);
      } else if (kind === 'grass' && y === 2) {
        c = r < 0.4 ? p[0] : (r < 0.7 ? p[3] : p[4]);
      } else if (kind === 'grass') {
        c = r < 0.5 ? p[4] : (r < 0.85 ? p[3] : p[5]);
      } else {
        c = r < 0.45 ? p[0] : r < 0.75 ? p[1] : r < 0.9 ? p[2] : p[3];
      }
      cells.push(c);
    }
  }
  return (
    <div style={{
      width: size, height: size, display: 'grid',
      gridTemplateColumns: `repeat(8, 1fr)`,
      gridTemplateRows: `repeat(8, 1fr)`,
      lineHeight: 0,
      imageRendering: 'pixelated',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)',
    }}>
      {cells.map((c, i) => (
        <div key={i} style={{ background: c }} />
      ))}
    </div>
  );
}

// Pixel heart (hp icon)
function PixelHeart({ size = 16, full = true }) {
  const px = size / 9;
  const map = full ? [
    '_RR_RR_',
    'RWRRRRR',
    'RWWRRRR',
    'RRRRRRR',
    '_RRRRR_',
    '__RRR__',
    '___R___',
  ] : [
    '_##_##_',
    '#____#',
    '#____#',
    '#____#',
    '_#__#_',
    '__##__',
    '___#__',
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 7 7" shapeRendering="crispEdges">
      {map.map((row, y) => row.split('').map((ch, x) => {
        if (ch === '_') return null;
        const fill = ch === 'R' ? '#c44536' : ch === 'W' ? '#ffb3aa' : '#3a1a14';
        return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
      }))}
    </svg>
  );
}

// Pixel star (achievement)
function PixelStar({ size = 20 }) {
  const map = [
    '____Y____',
    '___YWY___',
    '___YWY___',
    'YYYYWYYYY',
    'YWWWWWWYY',
    '_YYWYYY__',
    '__YY_YY__',
    '_YY___YY_',
    'YY_____YY',
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 9 9" shapeRendering="crispEdges">
      {map.map((row, y) => row.split('').map((ch, x) => {
        if (ch === '_') return null;
        const fill = ch === 'Y' ? '#ffce3a' : '#fff7c8';
        return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
      }))}
    </svg>
  );
}

// Pixel sword
function PixelSword({ size = 64 }) {
  const map = [
    '_______BB',
    '______BWB',
    '_____BWWB',
    '____BWWBB',
    '___BWWBB_',
    '__BWWBB__',
    '_BWWBB___',
    'BWWBB_GG_',
    'BWBBGGG__',
    '_BBGG_BB_',
    'BBG___BBB',
    'BB____BBB',
    'B_____BB_',
  ];
  return (
    <svg width={size} height={size * (13/9)} viewBox="0 0 9 13" shapeRendering="crispEdges">
      {map.map((row, y) => row.split('').map((ch, x) => {
        if (ch === '_') return null;
        const fill = ch === 'B' ? '#3a3a4a' : ch === 'W' ? '#dde3ec' : ch === 'G' ? '#a87c4a' : '#000';
        return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
      }))}
    </svg>
  );
}

// Pixel pickaxe
function PixelPick({ size = 64 }) {
  const map = [
    '__BBBBBBB',
    '_B7777777',
    'B7CCCCCC7',
    '_B7777777',
    '___GG____',
    '___GG____',
    '___GG____',
    '___GG____',
    '___GG____',
    '___GG____',
    '___GG____',
  ];
  return (
    <svg width={size} height={size * (11/9)} viewBox="0 0 9 11" shapeRendering="crispEdges">
      {map.map((row, y) => row.split('').map((ch, x) => {
        if (ch === '_') return null;
        const fill = ch === 'B' ? '#1a1a26' : ch === '7' ? '#7be8ec' : ch === 'C' ? '#a8f4f6' : '#a87c4a';
        return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
      }))}
    </svg>
  );
}

// Pixel chest
function PixelChest({ size = 48 }) {
  const map = [
    '__BBBBBBBB__',
    '_B66666666B_',
    'B6CCCCCCCC6B',
    'B6C8888888CB',
    'B6C8YYYYY8CB',
    'B6C8Y####Y8B',
    'BBBBBBBBBBBB',
    'B6CCCCCCCC6B',
    'B6C8888888CB',
    'B6CCCCCCCC6B',
    'BBBBBBBBBBBB',
  ];
  return (
    <svg width={size} height={size * (11/12)} viewBox="0 0 12 11" shapeRendering="crispEdges">
      {map.map((row, y) => row.split('').map((ch, x) => {
        if (ch === '_') return null;
        const fill = ch === 'B' ? '#1a1208' : ch === '6' ? '#7d5a30' : ch === 'C' ? '#a87c4a' :
                     ch === '8' ? '#8e6a36' : ch === 'Y' ? '#ffd84a' : '#1a1208';
        return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
      }))}
    </svg>
  );
}

// XP orb
function XPOrb({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 9 9" shapeRendering="crispEdges">
      {[
        ['_GGYYGG_', 0],
        ['GYYYYYYG', 1],
        ['GYWWWYYG', 2],
        ['YWWYYYYY', 3],
        ['YYYYYYYY', 4],
        ['GYYYYYYG', 5],
        ['GGYYYYGG', 6],
        ['_GGGGGG_', 7],
      ].map(([row, y]) => row.split('').map((ch, x) => {
        if (ch === '_') return null;
        const fill = ch === 'G' ? '#3fc46a' : ch === 'Y' ? '#a8e870' : '#fff';
        return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
      }))}
    </svg>
  );
}

// Achievement banner (Minecraft toast-style)
function AchievementBanner({ title, sub, icon = 'star' }) {
  return (
    <div style={mcStyles.achievement}>
      <div style={mcStyles.achievementIcon}>
        {icon === 'star' && <PixelStar size={24} />}
        {icon === 'sword' && <PixelSword size={24} />}
        {icon === 'chest' && <PixelChest size={24} />}
      </div>
      <div>
        <div style={mcStyles.achievementSub}>{sub}</div>
        <div style={mcStyles.achievementTitle}>{title}</div>
      </div>
    </div>
  );
}

function Minecraft({ data, lang }) {
  const t = window.I18N[lang];
  const { heroName, level, levelName, chores, bonus, reward } = data;

  // Block kinds for variety in the row tile column
  const blockKinds = ['grass', 'dirt', 'stone', 'cobble', 'plank', 'diamond', 'gold'];
  const dayBlocks = ['grass', 'dirt', 'stone', 'wood', 'cobble', 'sand', 'plank'];

  return (
    <div style={mcStyles.page}>
      {/* Sky background with pixel sun */}
      <div style={mcStyles.sky}>
        <div style={mcStyles.sun}>
          <PixelBlock size={48} kind="gold" />
        </div>
        {/* Pixel clouds */}
        <div style={{ ...mcStyles.cloud, top: 24, left: 180 }}>
          <PixelCloud width={120} />
        </div>
        <div style={{ ...mcStyles.cloud, top: 50, right: 80 }}>
          <PixelCloud width={90} />
        </div>
      </div>

      {/* Ground strip */}
      <div style={mcStyles.ground}>
        {Array.from({ length: 20 }, (_, i) => (
          <PixelBlock key={i} size={40} kind={i % 3 === 0 ? 'grass' : i % 5 === 0 ? 'stone' : 'grass'} />
        ))}
      </div>

      {/* Title plaque (pixel sign) */}
      <div style={mcStyles.titlePlaque}>
        <PixelSword size={60} />
        <div style={mcStyles.titleStack}>
          <div style={mcStyles.username}>{heroName}</div>
          <div style={mcStyles.levelLine}>
            <span style={mcStyles.levelBadge}>
              <XPOrb size={14} /> {t.levelLabel} {level}
            </span>
            <span style={mcStyles.levelTitle}>· {levelName}</span>
          </div>
        </div>
        <PixelPick size={60} />
      </div>

      {/* HP / XP / hunger row (Minecraft HUD style) */}
      <div style={mcStyles.hud}>
        <div style={mcStyles.hudRow}>
          <span style={mcStyles.hudLabel}>HP</span>
          <div style={mcStyles.hudIcons}>
            {Array.from({ length: 10 }, (_, i) => <PixelHeart key={i} size={16} full />)}
          </div>
        </div>
        <div style={mcStyles.hudRow}>
          <span style={mcStyles.hudLabel}>XP</span>
          <div style={mcStyles.hudIcons}>
            {Array.from({ length: 10 }, (_, i) => <XPOrb key={i} size={16} />)}
          </div>
        </div>
        <div style={mcStyles.hudRow}>
          <span style={mcStyles.hudLabel}>★</span>
          <div style={mcStyles.hudIcons}>
            {Array.from({ length: 10 }, (_, i) => <PixelStar key={i} size={16} />)}
          </div>
        </div>
      </div>

      {/* Quest table — Minecraft inventory grid style */}
      <div style={mcStyles.invHeader}>
        <span style={mcStyles.invHeaderText}>▣ {t.dailyQuests}</span>
        <span style={mcStyles.invHeaderHint}>BLOCK = COMPLETED</span>
      </div>
      <div style={mcStyles.inventory}>
        {/* Day header */}
        <div style={mcStyles.invDayRow}>
          <div style={mcStyles.invQuestColHeader}>QUEST</div>
          <div style={mcStyles.invXpColHeader}>XP</div>
          {t.days.map((d, i) => (
            <div key={i} style={mcStyles.invDayCol}>
              <PixelBlock size={20} kind={dayBlocks[i % dayBlocks.length]} />
              <span style={mcStyles.invDayLabel}>{d}</span>
            </div>
          ))}
        </div>
        {/* Quest rows */}
        {chores.map((c, i) => (
          <div key={i} style={mcStyles.invRow}>
            <div style={mcStyles.invQuestCell}>
              <PixelBlock size={28} kind={blockKinds[i % blockKinds.length]} />
              <span style={mcStyles.invQuestText}>{c.name}</span>
            </div>
            <div style={mcStyles.invXpCell}>
              <XPOrb size={14} />
              <span>{c.xp}</span>
            </div>
            {t.days.map((_, di) => (
              <div key={di} style={mcStyles.invSlot}>
                <div style={mcStyles.invSlotInner} />
              </div>
            ))}
          </div>
        ))}
        {Array.from({ length: Math.max(0, 6 - chores.length) }, (_, i) => (
          <div key={`e${i}`} style={mcStyles.invRow}>
            <div style={mcStyles.invQuestCell}>
              <div style={{ width: 28, height: 28, border: '1.5px dashed #6b6b6b', boxSizing: 'border-box' }} />
              <span style={{ ...mcStyles.invQuestText, opacity: 0.4 }}>______________</span>
            </div>
            <div style={mcStyles.invXpCell}><span style={{ opacity: 0.4 }}>___</span></div>
            {t.days.map((_, di) => (
              <div key={di} style={mcStyles.invSlot}>
                <div style={mcStyles.invSlotInner} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bonus quests as chests */}
      <div style={mcStyles.invHeader}>
        <span style={mcStyles.invHeaderText}>⛏ {t.bonusQuests}</span>
        <span style={mcStyles.invHeaderHint}>LOOT</span>
      </div>
      <div style={mcStyles.bonusGrid}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} style={mcStyles.bonusCard}>
            <PixelChest size={40} />
            <div style={mcStyles.bonusBody}>
              <div style={mcStyles.bonusText}>
                {bonus[i] || <span style={{ opacity: 0.4 }}>______________</span>}
              </div>
              <div style={mcStyles.bonusXpLine}>
                <XPOrb size={12} />
                <span>+10 XP</span>
              </div>
            </div>
            <div style={mcStyles.bonusCheck}>
              <div style={mcStyles.bonusCheckBox} />
            </div>
          </div>
        ))}
      </div>

      {/* Boss reward — diamond block / level up */}
      <div style={mcStyles.bossRow}>
        <div style={mcStyles.bossDecor}>
          <PixelBlock size={48} kind="diamond" />
          <PixelBlock size={48} kind="emerald" />
          <PixelBlock size={48} kind="gold" />
        </div>
        <div style={mcStyles.bossPlate}>
          <div style={mcStyles.bossLabel}>★ {t.levelUpReward} ★</div>
          <div style={mcStyles.bossText}>
            {reward || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>{t.chosenBy}…</span>}
          </div>
          <div style={mcStyles.bossSign}>
            <span>{t.signature}: ____________</span>
            <span>{t.witness}: ____________</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PixelCloud({ width = 100 }) {
  return (
    <svg width={width} height={width / 3} viewBox="0 0 12 4" shapeRendering="crispEdges">
      {[
        '__####__',
        '_######_',
        '########',
        '_######_',
      ].map((row, y) => row.split('').map((ch, x) => {
        if (ch === '_') return null;
        return <rect key={`${x}-${y}`} x={x + 2} y={y} width={1} height={1} fill="rgba(255,255,255,0.85)" />;
      }))}
    </svg>
  );
}

const mcStyles = {
  page: {
    width: 794,
    height: 1123,
    background: '#7cb6f5',
    fontFamily: '"Press Start 2P", "JetBrains Mono", monospace',
    color: '#1a1208',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px 28px 28px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  sky: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(#9bcaf6 0%, #7cb6f5 60%, #87b8d8 100%)',
    pointerEvents: 'none',
  },
  sun: { position: 'absolute', top: 24, left: 32 },
  cloud: { position: 'absolute' },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    display: 'flex',
    pointerEvents: 'none',
  },
  titlePlaque: {
    position: 'relative',
    background: 'linear-gradient(#a87c4a 0%, #8e6a36 100%)',
    border: '4px solid #3a1f15',
    boxShadow: 'inset 0 4px 0 #c89a5e, inset 0 -4px 0 #6b4a2f, 0 6px 0 #1a1208',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    margin: '4px 0 14px',
  },
  titleStack: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    textShadow: '2px 2px 0 #1a1208',
  },
  username: {
    fontSize: 24,
    letterSpacing: '0.04em',
    lineHeight: 1.1,
  },
  levelLine: {
    fontSize: 11,
    marginTop: 6,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  levelBadge: {
    background: '#3fc46a',
    border: '2px solid #1a5028',
    padding: '3px 8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 10,
  },
  levelTitle: { color: '#ffe674' },
  hud: {
    background: 'rgba(0,0,0,0.55)',
    border: '3px solid #1a1208',
    boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.18), 0 4px 0 #1a1208',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginBottom: 14,
    position: 'relative',
  },
  hudRow: { display: 'flex', alignItems: 'center', gap: 10 },
  hudLabel: {
    color: '#fff',
    fontSize: 9,
    width: 18,
    textShadow: '1px 1px 0 #000',
  },
  hudIcons: { display: 'flex', gap: 1 },
  invHeader: {
    background: '#3a1f15',
    color: '#ffd84a',
    padding: '6px 12px',
    fontSize: 11,
    letterSpacing: '0.06em',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '3px solid #6b4a2f',
    borderLeft: '3px solid #6b4a2f',
    borderRight: '3px solid #1a1208',
    textShadow: '1px 1px 0 #000',
  },
  invHeaderText: { fontSize: 11 },
  invHeaderHint: { fontSize: 8, color: '#a8a8a8' },
  inventory: {
    background: '#c6c6c6',
    border: '3px solid #1a1208',
    borderTopColor: '#fff',
    borderLeftColor: '#fff',
    boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #555, 0 4px 0 #1a1208',
    padding: 10,
    marginBottom: 14,
    position: 'relative',
  },
  invDayRow: {
    display: 'grid',
    gridTemplateColumns: '1.55fr 0.45fr repeat(7, 1fr)',
    gap: 4,
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: '2px solid #555',
    alignItems: 'end',
  },
  invQuestColHeader: {
    fontSize: 9,
    color: '#3a1f15',
    paddingLeft: 4,
    display: 'flex',
    alignItems: 'center',
  },
  invXpColHeader: {
    fontSize: 9,
    color: '#3a1f15',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invDayCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  invDayLabel: {
    fontSize: 7.5,
    color: '#3a1f15',
    letterSpacing: '0.04em',
  },
  invRow: {
    display: 'grid',
    gridTemplateColumns: '1.55fr 0.45fr repeat(7, 1fr)',
    gap: 4,
    alignItems: 'center',
    padding: '3px 0',
  },
  invQuestCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
    minWidth: 0,
  },
  invQuestText: {
    fontSize: 9,
    color: '#1a1208',
    lineHeight: 1.2,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  invXpCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    fontSize: 9,
    color: '#1a5028',
  },
  invSlot: {
    width: '100%',
    height: 28,
    background: '#8b8b8b',
    boxShadow: 'inset 2px 2px 0 #555, inset -2px -2px 0 #fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invSlotInner: {
    width: '60%',
    height: '60%',
    border: '1.5px dashed rgba(0,0,0,0.3)',
  },
  bonusGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginBottom: 14,
    position: 'relative',
  },
  bonusCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#a87c4a',
    border: '3px solid #3a1f15',
    boxShadow: 'inset 0 3px 0 #c89a5e, inset 0 -3px 0 #6b4a2f, 0 3px 0 #1a1208',
    padding: '6px 10px',
  },
  bonusBody: { flex: 1 },
  bonusText: {
    color: '#fff',
    fontSize: 9,
    textShadow: '1px 1px 0 #000',
    lineHeight: 1.3,
  },
  bonusXpLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 8,
    color: '#a8e870',
    marginTop: 3,
    textShadow: '1px 1px 0 #000',
  },
  bonusCheck: {
    width: 24,
    height: 24,
    background: '#c6c6c6',
    boxShadow: 'inset 2px 2px 0 #555, inset -2px -2px 0 #fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonusCheckBox: {
    width: '70%', height: '70%',
    border: '1.5px dashed rgba(0,0,0,0.4)',
  },
  bossRow: {
    display: 'flex',
    gap: 12,
    marginTop: 'auto',
    marginBottom: 50, // leave room for ground strip
    position: 'relative',
  },
  bossDecor: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    justifyContent: 'center',
  },
  bossPlate: {
    flex: 1,
    background: 'linear-gradient(#8b2e1f 0%, #641a10 100%)',
    border: '4px solid #1a0a06',
    boxShadow: 'inset 0 4px 0 #c44536, inset 0 -4px 0 #3a1208, 0 5px 0 #1a0a06',
    padding: '12px 18px',
    color: '#fff',
    textShadow: '2px 2px 0 #1a0a06',
  },
  bossLabel: {
    fontSize: 12,
    color: '#ffd84a',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: '0.08em',
  },
  bossText: {
    fontSize: 11,
    minHeight: 20,
    lineHeight: 1.4,
    background: 'rgba(0,0,0,0.25)',
    padding: '6px 10px',
    border: '2px dashed rgba(255,216,74,0.4)',
  },
  bossSign: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 8,
    marginTop: 8,
    color: '#ffd84a',
  },
  achievement: {
    background: '#3a3a3a',
    border: '2px solid #1a1a1a',
    padding: '6px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#fff',
  },
  achievementIcon: { display: 'flex' },
  achievementSub: { fontSize: 8, color: '#ffd84a' },
  achievementTitle: { fontSize: 10 },
};

window.Minecraft = Minecraft;

export { Minecraft };
