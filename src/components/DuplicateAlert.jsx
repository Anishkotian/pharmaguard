export default function DuplicateAlert({ duplicate }) {
  const { generic, entries, totalDose, safeLimit, isOverLimit } = duplicate
  return (
    <div style={{
      background: isOverLimit ? "rgba(204,34,34,0.1)" : "rgba(255,214,10,0.08)",
      border:`1px solid ${isOverLimit ? "rgba(204,34,34,0.3)" : "rgba(255,214,10,0.25)"}`,
      borderRadius:"14px", padding:"16px",
      marginBottom:"10px", position:"relative", overflow:"hidden"
    }}>
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:"3px",
        background: isOverLimit ? "#CC2222" : "#FFD60A"
      }}/>

      <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px"}}>
        <span style={{fontSize:"22px"}}>💊</span>
        <div>
          <p style={{
            color: isOverLimit ? "#FF5555" : "#FFD60A",
            fontWeight:"700", fontSize:"11px",
            fontFamily:"'JetBrains Mono',monospace",
            letterSpacing:"0.1em", textTransform:"uppercase",
            margin:"0 0 2px"
          }}>Duplicate Medicine</p>
          <p style={{
            color:"#EAEEF2", fontWeight:"700",
            fontSize:"15px", textTransform:"uppercase",
            margin:0, letterSpacing:"0.04em",
            fontFamily:"'Bebas Neue',sans-serif"
          }}>{generic}</p>
        </div>
      </div>

      <div style={{
        background:"rgba(0,0,0,0.25)", borderRadius:"10px",
        padding:"10px 12px", marginBottom:"8px"
      }}>
        <p style={{
          color:"#636E7B", fontSize:"9px",
          fontFamily:"'JetBrains Mono',monospace",
          letterSpacing:"0.2em", textTransform:"uppercase",
          margin:"0 0 8px"
        }}>Same Molecule Found In</p>
        <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
          {entries.map((entry, i) => (
            <div key={i} style={{
              background:"rgba(255,255,255,0.06)",
              borderRadius:"8px", padding:"6px 10px"
            }}>
              <p style={{color:"#EAEEF2", fontWeight:"600", fontSize:"12px", margin:0}}>
                {entry.medicine?.brandName || entry.brand}
              </p>
              <p style={{color:"#636E7B", fontSize:"10px", margin:"2px 0 0"}}>
                {entry.member?.name || entry.member} · {entry.medicine?.dose || entry.dose}
              </p>
            </div>
          ))}
        </div>
      </div>

      {safeLimit && (
        <div style={{
          background:"rgba(0,0,0,0.25)", borderRadius:"10px",
          padding:"10px 12px", marginBottom:"8px"
        }}>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:"6px"}}>
            <p style={{
              color:"#636E7B", fontSize:"9px",
              fontFamily:"'JetBrains Mono',monospace",
              letterSpacing:"0.2em", textTransform:"uppercase", margin:0
            }}>Combined Dose</p>
            <p style={{
              color: isOverLimit ? "#FF5555" : "#FFD60A",
              fontSize:"11px", fontWeight:"700", margin:0
            }}>{totalDose}mg / {safeLimit}mg</p>
          </div>
          <div style={{
            width:"100%", height:"8px",
            background:"rgba(255,255,255,0.08)", borderRadius:"4px",
            overflow:"hidden"
          }}>
            <div style={{
              height:"100%",
              width:`${Math.min((totalDose/safeLimit)*100,100)}%`,
              background: isOverLimit ? "#CC2222" : "#FFD60A",
              borderRadius:"4px", transition:"width 0.8s ease"
            }}/>
          </div>
          {isOverLimit && (
            <p style={{color:"#FF5555", fontSize:"11px", margin:"6px 0 0", fontWeight:"600"}}>
              ⚠️ Combined dose exceeds safe daily limit
            </p>
          )}
        </div>
      )}

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
          color: isOverLimit ? "#FF8888" : "#FFD60A",
          fontSize:"13px", fontWeight:"600",
          margin:0, lineHeight:"1.5"
        }}>
          {isOverLimit
            ? "Remove one medicine immediately. Combined dose exceeds safe limit."
            : "Check with doctor — both medicines contain the same molecule."}
        </p>
      </div>
    </div>
  )
}
