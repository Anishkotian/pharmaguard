export default function FamilyMap({ members, alerts }) {
  const hasAlert = (name) =>
    alerts.some(a => a.member1 === name || a.member2 === name || a.memberName === name)

  return (
    <div style={{
      background:"rgba(255,255,255,0.03)",
      border:"1px solid rgba(255,255,255,0.07)",
      borderRadius:"16px", padding:"16px"
    }}>
      <p style={{
        fontFamily:"'JetBrains Mono',monospace",
        fontSize:"9px", letterSpacing:"0.2em",
        color:"#636E7B", textTransform:"uppercase",
        margin:"0 0 14px"
      }}>Family Medicine Map</p>

      {/* Member nodes */}
      <div style={{
        display:"flex", flexWrap:"wrap",
        gap:"8px", marginBottom:"14px"
      }}>
        {members.map(member => (
          <div key={member.id} style={{
            background: hasAlert(member.name)
              ? "rgba(204,34,34,0.1)"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${hasAlert(member.name)
              ? "rgba(204,34,34,0.4)"
              : "rgba(255,255,255,0.08)"}`,
            borderRadius:"12px",
            padding:"10px 14px",
            textAlign:"center",
            minWidth:"80px",
            animation: hasAlert(member.name) ? "mapPulse 2s ease-in-out infinite" : "none"
          }}>
            <style>{`
              @keyframes mapPulse {
                0%,100% { box-shadow: 0 0 0 0 rgba(204,34,34,0.4); }
                50% { box-shadow: 0 0 0 6px rgba(204,34,34,0); }
              }
            `}</style>
            <p style={{fontSize:"20px", margin:"0 0 4px"}}>
              {hasAlert(member.name) ? "🚨" : "👤"}
            </p>
            <p style={{
              color:"#EAEEF2", fontWeight:"600",
              fontSize:"12px", margin:"0 0 2px"
            }}>{member.name}</p>
            <p style={{color:"#636E7B", fontSize:"10px", margin:0}}>
              {member.medicines.length} med{member.medicines.length !== 1 ? "s" : ""}
            </p>
          </div>
        ))}
      </div>

      {/* Alert connections */}
      {alerts.length > 0 ? (
        <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
          {alerts.map((alert, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:"8px",
              background:"rgba(204,34,34,0.08)",
              border:"1px solid rgba(204,34,34,0.2)",
              borderRadius:"10px", padding:"8px 12px",
              flexWrap:"wrap"
            }}>
              <div style={{
                width:"6px", height:"6px", borderRadius:"50%",
                background:"#CC2222", flexShrink:0,
                animation:"mapPulse 1.5s ease-in-out infinite"
              }}/>
              <span style={{color:"#FF5555", fontWeight:"700", fontSize:"12px"}}>
                {alert.member1 || alert.memberName}
              </span>
              <span style={{color:"#636E7B", fontSize:"11px"}}>
                ⚡ {alert.severity}
              </span>
              <span style={{color:"#FF5555", fontWeight:"700", fontSize:"12px"}}>
                {alert.member2 || ""}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display:"flex", alignItems:"center", gap:"8px",
          color:"#00CC66", fontSize:"13px"
        }}>
          <span>✅</span>
          <span>No cross-family interactions detected</span>
        </div>
      )}
    </div>
  )
}
