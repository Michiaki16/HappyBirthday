import { useState, useEffect, useRef, useCallback } from "react";
import { BirthdayCake } from "../components/BirthdayCake";
import { Confetti, StaticConfetti } from "../components/Confetti";
import { WishModal } from "../components/WishModal";

const TOTAL_CANDLES = 29;
const CANDLES_PER_BLOW = 3;

interface Wish {
  id: number;
  name: string;
  text: string;
}

const INITIAL_WISHES: Wish[] = [
  {
    id: 1,
    name: "Alex",
    text: "Have an amazing birthday! Enjoy your special day! 🎉",
  },
];

const AVATAR_COLORS = [
  "#1a73e8", "#0288d1", "#0097a7", "#00897b", "#388e3c",
  "#f57c00", "#e64a19", "#6d4c41", "#5e35b1", "#c62828",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function AvatarIcon({ name }: { name: string }) {
  const color = getAvatarColor(name);
  return (
    <div
      style={{
        width: 44, height: 44, borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontWeight: 700, fontSize: 16, flexShrink: 0,
        boxShadow: `0 2px 8px ${color}44`,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function BirthdayPage() {
  const [blownCandles, setBlownCandles] = useState<Set<number>>(new Set());
  const [blowingOut, setBlowingOut] = useState<Set<number>>(new Set());
  const [allBlown, setAllBlown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [blowLevel, setBlowLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const blownRef = useRef<Set<number>>(new Set());
  const blowCooldownRef = useRef(false);
  const blowingRef = useRef(false);

  blownRef.current = blownCandles;

  const stopMic = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    analyserRef.current = null;
    setMicActive(false);
    setBlowLevel(0);
  }, []);

  const blowNextCandles = useCallback(() => {
    if (blowCooldownRef.current) return;
    const current = blownRef.current;
    if (current.size >= TOTAL_CANDLES) return;

    blowCooldownRef.current = true;

    // Pick next CANDLES_PER_BLOW unblown candles
    const toBlowOut: number[] = [];
    for (let i = 0; i < TOTAL_CANDLES && toBlowOut.length < CANDLES_PER_BLOW; i++) {
      if (!current.has(i)) toBlowOut.push(i);
    }

    setBlowingOut(new Set(toBlowOut));

    setTimeout(() => {
      setBlownCandles((prev) => {
        const next = new Set(prev);
        toBlowOut.forEach((i) => next.add(i));
        if (next.size >= TOTAL_CANDLES) {
          setTimeout(() => {
            setAllBlown(true);
            setShowConfetti(true);
            stopMic();
          }, 400);
        }
        return next;
      });
      setBlowingOut(new Set());
      blowCooldownRef.current = false;
    }, 500);
  }, [stopMic]);

  const startMic = useCallback(async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;
      source.connect(analyser);

      setMicActive(true);
      const dataArray = new Uint8Array(analyser.fftSize);

      const detect = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);
        let sumSq = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / dataArray.length);
        const level = Math.min(100, Math.round(rms * 400));
        setBlowLevel(level);

        if (level > 18 && !blowingRef.current) {
          blowingRef.current = true;
          blowNextCandles();
          setTimeout(() => { blowingRef.current = false; }, 700);
        }

        rafRef.current = requestAnimationFrame(detect);
      };
      rafRef.current = requestAnimationFrame(detect);
    } catch {
      setMicError("Microphone access denied. Please allow microphone access to blow the candles!");
    }
  }, [blowNextCandles]);

  useEffect(() => () => stopMic(), [stopMic]);

  const handleAddWish = (text: string, name: string) => {
    setWishes((prev) => [...prev, { id: Date.now(), name, text }]);
  };

  const resetCake = () => {
    stopMic();
    setBlownCandles(new Set());
    setBlowingOut(new Set());
    setAllBlown(false);
    setShowConfetti(false);
    blowCooldownRef.current = false;
    blowingRef.current = false;
  };

  const blownCount = blownCandles.size;
  const progress = Math.round((blownCount / TOTAL_CANDLES) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #bbdefb 0%, #90caf9 30%, #64b5f6 70%, #bbdefb 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 16px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <Confetti active={showConfetti} />
      {showModal && <WishModal onClose={() => setShowModal(false)} onSubmit={handleAddWish} />}

      <div
        className={allBlown ? "celebration-card" : ""}
        style={{
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(20px)",
          borderRadius: 28,
          width: "min(420px, 100%)",
          padding: "0 0 28px 0",
          boxShadow: "0 12px 48px rgba(26,115,232,0.18), 0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(255,255,255,0.7)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top hero section */}
        <div
          style={{
            background: "linear-gradient(160deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)",
            borderRadius: "28px 28px 40px 40px",
            padding: "24px 20px 28px",
            position: "relative",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <StaticConfetti />

          {/* Title badge */}
          <div style={{ position: "relative", zIndex: 1, marginBottom: 14, textAlign: "center" }}>
            <div
              className="title-button"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                borderRadius: 14,
                color: "white",
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "0.02em",
                textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            >
              HAPPY BIRTHDAY DUDU!
            </div>
          </div>

          {/* 29-candle cake */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center" }}>
            <BirthdayCake blownCandles={blownCandles} blowingOut={blowingOut} />
          </div>

          {/* Candle counter pill */}
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginTop: 6 }}>
            <span
              style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.7)",
                borderRadius: 20,
                padding: "4px 14px",
                fontSize: 13,
                fontWeight: 700,
                color: "#1557b0",
              }}
            >
              🕯️ {blownCount} / {TOTAL_CANDLES} candles blown out
            </span>
          </div>
        </div>

        {/* Interaction section */}
        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          {!allBlown ? (
            !micActive ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#1557b0", fontSize: 14, marginBottom: 12, fontWeight: 500 }}>
                  🎤 Blow into your microphone to extinguish the candles!
                </p>
                {micError && (
                  <p style={{ color: "#c62828", fontSize: 12, marginBottom: 12, padding: "8px 12px", background: "#ffebee", borderRadius: 8 }}>
                    {micError}
                  </p>
                )}
                <button
                  onClick={startMic}
                  style={{
                    width: "100%", padding: "14px 20px", borderRadius: 16, border: "none",
                    background: "linear-gradient(135deg, #1a73e8, #1557b0)",
                    color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(26,115,232,0.4)", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(26,115,232,0.5)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,115,232,0.4)"; }}
                >
                  🎤 Enable Microphone to Blow Candles
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#f44336", animation: "pulse-ring 1s ease-out infinite" }} />
                  <p style={{ color: "#1557b0", fontSize: 14, fontWeight: 600 }}>
                    Listening… blow into your microphone!
                  </p>
                </div>

                {/* Blow level bar */}
                <div style={{ height: 8, background: "#e3f2fd", borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${blowLevel}%`,
                    background: blowLevel > 18 ? "linear-gradient(90deg, #1a73e8, #42a5f5)" : "linear-gradient(90deg, #90caf9, #64b5f6)",
                    borderRadius: 8, transition: "width 0.05s",
                  }} />
                </div>

                {/* Progress bar */}
                <div style={{ height: 6, background: "#e3f2fd", borderRadius: 8, marginBottom: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${progress}%`,
                    background: "linear-gradient(90deg, #1a73e8, #4fc3f7)",
                    borderRadius: 8, transition: "width 0.3s ease",
                  }} />
                </div>

                <div style={{ textAlign: "center" }}>
                  <button
                    onClick={stopMic}
                    style={{
                      padding: "8px 18px", borderRadius: 10, border: "2px solid #e3f2fd",
                      background: "white", color: "#666", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Stop Microphone
                  </button>
                </div>
              </div>
            )
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎉🎂🎉</div>
              <p style={{ color: "#1557b0", fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                All 29 candles blown out!
              </p>
              <p style={{ color: "#555", fontSize: 13, marginBottom: 16 }}>
                Make a wish — Happy 29th Birthday! 💙
              </p>
              <button
                onClick={resetCake}
                style={{
                  padding: "10px 24px", borderRadius: 12, border: "2px solid #e3f2fd",
                  background: "white", color: "#1a73e8", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                🕯️ Relight Candles
              </button>
            </div>
          )}
        </div>

        {/* Birthday Wishes */}
        <div style={{ padding: "0 20px" }}>
          <p style={{ color: "#1a73e8", fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 12 }}>
            BIRTHDAY WISHES:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            {wishes.map((wish) => (
              <div
                key={wish.id}
                style={{
                  background: "rgba(255,255,255,0.8)", borderRadius: 16,
                  padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12,
                  boxShadow: "0 2px 8px rgba(26,115,232,0.08)", border: "1px solid rgba(255,255,255,0.9)",
                }}
              >
                <AvatarIcon name={wish.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#333", fontSize: 14, margin: 0, lineHeight: 1.5 }}>{wish.text}</p>
                  <p style={{ color: "#1a73e8", fontSize: 12, fontWeight: 600, margin: "4px 0 0" }}>— {wish.name}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{
              width: "100%", padding: "15px 20px", borderRadius: 16, border: "none",
              background: "linear-gradient(135deg, #1a73e8, #1557b0)",
              color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(26,115,232,0.4)", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(26,115,232,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,115,232,0.4)"; }}
          >
            <span style={{ fontSize: 16 }}>♥</span> Leave a Wish
          </button>
        </div>
      </div>
    </div>
  );
}
