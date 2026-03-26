import { useState } from "react"
import { aiSymptomDiagnosis } from "../services/aiService"

const examples = [
  "I feel dizzy every morning after taking my pill",
  "My legs are swelling since I started the new medicine",
  "I have a dry cough that won't go away",
  "I feel very tired and weak since last week",
  "My stomach hurts after every dose",
  "I can't sleep properly since I started the medicine",
]

export default function AISymptomDiagnosis({ family, onClose }) {
  const [symptom, setSymptom]   = useState("")
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleAnalyze = async (text) => {
    const s = text || symptom
    if (!s.trim()) return
    setSymptom(s)
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await aiSymptomDiagnosis(s, family)
      setResult(response)
    } catch {
      setError("Could not connect to AI. Please check your internet and try again.")
    }
    setLoading(false)
  }

  const parseResult = (text) => {
    const lines = {}
    const keys = ["LIKELY CAUSE", "CONFIDENCE", "EXPLANATION", "TIMING", "ACTION"]
    keys.forEach(key => {
      const match = text.match(new RegExp(`${key}:\\s*(.+?)(?=\\n[A-Z]+:|$)`, "s"))
      if (match) lines[key] = match[1].trim()
    })
    return lines
  }

  const parsed = result ? parseResult(result) : null

  const confColor =
    parsed?.CONFIDENCE?.toLowerCase() === "high"   ? "#00C853" :
    parsed?.CONFIDENCE?.toLowerCase() === "medium" ? "#FFB300" : "#E53935"

  return (
    <div style={{
      position:"fixed", inset:0,
      background:"rgba(0,0,0,0.85)",
      backdropFilter:"blur(8px)",
      display:"flex", alignItems:"flex-end",
      justifyContent:"center", zIndex:50
    }}>
      <style>{`
        @media(min-width:640px){
          .asd-modal {
            align-self:center !important;
            border-radius:20px !important;
            max-width:480px !important;
          }
        }
        .asd-textarea {
          width:100%; background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px; padding:14px 16px;
          color:#F0F4F8; font-size:16px;
          font-family:'DM Sans',sans-serif;
          outline:none; resize:none; line-height:1.5;
          transition:border-color 0.2s; box-sizing:border-box;
        }
        .asd-textarea:focus { border-color:#E53935; }
        .asd-textarea::placeholder { color:#64748B; }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div className="asd-modal" style={{
        background:"#0D1117",
        border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:"20px 20px 0 0",
        width:"100%", maxHeight:"90vh",
        overflowY:"auto", fontFamily:"'DM Sans',sans-serif"
      }}>

        {/* Header */}
        <div style={{
          padding:"18px 18px 0",
          display:"flex", alignItems:"center",
          justifyContent:"space-between", marginBottom:"16px"
        }}>
          <div>
            <h2 style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize:"26px", letterSpacing:"0.06em",
              color:"#F0F4F8", margin:0
            }}>🤒 AI Symptom Diagnosis</h2>
            <p style={{color:"#64748B", fontSize:"12px", marginTop:"3px"}}>
              Describe your symptom — AI checks all your medicines
            </p>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.1)",
            color:"#F0F4F8", borderRadius:"10px",
            width:"36px", height:"36px", fontSize:"18px",
            cursor:"pointer", display:"flex",
            alignItems:"center", justifyContent:"center"
          }}>×</button>
        </div>

        <div style={{padding:"0 18px 24px"}}>

          {/* Input */}
          <div style={{marginBottom:"14px"}}>
            <label style={{
              display:"block", fontSize:"11px", color:"#64748B",
              fontFamily:"'JetBrains Mono',monospace",
              letterSpacing:"0.15em", textTransform:"uppercase",
              marginBottom:"8px"
            }}>Describe Your Symptom</label>
            <textarea
              className="asd-textarea"
              placeholder="e.g. I feel dizzy every morning after taking my blood pressure pill..."
              value={symptom}
              onChange={e => setSymptom(e.target.value)}
              rows={3}
            />
          </div>

          {/* Example chips */}
          {!result && !loading && (
            <div style={{marginBottom:"16px"}}>
              <p style={{
                fontSize:"10px", color:"#64748B",
                fontFamily:"'JetBrains Mono',monospace",
                letterSpacing:"0.15em", textTransform:"uppercase",
                marginBottom:"8px"
              }}>Examples</p>
              <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
                {examples.map((ex, i) => (
                  <button key={i} onClick={() => handleAnalyze(ex)} style={{
                    background:"rgba(255,179,0,0.08)",
                    border:"1px solid rgba(255,179,0,0.2)",
                    borderRadius:"20px", padding:"5px 12px",
                    color:"#FFB300", fontSize:"11px",
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                    fontWeight:"500", transition:"all 0.2s"
                  }}>{ex}</button>
                ))}
              </div>
            </div>
          )}

          {/* Analyze button */}
          <button
            onClick={() => handleAnalyze()}
            disabled={loading || !symptom.trim()}
            style={{
              width:"100%",
              background: loading || !symptom.trim()
                ? "rgba(229,57,53,0.3)" : "#E53935",
              border:"none", color:"white",
              borderRadius:"12px", padding:"14px",
              fontSize:"14px", fontWeight:"700",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily:"'DM Sans',sans-serif",
              transition:"all 0.2s", marginBottom:"16px",
              display:"flex", alignItems:"center",
              justifyContent:"center", gap:"8px"
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width:"16px", height:"16px", borderRadius:"50%",
                  border:"2px solid white", borderTopColor:"transparent",
                  animation:"spin 0.8s linear infinite"
                }}/>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                Analyzing your medicines...
              </>
            ) : "🔍 Analyze with AI"}
          </button>

          {error && (
            <div style={{
              background:"rgba(229,57,53,0.1)",
              border:"1px solid rgba(229,57,53,0.25)",
              borderRadius:"12px", padding:"14px",
              color:"#FF6B6B", fontSize:"13px", marginBottom:"16px"
            }}>{error}</div>
          )}

          {/* Result */}
          {parsed && (
            <div style={{animation:"fadeUp 0.3s ease"}}>
              <p style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:"9px", letterSpacing:"0.2em",
                color:"#64748B", textTransform:"uppercase",
                marginBottom:"12px"
              }}>AI Analysis Result</p>

              {/* Likely cause */}
              <div style={{
                background:"rgba(229,57,53,0.08)",
                border:"1px solid rgba(229,57,53,0.2)",
                borderRadius:"14px", padding:"16px",
                marginBottom:"10px"
              }}>
                <p style={{
                  fontFamily:"'JetBrains Mono',monospace",
                  fontSize:"9px", letterSpacing:"0.2em",
                  color:"#64748B", textTransform:"uppercase", marginBottom:"6px"
                }}>Likely Cause</p>
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px"}}>
                  <p style={{color:"#F0F4F8", fontWeight:"700", fontSize:"16px", margin:0}}>
                    {parsed["LIKELY CAUSE"] || "Could not determine"}
                  </p>
                  {parsed.CONFIDENCE && (
                    <span style={{
                      background:`${confColor}18`,
                      border:`1px solid ${confColor}30`,
                      color:confColor, borderRadius:"20px",
                      padding:"3px 10px", fontSize:"10px",
                      fontWeight:"700", flexShrink:0,
                      fontFamily:"'JetBrains Mono',monospace"
                    }}>{parsed.CONFIDENCE} confidence</span>
                  )}
                </div>
              </div>

              {/* Details */}
              {[
                {key:"EXPLANATION", label:"Why This Happens", icon:"💡"},
                {key:"TIMING",      label:"Timing Check",     icon:"⏱"},
                {key:"ACTION",      label:"What To Do",       icon:"✅"},
              ].map(item => parsed[item.key] && (
                <div key={item.key} style={{
                  background:"rgba(255,255,255,0.03)",
                  border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:"12px", padding:"14px",
                  marginBottom:"8px"
                }}>
                  <p style={{
                    fontFamily:"'JetBrains Mono',monospace",
                    fontSize:"9px", letterSpacing:"0.15em",
                    color:"#64748B", textTransform:"uppercase",
                    marginBottom:"6px"
                  }}>{item.icon} {item.label}</p>
                  <p style={{color:"#94A3B8", fontSize:"13px", lineHeight:"1.6", margin:0}}>
                    {parsed[item.key]}
                  </p>
                </div>
              ))}

              {/* Disclaimer */}
              <div style={{
                background:"rgba(255,255,255,0.02)",
                borderRadius:"10px", padding:"10px 12px",
                marginTop:"8px"
              }}>
                <p style={{color:"#64748B", fontSize:"11px", margin:0, lineHeight:"1.5"}}>
                  ⚕️ This is AI analysis for information only. Always consult your doctor before changing or stopping any medicine.
                </p>
              </div>

              <button onClick={() => { setResult(null); setSymptom("") }} style={{
                width:"100%", marginTop:"12px",
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:"12px", padding:"12px",
                color:"#94A3B8", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",
                fontSize:"13px", fontWeight:"600"
              }}>Check Another Symptom</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
