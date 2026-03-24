import { useEffect, useState } from "react"

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 900)
    const t3 = setTimeout(() => setPhase(3), 1600)
    const t4 = setTimeout(() => setPhase(4), 2200)
    const t5 = setTimeout(() => onComplete(), 3000)
    return () => [t1,t2,t3,t4,t5].forEach(clearTimeout)
  }, [])

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"#05070A",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      overflow:"hidden",
      opacity: phase === 4 ? 0 : 1,
      transition: phase === 4 ? "opacity 0.6s ease" : "none"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');

        @keyframes gridPan {
          0%   { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }
        @keyframes blobPulse {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50%      { transform: scale(1.15); opacity: 0.9; }
        }
        @keyframes logoReveal {
          from { opacity:0; transform: translateY(20px) scale(0.95); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes lineExpand {
          from { width: 0; }
          to   { width: 120px; }
        }
        @keyframes tagReveal {
          from { opacity:0; transform: translateY(8px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes barFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes dotPop {
          0%   { transform: scale(0); opacity:0; }
          60%  { transform: scale(1.3); opacity:1; }
          100% { transform: scale(1); opacity:1; }
        }
      `}</style>

      {/* Animated grid background */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:
          "linear-gradient(rgba(204,34,34,0.06) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(204,34,34,0.06) 1px, transparent 1px)",
        backgroundSize:"60px 60px",
        animation:"gridPan 20s linear infinite",
        pointerEvents:"none"
      }}/>

      {/* Glow blobs */}
      <div style={{
        position:"absolute",
        width:"500px", height:"500px",
        background:"radial-gradient(circle, rgba(204,34,34,0.15) 0%, transparent 70%)",
        top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        animation:"blobPulse 3s ease-in-out infinite",
        pointerEvents:"none"
      }}/>
      <div style={{
        position:"absolute",
        width:"300px", height:"300px",
        background:"radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
        top:"20%", left:"20%",
        animation:"blobPulse 4s ease-in-out infinite 1s",
        pointerEvents:"none"
      }}/>

      {/* Center content */}
      <div style={{
        position:"relative", zIndex:1,
        display:"flex", flexDirection:"column",
        alignItems:"center", gap:"0px",
        textAlign:"center", padding:"0 24px"
      }}>

        {/* Shield icon */}
        <div style={{
          fontSize:"56px", marginBottom:"16px",
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "scale(1)" : "scale(0.5)",
          transition:"all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          filter:"drop-shadow(0 0 20px rgba(204,34,34,0.6))"
        }}>🛡️</div>

        {/* PHARMAGUARD text */}
        <h1 style={{
          fontFamily:"'Bebas Neue',sans-serif",
          fontSize:"clamp(52px,14vw,88px)",
          letterSpacing:"0.08em",
          lineHeight:0.9,
          margin:"0 0 4px",
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
          transition:"all 0.7s ease",
          background:"linear-gradient(135deg, #FF4444 0%, #CC2222 50%, #FF6666 100%)",
          WebkitBackgroundClip:"text",
          WebkitTextFillColor:"transparent",
          backgroundClip:"text"
        }}>
          PHARMA<br/>GUARD
        </h1>

        {/* Animated line */}
        <div style={{
          height:"2px", background:"linear-gradient(90deg, transparent, #CC2222, transparent)",
          margin:"12px 0",
          width: phase >= 2 ? "120px" : "0px",
          transition:"width 0.6s ease"
        }}/>

        {/* Tagline */}
        <p style={{
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:"clamp(10px,3vw,13px)",
          letterSpacing:"0.25em",
          color:"#636E7B",
          textTransform:"uppercase",
          margin:"0 0 32px",
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(8px)",
          transition:"all 0.5s ease 0.2s"
        }}>
          Family Medicine Safety System
        </p>

        {/* Feature pills */}
        <div style={{
          display:"flex", gap:"8px", flexWrap:"wrap",
          justifyContent:"center", marginBottom:"40px",
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "translateY(0)" : "translateY(12px)",
          transition:"all 0.5s ease"
        }}>
          {["🚨 Cross-Family Alerts","💊 Duplicate Detection","🤒 Symptom Lookup","🛡️ Safety Score"].map((pill, i) => (
            <span key={i} style={{
              background:"rgba(204,34,34,0.1)",
              border:"1px solid rgba(204,34,34,0.25)",
              borderRadius:"20px", padding:"5px 12px",
              fontSize:"11px", color:"#FF8888",
              fontFamily:"'DM Sans',sans-serif",
              fontWeight:"600",
              opacity: phase >= 3 ? 1 : 0,
              transform: phase >= 3 ? "translateY(0) scale(1)" : "translateY(8px) scale(0.9)",
              transition:`all 0.4s ease ${0.1 * i}s`
            }}>{pill}</span>
          ))}
        </div>

        {/* Loading bar */}
        <div style={{
          width:"200px", height:"2px",
          background:"rgba(255,255,255,0.06)",
          borderRadius:"2px", overflow:"hidden",
          opacity: phase >= 2 ? 1 : 0,
          transition:"opacity 0.3s"
        }}>
          <div style={{
            height:"100%",
            background:"linear-gradient(90deg, #CC2222, #FF6666)",
            borderRadius:"2px",
            width: phase >= 3 ? "100%" : phase >= 2 ? "60%" : "0%",
            transition:"width 0.8s ease"
          }}/>
        </div>
        <p style={{
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:"10px", color:"#636E7B",
          letterSpacing:"0.15em", marginTop:"8px",
          opacity: phase >= 2 ? 1 : 0,
          transition:"opacity 0.3s"
        }}>
          {phase >= 3 ? "READY" : "LOADING..."}
        </p>

      </div>

      {/* Corner decorations */}
      <div style={{
        position:"absolute", top:"20px", left:"20px",
        fontFamily:"'JetBrains Mono',monospace",
        fontSize:"10px", color:"rgba(204,34,34,0.4)",
        letterSpacing:"0.1em",
        opacity: phase >= 1 ? 1 : 0,
        transition:"opacity 0.5s"
      }}>PG_OS v2.0</div>
      <div style={{
        position:"absolute", bottom:"20px", right:"20px",
        fontFamily:"'JetBrains Mono',monospace",
        fontSize:"10px", color:"rgba(204,34,34,0.4)",
        letterSpacing:"0.1em",
        opacity: phase >= 1 ? 1 : 0,
        transition:"opacity 0.5s"
      }}>HACKATHON 2026</div>

    </div>
  )
}
