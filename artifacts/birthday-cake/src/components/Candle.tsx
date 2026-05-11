import { useState, useEffect } from "react";

interface CandleProps {
  blown: boolean;
  blowingOut: boolean;
  delay?: number;
}

export function Candle({ blown, blowingOut, delay = 0 }: CandleProps) {
  const [showSmoke, setShowSmoke] = useState(false);

  useEffect(() => {
    if (blown) {
      setShowSmoke(true);
      const t = setTimeout(() => setShowSmoke(false), 1200);
      return () => clearTimeout(t);
    }
  }, [blown]);

  return (
    <div className="flex flex-col items-center" style={{ width: 28 }}>
      {/* Flame or smoke */}
      <div style={{ height: 36, position: "relative", display: "flex", justifyContent: "center" }}>
        {!blown && (
          <div
            className={blowingOut ? "flame-blow-out" : "flame"}
            style={{
              position: "absolute",
              bottom: 0,
              animationDelay: `${delay}ms`,
            }}
          >
            {/* Outer flame */}
            <svg width="18" height="32" viewBox="0 0 18 32" fill="none">
              <path
                d="M9 30 C3 24 0 18 2 11 C4 5 7 2 9 0 C11 2 14 5 16 11 C18 18 15 24 9 30Z"
                fill="url(#flameGrad)"
              />
              <defs>
                <radialGradient id="flameGrad" cx="50%" cy="80%" r="60%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#ffee88" />
                  <stop offset="60%" stopColor="#ffaa00" />
                  <stop offset="100%" stopColor="#ff4400" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        )}
        {showSmoke && (
          <div
            className="smoke"
            style={{
              position: "absolute",
              bottom: 0,
              width: 4,
              height: 16,
              background: "linear-gradient(to top, rgba(150,150,150,0.6), transparent)",
              borderRadius: 4,
            }}
          />
        )}
      </div>

      {/* Candle body */}
      <div
        style={{
          width: 14,
          height: 52,
          borderRadius: "3px 3px 2px 2px",
          background: "repeating-linear-gradient(180deg, #4da6ff 0px, #4da6ff 6px, #2196f3 6px, #2196f3 8px)",
          boxShadow: "inset -2px 0 4px rgba(0,0,0,0.15), inset 2px 0 4px rgba(255,255,255,0.2)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Wick */}
        <div
          style={{
            position: "absolute",
            top: -4,
            left: "50%",
            transform: "translateX(-50%)",
            width: 2,
            height: 6,
            background: "#333",
            borderRadius: 1,
          }}
        />
        {/* Wax drip effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 2,
            width: 3,
            height: 8,
            background: "rgba(255,255,255,0.3)",
            borderRadius: "0 0 2px 2px",
          }}
        />
      </div>
    </div>
  );
}
