import { useEffect, useState } from "react"
import {
  getFamily, addMedicineToMember, removeMedicineFromMember,
  clearMemberMedicines, removeFamilyMember, deleteFamily
} from "../services/familyService"
import { checkCrossFamily, checkSamePersonMultiDoctor } from "../services/interactionChecker"
import { findDuplicates } from "../services/duplicateChecker"
import { calculateFamilyScores, calculateFamilyOverallScore } from "../services/safetyScoreService"
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

export default function Dashboard({ familyId, onReset }) {
  const [family, setFamily]                       = useState(null)
  const [loading, setLoading]                     = useState(true)
  const [showScanner, setShowScanner]             = useState(false)
  const [showSymptom, setShowSymptom]             = useState(false)
  const [showReminder, setShowReminder]           = useState(false)
  const [showSettings, setShowSettings]           = useState(false)
  const [showComparator, setShowComparator]       = useState(false)
  const [showDoctorBrief, setShowDoctorBrief]     = useState(false)
  const [showSafetyScore, setShowSafetyScore]     = useState(false)
  const [showFoodChecker, setShowFoodChecker]     = useState(false)
  const [crossFamilyAlerts, setCrossFamilyAlerts] = useState([])
  const [multiDoctorAlerts, setMultiDoctorAlerts] = useState([])
  const [duplicates, setDuplicates]               = useState([])
  const [memberScores, setMemberScores]           = useState([])
  const [overallScore, setOverallScore]           = useState(100)
  const [activeTab, setActiveTab]                 = useState("overview")
  const [dismissedCross, setDismissedCross]       = useState([])
  const [dismissedMulti, setDismissedMulti]       = useState([])

  useEffect(() => { loadFamily() }, [familyId])

  const loadFamily = async () => {
    const data = await getFamily(familyId)
    setFamily(data)
    setLoading(false)
    if (data) {
      setCrossFamilyAlerts(checkCrossFamily(data.members))
      setMultiDoctorAlerts(checkSamePersonMultiDoctor(data.members))
      setDuplicates(findDuplicates(data.members))
      const scores = calculateFamilyScores(data.members)
      setMemberScores(scores)
      setOverallScore(calculateFamilyOverallScore(scores))
    }
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
    if (!window.confirm(`Remove ${name} from the family?`)) return
    await removeFamilyMember(familyId, memberId)
    await loadFamily()
  }

  const handleResetApp = async () => {
    if (!window.confirm("Reset entire app? Deletes ALL data permanently.")) return
    if (!window.confirm("Are you absolutely sure?")) return
    await deleteFamily(familyId)
    onReset()
  }

  const visibleCross = crossFamilyAlerts.filter((_, i) => !dismissedCross.includes(i))
  const visibleMulti = multiDoctorAlerts.filter((_, i) => !dismissedMulti.includes(i))
  const totalIssues  = visibleCross.length + visibleMulti.length + duplicates.length
  const totalMeds    = family?.members.reduce((s, m) => s + m.medicines.length, 0) || 0

  const scoreTxt =
    overallScore >= 80 ? "#00FF88" :
    overallScore >= 60 ? "#FFD60A" :
    overallScore >= 40 ? "#FF6B35" : "#FF2D4B"

  const scoreBg =
    overallScore >= 80
      ? "linear-gradient(135deg,rgba(0,255,136,0.12),rgba(0,255,136,0.04))"
      : overallScore >= 60
      ? "linear-gradient(135deg,rgba(255,214,10,0.12),rgba(255,214,10,0.04))"
      : "linear-gradient(135deg,rgba(204,34,34,0.15),rgba(204,34,34,0.05))"

  const scoreBorder =
    overallScore >= 80 ? "rgba(0,255,136,0.2)"  :
    overallScore >= 60 ? "rgba(255,214,10,0.2)" :
                         "rgba(204,34,34,0.25)"

  const msColor = (color) =>
    color === "green"  ? "#00FF88" :
    color === "yellow" ? "#FFD60A" :
    color === "orange" ? "#FF6B35" : "#FF2D4B"

  const msBg = (color) =>
    color === "green"  ? "rgba(0,255,136,0.1)"  :
    color === "yellow" ? "rgba(255,214,10,0.1)"  :
    color === "orange" ? "rgba(255,107,53,0.1)"  :
                         "rgba(204,34,34,0.1)"

  const msBorder = (color) =>
    color === "green"  ? "rgba(0,255,136,0.2)"  :
    color === "yellow" ? "rgba(255,214,10,0.2)"  :
    color === "orange" ? "rgba(255,107,53,0.2)"  :
                         "rgba(204,34,34,0.2)"

  const quickActions = [
    { icon:"🍽️", label:"Food",      desc:"Foods to avoid",      bg:"rgba(255,107,53,0.1)",  border:"rgba(255,107,53,0.25)",  action:() => setShowFoodChecker(true)  },
    { icon:"🤒", label:"Symptom",   desc:"Side effect lookup",  bg:"rgba(255,214,10,0.08)", border:"rgba(255,214,10,0.2)",   action:() => setShowSymptom(true)      },
    { icon:"💊", label:"Compare",   desc:"Same molecule check", bg:"rgba(0,212,255,0.08)",  border:"rgba(0,212,255,0.2)",    action:() => setShowComparator(true)   },
    { icon:"🏥", label:"Brief",     desc:"AI doctor PDF",       bg:"rgba(191,90,242,0.08)", border:"rgba(191,90,242,0.2)",   action:() => setShowDoctorBrief(true)  },
    { icon:"⏰", label:"Reminders", desc:"Medicine schedule",   bg:"rgba(0,255,136,0.08)",  border:"rgba(0,255,136,0.2)",    action:() => setShowReminder(true)     },
    { icon:"🛡️", label:"Score",    desc:`${overallScore}/100`, bg:"rgba(204,34,34,0.08)",  border:"rgba(204,34,34,0.2)",    action:() => setShowSafetyScore(true)  },
  ]

  if (loading) {
    return (
      <div style={{
        minHeight:"100vh", background:"#05070A",
        display:"flex", alignItems:"center", justifyContent:"center",
        flexDirection:"column", gap:"16px"
      }}>
        <div style={{
          width:"44px", height:"44px", borderRadius:"50%",
          border:"3px solid #CC2222", borderTopColor:"transparent",
          animation:"spin 0.8s linear infinite"
        }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{
          color:"#636E7B", fontFamily:"'JetBrains Mono',monospace",
          fontSize:"11px", letterSpacing:"0.2em"
        }}>LOADING...</p>
      </div>
    )
  }

  const tabs = ["overview","alerts","multi-doctor","duplicates","medicines"]

  return (
    <div style={{
      minHeight:"100vh", background:"#05070A",
      color:"#EAEEF2", fontFamily:"'DM Sans',sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        * { box-sizing: border-box; }

        .dash-hover { transition: all 0.2s ease; }
        .dash-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .dash-hover:active { transform: translateY(0); }

        .qa-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          padding: 14px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.25s;
          border: none;
          text-align: left;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
        }
        .qa-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          filter: brightness(1.1);
        }
        .qa-card:active { transform: translateY(0); }

        .med-item {
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          transition: background 0.2s;
        }
        .med-item:hover { background: rgba(255,255,255,0.07); }

        .tab-pill {
          flex-shrink: 0;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          white-space: nowrap;
        }

        .close-btn:hover { color: #FF5555 !important; }

        .scan-btn {
          animation: scanPulse 2s ease-in-out infinite;
        }
        @keyframes scanPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(204,34,34,0.5); }
          50%      { box-shadow: 0 0 0 8px rgba(204,34,34,0); }
        }

        .fade-in {
          animation: fadeIn 0.3s ease both;
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .mobile-nav-btn {
          flex: 1;
          padding: 10px 4px 8px;
          text-align: center;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        @media (max-width: 640px) {
          .desktop-btns { display: none !important; }
          .mobile-btns  { display: flex !important; }
          .mobile-nav   { display: flex !important; }
          .main-pad     { padding: 16px 14px 100px !important; }
          .header-pad   { padding: 10px 14px !important; }
          .stats-row    { gap: 8px !important; }
          .stat-num     { font-size: 28px !important; }
          .qa-grid      { grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; }
        }
        @media (min-width: 641px) {
          .desktop-btns { display: flex !important; }
          .mobile-btns  { display: none !important; }
          .mobile-nav   { display: none !important; }
          .main-pad     { padding: 24px 20px 40px !important; }
          .header-pad   { padding: 14px 20px !important; }
          .qa-grid      { grid-template-columns: repeat(3,1fr) !important; gap: 10px !important; }
        }
      `}</style>

      {/* ══════════════════ HEADER ══════════════════ */}
      <div style={{
        position:"sticky", top:0, zIndex:40,
        background:"rgba(5,7,10,0.88)",
        backdropFilter:"blur(24px)",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
      }}>
        <div className="header-pad" style={{
          maxWidth:"760px", margin:"0 auto",
          display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:"10px"
        }}>

          {/* Logo + score */}
          <div style={{display:"flex", alignItems:"center", gap:"10px", minWidth:0}}>
            <div style={{minWidth:0}}>
              <div style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"20px", letterSpacing:"0.08em",
                color:"#CC2222", lineHeight:1,
                whiteSpace:"nowrap"
              }}>PharmaGuard</div>
              <div style={{
                fontSize:"10px", color:"#636E7B",
                fontFamily:"'JetBrains Mono',monospace",
                letterSpacing:"0.05em", marginTop:"1px",
                overflow:"hidden", textOverflow:"ellipsis",
                whiteSpace:"nowrap", maxWidth:"120px"
              }}>{family?.familyName}</div>
            </div>

            {/* Score pill */}
            <button
              className="dash-hover"
              onClick={() => setShowSafetyScore(true)}
              style={{
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:"24px", padding:"5px 12px",
                display:"flex", alignItems:"center", gap:"6px",
                cursor:"pointer", flexShrink:0
              }}
            >
              <div style={{
                width:"7px", height:"7px", borderRadius:"50%",
                background:scoreTxt,
                boxShadow:`0 0 6px ${scoreTxt}`,
                flexShrink:0
              }}/>
              <span style={{
                color:scoreTxt,
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"16px", letterSpacing:"0.04em"
              }}>{overallScore}</span>
              <span style={{
                color:"#636E7B", fontSize:"9px",
                fontFamily:"'JetBrains Mono',monospace"
              }}>/100</span>
            </button>
          </div>

          {/* Desktop buttons */}
          <div className="desktop-btns" style={{gap:"6px", flexWrap:"wrap", justifyContent:"flex-end", alignItems:"center"}}>
            {[
              {icon:"🤒",label:"Symptom",  fn:() => setShowSymptom(true)},
              {icon:"💊",label:"Compare",  fn:() => setShowComparator(true)},
              {icon:"🍽️",label:"Food",    fn:() => setShowFoodChecker(true)},
              {icon:"⏰",label:"Reminders",fn:() => setShowReminder(true)},
              {icon:"🏥",label:"Brief",    fn:() => setShowDoctorBrief(true)},
              {icon:"🛡️",label:"Score",   fn:() => setShowSafetyScore(true)},
            ].map(b => (
              <button key={b.label} className="dash-hover"
                onClick={b.fn}
                style={{
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.08)",
                  color:"#EAEEF2", borderRadius:"10px",
                  padding:"7px 11px", fontSize:"11px",
                  fontWeight:"600", cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif",
                  display:"flex", alignItems:"center", gap:"5px"
                }}
              >
                <span>{b.icon}</span><span>{b.label}</span>
              </button>
            ))}
            <button className="dash-hover scan-btn"
              onClick={() => setShowScanner(true)}
              style={{
                background:"#CC2222", color:"white",
                border:"none", borderRadius:"10px",
                padding:"7px 14px", fontSize:"11px",
                fontWeight:"700", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",
                display:"flex", alignItems:"center", gap:"5px"
              }}
            >📷 Scan</button>
            <button className="dash-hover"
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.08)",
                color:"#EAEEF2", borderRadius:"10px",
                padding:"7px 10px", fontSize:"13px",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif"
              }}
            >⚙️</button>
          </div>

          {/* Mobile buttons */}
          <div className="mobile-btns" style={{gap:"8px", alignItems:"center"}}>
            <button className="dash-hover scan-btn"
              onClick={() => setShowScanner(true)}
              style={{
                background:"#CC2222", color:"white",
                border:"none", borderRadius:"10px",
                padding:"8px 14px", fontSize:"13px",
                fontWeight:"700", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif"
              }}
            >📷</button>
            <button className="dash-hover"
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.08)",
                color:"#EAEEF2", borderRadius:"10px",
                padding:"8px 12px", fontSize:"14px",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif"
              }}
            >☰</button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="fade-in header-pad" style={{maxWidth:"760px", margin:"0 auto", paddingTop:"0 !important"}}>
            <div style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:"16px", padding:"16px",
              marginBottom:"12px"
            }}>
              {/* Mobile grid */}
              <div className="mobile-btns" style={{
                display:"grid", gridTemplateColumns:"repeat(3,1fr)",
                gap:"8px", marginBottom:"12px"
              }}>
                {[
                  {icon:"🤒",label:"Symptom",  fn:() => { setShowSymptom(true);      setShowSettings(false) }},
                  {icon:"💊",label:"Compare",  fn:() => { setShowComparator(true);   setShowSettings(false) }},
                  {icon:"🍽️",label:"Food",    fn:() => { setShowFoodChecker(true);  setShowSettings(false) }},
                  {icon:"⏰",label:"Reminders",fn:() => { setShowReminder(true);     setShowSettings(false) }},
                  {icon:"🛡️",label:"Score",   fn:() => { setShowSafetyScore(true);  setShowSettings(false) }},
                  {icon:"🏥",label:"Brief",    fn:() => { setShowDoctorBrief(true);  setShowSettings(false) }},
                ].map(b => (
                  <button key={b.label} onClick={b.fn}
                    style={{
                      background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.08)",
                      borderRadius:"12px", padding:"12px 8px",
                      color:"#EAEEF2", cursor:"pointer",
                      fontFamily:"'DM Sans',sans-serif",
                      fontSize:"11px", fontWeight:"600",
                      display:"flex", flexDirection:"column",
                      alignItems:"center", gap:"5px",
                      transition:"all 0.2s"
                    }}
                  >
                    <span style={{fontSize:"18px"}}>{b.icon}</span>
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>

              {/* Reset */}
              <div style={{
                display:"flex", alignItems:"center",
                justifyContent:"space-between",
                background:"rgba(204,34,34,0.08)",
                border:"1px solid rgba(204,34,34,0.2)",
                borderRadius:"12px", padding:"12px 14px"
              }}>
                <div>
                  <p style={{color:"#EAEEF2", fontWeight:"600", fontSize:"13px", margin:0}}>
                    Reset Entire App
                  </p>
                  <p style={{color:"#636E7B", fontSize:"11px", margin:"2px 0 0"}}>
                    Deletes all family data permanently
                  </p>
                </div>
                <button onClick={handleResetApp}
                  style={{
                    background:"#CC2222", color:"white",
                    border:"none", borderRadius:"10px",
                    padding:"8px 16px", fontSize:"12px",
                    fontWeight:"700", cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif",
                    marginLeft:"12px", flexShrink:0
                  }}
                >Reset</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════ MAIN ══════════════════ */}
      <div className="main-pad" style={{maxWidth:"760px", margin:"0 auto"}}>

        {/* ── STATS ROW ── */}
        <div className="stats-row" style={{
          display:"flex", gap:"10px",
          marginBottom:"16px",
          overflowX:"auto", paddingBottom:"4px",
          marginLeft:"-14px", paddingLeft:"14px",
          marginRight:"-14px", paddingRight:"14px"
        }}>

          {/* Overall score card */}
          <button
            className="dash-hover"
            onClick={() => setShowSafetyScore(true)}
            style={{
              background:scoreBg,
              border:`1px solid ${scoreBorder}`,
              borderRadius:"18px", padding:"16px 20px",
              cursor:"pointer", flexShrink:0,
              minWidth:"110px", textAlign:"left",
              fontFamily:"'DM Sans',sans-serif"
            }}
          >
            <p style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"8px", letterSpacing:"0.18em",
              color:"#636E7B", textTransform:"uppercase",
              margin:"0 0 6px"
            }}>Family</p>
            <p className="stat-num" style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize:"40px", color:scoreTxt,
              lineHeight:1, margin:"0 0 3px"
            }}>{overallScore}</p>
            <p style={{color:"#636E7B", fontSize:"10px", margin:0}}>
              {overallScore >= 80 ? "✅ Safe" : overallScore >= 60 ? "⚠️ Moderate" : overallScore >= 40 ? "🔶 At Risk" : "🚨 Danger"}
            </p>
          </button>

          {/* Member score cards */}
          {memberScores.map(ms => (
            <button
              key={ms.member.id}
              className="dash-hover"
              onClick={() => setShowSafetyScore(true)}
              style={{
                background: msBg(ms.color),
                border: `1px solid ${msBorder(ms.color)}`,
                borderRadius:"18px", padding:"14px 16px",
                cursor:"pointer", flexShrink:0,
                minWidth:"90px", textAlign:"left",
                fontFamily:"'DM Sans',sans-serif"
              }}
            >
              <p style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:"8px", letterSpacing:"0.1em",
                color:"#636E7B", margin:"0 0 4px",
                textOverflow:"ellipsis", overflow:"hidden",
                whiteSpace:"nowrap", maxWidth:"80px"
              }}>{ms.member.name}</p>
              <p className="stat-num" style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"30px", color:msColor(ms.color),
                lineHeight:1, margin:"0 0 6px"
              }}>{ms.score}</p>
              <div style={{
                width:"100%", height:"3px",
                background:"rgba(255,255,255,0.08)",
                borderRadius:"2px", overflow:"hidden"
              }}>
                <div style={{
                  height:"100%", width:`${ms.score}%`,
                  background:msColor(ms.color),
                  borderRadius:"2px", transition:"width 1s ease"
                }}/>
              </div>
            </button>
          ))}

          {/* Stat boxes */}
          {[
            {label:"Members",  value:family?.members.length || 0, color:"#00D4FF"},
            {label:"Medicines",value:totalMeds,                   color:"#BF5AF2"},
            {label:"Alerts",   value:totalIssues, color:totalIssues > 0 ? "#FF2D4B" : "#00FF88",
             action:() => setActiveTab("alerts")},
          ].map(s => (
            <div key={s.label}
              onClick={s.action}
              style={{
                background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.06)",
                borderRadius:"18px", padding:"14px 16px",
                flexShrink:0, minWidth:"80px",
                cursor: s.action ? "pointer" : "default",
                transition:"all 0.2s"
              }}
            >
              <p style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:"8px", letterSpacing:"0.15em",
                color:"#636E7B", textTransform:"uppercase",
                margin:"0 0 4px"
              }}>{s.label}</p>
              <p className="stat-num" style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"30px", color:s.color,
                lineHeight:1, margin:0
              }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── STATUS BANNER ── */}
        {totalIssues > 0 ? (
          <div className="fade-in" style={{
            background:"linear-gradient(135deg,rgba(204,34,34,0.14),rgba(204,34,34,0.04))",
            border:"1px solid rgba(204,34,34,0.28)",
            borderRadius:"14px", padding:"14px 18px",
            marginBottom:"14px",
            display:"flex", alignItems:"center", gap:"12px"
          }}>
            <div style={{
              width:"38px", height:"38px", borderRadius:"11px",
              background:"rgba(204,34,34,0.18)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"18px", flexShrink:0
            }}>🚨</div>
            <div>
              <p style={{color:"#FF5555", fontWeight:"700", fontSize:"13px", margin:"0 0 2px"}}>
                {totalIssues} Issue{totalIssues > 1 ? "s" : ""} Detected
              </p>
              <p style={{color:"#636E7B", fontSize:"11px", margin:0}}>
                {[
                  visibleCross.length > 0 && `${visibleCross.length} cross-family`,
                  visibleMulti.length > 0 && `${visibleMulti.length} multi-doctor`,
                  duplicates.length > 0   && `${duplicates.length} duplicate${duplicates.length > 1 ? "s" : ""}`,
                ].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        ) : (
          <div className="fade-in" style={{
            background:"linear-gradient(135deg,rgba(0,255,136,0.08),rgba(0,255,136,0.02))",
            border:"1px solid rgba(0,255,136,0.14)",
            borderRadius:"14px", padding:"12px 18px",
            marginBottom:"14px",
            display:"flex", alignItems:"center", gap:"10px"
          }}>
            <div style={{
              width:"34px", height:"34px", borderRadius:"10px",
              background:"rgba(0,255,136,0.1)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"16px", flexShrink:0
            }}>✅</div>
            <p style={{color:"#00CC66", fontWeight:"600", fontSize:"13px", margin:0}}>
              No issues detected — your family is safe
            </p>
          </div>
        )}

        {/* ── TABS ── */}
        <div style={{
          display:"flex", gap:"6px", marginBottom:"18px",
          overflowX:"auto", paddingBottom:"4px",
          marginLeft:"-14px", paddingLeft:"14px",
          marginRight:"-14px", paddingRight:"14px"
        }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="tab-pill"
              style={{
                background: activeTab === tab ? "#CC2222" : "rgba(255,255,255,0.05)",
                color:       activeTab === tab ? "white"   : "#636E7B",
              }}
            >
              {tab === "multi-doctor" ? "👨‍⚕️ Multi" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "alerts" && visibleCross.length > 0 && (
                <span style={{
                  position:"absolute", top:"-5px", right:"-5px",
                  background:"#CC2222", color:"white",
                  width:"15px", height:"15px", borderRadius:"50%",
                  fontSize:"8px", display:"flex",
                  alignItems:"center", justifyContent:"center",
                  fontWeight:"700", border:"2px solid #05070A"
                }}>{visibleCross.length}</span>
              )}
              {tab === "multi-doctor" && visibleMulti.length > 0 && (
                <span style={{
                  position:"absolute", top:"-5px", right:"-5px",
                  background:"#CC6600", color:"white",
                  width:"15px", height:"15px", borderRadius:"50%",
                  fontSize:"8px", display:"flex",
                  alignItems:"center", justifyContent:"center",
                  fontWeight:"700", border:"2px solid #05070A"
                }}>{visibleMulti.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════ OVERVIEW TAB ══════════ */}
        {activeTab === "overview" && (
          <div className="fade-in">
            <FamilyMap
              members={family?.members || []}
              alerts={[...crossFamilyAlerts, ...multiDoctorAlerts]}
            />

            <p style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"9px", letterSpacing:"0.25em",
              color:"#636E7B", textTransform:"uppercase",
              margin:"22px 0 10px"
            }}>Quick Actions</p>

            <div className="qa-grid" style={{display:"grid"}}>
              {quickActions.map(card => (
                <button
                  key={card.label}
                  className="qa-card"
                  onClick={card.action}
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                  }}
                >
                  <div style={{
                    width:"38px", height:"38px",
                    borderRadius:"11px",
                    background:`rgba(255,255,255,0.08)`,
                    border:`1px solid ${card.border}`,
                    display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:"18px",
                    flexShrink:0
                  }}>
                    {card.icon}
                  </div>
                  <div>
                    <p style={{
                      color:"#EAEEF2", fontWeight:"700",
                      fontSize:"13px", margin:"0 0 2px"
                    }}>{card.label}</p>
                    <p style={{
                      color:"#636E7B", fontSize:"11px",
                      margin:0, lineHeight:"1.4"
                    }}>{card.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ ALERTS TAB ══════════ */}
        {activeTab === "alerts" && (
          <div className="fade-in">
            {visibleCross.length === 0 ? (
              <div style={{textAlign:"center", padding:"60px 20px"}}>
                <div style={{fontSize:"48px", marginBottom:"12px"}}>✅</div>
                <p style={{color:"#EAEEF2", fontWeight:"600", fontSize:"15px", marginBottom:"4px"}}>All Clear</p>
                <p style={{color:"#636E7B", fontSize:"13px"}}>No cross-family interactions detected</p>
              </div>
            ) : visibleCross.map((alert, i) => (
              <AlertCard key={i} alert={alert}
                onDismiss={() => setDismissedCross([...dismissedCross, i])} />
            ))}
          </div>
        )}

        {/* ══════════ MULTI DOCTOR TAB ══════════ */}
        {activeTab === "multi-doctor" && (
          <div className="fade-in">
            <p style={{color:"#636E7B", fontSize:"13px", marginBottom:"16px"}}>
              Medicines from different doctors for the same person that interact dangerously.
            </p>
            {visibleMulti.length === 0 ? (
              <div style={{textAlign:"center", padding:"60px 20px"}}>
                <div style={{fontSize:"48px", marginBottom:"12px"}}>✅</div>
                <p style={{color:"#EAEEF2", fontWeight:"600", fontSize:"15px", marginBottom:"4px"}}>All Clear</p>
                <p style={{color:"#636E7B", fontSize:"13px"}}>No multi-doctor conflicts detected</p>
              </div>
            ) : visibleMulti.map((alert, i) => (
              <MultiDoctorAlert key={i} alert={alert}
                onDismiss={() => setDismissedMulti([...dismissedMulti, i])} />
            ))}
          </div>
        )}

        {/* ══════════ DUPLICATES TAB ══════════ */}
        {activeTab === "duplicates" && (
          <div className="fade-in">
            {duplicates.length === 0 ? (
              <div style={{textAlign:"center", padding:"60px 20px"}}>
                <div style={{fontSize:"48px", marginBottom:"12px"}}>✅</div>
                <p style={{color:"#EAEEF2", fontWeight:"600", fontSize:"15px", marginBottom:"4px"}}>All Clear</p>
                <p style={{color:"#636E7B", fontSize:"13px"}}>No duplicate medicines detected</p>
              </div>
            ) : duplicates.map((dup, i) => (
              <DuplicateAlert key={i} duplicate={dup} />
            ))}
          </div>
        )}

        {/* ══════════ MEDICINES TAB ══════════ */}
        {activeTab === "medicines" && (
          <div className="fade-in" style={{display:"flex", flexDirection:"column", gap:"10px"}}>
            {family?.members.map(member => {
              const ms = memberScores.find(s => s.member.id === member.id)
              return (
                <div key={member.id} style={{
                  background:"rgba(255,255,255,0.03)",
                  border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:"16px", overflow:"hidden"
                }}>
                  {/* Member header */}
                  <div style={{
                    padding:"14px 16px",
                    display:"flex", alignItems:"center",
                    justifyContent:"space-between", gap:"10px",
                    borderBottom: member.medicines.length > 0
                      ? "1px solid rgba(255,255,255,0.05)" : "none"
                  }}>
                    <div style={{display:"flex", alignItems:"center", gap:"10px", minWidth:0}}>
                      <div style={{
                        width:"38px", height:"38px", borderRadius:"11px",
                        background: ms ? msBg(ms.color) : "rgba(255,255,255,0.06)",
                        border:`1px solid ${ms ? msBorder(ms.color) : "rgba(255,255,255,0.08)"}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"16px", flexShrink:0
                      }}>👤</div>

                      <div style={{minWidth:0}}>
                        <div style={{display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap"}}>
                          <p style={{
                            color:"#EAEEF2", fontWeight:"600",
                            fontSize:"14px", margin:0
                          }}>{member.name}</p>
                          {ms && (
                            <span style={{
                              fontFamily:"'JetBrains Mono',monospace",
                              fontSize:"9px", fontWeight:"700",
                              padding:"2px 7px", borderRadius:"20px",
                              background:msBg(ms.color),
                              color:msColor(ms.color),
                              border:`1px solid ${msBorder(ms.color)}`,
                              flexShrink:0
                            }}>{ms.score}/100</span>
                          )}
                        </div>
                        <p style={{color:"#636E7B", fontSize:"11px", margin:"2px 0 0"}}>
                          Age {member.age} · {member.medicines.length} med{member.medicines.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div style={{display:"flex", gap:"6px", flexShrink:0}}>
                      {member.medicines.length > 0 && (
                        <button onClick={() => handleClearMedicines(member.id, member.name)}
                          style={{
                            background:"rgba(255,214,10,0.08)",
                            border:"1px solid rgba(255,214,10,0.2)",
                            color:"#FFD60A", borderRadius:"8px",
                            padding:"5px 10px", fontSize:"11px",
                            cursor:"pointer", fontWeight:"600",
                            fontFamily:"'DM Sans',sans-serif",
                            transition:"all 0.2s"
                          }}>Clear</button>
                      )}
                      <button onClick={() => handleRemoveMember(member.id, member.name)}
                        style={{
                          background:"rgba(204,34,34,0.08)",
                          border:"1px solid rgba(204,34,34,0.2)",
                          color:"#FF5555", borderRadius:"8px",
                          padding:"5px 10px", fontSize:"11px",
                          cursor:"pointer", fontWeight:"600",
                          fontFamily:"'DM Sans',sans-serif",
                          transition:"all 0.2s"
                        }}>Remove</button>
                    </div>
                  </div>

                  {/* Medicine list */}
                  {member.medicines.length === 0 ? (
                    <div style={{padding:"18px 16px", textAlign:"center"}}>
                      <p style={{color:"#636E7B", fontSize:"13px", fontStyle:"italic", margin:0}}>
                        No medicines added yet
                      </p>
                    </div>
                  ) : (
                    <div style={{padding:"8px 10px", display:"flex", flexDirection:"column", gap:"4px"}}>
                      {member.medicines.map((med, i) => (
                        <div key={i} className="med-item"
                          style={{padding:"10px 12px", display:"flex", alignItems:"flex-start", gap:"10px"}}>
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{
                              display:"flex", alignItems:"flex-start",
                              justifyContent:"space-between", gap:"8px", flexWrap:"wrap"
                            }}>
                              <p style={{
                                color:"#EAEEF2", fontWeight:"600",
                                fontSize:"13px", margin:0
                              }}>{med.brandName}</p>
                              <span style={{
                                fontFamily:"'JetBrains Mono',monospace",
                                fontSize:"9px", color:"#636E7B",
                                background:"rgba(255,255,255,0.05)",
                                padding:"2px 7px", borderRadius:"5px",
                                flexShrink:0, whiteSpace:"nowrap"
                              }}>{med.genericName}</span>
                            </div>
                            <p style={{color:"#636E7B", fontSize:"11px", margin:"4px 0 0"}}>
                              {med.dose} · {med.frequency}
                            </p>
                            {med.doctorName && (
                              <p style={{
                                color:"rgba(255,107,53,0.8)",
                                fontSize:"10px", margin:"3px 0 0"
                              }}>👨‍⚕️ {med.doctorName}</p>
                            )}
                          </div>
                          <button
                            className="close-btn"
                            onClick={() => handleRemoveMedicine(member.id, i)}
                            style={{
                              background:"none", border:"none",
                              color:"#636E7B", cursor:"pointer",
                              fontSize:"16px", fontWeight:"bold",
                              width:"26px", height:"26px",
                              display:"flex", alignItems:"center",
                              justifyContent:"center", borderRadius:"6px",
                              flexShrink:0, transition:"color 0.2s",
                              padding:0
                            }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* ══════════════════ MOBILE BOTTOM NAV ══════════════════ */}
      <div className="mobile-nav" style={{
        position:"fixed", bottom:0, left:0, right:0,
        background:"rgba(5,7,10,0.95)",
        backdropFilter:"blur(24px)",
        borderTop:"1px solid rgba(255,255,255,0.06)",
        zIndex:50
      }}>
        <div style={{display:"flex"}}>
          {[
            {tab:"overview",     icon:"🏠", label:"Home"},
            {tab:"alerts",       icon:"🚨", label:"Alerts"},
            {tab:"multi-doctor", icon:"👨‍⚕️", label:"Doctors"},
            {tab:"duplicates",   icon:"💊", label:"Dupes"},
            {tab:"medicines",    icon:"📋", label:"Meds"},
          ].map(item => (
            <button
              key={item.tab}
              className="mobile-nav-btn"
              onClick={() => setActiveTab(item.tab)}
              style={{color: activeTab === item.tab ? "#CC2222" : "#636E7B"}}
            >
              {activeTab === item.tab && (
                <div style={{
                  position:"absolute", top:0,
                  left:"50%", transform:"translateX(-50%)",
                  width:"28px", height:"2px",
                  background:"#CC2222",
                  borderRadius:"0 0 2px 2px"
                }}/>
              )}
              <div style={{fontSize:"17px"}}>{item.icon}</div>
              <div style={{fontSize:"9px", fontWeight:"600", marginTop:"3px", letterSpacing:"0.02em"}}>
                {item.label}
              </div>
              {item.tab === "alerts" && visibleCross.length > 0 && (
                <div style={{
                  position:"absolute", top:"5px", right:"6px",
                  background:"#CC2222", color:"white",
                  width:"14px", height:"14px", borderRadius:"50%",
                  fontSize:"8px", fontWeight:"700",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  border:"2px solid #05070A"
                }}>{visibleCross.length}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════ MODALS ══════════════════ */}
      {showScanner     && <PrescriptionScanner familyMembers={family?.members || []} onDrugsExtracted={handleDrugsExtracted} onClose={() => setShowScanner(false)} />}
      {showSymptom     && <SymptomChecker      members={family?.members || []}       onClose={() => setShowSymptom(false)} />}
      {showReminder    && <RemindersManager    members={family?.members || []}       onClose={() => setShowReminder(false)} />}
      {showComparator  && <MedicineComparator                                         onClose={() => setShowComparator(false)} />}
      {showFoodChecker && <FoodChecker         members={family?.members || []}       onClose={() => setShowFoodChecker(false)} />}
      {showDoctorBrief && family && <DoctorBrief family={family}                     onClose={() => setShowDoctorBrief(false)} />}
      {showSafetyScore && family && <SafetyScore members={family.members}            onClose={() => setShowSafetyScore(false)} />}

    </div>
  )
}
