import { useEffect, useState } from "react"
import {
  getFamily, addMedicineToMember, removeMedicineFromMember,
  clearMemberMedicines, removeFamilyMember, deleteFamily,
  addFamilyMember
} from "../services/familyService"
import { checkCrossFamily, checkSamePersonMultiDoctor } from "../services/interactionChecker"
import { findDuplicates } from "../services/duplicateChecker"
import { calculateFamilyScores, calculateFamilyOverallScore } from "../services/safetyScoreService"
import { generateHealthSummary } from "../services/aiService"
import PrescriptionScanner from "../components/PrescriptionScanner"
import AlertCard from "../components/AlertCard"
import MultiDoctorAlert from "../components/MultiDoctorAlert"
import FamilyMap from "../components/FamilyMap"
import DuplicateAlert from "../components/DuplicateAlert"
import SafetyScore from "../components/SafetyScore"
import SymptomChecker from "./SymptomChecker"
import RemindersManager from "./RemindersManager"
import MedicineComparator from "./MedicineComparator"
import DoctorBrief from "./DoctorBrief"
import FoodChecker from "./FoodChecker"
import AddMember from "./AddMember"
import AIChatbot from "./AIChatbot"
import AISymptomDiagnosis from "./AISymptomDiagnosis"

const C = {
  bg:"#07090D", surface:"#0D1117", card:"#111827",
  border:"rgba(255,255,255,0.07)",
  red:"#E53935", redDim:"rgba(229,57,53,0.12)",
  redBorder:"rgba(229,57,53,0.25)",
  green:"#00C853", yellow:"#FFB300",
  cyan:"#00B8D9", purple:"#7C4DFF",
  text:"#F0F4F8", muted:"#64748B", soft:"#94A3B8",
}

const scoreColor = (s) =>
  s >= 80 ? C.green : s >= 60 ? C.yellow : s >= 40 ? "#FF6D00" : C.red

const pill = (label, color) => ({
  display:"inline-flex", alignItems:"center",
  padding:"2px 8px", borderRadius:"20px",
  fontSize:"10px", fontWeight:"700",
  fontFamily:"'JetBrains Mono',monospace",
  letterSpacing:"0.08em",
  background:`${color}18`, color,
  border:`1px solid ${color}30`
})

