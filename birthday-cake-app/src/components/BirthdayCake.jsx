// 29 candles in 3 rows — positions computed to sit on the frosting ellipse
// SVG top-tier frosting: cx=155, cy=90, rx=90, ry=13
const CANDLES = [
  // Row 1 — back (7, scale 0.70)
  { x: 97,  baseY: 84, s: 0.70 },
  { x: 113, baseY: 83, s: 0.70 },
  { x: 129, baseY: 82, s: 0.70 },
  { x: 145, baseY: 82, s: 0.70 },
  { x: 161, baseY: 82, s: 0.70 },
  { x: 177, baseY: 83, s: 0.70 },
  { x: 193, baseY: 84, s: 0.70 },

  // Row 2 — middle (10, scale 0.85)
  { x: 80,  baseY: 88, s: 0.85 },
  { x: 95,  baseY: 86, s: 0.85 },
  { x: 110, baseY: 85, s: 0.85 },
  { x: 125, baseY: 84, s: 0.85 },
  { x: 140, baseY: 84, s: 0.85 },
  { x: 155, baseY: 84, s: 0.85 },
  { x: 170, baseY: 84, s: 0.85 },
  { x: 185, baseY: 85, s: 0.85 },
  { x: 200, baseY: 86, s: 0.85 },
  { x: 216, baseY: 88, s: 0.85 },

  // Row 3 — front (12, scale 1.00)
  { x: 68,  baseY: 94, s: 1.00 },
  { x: 82,  baseY: 91, s: 1.00 },
  { x: 96,  baseY: 89, s: 1.00 },
  { x: 110, baseY: 88, s: 1.00 },
  { x: 124, baseY: 87, s: 1.00 },
  { x: 138, baseY: 87, s: 1.00 },
  { x: 152, baseY: 87, s: 1.00 },
  { x: 166, baseY: 87, s: 1.00 },
  { x: 180, baseY: 88, s: 1.00 },
  { x: 194, baseY: 89, s: 1.00 },
  { x: 208, baseY: 91, s: 1.00 },
  { x: 222, baseY: 94, s: 1.00 },
]

