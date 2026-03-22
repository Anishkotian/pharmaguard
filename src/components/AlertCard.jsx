export default function AlertCard({ alert, onDismiss }) {
  const isHigh = alert.severity === "HIGH"
  return (
    <div style={{
      background: isHigh ? "rgba(204,34,34,0.1)" : "rgba(255,214,10,0.08)",
      border: `1px solid ${isHigh ? "rgba(204,34,34,0.3)" : "rgba(255,214,10,0.25)"}`,
      borderRadius:"14px", padding:"16px",
      marginBottom:"10px", position:"relative",
      overflow:"hidden"
    }}>
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:"3px",
        background: isHigh ? "#CC2222" : "#FFD60A"
      }}/>

      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"10px", marginBottom:"12px"}}>
        <div style={{display:"flex", alignItems:"flex-start", gap:"10px", flex:1, minWidth:0}}>
          <span style={{fontSize:"20px", flexShrink:0}}>
            {isHigh ? "🚨" : "⚠️"}
          </span>
          <div style={{minWidth:0}}>
            <p style={{
              color: isHigh ? "#FF5555" : "#FFD60A",
              fontWeight:"700", fontSize:"11px",
              fontFamily:"'JetBrains Mono',monospace",
              letterSpacing:"0.1em", margin:"0 0 4px",
              textTransform:"uppercase"
            }}>
              {isHigh ? "High Risk" : "Medium Risk"} — Cross Family
            </p>
            <p style={{
              color:"#EAEEF2", fontWeight:"600",
              fontSize:"13px", margin:0,
              lineHeight:"1.4"
            }}>
              {alert.member1}'s {alert.med1} + {alert.member2}'s {alert.med2}
            </p>
          </div>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} style={{
            background:"none", border:"none",
            color:"#636E7B", cursor:"pointer",
            fontSize:"18px", flexShrink:0,
            padding:0, lineHeight:1
          }}>×</button>
        )}
      </div>

      <div style={{
        background:"rgba(0,0,0,0.25)", borderRadius:"10px",
        padding:"10px 12px", marginBottom:"8px"
      }}>
        <p style={{
          color:"#636E7B", fontSize:"9px",
          fontFamily:"'JetBrains Mono',monospace",
          letterSpacing:"0.2em", textTransform:"uppercase",
          margin:"0 0 4px"
        }}>Risk</p>
        <p style={{color:"#EAEEF2", fontSize:"13px", margin:0, lineHeight:"1.5"}}>
          {alert.effect}
        </p>
      </div>

      <div style={{
        background:"rgba(0,0,0,0.25)", borderRadius:"10px",
        padding:"10px 12px"
      }}>
        <p style={{
          color:"#636E7B", fontSize:"9px",
          fontFamily:"'JetBrains Mono',monospace",
          letterSpacing:"0.2em", textTransform:"uppercase",
          margin:"0 0 4px"
        }}>Action</p>
        <p style={{
          color: isHigh ? "#FF8888" : "#FFD60A",
          fontSize:"13px", fontWeight:"600",
          margin:0, lineHeight:"1.5"
        }}>
          {alert.action}
        </p>
      </div>
    </div>
  )
}
