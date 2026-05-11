interface BirthdayCakeProps {
  blownCandles: Set<number>;
  blowingOut: Set<number>;
}

// 29 candles in 3 rows, positioned on the elliptical cake top
// baseY = where the candle bottom meets the cake frosting
const CANDLE_POSITIONS: { x: number; baseY: number; scale: number }[] = [
  // Row 1 — back (7 candles, smaller/shorter for depth)
  { x: 90,  baseY: 48, scale: 0.72 },
  { x: 103, baseY: 48, scale: 0.72 },
  { x: 116, baseY: 48, scale: 0.72 },
  { x: 130, baseY: 48, scale: 0.72 },
  { x: 144, baseY: 48, scale: 0.72 },
  { x: 158, baseY: 48, scale: 0.72 },
  { x: 171, baseY: 48, scale: 0.72 },

  // Row 2 — middle (10 candles, medium)
  { x: 70,  baseY: 51, scale: 0.86 },
  { x: 83,  baseY: 51, scale: 0.86 },
  { x: 97,  baseY: 51, scale: 0.86 },
  { x: 111, baseY: 51, scale: 0.86 },
  { x: 125, baseY: 51, scale: 0.86 },
  { x: 139, baseY: 51, scale: 0.86 },
  { x: 153, baseY: 51, scale: 0.86 },
  { x: 167, baseY: 51, scale: 0.86 },
  { x: 181, baseY: 51, scale: 0.86 },
  { x: 195, baseY: 51, scale: 0.86 },

  // Row 3 — front (12 candles, full size)
  { x: 62,  baseY: 54, scale: 1 },
  { x: 75,  baseY: 54, scale: 1 },
  { x: 88,  baseY: 54, scale: 1 },
  { x: 101, baseY: 54, scale: 1 },
  { x: 114, baseY: 54, scale: 1 },
  { x: 127, baseY: 54, scale: 1 },
  { x: 140, baseY: 54, scale: 1 },
  { x: 153, baseY: 54, scale: 1 },
  { x: 166, baseY: 54, scale: 1 },
  { x: 179, baseY: 54, scale: 1 },
  { x: 192, baseY: 54, scale: 1 },
  { x: 205, baseY: 54, scale: 1 },
];