function SmallCandle({ x, baseY, s, index, blown, blowingOut }) {
  const bw = 5.5 * s
  const bh = 24 * s
  const wh = 4 * s
  const fw = 7 * s
  const fh = 12 * s

  const bodyTop  = baseY - bh
  const wickTop  = bodyTop - wh
  const flameBase = wickTop

  const dur   = (0.22 + (index % 7) * 0.025).toFixed(3)
  const delay = (index % 5) * 55

  return (
    <g>
      <defs>
        <linearGradient id={`cside${index}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#7ec8ff" />
          <stop offset="50%"  stopColor="#2196f3" />
          <stop offset="100%" stopColor="#1565c0" />
        </linearGradient>
        <pattern id={`cst${index}`} x="0" y="0" width={bw} height={7 * s} patternUnits="userSpaceOnUse">
          <rect width={bw} height={3.5 * s} fill={`url(#cside${index})`} />
          <rect y={3.5 * s} width={bw} height={3.5 * s} fill="#1565c0" />
        </pattern>
        <radialGradient id={`fg${index}`} cx="45%" cy="75%" r="60%">
          <stop offset="0%"   stopColor="#fffde7" />
          <stop offset="30%"  stopColor="#fff176" />
          <stop offset="65%"  stopColor="#ffa726" />
          <stop offset="100%" stopColor="#f4511e" stopOpacity="0.7" />
        </radialGradient>
      </defs>

      {/* body */}
      <rect x={x - bw / 2} y={bodyTop} width={bw} height={bh} rx={bw * 0.25} fill={`url(#cst${index})`} />
      <rect x={x - bw / 2 + 0.8} y={bodyTop + 2} width={bw * 0.28} height={bh * 0.55} rx={1} fill="rgba(255,255,255,0.28)" />
      <ellipse cx={x} cy={bodyTop} rx={bw * 0.55} ry={1.5 * s} fill="rgba(255,255,255,0.6)" />

      {/* wick */}
      <line x1={x} y1={wickTop} x2={x} y2={bodyTop} stroke="#4e342e" strokeWidth={1 * s} strokeLinecap="round" />

      {/* flame */}
      {!blown && (
        <g style={{
          transformOrigin: `${x}px ${flameBase}px`,
          animation: blowingOut
            ? `blow-out 0.55s ease-in forwards`
            : `flicker ${dur}s ease-in-out ${delay}ms infinite alternate`,
          filter: `drop-shadow(0 0 ${3 * s}px #ffb300) drop-shadow(0 0 ${5 * s}px #ff6d00)`,
        }}>
          <path
            d={`M ${x} ${flameBase - fh} C ${x - fw * 0.28} ${flameBase - fh * 0.65}, ${x - fw * 0.48} ${flameBase - fh * 0.22}, ${x} ${flameBase} C ${x + fw * 0.48} ${flameBase - fh * 0.22}, ${x + fw * 0.28} ${flameBase - fh * 0.65}, ${x} ${flameBase - fh} Z`}
            fill={`url(#fg${index})`}
          />
          <ellipse cx={x} cy={flameBase - fh * 0.28} rx={fw * 0.22} ry={fh * 0.22} fill="rgba(255,255,255,0.55)" />
        </g>
      )}

      {/* smoke */}
      {blown && (
        <ellipse
          cx={x} cy={wickTop - 3}
          rx={2 * s} ry={1.2 * s}
          fill="rgba(180,180,200,0.4)"
          style={{ animation: 'smoke-rise 1.2s ease-out forwards' }}
        />
      )}
    </g>
  )
}

export default function BirthdayCake({ blownCandles, blowingOut }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', userSelect: 'none' }}>
      <svg width="310" height="225" viewBox="0 0 310 225" fill="none" style={{ overflow: 'visible' }}>
        {/* shadow + plate */}
        <ellipse cx="155" cy="216" rx="110" ry="9"  fill="rgba(0,0,0,0.08)" />
        <ellipse cx="155" cy="208" rx="110" ry="13" fill="#e8edf5" />
        <ellipse cx="155" cy="206" rx="110" ry="13" fill="#f0f4fa" />
        <ellipse cx="155" cy="203" rx="108" ry="11" fill="#dce4f0" />

        {/* bottom tier */}
        <rect x="40" y="143" width="230" height="58" rx="7" fill="#2196f3" />
        <rect x="40" y="143" width="230" height="9"  rx="7" fill="#42a5f5" />
        <line x1="40" y1="163" x2="270" y2="163" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <line x1="40" y1="180" x2="270" y2="180" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <rect x="40"  y="143" width="14" height="58" rx="5" fill="rgba(255,255,255,0.07)" />
        <rect x="256" y="143" width="14" height="58" rx="5" fill="rgba(0,0,0,0.07)" />
        <path d="M40 147 C51 147 49 159 62 158 C75 157 73 147 86 147 C99 147 97 159 110 158 C123 157 121 147 134 147 C147 147 145 159 158 158 C171 157 169 147 182 147 C195 147 193 159 206 158 C219 157 217 147 230 147 C243 147 241 159 254 158 C267 157 265 147 270 147 L270 143 L40 143 Z" fill="white" opacity="0.96" />

        {/* top tier */}
        <rect x="65"  y="90"  width="180" height="56" rx="7" fill="#1e88e5" />
        <rect x="65"  y="90"  width="180" height="9"  rx="7" fill="#42a5f5" />
        <line x1="65"  y1="109" x2="245" y2="109" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <line x1="65"  y1="126" x2="245" y2="126" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <rect x="65"  y="90"  width="13" height="56" rx="5" fill="rgba(255,255,255,0.07)" />
        <rect x="232" y="90"  width="13" height="56" rx="5" fill="rgba(0,0,0,0.07)" />

        {/* frosting */}
        <ellipse cx="155" cy="90" rx="90" ry="13" fill="white" />
        <path d="M65 94 C76 94 74 106 87 105 C100 104 98 94 111 94 C124 94 122 106 135 105 C148 104 146 94 159 94 C172 94 170 106 183 105 C196 104 194 94 207 94 C220 94 218 106 231 105 C244 104 242 94 245 94 L245 90 L65 90 Z" fill="white" opacity="0.96" />

        {/* dots */}
        {[88,104,120,136,152,168,184,200,217].map((cx, i) => (
          <circle key={i} cx={cx} cy={90} r={3} fill="#1a73e8" opacity={0.42} />
        ))}
        {[96,128,164,200].map((cx, i) => (
          <circle key={i} cx={cx} cy={86} r={2} fill="#64b5f6" opacity={0.35} />
        ))}

        {/* 29 candles */}
        {CANDLES.map((c, i) => (
          <SmallCandle
            key={i}
            index={i}
            x={c.x}
            baseY={c.baseY}
            s={c.s}
            blown={blownCandles.has(i)}
            blowingOut={blowingOut && !blownCandles.has(i)}
          />
        ))}
      </svg>
    </div>
  )
}
