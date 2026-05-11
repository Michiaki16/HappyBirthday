import { useState, useEffect, useRef, useCallback } from 'react'
import BirthdayCake from '../components/BirthdayCake.jsx'
import { Confetti, StaticConfetti } from '../components/Confetti.jsx'
import WishModal from '../components/WishModal.jsx'

const TOTAL = 29

const AVATAR_COLORS = [
  '#1a73e8','#0288d1','#0097a7','#00897b','#388e3c',
  '#f57c00','#e64a19','#6d4c41','#5e35b1','#c62828',
]
function avatarColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function Avatar({ name }) {
  const color = avatarColor(name)
  return (
    <div style={{
      width:44,height:44,borderRadius:'50%',flexShrink:0,
      background:`linear-gradient(135deg,${color},${color}cc)`,
      display:'flex',alignItems:'center',justifyContent:'center',
      color:'white',fontWeight:700,fontSize:16,
      boxShadow:`0 2px 8px ${color}44`,
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function BirthdayPage() {
  const [blown,       setBlown]       = useState(new Set())
  const [blowingOut,  setBlowingOut]  = useState(false)
  const [allBlown,    setAllBlown]    = useState(false)
  const [confetti,    setConfetti]    = useState(false)
  const [showModal,   setShowModal]   = useState(false)
  const [wishes,      setWishes]      = useState([
    { id:1, name:'Alex', text:'Have an amazing birthday! Enjoy your special day! 🎉' },
  ])
  const [micActive,   setMicActive]   = useState(false)
  const [micError,    setMicError]    = useState(null)
  const [blowLevel,   setBlowLevel]   = useState(0)

  const ctxRef      = useRef(null)
  const analyserRef = useRef(null)
  const streamRef   = useRef(null)
  const rafRef      = useRef(null)
  const cooldown    = useRef(false)
  const blowing     = useRef(false)

  const stopMic = useCallback(() => {
    if (rafRef.current)    { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    if (ctxRef.current)    { ctxRef.current.close(); ctxRef.current = null }
    analyserRef.current = null
    setMicActive(false)
    setBlowLevel(0)
  }, [])

  const blowAll = useCallback(() => {
    if (cooldown.current) return
    cooldown.current = true
    setBlowingOut(true)
    setTimeout(() => {
      const all = new Set(Array.from({ length: TOTAL }, (_, i) => i))
      setBlown(all)
      setBlowingOut(false)
      setTimeout(() => {
        setAllBlown(true)
        setConfetti(true)
        stopMic()
      }, 300)
    }, 600)
  }, [stopMic])

  const startMic = useCallback(async () => {
    try {
      setMicError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream
      const ctx = new AudioContext()
      ctxRef.current = ctx
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.25
      analyserRef.current = analyser
      src.connect(analyser)
      setMicActive(true)

      const data = new Uint8Array(analyser.fftSize)
      const tick = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteTimeDomainData(data)
        let sq = 0
        for (let i = 0; i < data.length; i++) { const v = (data[i]-128)/128; sq += v*v }
        const level = Math.min(100, Math.round(Math.sqrt(sq/data.length)*400))
        setBlowLevel(level)
        if (level > 18 && !blowing.current) {
          blowing.current = true
          blowAll()
          setTimeout(() => { blowing.current = false; cooldown.current = false }, 1200)
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch {
      setMicError('Microphone access denied. Please allow microphone to blow the candles!')
    }
  }, [blowAll])

  useEffect(() => () => stopMic(), [stopMic])

  const reset = () => {
    stopMic()
    setBlown(new Set())
    setBlowingOut(false)
    setAllBlown(false)
    setConfetti(false)
    cooldown.current = false
    blowing.current  = false
  }

  const btn = {
    width:'100%',padding:'14px 20px',borderRadius:16,border:'none',
    background:'linear-gradient(135deg,#1a73e8,#1557b0)',
    color:'white',fontWeight:700,fontSize:15,cursor:'pointer',
    boxShadow:'0 4px 16px rgba(26,115,232,0.4)',fontFamily:'inherit',
    display:'flex',alignItems:'center',justifyContent:'center',gap:8,
    transition:'all 0.2s',
  }

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(160deg,#bbdefb 0%,#90caf9 30%,#64b5f6 70%,#bbdefb 100%)',
      display:'flex',alignItems:'center',justifyContent:'center',
      padding:'20px 16px',
      fontFamily:"'Inter', system-ui, sans-serif",
    }}>
      <Confetti active={confetti} />
      {showModal && <WishModal onClose={() => setShowModal(false)} onSubmit={(t,n) => setWishes(p => [...p,{id:Date.now(),name:n,text:t}])} />}

      <div
        className={allBlown ? 'celebration-card' : ''}
        style={{
          background:'rgba(255,255,255,0.45)',backdropFilter:'blur(20px)',
          borderRadius:28,width:'min(430px,100%)',
          padding:'0 0 28px 0',
          boxShadow:'0 12px 48px rgba(26,115,232,0.18),0 2px 12px rgba(0,0,0,0.08)',
          border:'1px solid rgba(255,255,255,0.7)',
          position:'relative',overflow:'hidden',
        }}
      >
        {/* Hero */}
        <div style={{
          background:'linear-gradient(160deg,#e3f2fd 0%,#bbdefb 50%,#90caf9 100%)',
          borderRadius:'28px 28px 40px 40px',
          padding:'24px 20px 24px',
          position:'relative',overflow:'hidden',marginBottom:20,
        }}>
          <StaticConfetti />

          <div style={{ position:'relative',zIndex:1,marginBottom:14,textAlign:'center' }}>
            <div style={{
              display:'inline-block',padding:'12px 28px',borderRadius:14,
              background:'linear-gradient(135deg,#1a73e8,#1557b0)',
              boxShadow:'0 4px 15px rgba(26,115,232,0.5),inset 0 1px 0 rgba(255,255,255,0.2)',
              color:'white',fontSize:20,fontWeight:800,letterSpacing:'0.02em',
              textShadow:'0 1px 3px rgba(0,0,0,0.3)',
            }}>
              HAPPY BIRTHDAY DUDU!
            </div>
          </div>

          <div style={{ position:'relative',zIndex:1,display:'flex',justifyContent:'center' }}>
            <BirthdayCake blownCandles={blown} blowingOut={blowingOut} />
          </div>

          <div style={{ position:'relative',zIndex:1,textAlign:'center',marginTop:8 }}>
            <span style={{
              display:'inline-block',
              background:'rgba(255,255,255,0.72)',borderRadius:20,
              padding:'4px 16px',fontSize:13,fontWeight:700,color:'#1557b0',
            }}>
              🕯️ {blown.size} / {TOTAL} candles blown out
            </span>
          </div>
        </div>

        {/* Interaction */}
        <div style={{ padding:'0 20px',marginBottom:20 }}>
          {!allBlown ? (
            !micActive ? (
              <div style={{ textAlign:'center' }}>
                <p style={{ color:'#1557b0',fontSize:14,marginBottom:12,fontWeight:500 }}>
                  🎤 One big blow into your microphone extinguishes all candles!
                </p>
                {micError && (
                  <p style={{ color:'#c62828',fontSize:12,marginBottom:12,padding:'8px 12px',background:'#ffebee',borderRadius:8 }}>
                    {micError}
                  </p>
                )}
                <button
                  onClick={startMic}
                  style={btn}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(26,115,232,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(26,115,232,0.4)' }}
                >
                  🎤 Enable Microphone to Blow Candles
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10 }}>
                  <div style={{ width:9,height:9,borderRadius:'50%',background:'#f44336',animation:'pulse-ring 1s ease-out infinite' }} />
                  <p style={{ color:'#1557b0',fontSize:14,fontWeight:600 }}>
                    Listening… blow hard into your microphone!
                  </p>
                </div>
                <div style={{ height:8,background:'#e3f2fd',borderRadius:8,marginBottom:12,overflow:'hidden' }}>
                  <div style={{
                    height:'100%',width:`${blowLevel}%`,
                    background: blowLevel>18 ? 'linear-gradient(90deg,#1a73e8,#42a5f5)' : 'linear-gradient(90deg,#90caf9,#64b5f6)',
                    borderRadius:8,transition:'width 0.05s',
                  }} />
                </div>
                <div style={{ textAlign:'center' }}>
                  <button onClick={stopMic} style={{
                    padding:'8px 18px',borderRadius:10,border:'2px solid #e3f2fd',
                    background:'white',color:'#666',fontSize:13,cursor:'pointer',fontFamily:'inherit',
                  }}>
                    Stop Microphone
                  </button>
                </div>
              </div>
            )
          ) : (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:36,marginBottom:8 }}>🎉🎂🎉</div>
              <p style={{ color:'#1557b0',fontSize:18,fontWeight:800,marginBottom:4 }}>All 29 candles blown out!</p>
              <p style={{ color:'#555',fontSize:13,marginBottom:16 }}>Make a wish — Happy 29th Birthday! 💙</p>
              <button onClick={reset} style={{
                padding:'10px 24px',borderRadius:12,border:'2px solid #e3f2fd',
                background:'white',color:'#1a73e8',fontSize:14,fontWeight:600,
                cursor:'pointer',fontFamily:'inherit',
              }}>
                🕯️ Relight Candles
              </button>
            </div>
          )}
        </div>

        {/* Wishes */}
        <div style={{ padding:'0 20px' }}>
          <p style={{ color:'#1a73e8',fontSize:13,fontWeight:800,letterSpacing:'0.08em',marginBottom:12 }}>
            BIRTHDAY WISHES:
          </p>
          <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:14 }}>
            {wishes.map(w => (
              <div key={w.id} style={{
                background:'rgba(255,255,255,0.82)',borderRadius:16,
                padding:'12px 14px',display:'flex',alignItems:'flex-start',gap:12,
                boxShadow:'0 2px 8px rgba(26,115,232,0.08)',border:'1px solid rgba(255,255,255,0.9)',
              }}>
                <Avatar name={w.name} />
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ color:'#333',fontSize:14,margin:0,lineHeight:1.5 }}>{w.text}</p>
                  <p style={{ color:'#1a73e8',fontSize:12,fontWeight:600,margin:'4px 0 0' }}>— {w.name}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ ...btn, padding:'15px 20px' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(26,115,232,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(26,115,232,0.4)' }}
          >
            <span style={{ fontSize:16 }}>♥</span> Leave a Wish
          </button>
        </div>
      </div>
    </div>
  )
}
