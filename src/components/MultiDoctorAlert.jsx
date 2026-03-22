export default function MultiDoctorAlert({ alert, onDismiss }) {
  const isHigh = alert.severity === "HIGH"
  return (
    <div style={{
      background:"rgba(255,107,53,0.08)",
      border:"1px solid rgba(255,107,53,0.25)",
      borderRadius:"14px", padding:"16px",
      marginBottom:"10px", position:"relative", overflow:"hidden"
    }}>
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:"3px",
        background: isHigh ? "#FF6B35" : "#FFD60A"
      }}/>

      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"10px", marginBottom:"12px"}}>
        <div style={{display:"flex", alignItems:"flex-start", gap:"10px", flex:1, minWidth:0}}>
          <span style={{fontSize:"20px", flexShrink:0}}>👨‍⚕️</span>
          <div style={{minWidth:0}}>
            <p style={{
              color:"#FF6B35", fontWeight:"700", fontSize:"11px",
              fontFamily:"'JetBrains Mono',monospace",
              letterSpacing:"0.1em", margin:"0 0 4px",
              textTransform:"uppercase"
            }}>
              {isHigh ? "High Risk" : "Medium Risk"} — Multi-Doctor
            </p>
            <p style={{
              color:"#EAEEF2", fontWeight:"600",
              fontSize:"13px", margin:0, lineHeight:"1.4"
            }}>
              {alert.memberName}'s medicines conflict
            </p>
          </div>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} style={{
            background:"none", border:"none",
            color:"#636E7B", cursor:"pointer",
            fontSize:"18px", flexShrink:0, padding:0
          }}>×</button>
        )}
      </div>

      {/* Two doctors side by side */}
      <div style={{
        display:"grid", gridTemplateColumns:"1fr 1fr",
        gap:"8px", marginBottom:"8px"
      }}>
        {[
          {label:"Doctor 1", doctor:alert.doctor1, condition:alert.condition1, med:alert.med1},
          {label:"Doctor 2", doctor:alert.doctor2, condition:alert.condition2, med:alert.med2},
        ].map((d, i) => (
          <div key={i} style={{
            background:"rgba(0,0,0,0.25)",
            borderRadius:"10px", padding:"10px"
          }}>
            <p style={{
              color:"#636E7B", fontSize:"9px",
              fontFamily:"'JetBrains Mono',monospace",
              letterSpacing:"0.15em", textTransform:"uppercase",
              margin:"0 0 4px"
            }}>{d.label}</p>
            <p style={{color:"#EAEEF2", fontWeight:"600", fontSize:"12px", margin:"0 0 2px"}}>
              {d.doctor}
            </p>
            <p style={{color:"#636E7B", fontSize:"10px", margin:"0 0 4px"}}>
              For: {d.condition}
            </p>
            <p style={{color:"#FF8855", fontWeight:"700", fontSize:"12px", margin:0}}>
              {d.med}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        background:"rgba(0,0,0,0.25)", borderRadius:"10px",
        padding:"10px 12px", marginBottom:"8px"
      }}>
        <p style={{
          color:"#636E7B", fontSize:"9px",
          fontFamily:"'JetBrains Mono',monospace",
          letterSpacing:"0.2em", textTransform:"uppercase", margin:"0 0 4px"
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
          letterSpacing:"0.2em", textTransform:"uppercase", margin:"0 0 4px"
        }}>Action</p>
        <p style={{
          color:"#FF8855", fontSize:"13px",
          fontWeight:"600", margin:0, lineHeight:"1.5"
        }}>{alert.action}</p>
      </div>
    </div>
  )
}