export default function Dashboard({ familyId, onReset }) {
  const [family, setFamily]                     = useState(null)
  const [loading, setLoading]                   = useState(true)
  const [showScanner, setShowScanner]           = useState(false)
  const [showSymptom, setShowSymptom]           = useState(false)
  const [showReminder, setShowReminder]         = useState(false)
  const [showSettings, setShowSettings]         = useState(false)
  const [showComparator, setShowComparator]     = useState(false)
  const [showDoctorBrief, setShowDoctorBrief]   = useState(false)
  const [showSafetyScore, setShowSafetyScore]   = useState(false)
  const [showFoodChecker, setShowFoodChecker]   = useState(false)
  const [showAddMember, setShowAddMember]       = useState(false)
  const [showAIChatbot, setShowAIChatbot]       = useState(false)
  const [showAISymptom, setShowAISymptom]       = useState(false)
  const [crossAlerts, setCrossAlerts]           = useState([])
  const [multiAlerts, setMultiAlerts]           = useState([])
  const [duplicates, setDuplicates]             = useState([])
  const [memberScores, setMemberScores]         = useState([])
  const [overallScore, setOverallScore]         = useState(100)
  const [activeTab, setActiveTab]               = useState("home")
  const [dismissedCross, setDismissedCross]     = useState([])
  const [dismissedMulti, setDismissedMulti]     = useState([])
  const [aiSummary, setAiSummary]               = useState("")
  const [summaryLoading, setSummaryLoading]     = useState(false)

  useEffect(() => { loadFamily() }, [familyId])

  const loadFamily = async () => {
    const data = await getFamily(familyId)
    setFamily(data)
    setLoading(false)
    if (data) {
      const cross  = checkCrossFamily(data.members)
      const multi  = checkSamePersonMultiDoctor(data.members)
      const dups   = findDuplicates(data.members)
      const scores = calculateFamilyScores(data.members)
      setCrossAlerts(cross)
      setMultiAlerts(multi)
      setDuplicates(dups)
      setMemberScores(scores)
      setOverallScore(calculateFamilyOverallScore(scores))
    }
  }

  const loadAISummary = async (data) => {
    if (!data || aiSummary) return
    setSummaryLoading(true)
    try {
      const summary = await generateHealthSummary(
        data,
        crossAlerts,
        duplicates
      )
      setAiSummary(summary)
    } catch { setAiSummary("") }
    setSummaryLoading(false)
  }

  const handleDrugsExtracted = async (memberId, drugs) => {
    for (const drug of drugs) {
      await addMedicineToMember(familyId, memberId, {
        ...drug, startDate: new Date().toISOString().split("T")[0]
      })
    }
    await loadFamily()
  }

  const handleRemoveMedicine = async (memberId, i) => {
    if (!window.confirm("Remove this medicine?")) return
    await removeMedicineFromMember(familyId, memberId, i)
    await loadFamily()
  }

  const handleClearMedicines = async (memberId, name) => {
    if (!window.confirm(`Remove ALL medicines from ${name}?`)) return
    await clearMemberMedicines(familyId, memberId)
    await loadFamily()
  }

  const handleRemoveMember = async (memberId, name) => {
    if (!window.confirm(`Remove ${name}?`)) return
    await removeFamilyMember(familyId, memberId)
    await loadFamily()
  }

  const handleAddMember = async (newMember) => {
    await addFamilyMember(familyId, newMember)
    await loadFamily()
  }

  const handleResetApp = async () => {
    if (!window.confirm("Reset entire app? This cannot be undone.")) return
    if (!window.confirm("Are you absolutely sure?")) return
    await deleteFamily(familyId)
    onReset()
  }

  const visibleCross = crossAlerts.filter((_, i) => !dismissedCross.includes(i))
  const visibleMulti = multiAlerts.filter((_, i) => !dismissedMulti.includes(i))
  const totalIssues  = visibleCross.length + visibleMulti.length + duplicates.length
  const totalMeds    = family?.members.reduce((s,m) => s + m.medicines.length, 0) || 0

  const msColor  = (c) => c==="green"?C.green:c==="yellow"?C.yellow:c==="orange"?"#FF6D00":C.red
  const msBg     = (c) => c==="green"?"rgba(0,200,83,0.1)":c==="yellow"?"rgba(255,179,0,0.1)":c==="orange"?"rgba(255,109,0,0.1)":"rgba(229,57,53,0.1)"
  const msBorder = (c) => c==="green"?"rgba(0,200,83,0.2)":c==="yellow"?"rgba(255,179,0,0.2)":c==="orange"?"rgba(255,109,0,0.2)":"rgba(229,57,53,0.2)"

  if (loading) return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      display:"flex", alignItems:"center",
      justifyContent:"center", flexDirection:"column", gap:"14px"
    }}>
      <div style={{
        width:"40px", height:"40px", borderRadius:"50%",
        border:`3px solid ${C.red}`, borderTopColor:"transparent",
        animation:"spin 0.8s linear infinite"
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{color:C.muted, fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", letterSpacing:"0.15em"}}>
        LOADING
      </p>
    </div>
  )

  const navTabs = [
    {id:"home",     icon:"⊙", label:"Home"},
    {id:"issues",   icon:"⚠", label:"Issues"},
    {id:"medicines",icon:"⬡", label:"Meds"},
    {id:"tools",    icon:"◈", label:"Tools"},
  ]

  return (
    <div style={{minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        .hov { transition:all 0.18s ease; cursor:pointer; }
        .hov:hover { opacity:0.85; transform:translateY(-1px); }
        .hov:active { transform:translateY(0); opacity:1; }
        .card { background:${C.card}; border:1px solid ${C.border}; border-radius:14px; }
        .icon-btn {
          display:flex; align-items:center; justify-content:center;
          border:none; cursor:pointer; transition:all 0.18s;
          font-family:'DM Sans',sans-serif; font-weight:600;
        }
        .icon-btn:hover { opacity:0.8; transform:translateY(-1px); }
        .mem-card { background:${C.card}; border:1px solid ${C.border}; border-radius:14px; overflow:hidden; }
        .med-row {
          display:flex; align-items:flex-start; gap:10px;
          padding:10px 14px; transition:background 0.15s;
          border-bottom:1px solid rgba(255,255,255,0.04);
        }
        .med-row:last-child { border-bottom:none; }
        .med-row:hover { background:rgba(255,255,255,0.03); }
        .nav-tab {
          flex:1; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          gap:3px; padding:8px 4px; border:none;
          background:none; cursor:pointer;
          font-family:'DM Sans',sans-serif;
          transition:all 0.2s; position:relative;
        }
        .fade-up { animation:fadeUp 0.35s ease both; }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .pulse-dot { animation:pulseDot 2s ease-in-out infinite; }
        @keyframes pulseDot {
          0%,100% { box-shadow:0 0 0 0 rgba(229,57,53,0.6); }
          50%      { box-shadow:0 0 0 6px rgba(229,57,53,0); }
        }
        .ai-glow { animation:aiGlow 2s ease-in-out infinite; }
        @keyframes aiGlow {
          0%,100% { box-shadow:0 0 0 0 rgba(229,57,53,0.3); }
          50%      { box-shadow:0 0 0 8px rgba(229,57,53,0); }
        }
        input, textarea { font-size:16px !important; }
        @media(max-width:639px){
          .desktop-only { display:none !important; }
          .mobile-bottom-nav { display:flex !important; }
          .page-pad { padding:14px 14px 90px !important; }
          .header-row { padding:12px 14px !important; }
          .tool-grid { grid-template-columns:repeat(2,1fr) !important; }
        }
        @media(min-width:640px){
          .mobile-only { display:none !important; }
          .mobile-bottom-nav { display:none !important; }
          .page-pad { padding:70px 24px 40px !important; }
          .header-row { padding:16px 24px !important; }
          .tool-grid { grid-template-columns:repeat(3,1fr) !important; }
        }
      `}</style>

      {/* ━━━━━━ HEADER ━━━━━━ */}
      <header style={{
        position:"fixed", top:0, left:0, right:0, zIndex:50,
        background:"rgba(7,9,13,0.94)",
        backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${C.border}`
      }}>
        <div className="header-row" style={{
          maxWidth:"700px", margin:"0 auto",
          display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:"12px"
        }}>
          {/* Brand */}
          <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <div style={{
              width:"32px", height:"32px", borderRadius:"9px",
              background:C.red, display:"flex",
              alignItems:"center", justifyContent:"center",
              fontSize:"16px", flexShrink:0
            }}>🛡️</div>
            <div>
              <div style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"18px", letterSpacing:"0.1em",
                color:C.text, lineHeight:1
              }}>PharmaGuard</div>
              <div style={{
                fontSize:"10px", color:C.muted,
                fontFamily:"'JetBrains Mono',monospace",
                letterSpacing:"0.05em"
              }}>{family?.familyName}</div>
            </div>
          </div>

          {/* Right */}
          <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
            {/* Score */}
            <button className="hov icon-btn" onClick={() => setShowSafetyScore(true)} style={{
              background:C.card, border:`1px solid ${C.border}`,
              borderRadius:"20px", padding:"5px 12px 5px 8px",
              gap:"6px", color:C.text
            }}>
              <div style={{
                width:"8px", height:"8px", borderRadius:"50%",
                background:scoreColor(overallScore),
                boxShadow:`0 0 8px ${scoreColor(overallScore)}`,
                flexShrink:0
              }}/>
              <span style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"18px", color:scoreColor(overallScore),
                letterSpacing:"0.04em"
              }}>{overallScore}</span>
              <span style={{color:C.muted, fontSize:"10px", fontFamily:"'JetBrains Mono',monospace"}}>/100</span>
            </button>

            {/* AI Chat button */}
            <button className="icon-btn ai-glow" onClick={() => setShowAIChatbot(true)} style={{
              background:"linear-gradient(135deg,#E53935,#B71C1C)",
              color:"white", borderRadius:"10px",
              padding:"8px 12px", fontSize:"12px", gap:"5px",
              border:"none"
            }}>
              <span>🤖</span>
              <span className="desktop-only" style={{fontWeight:"700"}}>Ask AI</span>
            </button>

            {/* Scan */}
            <button className="icon-btn" onClick={() => setShowScanner(true)} style={{
              background:C.card,
              border:`1px solid ${C.border}`,
              color:C.text, borderRadius:"10px",
              padding:"8px 12px", fontSize:"12px", gap:"5px"
            }}>
              <span>📷</span>
              <span className="desktop-only" style={{fontWeight:"700"}}>Scan</span>
            </button>

            {/* Menu */}
            <button className="icon-btn" onClick={() => setShowSettings(!showSettings)} style={{
              background:C.card, border:`1px solid ${C.border}`,
              borderRadius:"10px", padding:"8px 10px",
              color:C.soft, fontSize:"14px"
            }}>☰</button>
          </div>
        </div>

        {/* Desktop tab strip */}
        <div className="desktop-only" style={{
          maxWidth:"700px", margin:"0 auto",
          padding:"0 24px",
          display:"flex", gap:"4px",
          borderTop:`1px solid ${C.border}`
        }}>
          {navTabs.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
              padding:"10px 16px", border:"none",
              background:"none", cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif",
              fontSize:"13px", fontWeight:"600",
              color: activeTab === item.id ? C.text : C.muted,
              borderBottom: activeTab === item.id
                ? `2px solid ${C.red}` : "2px solid transparent",
              transition:"all 0.2s", position:"relative",
              display:"flex", alignItems:"center", gap:"6px"
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "issues" && totalIssues > 0 && (
                <span style={{
                  background:C.red, color:"white",
                  borderRadius:"10px", padding:"1px 6px",
                  fontSize:"9px", fontWeight:"700",
                  fontFamily:"'JetBrains Mono',monospace"
                }}>{totalIssues}</span>
              )}
            </button>
          ))}
        </div>

        {/* Dropdown menu */}
        {showSettings && (
          <div className="fade-up" style={{
            maxWidth:"700px", margin:"0 auto",
            padding:"0 14px 14px"
          }}>
            <div style={{
              background:C.surface,
              border:`1px solid ${C.border}`,
              borderRadius:"14px", padding:"16px",
              display:"flex", flexDirection:"column", gap:"12px"
            }}>
              <p style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:"9px", letterSpacing:"0.2em",
                color:C.muted, textTransform:"uppercase"
              }}>All Features</p>
              <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px"}}>
                {[
                  {icon:"🤖", label:"AI Chat",    color:"#FF5252", fn:() => { setShowAIChatbot(true);    setShowSettings(false) }},
                  {icon:"🧬", label:"AI Symptom", color:"#FF5252", fn:() => { setShowAISymptom(true);    setShowSettings(false) }},
                  {icon:"🤒", label:"Symptom",    color:C.yellow,  fn:() => { setShowSymptom(true);      setShowSettings(false) }},
                  {icon:"💊", label:"Compare",    color:C.cyan,    fn:() => { setShowComparator(true);   setShowSettings(false) }},
                  {icon:"🍽️", label:"Food",      color:"#FF6D00", fn:() => { setShowFoodChecker(true);  setShowSettings(false) }},
                  {icon:"⏰", label:"Reminders",  color:C.green,   fn:() => { setShowReminder(true);     setShowSettings(false) }},
                  {icon:"🏥", label:"Brief",      color:C.purple,  fn:() => { setShowDoctorBrief(true);  setShowSettings(false) }},
                  {icon:"➕", label:"Member",     color:C.green,   fn:() => { setShowAddMember(true);    setShowSettings(false) }},
                ].map(b => (
                  <button key={b.label} onClick={b.fn} style={{
                    background:C.card,
                    border:`1px solid ${C.border}`,
                    borderRadius:"12px", padding:"12px 8px",
                    color:C.soft, cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif",
                    fontSize:"11px", fontWeight:"600",
                    display:"flex", flexDirection:"column",
                    alignItems:"center", gap:"5px", transition:"all 0.2s"
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor=`${b.color}40`
                    e.currentTarget.style.background=`${b.color}08`
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor=C.border
                    e.currentTarget.style.background=C.card
                  }}>
                    <span style={{fontSize:"20px"}}>{b.icon}</span>
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>
              <div style={{
                display:"flex", alignItems:"center",
                justifyContent:"space-between",
                padding:"12px 14px", borderRadius:"10px",
                background:C.redDim, border:`1px solid ${C.redBorder}`
              }}>
                <div>
                  <p style={{color:C.text, fontWeight:"600", fontSize:"13px"}}>Reset App</p>
                  <p style={{color:C.muted, fontSize:"11px", marginTop:"2px"}}>Delete all data permanently</p>
                </div>
                <button onClick={handleResetApp} className="icon-btn" style={{
                  background:C.red, color:"white", borderRadius:"8px",
                  padding:"7px 14px", fontSize:"12px", marginLeft:"12px", flexShrink:0
                }}>Reset</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ━━━━━━ PAGE ━━━━━━ */}
      <main className="page-pad" style={{maxWidth:"700px", margin:"0 auto"}}>

        {/* ══ HOME ══ */}
        {activeTab === "home" && (
          <div className="fade-up" style={{display:"flex", flexDirection:"column", gap:"14px"}}>

            {/* AI Summary Card */}
            <div style={{
              background:"linear-gradient(135deg, rgba(229,57,53,0.12), rgba(229,57,53,0.04))",
              border:`1px solid ${C.redBorder}`,
              borderRadius:"16px", padding:"16px 18px"
            }}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px"}}>
                <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
                  <span style={{fontSize:"18px"}}>🤖</span>
                  <p style={{
                    fontFamily:"'JetBrains Mono',monospace",
                    fontSize:"9px", letterSpacing:"0.2em",
                    color:C.muted, textTransform:"uppercase"
                  }}>AI Health Summary</p>
                </div>
                {!aiSummary && !summaryLoading && (
                  <button onClick={() => loadAISummary(family)}
                    className="icon-btn" style={{
                      background:C.redDim,
                      border:`1px solid ${C.redBorder}`,
                      color:"#FF8A80", borderRadius:"8px",
                      padding:"5px 10px", fontSize:"11px", gap:"4px"
                    }}>Generate ✨</button>
                )}
              </div>
              {summaryLoading ? (
                <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
                  <div style={{
                    width:"14px", height:"14px", borderRadius:"50%",
                    border:`2px solid ${C.red}`, borderTopColor:"transparent",
                    animation:"spin 0.8s linear infinite"
                  }}/>
                  <p style={{color:C.muted, fontSize:"12px"}}>Generating AI summary...</p>
                </div>
              ) : aiSummary ? (
                <p style={{color:C.soft, fontSize:"13px", lineHeight:"1.7", margin:0}}>
                  {aiSummary}
                </p>
              ) : (
                <p style={{color:C.muted, fontSize:"12px", fontStyle:"italic"}}>
                  Click Generate to get an AI health summary for your family
                </p>
              )}
            </div>

            {/* AI Actions */}
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
              <button onClick={() => setShowAIChatbot(true)} style={{
                background:"linear-gradient(135deg,rgba(229,57,53,0.15),rgba(229,57,53,0.05))",
                border:`1px solid ${C.redBorder}`,
                borderRadius:"14px", padding:"16px",
                cursor:"pointer", textAlign:"left",
                fontFamily:"'DM Sans',sans-serif",
                transition:"all 0.2s"
              }}
              onMouseOver={e => e.currentTarget.style.transform="translateY(-2px)"}
              onMouseOut={e => e.currentTarget.style.transform="translateY(0)"}
              >
                <p style={{fontSize:"24px", marginBottom:"8px"}}>🤖</p>
                <p style={{color:C.text, fontWeight:"700", fontSize:"13px", marginBottom:"3px"}}>
                  Ask AI
                </p>
                <p style={{color:C.muted, fontSize:"11px", lineHeight:"1.4"}}>
                  Chat about your family's medicines
                </p>
              </button>

              <button onClick={() => setShowAISymptom(true)} style={{
                background:"rgba(255,179,0,0.08)",
                border:"1px solid rgba(255,179,0,0.2)",
                borderRadius:"14px", padding:"16px",
                cursor:"pointer", textAlign:"left",
                fontFamily:"'DM Sans',sans-serif",
                transition:"all 0.2s"
              }}
              onMouseOver={e => e.currentTarget.style.transform="translateY(-2px)"}
              onMouseOut={e => e.currentTarget.style.transform="translateY(0)"}
              >
                <p style={{fontSize:"24px", marginBottom:"8px"}}>🧬</p>
                <p style={{color:C.text, fontWeight:"700", fontSize:"13px", marginBottom:"3px"}}>
                  AI Symptom
                </p>
                <p style={{color:C.muted, fontSize:"11px", lineHeight:"1.4"}}>
                  Describe symptoms in plain language
                </p>
              </button>
            </div>

            {/* Status */}
            {totalIssues > 0 ? (
              <div style={{
                background:C.redDim, border:`1px solid ${C.redBorder}`,
                borderRadius:"14px", padding:"16px 18px",
                display:"flex", alignItems:"center", gap:"14px"
              }}>
                <div className="pulse-dot" style={{
                  width:"10px", height:"10px", borderRadius:"50%",
                  background:C.red, flexShrink:0
                }}/>
                <div style={{flex:1}}>
                  <p style={{color:"#FF6B6B", fontWeight:"700", fontSize:"14px"}}>
                    {totalIssues} Safety Issue{totalIssues > 1 ? "s" : ""} Found
                  </p>
                  <p style={{color:C.muted, fontSize:"12px", marginTop:"2px"}}>
                    {[
                      visibleCross.length > 0 && `${visibleCross.length} drug interactions`,
                      visibleMulti.length > 0 && `${visibleMulti.length} doctor conflicts`,
                      duplicates.length > 0   && `${duplicates.length} duplicates`,
                    ].filter(Boolean).join("  ·  ")}
                  </p>
                </div>
                <button className="hov icon-btn" onClick={() => setActiveTab("issues")} style={{
                  background:C.red, color:"white", borderRadius:"8px",
                  padding:"7px 12px", fontSize:"11px", flexShrink:0
                }}>View →</button>
              </div>
            ) : (
              <div style={{
                background:"rgba(0,200,83,0.08)",
                border:"1px solid rgba(0,200,83,0.18)",
                borderRadius:"14px", padding:"14px 18px",
                display:"flex", alignItems:"center", gap:"12px"
              }}>
                <div style={{
                  width:"32px", height:"32px", borderRadius:"10px",
                  background:"rgba(0,200,83,0.15)",
                  display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:"16px", flexShrink:0
                }}>✓</div>
                <p style={{color:C.green, fontWeight:"600", fontSize:"14px"}}>
                  All clear — your family is safe
                </p>
              </div>
            )}

            {/* Family summary */}
            <div className="card" style={{padding:"18px"}}>
              <div style={{
                display:"flex", alignItems:"center",
                justifyContent:"space-between", marginBottom:"14px"
              }}>
                <p style={{
                  fontFamily:"'JetBrains Mono',monospace",
                  fontSize:"9px", letterSpacing:"0.2em",
                  color:C.muted, textTransform:"uppercase"
                }}>Family</p>
                <button className="hov icon-btn" onClick={() => setShowAddMember(true)} style={{
                  background:"rgba(0,200,83,0.1)",
                  border:"1px solid rgba(0,200,83,0.2)",
                  color:C.green, borderRadius:"8px",
                  padding:"5px 10px", fontSize:"11px", gap:"4px"
                }}>➕ Member</button>
              </div>

              <div style={{
                display:"flex", gap:"10px",
                overflowX:"auto", paddingBottom:"4px",
                marginBottom:"14px"
              }}>
                {family?.members.map(member => {
                  const ms = memberScores.find(s => s.member.id === member.id)
                  const sc = scoreColor(ms?.score || 100)
                  return (
                    <div key={member.id} className="hov"
                      onClick={() => setActiveTab("medicines")}
                      style={{
                        flexShrink:0, textAlign:"center",
                        background:C.surface,
                        border:`1px solid ${C.border}`,
                        borderRadius:"12px", padding:"12px 16px",
                        minWidth:"80px", cursor:"pointer"
                      }}>
                      <div style={{
                        width:"36px", height:"36px", borderRadius:"50%",
                        background:`${sc}18`, border:`2px solid ${sc}40`,
                        display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:"17px",
                        margin:"0 auto 6px"
                      }}>👤</div>
                      <p style={{fontSize:"12px", fontWeight:"600", color:C.text, marginBottom:"2px"}}>
                        {member.name.split(" ")[0]}
                      </p>
                      <p style={{
                        fontFamily:"'Bebas Neue',sans-serif",
                        fontSize:"18px", color:sc, lineHeight:1
                      }}>{ms?.score ?? 100}</p>
                      <p style={{fontSize:"9px", color:C.muted, marginTop:"1px"}}>
                        {member.medicines.length} meds
                      </p>
                    </div>
                  )
                })}
              </div>

              <div style={{display:"flex", gap:"8px"}}>
                {[
                  {label:"Members",   value:family?.members.length || 0, color:C.cyan},
                  {label:"Medicines", value:totalMeds,                   color:C.purple},
                  {label:"Issues",    value:totalIssues, color:totalIssues > 0 ? C.red : C.green},
                ].map(s => (
                  <div key={s.label} style={{
                    flex:1, background:C.surface,
                    border:`1px solid ${C.border}`,
                    borderRadius:"10px", padding:"10px 12px", textAlign:"center"
                  }}>
                    <p style={{
                      fontFamily:"'Bebas Neue',sans-serif",
                      fontSize:"28px", color:s.color,
                      lineHeight:1, marginBottom:"2px"
                    }}>{s.value}</p>
                    <p style={{
                      fontSize:"10px", color:C.muted,
                      fontFamily:"'JetBrains Mono',monospace",
                      letterSpacing:"0.1em", textTransform:"uppercase"
                    }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <FamilyMap members={family?.members || []} alerts={[...crossAlerts, ...multiAlerts]} />
          </div>
        )}

        {/* ══ ISSUES ══ */}
        {activeTab === "issues" && (
          <div className="fade-up" style={{display:"flex", flexDirection:"column", gap:"12px"}}>
            {[
              {
                title:"Drug Interactions", icon:"⚡",
                count:visibleCross.length, color:C.red,
                empty:"No cross-family interactions detected",
                items:visibleCross,
                render:(alert, i) => (
                  <AlertCard key={i} alert={alert}
                    onDismiss={() => setDismissedCross([...dismissedCross, i])} />
                )
              },
              {
                title:"Multi-Doctor Conflicts", icon:"👨‍⚕️",
                count:visibleMulti.length, color:"#FF6D00",
                empty:"No multi-doctor conflicts",
                items:visibleMulti,
                render:(alert, i) => (
                  <MultiDoctorAlert key={i} alert={alert}
                    onDismiss={() => setDismissedMulti([...dismissedMulti, i])} />
                )
              },
              {
                title:"Duplicate Medicines", icon:"💊",
                count:duplicates.length, color:C.yellow,
                empty:"No duplicate molecules detected",
                items:duplicates,
                render:(dup, i) => <DuplicateAlert key={i} duplicate={dup} />
              },
            ].map(section => (
              <div key={section.title} className="card" style={{overflow:"hidden"}}>
                <div style={{
                  padding:"14px 16px",
                  borderBottom:`1px solid ${C.border}`,
                  display:"flex", alignItems:"center",
                  justifyContent:"space-between"
                }}>
                  <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
                    <span style={{fontSize:"16px"}}>{section.icon}</span>
                    <p style={{fontWeight:"600", fontSize:"14px", color:C.text}}>
                      {section.title}
                    </p>
                  </div>
                  {section.count > 0 && (
                    <span style={pill(`${section.count} found`, section.color)}>
                      {section.count} found
                    </span>
                  )}
                </div>
                <div style={{padding:"12px"}}>
                  {section.items.length === 0 ? (
                    <div style={{textAlign:"center", padding:"24px", color:C.muted, fontSize:"13px"}}>
                      <p style={{fontSize:"32px", marginBottom:"8px"}}>✓</p>
                      {section.empty}
                    </div>
                  ) : section.items.map((item, i) => section.render(item, i))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ MEDICINES ══ */}
        {activeTab === "medicines" && (
          <div className="fade-up" style={{display:"flex", flexDirection:"column", gap:"12px"}}>
            {family?.members.map(member => {
              const ms = memberScores.find(s => s.member.id === member.id)
              const sc = scoreColor(ms?.score || 100)
              return (
                <div key={member.id} className="mem-card">
                  <div style={{
                    padding:"14px 16px", display:"flex",
                    alignItems:"center", justifyContent:"space-between", gap:"10px",
                    borderBottom: member.medicines.length > 0 ? `1px solid ${C.border}` : "none"
                  }}>
                    <div style={{display:"flex", alignItems:"center", gap:"10px", minWidth:0}}>
                      <div style={{
                        width:"36px", height:"36px", borderRadius:"10px",
                        background:`${sc}15`, border:`1px solid ${sc}30`,
                        display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:"16px", flexShrink:0
                      }}>👤</div>
                      <div style={{minWidth:0}}>
                        <div style={{display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap"}}>
                          <p style={{fontWeight:"700", fontSize:"14px", color:C.text}}>
                            {member.name}
                          </p>
                          <span style={pill(`${ms?.score ?? 100}/100`, sc)}>
                            {ms?.score ?? 100}/100
                          </span>
                        </div>
                        <p style={{color:C.muted, fontSize:"11px", marginTop:"2px"}}>
                          Age {member.age} · {member.medicines.length} medicine{member.medicines.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div style={{display:"flex", gap:"6px", flexShrink:0}}>
                      {member.medicines.length > 0 && (
                        <button onClick={() => handleClearMedicines(member.id, member.name)}
                          className="icon-btn" style={{
                            background:"rgba(255,179,0,0.08)",
                            border:"1px solid rgba(255,179,0,0.2)",
                            color:C.yellow, borderRadius:"7px",
                            padding:"5px 9px", fontSize:"11px"
                          }}>Clear</button>
                      )}
                      <button onClick={() => handleRemoveMember(member.id, member.name)}
                        className="icon-btn" style={{
                          background:C.redDim, border:`1px solid ${C.redBorder}`,
                          color:"#FF6B6B", borderRadius:"7px",
                          padding:"5px 9px", fontSize:"11px"
                        }}>Remove</button>
                    </div>
                  </div>
                  {member.medicines.length === 0 ? (
                    <div style={{
                      padding:"20px 16px", textAlign:"center",
                      color:C.muted, fontSize:"13px", fontStyle:"italic"
                    }}>
                      No medicines added — scan a prescription to add
                    </div>
                  ) : (
                    <div>
                      {member.medicines.map((med, i) => (
                        <div key={i} className="med-row">
                          <div style={{
                            width:"3px", borderRadius:"2px",
                            background:`${C.red}50`, flexShrink:0,
                            alignSelf:"stretch", minHeight:"36px"
                          }}/>
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{
                              display:"flex", alignItems:"flex-start",
                              justifyContent:"space-between", gap:"8px"
                            }}>
                              <p style={{fontWeight:"600", fontSize:"13px", color:C.text}}>
                                {med.brandName}
                              </p>
                              <span style={{
                                fontFamily:"'JetBrains Mono',monospace",
                                fontSize:"9px", color:C.muted,
                                background:C.surface,
                                padding:"2px 6px", borderRadius:"4px",
                                flexShrink:0, whiteSpace:"nowrap"
                              }}>{med.genericName}</span>
                            </div>
                            <p style={{color:C.muted, fontSize:"11px", marginTop:"3px"}}>
                              {med.dose} · {med.frequency}
                            </p>
                            {med.doctorName && (
                              <p style={{color:"#FF8A65", fontSize:"10px", marginTop:"2px"}}>
                                👨‍⚕️ Dr. {med.doctorName}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveMedicine(member.id, i)}
                            style={{
                              background:"none", border:"none",
                              color:C.muted, cursor:"pointer",
                              fontSize:"16px", padding:"0",
                              width:"24px", height:"24px",
                              display:"flex", alignItems:"center",
                              justifyContent:"center", flexShrink:0,
                              borderRadius:"6px", transition:"color 0.15s"
                            }}
                            onMouseOver={e => e.currentTarget.style.color="#FF6B6B"}
                            onMouseOut={e => e.currentTarget.style.color=C.muted}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <button onClick={() => setShowAddMember(true)} style={{
              width:"100%", background:"none",
              border:`1px dashed rgba(0,200,83,0.3)`,
              borderRadius:"14px", padding:"16px",
              color:C.green, cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif",
              fontSize:"13px", fontWeight:"600",
              display:"flex", alignItems:"center",
              justifyContent:"center", gap:"8px", transition:"all 0.2s"
            }}
            onMouseOver={e => {
              e.currentTarget.style.background="rgba(0,200,83,0.06)"
              e.currentTarget.style.borderColor="rgba(0,200,83,0.5)"
            }}
            onMouseOut={e => {
              e.currentTarget.style.background="none"
              e.currentTarget.style.borderColor="rgba(0,200,83,0.3)"
            }}>
              ➕ Add Family Member
            </button>
          </div>
        )}

        {/* ══ TOOLS ══ */}
        {activeTab === "tools" && (
          <div className="fade-up" style={{display:"flex", flexDirection:"column", gap:"14px"}}>

            {/* AI section */}
            <div>
              <p style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:"9px", letterSpacing:"0.2em",
                color:C.muted, textTransform:"uppercase",
                marginBottom:"10px"
              }}>🤖 AI Powered</p>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
                {[
                  {
                    icon:"🤖", label:"AI Medicine Chat",
                    desc:"Ask anything about your medicines",
                    color:"#FF5252", fn:() => setShowAIChatbot(true)
                  },
                  {
                    icon:"🧬", label:"AI Symptom Diagnosis",
                    desc:"Describe symptoms in plain language",
                    color:"#FF5252", fn:() => setShowAISymptom(true)
                  },
                  {
                    icon:"🏥", label:"AI Doctor Brief",
                    desc:"AI-generated PDF for doctor",
                    color:C.purple, fn:() => setShowDoctorBrief(true)
                  },
                  {
                    icon:"🛡️", label:"Safety Score",
                    desc:`Family score: ${overallScore}/100`,
                    color:C.red, fn:() => setShowSafetyScore(true)
                  },
                ].map(tool => (
                  <button key={tool.label} onClick={tool.fn} style={{
                    background:C.card, border:`1px solid ${C.border}`,
                    borderRadius:"14px", padding:"16px",
                    cursor:"pointer", transition:"all 0.2s",
                    textAlign:"left", fontFamily:"'DM Sans',sans-serif",
                    display:"flex", flexDirection:"column", gap:"10px"
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor=`${tool.color}40`
                    e.currentTarget.style.background=`${tool.color}08`
                    e.currentTarget.style.transform="translateY(-2px)"
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor=C.border
                    e.currentTarget.style.background=C.card
                    e.currentTarget.style.transform="translateY(0)"
                  }}>
                    <div style={{
                      width:"40px", height:"40px", borderRadius:"11px",
                      background:`${tool.color}12`,
                      border:`1px solid ${tool.color}25`,
                      display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:"20px"
                    }}>{tool.icon}</div>
                    <div>
                      <p style={{color:C.text, fontWeight:"700", fontSize:"13px", marginBottom:"3px"}}>
                        {tool.label}
                      </p>
                      <p style={{color:C.muted, fontSize:"11px", lineHeight:"1.4"}}>
                        {tool.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Other tools */}
            <div>
              <p style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:"9px", letterSpacing:"0.2em",
                color:C.muted, textTransform:"uppercase",
                marginBottom:"10px"
              }}>Other Tools</p>
              <div className="tool-grid" style={{display:"grid", gap:"10px"}}>
                {[
                  {icon:"🤒", label:"Symptom Checker",  desc:"Is your medicine causing this?",  color:C.yellow,  fn:() => setShowSymptom(true)},
                  {icon:"💊", label:"Medicine Compare",  desc:"Same molecule different brand?",  color:C.cyan,    fn:() => setShowComparator(true)},
                  {icon:"🍽️", label:"Food Checker",     desc:"Foods to avoid with medicines",   color:"#FF6D00", fn:() => setShowFoodChecker(true)},
                  {icon:"⏰", label:"Reminders",         desc:"Daily medicine schedule",         color:C.green,   fn:() => setShowReminder(true)},
                  {icon:"➕", label:"Add Member",        desc:"Add to your family",              color:C.cyan,    fn:() => setShowAddMember(true)},
                  {icon:"📷", label:"Scan Prescription", desc:"OCR read any prescription",      color:C.red,     fn:() => setShowScanner(true)},
                ].map(tool => (
                  <button key={tool.label} onClick={tool.fn} style={{
                    background:C.card, border:`1px solid ${C.border}`,
                    borderRadius:"14px", padding:"14px",
                    cursor:"pointer", transition:"all 0.2s",
                    textAlign:"left", fontFamily:"'DM Sans',sans-serif",
                    display:"flex", alignItems:"center", gap:"12px"
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor=`${tool.color}40`
                    e.currentTarget.style.background=`${tool.color}08`
                    e.currentTarget.style.transform="translateY(-2px)"
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor=C.border
                    e.currentTarget.style.background=C.card
                    e.currentTarget.style.transform="translateY(0)"
                  }}>
                    <div style={{
                      width:"38px", height:"38px", borderRadius:"10px",
                      background:`${tool.color}12`,
                      border:`1px solid ${tool.color}25`,
                      display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:"18px", flexShrink:0
                    }}>{tool.icon}</div>
                    <div>
                      <p style={{color:C.text, fontWeight:"700", fontSize:"13px", marginBottom:"2px"}}>
                        {tool.label}
                      </p>
                      <p style={{color:C.muted, fontSize:"11px"}}>{tool.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ━━━━━━ MOBILE BOTTOM NAV ━━━━━━ */}
      <nav className="mobile-bottom-nav" style={{
        position:"fixed", bottom:0, left:0, right:0,
        background:"rgba(7,9,13,0.97)",
        backdropFilter:"blur(20px)",
        borderTop:`1px solid ${C.border}`,
        zIndex:50, display:"none"
      }}>
        {navTabs.map(item => (
          <button key={item.id} className="nav-tab"
            onClick={() => setActiveTab(item.id)}
            style={{color: activeTab === item.id ? C.red : C.muted}}
          >
            {activeTab === item.id && (
              <div style={{
                position:"absolute", top:0, left:"50%",
                transform:"translateX(-50%)",
                width:"24px", height:"2px",
                background:C.red, borderRadius:"0 0 2px 2px"
              }}/>
            )}
            <span style={{
              fontSize:"18px",
              filter: activeTab === item.id ? `drop-shadow(0 0 6px ${C.red})` : "none"
            }}>{item.icon}</span>
            <span style={{fontSize:"10px", fontWeight:"600", marginTop:"3px", letterSpacing:"0.02em"}}>
              {item.label}
            </span>
            {item.id === "issues" && totalIssues > 0 && (
              <div style={{
                position:"absolute", top:"5px", right:"8px",
                background:C.red, color:"white",
                width:"14px", height:"14px", borderRadius:"50%",
                fontSize:"8px", fontWeight:"700",
                display:"flex", alignItems:"center", justifyContent:"center",
                border:`2px solid ${C.bg}`
              }}>{totalIssues}</div>
            )}
          </button>
        ))}
      </nav>

      {/* ━━━━━━ ALL MODALS ━━━━━━ */}
      {showScanner     && <PrescriptionScanner familyMembers={family?.members || []} onDrugsExtracted={handleDrugsExtracted} onClose={() => setShowScanner(false)} />}
      {showSymptom     && <SymptomChecker      members={family?.members || []}       onClose={() => setShowSymptom(false)} />}
      {showReminder    && <RemindersManager    members={family?.members || []}       onClose={() => setShowReminder(false)} />}
      {showComparator  && <MedicineComparator                                         onClose={() => setShowComparator(false)} />}
      {showFoodChecker && <FoodChecker         members={family?.members || []}       onClose={() => setShowFoodChecker(false)} />}
      {showDoctorBrief && family && <DoctorBrief family={family}                     onClose={() => setShowDoctorBrief(false)} />}
      {showSafetyScore && family && <SafetyScore members={family.members}            onClose={() => setShowSafetyScore(false)} />}
      {showAddMember   && <AddMember onAdd={handleAddMember}                         onClose={() => setShowAddMember(false)} />}
      {showAIChatbot   && family && <AIChatbot family={family}                       onClose={() => setShowAIChatbot(false)} />}
      {showAISymptom   && family && <AISymptomDiagnosis family={family}              onClose={() => setShowAISymptom(false)} />}

    </div>
  )
}
