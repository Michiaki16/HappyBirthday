import { Candle } from "./Candle";

interface BirthdayCakeProps {
  blownCandles: number[];
  blowingOutIndex: number | null;
}

export function BirthdayCake({ blownCandles, blowingOutIndex }: BirthdayCakeProps) {
  const candlePositions = [0, 1, 2];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>
      {/* Candles */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: -2, zIndex: 2, position: "relative" }}>
        {candlePositions.map((i) => (
          <Candle
            key={i}
            blown={blownCandles.includes(i)}
            blowingOut={blowingOutIndex === i}
            delay={i * 80}
          />
        ))}
      </div>

      {/* Cake body */}
      <svg
        width="280"
        height="180"
        viewBox="0 0 280 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        {/* Drop shadow / plate */}
        <ellipse cx="140" cy="172" rx="105" ry="10" fill="rgba(0,0,0,0.08)" />

        {/* Plate */}
        <ellipse cx="140" cy="162" rx="105" ry="12" fill="#e8edf5" />
        <ellipse cx="140" cy="160" rx="105" ry="12" fill="#f0f4fa" />
        <ellipse cx="140" cy="158" rx="103" ry="10" fill="#dce4f0" />

        {/* Cake - bottom tier */}
        <rect x="30" y="100" width="220" height="56" rx="6" fill="#2196f3" />
        <rect x="30" y="100" width="220" height="8" rx="6" fill="#42a5f5" />
        {/* Stripe decorations */}
        <line x1="30" y1="120" x2="250" y2="120" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        <line x1="30" y1="135" x2="250" y2="135" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        {/* Side shine */}
        <rect x="30" y="100" width="14" height="56" fill="rgba(255,255,255,0.08)" rx="6" />

        {/* Frosting drips on bottom tier */}
        <path
          d="M30 104 C40 104 38 116 50 115 C62 114 60 104 72 104 C84 104 82 116 94 115 C106 114 104 104 116 104 C128 104 126 116 138 115 C150 114 148 104 160 104 C172 104 170 116 182 115 C194 114 192 104 204 104 C216 104 214 116 226 115 C238 114 236 104 248 104 L250 100 L30 100 Z"
          fill="white"
          opacity="0.95"
        />

        {/* Cake - top tier */}
        <rect x="55" y="52" width="170" height="52" rx="6" fill="#1e88e5" />
        <rect x="55" y="52" width="170" height="8" rx="6" fill="#42a5f5" />
        {/* Stripe decorations */}
        <line x1="55" y1="70" x2="225" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        <line x1="55" y1="85" x2="225" y2="85" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        {/* Side shine */}
        <rect x="55" y="52" width="12" height="52" fill="rgba(255,255,255,0.08)" rx="6" />

        {/* White frosting top */}
        <ellipse cx="140" cy="52" rx="85" ry="11" fill="white" />

        {/* Frosting drips on top tier */}
        <path
          d="M55 56 C65 56 63 68 75 67 C87 66 85 56 97 56 C109 56 107 68 119 67 C131 66 129 56 141 56 C153 56 151 68 163 67 C175 66 173 56 185 56 C197 56 195 68 207 67 C219 66 217 56 225 56 L225 52 L55 52 Z"
          fill="white"
          opacity="0.95"
        />

        {/* Blue dots on top frosting */}
        {[80, 100, 118, 140, 162, 180, 200].map((x, i) => (
          <circle key={i} cx={x} cy={52} r={3} fill="#1a73e8" opacity={0.5} />
        ))}
        {[90, 130, 155, 210].map((x, i) => (
          <circle key={i} cx={x} cy={48} r={2} fill="#64b5f6" opacity={0.4} />
        ))}

        {/* Candle holes / mounting areas */}
        <rect x="123" y="46" width="5" height="8" fill="rgba(0,0,0,0.1)" rx="2" />
        <rect x="138" y="44" width="5" height="10" fill="rgba(0,0,0,0.1)" rx="2" />
        <rect x="153" y="46" width="5" height="8" fill="rgba(0,0,0,0.1)" rx="2" />

        {/* Highlight on bottom tier right side */}
        <rect x="236" y="100" width="10" height="56" fill="rgba(0,0,0,0.06)" rx="4" />
        {/* Highlight on top tier right side */}
        <rect x="213" y="52" width="8" height="52" fill="rgba(0,0,0,0.06)" rx="4" />
      </svg>
    </div>
  );
}
