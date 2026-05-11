import { useEffect, useState } from 'react'

const COLORS = ['#1a73e8','#4fc3f7','#81d4fa','#ffffff','#b3e5fc','#29b6f6','#0288d1','#e3f2fd','#64b5f6','#42a5f5']
const SHAPES = ['rect','circle','rect']

export function Confetti({ active }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!active) return
    const next = Array.from({ length: 90 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: Math.random() * 8 + 5,
      dur: Math.random() * 2 + 2,
      delay: Math.random() * 1.5,
      rotate: Math.random() * 360,
    }))
    setPieces(next)
    const t = setTimeout(() => setPieces([]), 5000)
    return () => clearTimeout(t)
  }, [active])

  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            width:  p.shape === 'circle' ? p.size : p.size * 1.5,
            height: p.shape === 'circle' ? p.size : p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : 2,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
            opacity: 0.9,
          }}
        />
      ))}
    </>
  )
}

const STATIC = [
  { x:8,  y:12, color:'#4fc3f7', w:10, h:5,  rotate:30  },
  { x:20, y:6,  color:'#81d4fa', w:6,  h:6,  rotate:0,  circle:true },
  { x:35, y:15, color:'#ffffff', w:8,  h:4,  rotate:-20 },
  { x:55, y:8,  color:'#29b6f6', w:7,  h:7,  rotate:0,  circle:true },
  { x:68, y:18, color:'#b3e5fc', w:10, h:5,  rotate:45  },
  { x:78, y:5,  color:'#4fc3f7', w:6,  h:3,  rotate:-30 },
  { x:88, y:20, color:'#ffffff', w:8,  h:4,  rotate:15  },
  { x:92, y:10, color:'#81d4fa', w:6,  h:6,  rotate:0,  circle:true },
  { x:12, y:25, color:'#64b5f6', w:5,  h:5,  rotate:0,  circle:true },
  { x:45, y:22, color:'#4fc3f7', w:9,  h:4,  rotate:60  },
  { x:72, y:28, color:'#b3e5fc', w:7,  h:3,  rotate:-45 },
  { x:3,  y:18, color:'#42a5f5', w:6,  h:3,  rotate:20  },
]

export function StaticConfetti() {
  return (
    <div style={{ position:'absolute',inset:0,overflow:'hidden',borderRadius:'inherit',pointerEvents:'none' }}>
      {STATIC.map((p, i) => (
        <div key={i} style={{
          position:'absolute',
          left:`${p.x}%`,top:`${p.y}%`,
          width: p.circle ? p.w : p.w,
          height: p.circle ? p.w : p.h,
          backgroundColor: p.color,
          borderRadius: p.circle ? '50%' : 3,
          transform: `rotate(${p.rotate}deg)`,
          opacity: 0.7,
        }} />
      ))}
    </div>
  )
}
