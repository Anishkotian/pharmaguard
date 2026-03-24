import { useState } from "react"
import ScoreDial from "./ScoreDial"
import { calculateFamilyScores, calculateFamilyOverallScore } from "../services/safetyScoreService"

export default function SafetyScore({ members, onClose }) {
  const [selectedMember, setSelectedMember] = useState(null)
  const memberScores  = calculateFamilyScores(members)
  const overallScore  = calculateFamilyOverallScore(memberScores)
  const selectedData  = memberScores.find(ms => ms.member.id === selectedMember)

  const msColor = (color) =>
    color === "green"  ? "#00FF88" :
    color === "yellow" ? "#FFD60A" :
    color === "orange" ? "#FF6B35" : "#FF2D4B"

  const msBg = (color) =>
    color === "green"  ? "rgba(0,255,136,0.08)"  :
    color === "yellow" ? "rgba(255,214,10,0.08)"  :
    color === "orange" ? "rgba(255,107,53,0.08)"  :
                         "rgba(255,45,75,0.08)"

  const msBorder = (color) =>
    color === "green"  ? "rgba(0,255,136,0.2)"  :
    color === "yellow" ? "rgba(255,214,10,0.2)"  :
    color === "orange" ? "rgba(255,107,53,0.2)"  :
                         "rgba(255,45,75,0.2)"

  return (
    <div style={{
      position:"fixed", inset:0,
      background:"rgba(0,0,0,0.85)",
      backdropFilter:"blur(8px)",
      display:"flex",
      alignItems:"flex-end",
      justifyContent:"center",
      zIndex:50,
      padding:"0"
    }}>
      <style>{`
        @media(min-width:640px){
          .ss-modal {
            align-self: center !important;
            border-radius: 20px !important;
            max-width: 480px !important;
          }
        }
        .reason-row {
          display:flex; align-items:flex-start; gap:10px;
          padding:10px 12px; border-radius:10px;
          margin-bottom:6px;
          transition: all 0.2s;
        }
        .reason-row:hover { filter: brightness(1.1); }
      `}</style>

      <div className="ss-modal" style={{
        background:"rgba(9,12,16,0.98)",
        border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:"20px 20px 0 0",
        width:"100%",
        maxHeight:"90vh",
        overflowY:"auto",
        fontFamily:"'DM Sans',sans-serif"
      }}>

        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"20px 20px 0",
          position:"sticky", top:0,
          background:"rgba(9,12,16,0.98)",
          zIndex:1
        }}>
          <div>
            <h2 style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize:"28px", letterSpacing:"0.06em",
              color:"#EAEEF2", margin:0
            }}>🛡️ Safety Scores</h2>
            <p style={{color:"#636E7B", fontSize:"12px", margin:"2px 0 0"}}>
              Medicine safety rating for each family member
            </p>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.1)",
            color:"#EAEEF2", borderRadius:"10px",
            width:"36px", height:"36px",
            fontSize:"18px", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center"
          }}>×</button>
        </div>

        <div style={{padding:"20px"}}>

          {/* Overall score */}
          <div style={{
            background:"rgba(255,255,255,0.03)",
            border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:"16px", padding:"24px",
            display:"flex", flexDirection:"column",
            alignItems:"center", gap:"12px",
            marginBottom:"20px"
          }}>
            <p style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"9px", letterSpacing:"0.25em",
              color:"#636E7B", textTransform:"uppercase", margin:0
            }}>Overall Family Score</p>
            <ScoreDial
              score={overallScore}
              size={140}
              strokeWidth={10}
              animate={true}
            />
            <p style={{
              color:"#636E7B", fontSize:"13px", margin:0, textAlign:"center"
            }}>
              {members.length} members · {members.reduce((s,m) => s + m.medicines.length, 0)} medicines
            </p>
          </div>

          {/* Member dials */}
          <div style={{
            display:"flex", gap:"12px",
            justifyContent:"center", flexWrap:"wrap",
            marginBottom:"20px"
          }}>
            {memberScores.map(ms => (
              <div
                key={ms.member.id}
                onClick={() => setSelectedMember(
                  selectedMember === ms.member.id ? null : ms.member.id
                )}
                style={{
                  background: selectedMember === ms.member.id
                    ? msBg(ms.color)
                    : "rgba(255,255,255,0.03)",
                  border:`1px solid ${selectedMember === ms.member.id
                    ? msBorder(ms.color)
                    : "rgba(255,255,255,0.07)"}`,
                  borderRadius:"14px", padding:"16px",
                  cursor:"pointer", textAlign:"center",
                  transition:"all 0.25s",
                  minWidth:"100px"
                }}
              >
                <ScoreDial
                  score={ms.score}
                  size={80}
                  strokeWidth={6}
                  animate={true}
                />
                <p style={{
                  color:"#EAEEF2", fontWeight:"600",
                  fontSize:"12px", margin:"8px 0 2px"
                }}>{ms.member.name}</p>
                <p style={{color:"#636E7B", fontSize:"10px", margin:0}}>
                  Age {ms.member.age}
                </p>
                <p style={{
                  color:"#636E7B", fontSize:"10px",
                  margin:"4px 0 0"
                }}>
                  {selectedMember === ms.member.id ? "▲ Hide" : "▼ Details"}
                </p>
              </div>
            ))}
          </div>

          {/* Expanded member details */}
          {selectedData && (
            <div style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:"16px", padding:"16px",
              marginBottom:"20px",
              animation:"fadeIn 0.3s ease"
            }}>
              <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
              <p style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:"9px", letterSpacing:"0.2em",
                color:"#636E7B", textTransform:"uppercase",
                margin:"0 0 12px"
              }}>Risk Factors — {selectedData.member.name}</p>

              {selectedData.reasons.length === 0 ? (
                <div style={{
                  display:"flex", alignItems:"center", gap:"10px",
                  color:"#00CC66", padding:"12px"
                }}>
                  <span>✅</span>
                  <p style={{margin:0, fontSize:"13px"}}>
                    No risk factors. Score is perfect 100/100.
                  </p>
                </div>
              ) : (
                <>
                  {selectedData.reasons.map((reason, i) => (
                    <div key={i} className="reason-row" style={{
                      background:
                        reason.severity === "HIGH"   ? "rgba(204,34,34,0.1)"    :
                        reason.severity === "MEDIUM" ? "rgba(255,214,10,0.08)"  :
                                                       "rgba(0,212,255,0.08)",
                      border:`1px solid ${
                        reason.severity === "HIGH"   ? "rgba(204,34,34,0.2)"    :
                        reason.severity === "MEDIUM" ? "rgba(255,214,10,0.15)"  :
                                                       "rgba(0,212,255,0.15)"}`
                    }}>
                      <span style={{fontSize:"16px", flexShrink:0}}>
                        {reason.type === "interaction"      && "⚡"}
                        {reason.type === "self_interaction"  && "🔄"}
                        {reason.type === "duplicate"        && "💊"}
                        {reason.type === "missing_info"     && "ℹ️"}
                        {reason.type === "polypharmacy"     && "⚠️"}
                      </span>
                      <p style={{
                        flex:1, color:"#EAEEF2",
                        fontSize:"12px", margin:0, lineHeight:"1.5"
                      }}>{reason.text}</p>
                      <span style={{
                        color:
                          reason.severity === "HIGH"   ? "#FF5555" :
                          reason.severity === "MEDIUM" ? "#FFD60A" : "#00D4FF",
                        fontWeight:"700", fontSize:"12px",
                        flexShrink:0,
                        fontFamily:"'JetBrains Mono',monospace"
                      }}>-{reason.deduction}</span>
                    </div>
                  ))}

                  {/* Breakdown */}
                  <div style={{
                    background:"rgba(0,0,0,0.3)",
                    borderRadius:"10px", padding:"12px",
                    marginTop:"8px"
                  }}>
                    <p style={{
                      fontFamily:"'JetBrains Mono',monospace",
                      fontSize:"9px", letterSpacing:"0.2em",
                      color:"#636E7B", textTransform:"uppercase",
                      margin:"0 0 8px"
                    }}>Score Breakdown</p>
                    <div style={{display:"flex", justifyContent:"space-between", marginBottom:"4px"}}>
                      <span style={{color:"#636E7B", fontSize:"12px"}}>Starting score</span>
                      <span style={{color:"#EAEEF2", fontWeight:"700", fontSize:"12px"}}>100</span>
                    </div>
                    {selectedData.reasons.map((r, i) => (
                      <div key={i} style={{display:"flex", justifyContent:"space-between", marginBottom:"3px"}}>
                        <span style={{color:"#636E7B", fontSize:"11px"}}>
                          {r.type === "interaction"     && "Cross-family interaction"}
                          {r.type === "self_interaction" && "Self interaction"}
                          {r.type === "duplicate"       && "Duplicate medicine"}
                          {r.type === "missing_info"    && "Missing doctor info"}
                          {r.type === "polypharmacy"    && "Too many medicines"}
                        </span>
                        <span style={{color:"#FF5555", fontWeight:"700", fontSize:"11px",
                          fontFamily:"'JetBrains Mono',monospace"}}>
                          -{r.deduction}
                        </span>
                      </div>
                    ))}
                    <div style={{
                      display:"flex", justifyContent:"space-between",
                      paddingTop:"8px", marginTop:"4px",
                      borderTop:"1px solid rgba(255,255,255,0.06)"
                    }}>
                      <span style={{color:"#EAEEF2", fontWeight:"700", fontSize:"13px"}}>Final Score</span>
                      <span style={{
                        color:msColor(selectedData.color),
                        fontWeight:"700", fontSize:"14px",
                        fontFamily:"'Bebas Neue',sans-serif",
                        letterSpacing:"0.04em"
                      }}>{selectedData.score}/100</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Legend */}
          <div style={{
            background:"rgba(255,255,255,0.03)",
            border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:"14px", padding:"14px"
          }}>
            <p style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"9px", letterSpacing:"0.2em",
              color:"#636E7B", textTransform:"uppercase",
              margin:"0 0 10px"
            }}>Score Guide</p>
            <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
              {[
                ["80 – 100", "Safe",     "#00FF88"],
                ["60 – 79",  "Moderate", "#FFD60A"],
                ["40 – 59",  "At Risk",  "#FF6B35"],
                ["0 – 39",   "Danger",   "#FF2D4B"],
              ].map(([range, label, color]) => (
                <div key={range} style={{
                  display:"flex", alignItems:"center",
                  justifyContent:"space-between"
                }}>
                  <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
                    <div style={{
                      width:"10px", height:"10px", borderRadius:"50%",
                      background:color,
                      boxShadow:`0 0 6px ${color}`
                    }}/>
                    <span style={{color:"#636E7B", fontSize:"12px"}}>{label}</span>
                  </div>
                  <span style={{
                    color:color,
                    fontFamily:"'JetBrains Mono',monospace",
                    fontSize:"11px"
                  }}>{range}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
