interface BirthdayCakeProps {
  blownCandles: Set<number>;
  blowingOut: boolean;
}

// SVG cake: top-tier frosting ellipse at cx=150, cy=88, rx=88, ry=12
// Candle baseY = bottom of candle body, sitting on the frosting surface
// ellipse surface y = 88 - 12*sqrt(1 - ((x-150)/88)^2)
// We embed candles slightly into the frosting (baseY ≈ surface_y + 4)

const CANDLE_POSITIONS: { x: number; baseY: number; scale: number }[] = [
  // ── Row 1  back  (7 candles, scale 0.70) ──────────────────────────
  { x: 107, baseY: 84, scale: 0.70 },
  { x: 123, baseY: 83, scale: 0.70 },
  { x: 139, baseY: 82, scale: 0.70 },
  { x: 155, baseY: 82, scale: 0.70 },
  { x: 171, baseY: 82, scale: 0.70 },
  { x: 187, baseY: 83, scale: 0.70 },
  { x: 203, baseY: 84, scale: 0.70 },

  // ── Row 2  mid   (10 candles, scale 0.85) ─────────────────────────
  { x: 90,  baseY: 88, scale: 0.85 },
  { x: 105, baseY: 86, scale: 0.85 },
  { x: 120, baseY: 85, scale: 0.85 },
  { x: 135, baseY: 84, scale: 0.85 },
  { x: 150, baseY: 84, scale: 0.85 },
  { x: 165, baseY: 84, scale: 0.85 },
  { x: 180, baseY: 84, scale: 0.85 },
  { x: 195, baseY: 85, scale: 0.85 },
  { x: 210, baseY: 86, scale: 0.85 },
  { x: 226, baseY: 88, scale: 0.85 },

  // ── Row 3  front (12 candles, scale 1.00) ─────────────────────────
  { x: 78,  baseY: 94, scale: 1.00 },
  { x: 92,  baseY: 91, scale: 1.00 },
  { x: 106, baseY: 89, scale: 1.00 },
  { x: 120, baseY: 88, scale: 1.00 },
  { x: 134, baseY: 87, scale: 1.00 },
  { x: 148, baseY: 87, scale: 1.00 },
  { x: 162, baseY: 87, scale: 1.00 },
  { x: 176, baseY: 87, scale: 1.00 },
  { x: 190, baseY: 88, scale: 1.00 },
  { x: 204, baseY: 89, scale: 1.00 },
  { x: 218, baseY: 91, scale: 1.00 },
  { x: 232, baseY: 94, scale: 1.00 },
];

