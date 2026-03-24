import { useEffect, useState, useRef } from "react"

export default function ScoreDial({
  score,
  size = 120,
  strokeWidth = 8,
  label = "",
  animate = true
}) {
  const [displayScore, setDisplayScore] = useState(0)
  const animRef = useRef(null)

  const color =
    score >= 80 ? "#00FF88" :
    score >= 60 ? "#FFD60A" :
    score >= 40 ? "#FF6B35" : "#FF2D4B"

  const bgColor =
    score >= 80 ? "rgba(0,255,136,0.08)"  :
    score >= 60 ? "rgba(255,214,10,0.08)" :
    score >= 40 ? "rgba(255,107,53,0.08)" :
                  "rgba(255,45,75,0.08)"

  const radius       = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress     = (displayScore / 100) * circumference

  const status =
    score >= 80 ? "SAFE"     :
    score >= 60 ? "MODERATE" :
    score >= 40 ? "AT RISK"  : "DANGER"

  useEffect(() => {
    if (!animate) { setDisplayScore(score); return }
    let start = null
    const duration = 1200
    const startVal = 0

    const step = (timestamp) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(startVal + (score - startVal) * eased))
      if (progress < 1) animRef.current = requestAnimationFrame(step)
    }

    animRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animRef.current)
  }, [score, animate])

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      alignItems:"center", gap:"8px"
    }}>
      <div style={{ position:"relative", width:size, height:size }}>

        {/* Background glow */}
        <div style={{
          position:"absolute", inset:"-8px",
          borderRadius:"50%",
          background:`radial-gradient(circle, ${bgColor} 0%, transparent 70%)`,
          animation:"glowPulse 2s ease-in-out infinite"
        }}/>

        <style>{`
          @keyframes glowPulse {
            0%,100% { opacity: 0.6; transform: scale(1); }
            50%      { opacity: 1;   transform: scale(1.05); }
          }
        `}</style>

        {/* SVG dial */}
        <svg
          width={size} height={size}
          style={{transform:"rotate(-90deg)", position:"relative", zIndex:1}}
        >
          {/* Track */}
          <circle
            cx={size/2} cy={size/2} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size/2} cy={size/2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{
              filter:`drop-shadow(0 0 6px ${color})`,
              transition:"stroke-dasharray 0.05s linear"
            }}
          />
        </svg>

        {/* Center text */}
        <div style={{
          position:"absolute", inset:0,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          zIndex:2
        }}>
          <span style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize:size * 0.28,
            color:color, lineHeight:1,
            textShadow:`0 0 12px ${color}`
          }}>{displayScore}</span>
          <span style={{
            fontFamily:"'JetBrains Mono',monospace",
            fontSize:size * 0.08,
            color:"rgba(255,255,255,0.3)",
            letterSpacing:"0.1em"
          }}>/100</span>
        </div>
      </div>

      {label && (
        <div style={{textAlign:"center"}}>
          <p style={{
            fontFamily:"'DM Sans',sans-serif",
            fontSize:"13px", fontWeight:"600",
            color:"rgba(255,255,255,0.8)",
            margin:"0 0 2px"
          }}>{label}</p>
          <span style={{
            fontFamily:"'JetBrains Mono',monospace",
            fontSize:"9px", letterSpacing:"0.2em",
            padding:"2px 8px", borderRadius:"20px",
            background:`rgba(${color === "#00FF88" ? "0,255,136" : color === "#FFD60A" ? "255,214,10" : color === "#FF6B35" ? "255,107,53" : "255,45,75"},0.12)`,
            color:color,
            border:`1px solid ${color}33`
          }}>{status}</span>
        </div>
      )}
    </div>
  )
}
