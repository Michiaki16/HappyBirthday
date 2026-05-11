import { useState, useEffect, useRef, useCallback } from "react";
import { BirthdayCake } from "../components/BirthdayCake";
import { Confetti, StaticConfetti } from "../components/Confetti";
import { WishModal } from "../components/WishModal";

const TOTAL_CANDLES = 3;

interface Wish {
  id: number;
  name: string;
  text: string;
  avatar: string;
}

const INITIAL_WISHES: Wish[] = [
  {
    id: 1,
    name: "Alex",
    text: "Have an amazing birthday! Enjoy your special day! 🎉",
    avatar: "A",
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
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 700,
        fontSize: 16,
        flexShrink: 0,
        boxShadow: `0 2px 8px ${color}44`,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function BirthdayPage() {
  const [blownCandles, setBlownCandles] = useState<number[]>([]);
  const [blowingOutIndex, setBlowingOutIndex] = useState<number | null>(null);
  const [allBlown, setAllBlown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [blowLevel, setBlowLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const blownCandlesRef = useRef<number[]>([]);
  const blowingRef = useRef(false);
  const blowCooldownRef = useRef(false);

  blownCandlesRef.current = blownCandles;

  const stopMic = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setMicActive(false);
    setIsListening(false);
    setBlowLevel(0);
  }, []);

  const blowNextCandle = useCallback(() => {
    if (blowCooldownRef.current) return;

    const current = blownCandlesRef.current;
    if (current.length >= TOTAL_CANDLES) return;

    blowCooldownRef.current = true;
    const nextIdx = current.length;
    setBlowingOutIndex(nextIdx);

    setTimeout(() => {
      setBlownCandles((prev) => {
        const next = [...prev, nextIdx];
        if (next.length === TOTAL_CANDLES) {
          setTimeout(() => {
            setAllBlown(true);
            setShowConfetti(true);
            stopMic();
          }, 300);
        }
        return next;
      });
      setBlowingOutIndex(null);
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
      setIsListening(true);

      const dataArray = new Uint8Array(analyser.fftSize);

      const detect = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);

        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = (dataArray[i] - 128) / 128;
          sumSquares += val * val;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        const level = Math.min(100, Math.round(rms * 400));
        setBlowLevel(level);

        // Threshold: blowing = sustained loud breath (not just talking)
        if (level > 18 && !blowingRef.current) {
          blowingRef.current = true;
          blowNextCandle();
          setTimeout(() => {
            blowingRef.current = false;
          }, 800);
        }

        rafRef.current = requestAnimationFrame(detect);
      };

      rafRef.current = requestAnimationFrame(detect);
    } catch (err) {
      setMicError("Microphone access denied. Please allow microphone access to blow the candles!");
      setMicActive(false);
    }
  }, [blowNextCandle]);

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, [stopMic]);

  const handleAddWish = (text: string, name: string) => {
    setWishes((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        text,
        avatar: name.charAt(0).toUpperCase(),
      },
    ]);
  };

  const resetCake = () => {
    stopMic();
    setBlownCandles([]);
    setBlowingOutIndex(null);
    setAllBlown(false);
    setShowConfetti(false);
    blowCooldownRef.current = false;
    blowingRef.current = false;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #bbdefb 0%, #90caf9 30%, #64b5f6 70%, #bbdefb 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <Confetti active={showConfetti} />

      {showModal && (
        <WishModal onClose={() => setShowModal(false)} onSubmit={handleAddWish} />
      )}

      {/* Main Card */}
      <div
        className={allBlown ? "celebration-card" : ""}
        style={{
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(20px)",
          borderRadius: 28,
          width: "min(400px, 100%)",
          padding: "0 0 28px 0",
          boxShadow: "0 12px 48px rgba(26,115,232,0.18), 0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(255,255,255,0.7)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top section with confetti bg */}
        <div
          style={{
            background: "linear-gradient(160deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)",
            borderRadius: "28px 28px 40px 40px",
            padding: "24px 20px 32px",
            position: "relative",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <StaticConfetti />

          {/* Title */}
          <div style={{ position: "relative", zIndex: 1, marginBottom: 16, textAlign: "center" }}>
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

          {/* Cake */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center" }}>
            <BirthdayCake blownCandles={blownCandles} blowingOutIndex={blowingOutIndex} />
          </div>
        </div>

        {/* Blow interaction section */}
        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          {!allBlown ? (
            <div style={{ textAlign: "center" }}>
              {!micActive ? (
                <div>
                  <p style={{ color: "#1557b0", fontSize: 14, marginBottom: 12, fontWeight: 500 }}>
                    🎤 Use your microphone to blow out the candles!
                  </p>
                  {micError && (
                    <p style={{ color: "#c62828", fontSize: 12, marginBottom: 12, padding: "8px 12px", background: "#ffebee", borderRadius: 8 }}>
                      {micError}
                    </p>
                  )}
                  <button
                    onClick={startMic}
                    style={{
                      width: "100%",
                      padding: "14px 20px",
                      borderRadius: 16,
                      border: "none",
                      background: "linear-gradient(135deg, #1a73e8, #1557b0)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(26,115,232,0.4)",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget).style.transform = "translateY(-2px)";
                      (e.currentTarget).style.boxShadow = "0 6px 20px rgba(26,115,232,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget).style.transform = "translateY(0)";
                      (e.currentTarget).style.boxShadow = "0 4px 16px rgba(26,115,232,0.4)";
                    }}
                  >
                    🎤 Enable Microphone to Blow Candles
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#f44336",
                        animation: "pulse-ring 1s ease-out infinite",
                      }}
                    />
                    <p style={{ color: "#1557b0", fontSize: 14, fontWeight: 600 }}>
                      Listening... Blow into your microphone!
                    </p>
                  </div>

                  {/* Blow level bar */}
                  <div style={{
                    height: 8,
                    background: "#e3f2fd",
                    borderRadius: 8,
                    marginBottom: 10,
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${blowLevel}%`,
                      background: blowLevel > 18
                        ? "linear-gradient(90deg, #1a73e8, #42a5f5)"
                        : "linear-gradient(90deg, #90caf9, #64b5f6)",
                      borderRadius: 8,
                      transition: "width 0.05s",
                    }} />
                  </div>

                  <p style={{ color: "#666", fontSize: 12, marginBottom: 10 }}>
                    {blownCandles.length} / {TOTAL_CANDLES} candles blown out
                  </p>

                  <button
                    onClick={stopMic}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: "2px solid #e3f2fd",
                      background: "white",
                      color: "#666",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Stop Microphone
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <p style={{ color: "#1557b0", fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                All candles blown out!
              </p>
              <p style={{ color: "#555", fontSize: 13, marginBottom: 16 }}>
                Make a wish and have an amazing birthday!
              </p>
              <button
                onClick={resetCake}
                style={{
                  padding: "10px 24px",
                  borderRadius: 12,
                  border: "2px solid #e3f2fd",
                  background: "white",
                  color: "#1a73e8",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
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

          {/* Wishes list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            {wishes.map((wish) => (
              <div
                key={wish.id}
                style={{
                  background: "rgba(255,255,255,0.8)",
                  borderRadius: 16,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  boxShadow: "0 2px 8px rgba(26,115,232,0.08)",
                  border: "1px solid rgba(255,255,255,0.9)",
                }}
              >
                <AvatarIcon name={wish.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#333", fontSize: 14, margin: 0, lineHeight: 1.4 }}>
                    {wish.text}
                  </p>
                  {wish.name !== "Anonymous" && (
                    <p style={{ color: "#1a73e8", fontSize: 12, fontWeight: 600, margin: "4px 0 0" }}>
                      — {wish.name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Leave a Wish button */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              width: "100%",
              padding: "15px 20px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #1a73e8, #1557b0)",
              color: "white",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(26,115,232,0.4)",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget).style.transform = "translateY(-2px)";
              (e.currentTarget).style.boxShadow = "0 6px 20px rgba(26,115,232,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget).style.transform = "translateY(0)";
              (e.currentTarget).style.boxShadow = "0 4px 16px rgba(26,115,232,0.4)";
            }}
          >
            <span style={{ fontSize: 16 }}>♥</span> Leave a Wish
          </button>
        </div>
      </div>
    </div>
  );
}