function SmallCandle({
  x, baseY, scale, index, blown, blowingOut,
}: {
  x: number; baseY: number; scale: number;
  index: number; blown: boolean; blowingOut: boolean;
}) {
  const bw   = 5.5 * scale;   // body width
  const bh   = 24  * scale;   // body height
  const wh   = 4   * scale;   // wick height
  const fw   = 7   * scale;   // flame width
  const fh   = 12  * scale;   // flame height

  const bodyTop = baseY - bh;
  const wickTop = bodyTop - wh;
  const flameBase = wickTop;

  // Vary flicker timing per candle so they don't pulse in sync
  const flickerDur  = (0.22 + (index % 7) * 0.025).toFixed(3);
  const flickerDelay = ((index % 5) * 55).toString();

  return (
    <g>
      {/* gradients / patterns unique to this candle */}
      <defs>
        <linearGradient id={`cside${index}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#7ec8ff" />
          <stop offset="50%"  stopColor="#2196f3" />
          <stop offset="100%" stopColor="#1565c0" />
        </linearGradient>
        <pattern
          id={`cstripe${index}`}
          x="0" y="0"
          width={bw} height={7 * scale}
          patternUnits="userSpaceOnUse"
        >
          <rect width={bw} height={3.5 * scale} fill={`url(#cside${index})`} />
          <rect y={3.5 * scale} width={bw} height={3.5 * scale} fill="#1565c0" />
        </pattern>
        <radialGradient id={`fg${index}`} cx="45%" cy="75%" r="60%">
          <stop offset="0%"   stopColor="#fffde7" />
          <stop offset="30%"  stopColor="#fff176" />
          <stop offset="65%"  stopColor="#ffa726" />
          <stop offset="100%" stopColor="#f4511e" stopOpacity="0.7" />
        </radialGradient>
      </defs>

      {/* candle body */}
      <rect
        x={x - bw / 2} y={bodyTop}
        width={bw} height={bh}
        rx={bw * 0.25}
        fill={`url(#cstripe${index})`}
      />
      {/* shine */}
      <rect
        x={x - bw / 2 + 0.8} y={bodyTop + 2}
        width={bw * 0.28} height={bh * 0.55}
        rx={1}
        fill="rgba(255,255,255,0.28)"
      />

      {/* wax drip at top */}
      <ellipse cx={x} cy={bodyTop} rx={bw * 0.55} ry={1.5 * scale} fill="rgba(255,255,255,0.6)" />

      {/* wick */}
      <line
        x1={x} y1={wickTop} x2={x} y2={bodyTop}
        stroke="#4e342e" strokeWidth={1 * scale} strokeLinecap="round"
      />

      {/* flame */}
      {!blown && (
        <g
          style={{
            transformOrigin: `${x}px ${flameBase}px`,
            animation: blowingOut
              ? `blow-out 0.55s ease-in forwards`
              : `flicker ${flickerDur}s ease-in-out ${flickerDelay}ms infinite alternate`,
            filter: `drop-shadow(0 0 ${3 * scale}px #ffb300) drop-shadow(0 0 ${5 * scale}px #ff6d00)`,
          }}
        >
          <path
            d={[
              `M ${x} ${flameBase - fh}`,
              `C ${x - fw * 0.28} ${flameBase - fh * 0.65},`,
              `  ${x - fw * 0.48} ${flameBase - fh * 0.22},`,
              `  ${x} ${flameBase}`,
              `C ${x + fw * 0.48} ${flameBase - fh * 0.22},`,
              `  ${x + fw * 0.28} ${flameBase - fh * 0.65},`,
              `  ${x} ${flameBase - fh} Z`,
            ].join(" ")}
            fill={`url(#fg${index})`}
          />
          {/* inner bright core */}
          <ellipse
            cx={x} cy={flameBase - fh * 0.28}
            rx={fw * 0.22} ry={fh * 0.22}
            fill="rgba(255,255,255,0.55)"
          />
        </g>
      )}

      {/* smoke wisp after blown */}
      {blown && (
        <g style={{ animation: "smoke-rise 1.2s ease-out forwards", transformOrigin: `${x}px ${wickTop}px` }}>
          <ellipse cx={x} cy={wickTop - 3} rx={2 * scale} ry={1.2 * scale} fill="rgba(180,180,200,0.4)" />
        </g>
      )}
    </g>
  );
}

export function BirthdayCake({ blownCandles, blowingOut }: BirthdayCakeProps) {
  return (
    <div style={{ display: "flex", justifyContent: "center", userSelect: "none" }}>
      <svg
        width="310" height="225"
        viewBox="0 0 310 225"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        {/* ── plate / shadow ──────────────────────────────────────── */}
        <ellipse cx="155" cy="216" rx="110" ry="9"  fill="rgba(0,0,0,0.08)" />
        <ellipse cx="155" cy="208" rx="110" ry="13" fill="#e8edf5" />
        <ellipse cx="155" cy="206" rx="110" ry="13" fill="#f0f4fa" />
        <ellipse cx="155" cy="203" rx="108" ry="11" fill="#dce4f0" />

        {/* ── bottom tier ─────────────────────────────────────────── */}
        <rect x="40" y="143" width="230" height="58" rx="7" fill="#2196f3" />
        <rect x="40" y="143" width="230" height="9"  rx="7" fill="#42a5f5" />
        <line x1="40" y1="163" x2="270" y2="163" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <line x1="40" y1="180" x2="270" y2="180" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <rect x="40"  y="143" width="14" height="58" rx="5" fill="rgba(255,255,255,0.07)" />
        <rect x="256" y="143" width="14" height="58" rx="5" fill="rgba(0,0,0,0.07)" />
        {/* bottom drips */}
        <path d="M40 147 C51 147 49 159 62 158 C75 157 73 147 86 147 C99 147 97 159 110 158 C123 157 121 147 134 147 C147 147 145 159 158 158 C171 157 169 147 182 147 C195 147 193 159 206 158 C219 157 217 147 230 147 C243 147 241 159 254 158 C267 157 265 147 270 147 L270 143 L40 143 Z" fill="white" opacity="0.96" />

        {/* ── top tier ────────────────────────────────────────────── */}
        <rect x="65"  y="90"  width="180" height="56" rx="7" fill="#1e88e5" />
        <rect x="65"  y="90"  width="180" height="9"  rx="7" fill="#42a5f5" />
        <line x1="65"  y1="109" x2="245" y2="109" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <line x1="65"  y1="126" x2="245" y2="126" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <rect x="65"  y="90"  width="13" height="56" rx="5" fill="rgba(255,255,255,0.07)" />
        <rect x="232" y="90"  width="13" height="56" rx="5" fill="rgba(0,0,0,0.07)" />

        {/* ── frosting ellipse on top tier ────────────────────────── */}
        <ellipse cx="155" cy="90" rx="90" ry="13" fill="white" />
        {/* top drips */}
        <path d="M65 94 C76 94 74 106 87 105 C100 104 98 94 111 94 C124 94 122 106 135 105 C148 104 146 94 159 94 C172 94 170 106 183 105 C196 104 194 94 207 94 C220 94 218 106 231 105 C244 104 242 94 245 94 L245 90 L65 90 Z" fill="white" opacity="0.96" />

        {/* blue sprinkle dots on frosting */}
        {[88,104,120,136,152,168,184,200,217].map((cx, i) => (
          <circle key={i} cx={cx} cy={90} r={3} fill="#1a73e8" opacity={0.42} />
        ))}
        {[96,128,164,200].map((cx, i) => (
          <circle key={i} cx={cx} cy={86} r={2} fill="#64b5f6" opacity={0.35} />
        ))}

        {/* ── 29 candles (back→front render order) ────────────────── */}
        {CANDLE_POSITIONS.map((pos, i) => (
          <SmallCandle
            key={i}
            index={i}
            x={pos.x}
            baseY={pos.baseY}
            scale={pos.scale}
            blown={blownCandles.has(i)}
            blowingOut={blowingOut && !blownCandles.has(i)}
          />
        ))}
      </svg>
    </div>
  );
}