function CandleSVG({
  x, baseY, scale, index, blown, blowingOut,
}: {
  x: number; baseY: number; scale: number;
  index: number; blown: boolean; blowingOut: boolean;
}) {
  const bodyW = 5 * scale;
  const bodyH = 22 * scale;
  const flameW = 7 * scale;
  const flameH = 11 * scale;
  const wickH = 4 * scale;

  // Candle body top y (candle goes up from baseY)
  const bodyTopY = baseY - bodyH;
  const wickTopY = bodyTopY - wickH;
  const flameBaseY = wickTopY;

  const delayMs = (index % 5) * 60;

  return (
    <g key={index}>
      {/* Candle body — striped blue */}
      <defs>
        <linearGradient id={`cg${index}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5ab3ff" />
          <stop offset="40%" stopColor="#3399ff" />
          <stop offset="100%" stopColor="#1a73e8" />
        </linearGradient>
        <pattern id={`cp${index}`} x="0" y="0" width="4" height={6 * scale} patternUnits="userSpaceOnUse">
          <rect width="4" height={3 * scale} fill={`url(#cg${index})`} />
          <rect y={3 * scale} width="4" height={3 * scale} fill="#1565c0" />
        </pattern>
        <radialGradient id={`fg${index}`} cx="50%" cy="80%" r="55%">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="35%" stopColor="#ffee58" />
          <stop offset="65%" stopColor="#ffa726" />
          <stop offset="100%" stopColor="#ff5722" stopOpacity="0.8" />
        </radialGradient>
      </defs>

      <rect
        x={x - bodyW / 2}
        y={bodyTopY}
        width={bodyW}
        height={bodyH}
        rx={bodyW * 0.25}
        fill={`url(#cp${index})`}
      />
      {/* Wax top highlight */}
      <rect
        x={x - bodyW / 2 + 1}
        y={bodyTopY}
        width={bodyW * 0.3}
        height={bodyH * 0.6}
        rx={1}
        fill="rgba(255,255,255,0.25)"
      />

      {/* Wick */}
      <rect
        x={x - 0.7}
        y={wickTopY}
        width={1.4}
        height={wickH}
        fill="#37474f"
        rx={0.5}
      />

      {/* Flame */}
      {!blown && (
        <g
          style={{
            transformOrigin: `${x}px ${flameBaseY}px`,
            animation: blowingOut
              ? `blow-out 0.5s ease-in forwards`
              : `flicker ${0.25 + (index % 3) * 0.07}s ease-in-out infinite alternate`,
            animationDelay: `${delayMs}ms`,
            filter: `drop-shadow(0 0 ${3 * scale}px #ffaa00) drop-shadow(0 0 ${6 * scale}px #ff6b00)`,
          }}
        >
          <path
            d={`M ${x} ${flameBaseY - flameH}
                C ${x - flameW * 0.3} ${flameBaseY - flameH * 0.6},
                  ${x - flameW * 0.5} ${flameBaseY - flameH * 0.2},
                  ${x} ${flameBaseY}
                C ${x + flameW * 0.5} ${flameBaseY - flameH * 0.2},
                  ${x + flameW * 0.3} ${flameBaseY - flameH * 0.6},
                  ${x} ${flameBaseY - flameH} Z`}
            fill={`url(#fg${index})`}
          />
        </g>
      )}

      {/* Smoke after blow */}
      {blown && (
        <ellipse
          cx={x}
          cy={wickTopY - 5}
          rx={2 * scale}
          ry={1.5 * scale}
          fill="rgba(150,150,160,0.35)"
          style={{ animation: "smoke-rise 1.2s ease-out forwards" }}
        />
      )}
    </g>
  );
}

export function BirthdayCake({ blownCandles, blowingOut }: BirthdayCakeProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>
      <svg
        width="300"
        height="220"
        viewBox="0 0 300 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        {/* Drop shadow */}
        <ellipse cx="150" cy="212" rx="108" ry="9" fill="rgba(0,0,0,0.09)" />

        {/* Plate */}
        <ellipse cx="150" cy="202" rx="108" ry="13" fill="#e8edf5" />
        <ellipse cx="150" cy="200" rx="108" ry="13" fill="#f0f4fa" />
        <ellipse cx="150" cy="198" rx="106" ry="11" fill="#dce4f0" />

        {/* Bottom tier */}
        <rect x="38" y="138" width="224" height="58" rx="6" fill="#2196f3" />
        <rect x="38" y="138" width="224" height="8" rx="6" fill="#42a5f5" />
        <line x1="38" y1="158" x2="262" y2="158" stroke="rgba(255,255,255,0.13)" strokeWidth="2" />
        <line x1="38" y1="174" x2="262" y2="174" stroke="rgba(255,255,255,0.13)" strokeWidth="2" />
        <rect x="38" y="138" width="13" height="58" fill="rgba(255,255,255,0.07)" rx="6" />
        <rect x="249" y="138" width="13" height="58" fill="rgba(0,0,0,0.06)" rx="4" />

        {/* Bottom tier frosting drips */}
        <path
          d="M38 142 C48 142 46 154 58 153 C70 152 68 142 80 142 C92 142 90 154 102 153 C114 152 112 142 124 142 C136 142 134 154 146 153 C158 152 156 142 168 142 C180 142 178 154 190 153 C202 152 200 142 212 142 C224 142 222 154 234 153 C246 152 244 142 262 142 L262 138 L38 138 Z"
          fill="white"
          opacity="0.96"
        />

        {/* Top tier */}
        <rect x="62" y="88" width="176" height="54" rx="6" fill="#1e88e5" />
        <rect x="62" y="88" width="176" height="8" rx="6" fill="#42a5f5" />
        <line x1="62" y1="106" x2="238" y2="106" stroke="rgba(255,255,255,0.13)" strokeWidth="2" />
        <line x1="62" y1="122" x2="238" y2="122" stroke="rgba(255,255,255,0.13)" strokeWidth="2" />
        <rect x="62" y="88" width="12" height="54" fill="rgba(255,255,255,0.07)" rx="6" />
        <rect x="226" y="88" width="10" height="54" fill="rgba(0,0,0,0.06)" rx="4" />

        {/* Top frosting ellipse */}
        <ellipse cx="150" cy="88" rx="88" ry="12" fill="white" />

        {/* Top tier frosting drips */}
        <path
          d="M62 92 C72 92 70 104 82 103 C94 102 92 92 104 92 C116 92 114 104 126 103 C138 102 136 92 148 92 C160 92 158 104 170 103 C182 102 180 92 192 92 C204 92 202 104 214 103 C226 102 224 92 238 92 L238 88 L62 88 Z"
          fill="white"
          opacity="0.96"
        />

        {/* Blue dots on frosting */}
        {[85, 102, 118, 136, 152, 168, 185, 202, 218].map((cx, i) => (
          <circle key={i} cx={cx} cy={88} r={3} fill="#1a73e8" opacity={0.45} />
        ))}
        {[94, 128, 160, 194].map((cx, i) => (
          <circle key={i} cx={cx} cy={84} r={2} fill="#64b5f6" opacity={0.35} />
        ))}

        {/* 29 candles — rendered in back-to-front row order for z-depth */}
        {CANDLE_POSITIONS.map((pos, i) => (
          <CandleSVG
            key={i}
            index={i}
            x={pos.x}
            baseY={pos.baseY + 36} /* offset to sit on top tier top y=88 → shift down by 36 */
            scale={pos.scale}
            blown={blownCandles.has(i)}
            blowingOut={blowingOut.has(i)}
          />
        ))}
      </svg>
    </div>
  );
}
