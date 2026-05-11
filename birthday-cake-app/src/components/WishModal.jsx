import { useState } from 'react'

export default function WishModal({ onClose, onSubmit }) {
  const [wish, setWish] = useState('')
  const [name, setName] = useState('')

  const submit = () => {
    if (!wish.trim()) return
    onSubmit(wish.trim(), name.trim() || 'Anonymous')
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed',inset:0,
        background:'rgba(0,0,0,0.4)',
        display:'flex',alignItems:'center',justifyContent:'center',
        zIndex:1000,backdropFilter:'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:'white',borderRadius:20,
          padding:'28px 24px',
          width:'min(380px,90vw)',
          boxShadow:'0 20px 60px rgba(26,115,232,0.25)',
        }}
      >
        <h3 style={{ fontSize:20,fontWeight:700,color:'#1a73e8',marginBottom:6,textAlign:'center' }}>
          Leave a Birthday Wish 🎂
        </h3>
        <p style={{ color:'#666',fontSize:13,textAlign:'center',marginBottom:20 }}>
          Share your warm wishes!
        </p>

        <label style={{ display:'block',fontSize:13,fontWeight:600,color:'#1557b0',marginBottom:6 }}>
          Your Name (optional)
        </label>
        <input
          type="text"
          placeholder="Enter your name..."
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            width:'100%',padding:'10px 14px',
            border:'2px solid #e3f2fd',borderRadius:10,
            fontSize:14,outline:'none',marginBottom:14,
            fontFamily:'inherit',
          }}
          onFocus={e  => { e.target.style.borderColor='#1a73e8' }}
          onBlur={e   => { e.target.style.borderColor='#e3f2fd' }}
        />

        <label style={{ display:'block',fontSize:13,fontWeight:600,color:'#1557b0',marginBottom:6 }}>
          Your Wish *
        </label>
        <textarea
          placeholder="Write a birthday wish..."
          value={wish}
          onChange={e => setWish(e.target.value)}
          rows={3}
          style={{
            width:'100%',padding:'10px 14px',
            border:'2px solid #e3f2fd',borderRadius:10,
            fontSize:14,outline:'none',resize:'none',marginBottom:20,
            fontFamily:'inherit',
          }}
          onFocus={e => { e.target.style.borderColor='#1a73e8' }}
          onBlur={e  => { e.target.style.borderColor='#e3f2fd' }}
        />

        <div style={{ display:'flex',gap:10 }}>
          <button
            onClick={onClose}
            style={{
              flex:1,padding:'12px',border:'2px solid #e3f2fd',
              borderRadius:12,background:'white',color:'#666',
              fontWeight:600,cursor:'pointer',fontSize:14,fontFamily:'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!wish.trim()}
            style={{
              flex:2,padding:'12px',border:'none',borderRadius:12,
              background: wish.trim() ? 'linear-gradient(135deg,#1a73e8,#1557b0)' : '#ccc',
              color:'white',fontWeight:700,
              cursor: wish.trim() ? 'pointer' : 'not-allowed',
              fontSize:14,fontFamily:'inherit',
              boxShadow: wish.trim() ? '0 4px 15px rgba(26,115,232,0.35)' : 'none',
            }}
          >
            Send Wish 💙
          </button>
        </div>
      </div>
    </div>
  )
}
