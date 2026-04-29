import React from 'react';

// Decorative SVG components — hand-drawn-feel ornaments for the RPG dashboards
// All draw with simple geometry (circles, polygons, paths). No emoji, no AI-slop icons.

const Ornament = {
  // Compass rose / star burst — for top corners of scroll
  Star: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="-12 -12 24 24" fill="none">
      <g stroke={color} strokeWidth="0.6" fill={color}>
        <polygon points="0,-10 2,-2 10,0 2,2 0,10 -2,2 -10,0 -2,-2" />
      </g>
      <circle r="1.4" fill={color} />
    </svg>
  ),

  // Filigree corner flourish (rotatable)
  Corner: ({ size = 60, color = 'currentColor', rotate = 0 }) => (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ transform: `rotate(${rotate}deg)` }}>
      <g fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round">
        <path d="M 4 4 L 56 4" />
        <path d="M 4 4 L 4 56" />
        <path d="M 8 8 Q 20 8 20 20 Q 20 8 32 8" />
        <path d="M 8 8 Q 8 20 20 20 Q 8 20 8 32" />
        <circle cx="20" cy="20" r="1.5" fill={color} />
        <path d="M 26 8 L 30 12 M 32 8 L 36 12 M 38 8 L 42 12" strokeWidth="0.5" />
        <path d="M 8 26 L 12 30 M 8 32 L 12 36 M 8 38 L 12 42" strokeWidth="0.5" />
      </g>
    </svg>
  ),

  // Wax seal placeholder
  Seal: ({ size = 80, color = '#8b2e1f', text = 'LVL' }) => (
    <svg width={size} height={size} viewBox="-50 -50 100 100">
      <defs>
        <radialGradient id="sealGrad">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <g>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const r1 = 38;
          const r2 = 44;
          return (
            <line
              key={i}
              x1={Math.cos(a) * r1}
              y1={Math.sin(a) * r1}
              x2={Math.cos(a) * r2}
              y2={Math.sin(a) * r2}
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
        <circle r="38" fill="url(#sealGrad)" />
        <circle r="32" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
        <circle r="28" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
        <text
          x="0"
          y="2"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,250,240,0.95)"
          fontFamily="Cinzel, serif"
          fontSize="14"
          fontWeight="700"
          letterSpacing="2"
        >
          {text}
        </text>
      </g>
    </svg>
  ),

  // Banner / ribbon header
  Banner: ({ width = 300, height = 60, color = '#7a3a2a', children }) => (
    <div style={{ position: 'relative', width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }}>
        <path
          d={`M 0 ${height * 0.2} L ${width * 0.08} 0 L ${width * 0.92} 0 L ${width} ${height * 0.2} L ${width} ${height * 0.8} L ${width * 0.92} ${height} L ${width * 0.08} ${height} L 0 ${height * 0.8} Z`}
          fill={color}
        />
        <path
          d={`M ${width * 0.04} ${height * 0.3} L ${width * 0.1} ${height * 0.1} L ${width * 0.9} ${height * 0.1} L ${width * 0.96} ${height * 0.3} L ${width * 0.96} ${height * 0.7} L ${width * 0.9} ${height * 0.9} L ${width * 0.1} ${height * 0.9} L ${width * 0.04} ${height * 0.7} Z`}
          fill="none"
          stroke="rgba(255,250,240,0.35)"
          strokeWidth="1"
        />
      </svg>
      <div style={{ position: 'relative', color: '#faf6ec', fontFamily: 'Cinzel, serif', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: 14 }}>
        {children}
      </div>
    </div>
  ),

  // D20 die
  D20: ({ size = 40, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="-50 -50 100 100">
      <g fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round">
        <polygon points="0,-42 36,-12 22,32 -22,32 -36,-12" fill={color} fillOpacity="0.08" />
        <polygon points="0,-42 22,32 -22,32" />
        <line x1="36" y1="-12" x2="-22" y2="32" />
        <line x1="-36" y1="-12" x2="22" y2="32" />
        <text
          x="0"
          y="14"
          textAnchor="middle"
          fill={color}
          fontFamily="Cinzel, serif"
          fontSize="22"
          fontWeight="700"
          stroke="none"
        >
          20
        </text>
      </g>
    </svg>
  ),

  // Sword (crossed)
  Swords: ({ size = 40, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="-50 -50 100 100">
      <g stroke={color} strokeWidth="3" strokeLinecap="round" fill="none">
        <line x1="-30" y1="-30" x2="30" y2="30" />
        <line x1="30" y1="-30" x2="-30" y2="30" />
        <circle cx="-30" cy="-30" r="4" fill={color} />
        <circle cx="30" cy="-30" r="4" fill={color} />
        <line x1="-38" y1="-22" x2="-22" y2="-38" strokeWidth="4" />
        <line x1="38" y1="-22" x2="22" y2="-38" strokeWidth="4" />
      </g>
    </svg>
  ),

  // Shield
  Shield: ({ size = 40, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="-50 -50 100 100">
      <path
        d="M 0 -40 L 32 -28 L 32 6 Q 32 30 0 42 Q -32 30 -32 6 L -32 -28 Z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M -16 -10 L 16 -10 M -16 10 L 16 10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),

  // Decorative divider with center diamond
  Divider: ({ width = 200, color = 'currentColor' }) => (
    <svg width={width} height={12} viewBox={`0 0 ${width} 12`}>
      <line x1="0" y1="6" x2={width / 2 - 8} y2="6" stroke={color} strokeWidth="0.6" />
      <line x1={width / 2 + 8} y1="6" x2={width} y2="6" stroke={color} strokeWidth="0.6" />
      <polygon
        points={`${width / 2},2 ${width / 2 + 5},6 ${width / 2},10 ${width / 2 - 5},6`}
        fill={color}
      />
    </svg>
  ),

  // Pixel heart (for variation 3 — but used as a small flourish)
  PixelHeart: ({ size = 16, color = '#c44536' }) => (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges">
      {[
        [1, 1], [2, 1], [5, 1], [6, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
        [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
        [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4],
        [2, 5], [3, 5], [4, 5], [5, 5],
        [3, 6], [4, 6],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="1" height="1" fill={color} />
      ))}
    </svg>
  ),

  // XP bar (the actual filled part is left empty for hand-coloring on print)
  XPBar: ({ width = 400, segments = 10, filled = 0, color = '#7a3a2a', label = 'XP' }) => (
    <svg width={width} height={32} viewBox={`0 0 ${width} 32`}>
      <rect x="0.5" y="0.5" width={width - 1} height="31" fill="rgba(255,250,240,0.4)" stroke={color} strokeWidth="1" />
      {Array.from({ length: segments }, (_, i) => {
        const w = (width - 4) / segments;
        const x = 2 + i * w;
        return (
          <g key={i}>
            <rect
              x={x}
              y="3"
              width={w - 1}
              height="26"
              fill={i < filled ? color : 'none'}
              stroke={color}
              strokeWidth="0.5"
              opacity={i < filled ? 0.85 : 0.4}
            />
          </g>
        );
      })}
    </svg>
  ),

  // Hand-drawn checkbox (square with thin double border)
  Checkbox: ({ size = 22, color = 'currentColor', filled = false }) => (
    <svg width={size} height={size} viewBox="0 0 22 22">
      <rect x="1" y="1" width="20" height="20" fill="none" stroke={color} strokeWidth="1.2" />
      <rect x="3" y="3" width="16" height="16" fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" />
      {filled && (
        <path d="M 5 11 L 9 16 L 17 6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  ),

  // Diamond bullet
  Diamond: ({ size = 8, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 8 8" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <polygon points="4,0 8,4 4,8 0,4" fill={color} />
    </svg>
  ),
};

window.Ornament = Ornament;

export { Ornament };
