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

  const scoreGrad =
    overallScore >= 80 ? "from-green-500  to-emerald-400" :
    overallScore >= 60 ? "from-yellow-500 to-amber-400"   :
    overallScore >= 40 ? "from-orange-500 to-orange-400"  :
                         "from-red-600    to-red-400"

  const scoreTxt =
    overallScore >= 80 ? "text-emerald-400" :
    overallScore >= 60 ? "text-yellow-400"  :
    overallScore >= 40 ? "text-orange-400"  :
                         "text-red-400"

  if (loading) {
    return (
      <div style={{
        minHeight:"100vh", background:"#05070A",
        display:"flex", alignItems:"center", justifyContent:"center",
        flexDirection:"column", gap:"16px"
      }}>
        <div style={{
          width:"48px", height:"48px", borderRadius:"50%",
          border:"3px solid #CC2222", borderTopColor:"transparent",
          animation:"spin 0.8s linear infinite"
        }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{color:"#636E7B", fontFamily:"'JetBrains Mono',monospace", fontSize:"12px", letterSpacing:"0.2em"}}>
          LOADING...
        </p>
      </div>
    )
  }

  const tabs = ["overview", "alerts", "multi-doctor", "duplicates", "medicines"]

  return (
    <div style={{minHeight:"100vh", background:"#05070A", color:"#EAEEF2", fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        .dash-btn { transition: all 0.2s ease; }
        .dash-btn:hover { transform: translateY(-1px); }
        .dash-btn:active { transform: translateY(0); }

        .tool-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 18px 20px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: left;
        }
        .tool-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .tool-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }

        .score-card {
          border-radius: 16px;
          padding: 16px 18px;
          cursor: pointer;
          transition: all 0.25s;
          flex-shrink: 0;
          min-width: 100px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
        }
        .score-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }

        .med-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          transition: all 0.2s;
        }
        .med-item {
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          transition: all 0.2s;
        }
        .med-item:hover { background: rgba(255,255,255,0.07); }

        .tab-btn {
          flex-shrink: 0;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .tab-btn.active { background: #CC2222; color: white; }
        .tab-btn.inactive { background: rgba(255,255,255,0.05); color: #636E7B; }
        .tab-btn.inactive:hover { background: rgba(255,255,255,0.08); color: #EAEEF2; }

        .action-btn {
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          border-radius: 12px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .action-btn:hover { transform: translateY(-1px); }

        .stat-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 16px;
          text-align: center;
          flex: 1;
        }

        .glow-red    { box-shadow: 0 0 20px rgba(204,34,34,0.15); }
        .glow-green  { box-shadow: 0 0 20px rgba(0,255,136,0.10); }

        .mobile-nav-btn {
          flex: 1;
          padding: 10px 4px;
          text-align: center;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .scan-pulse {
          animation: scanPulse 2s ease-in-out infinite;
        }
        @keyframes scanPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(204,34,34,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(204,34,34,0); }
        }

        .fade-in {
          animation: fadeIn 0.4s ease both;
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }

        @media(max-width:640px) {
          .desktop-only { display: none !important; }
        }
        @media(min-width:641px) {
          .mobile-only { display: none !important; }
          .mobile-nav  { display: none !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        position:"sticky", top:0, zIndex:40,
        background:"rgba(5,7,10,0.85)",
        backdropFilter:"blur(24px)",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        padding:"0 16px",
      }}>
        <div style={{maxWidth:"720px", margin:"0 auto", padding:"12px 0", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px"}}>

          {/* Left — Logo + Score */}
          <div style={{display:"flex", alignItems:"center", gap:"12px", minWidth:0}}>
            <div>
              <div style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"22px", letterSpacing:"0.08em",
                color:"#CC2222", lineHeight:1
              }}>
                PharmaGuard
              </div>
              <div style={{
                fontSize:"11px", color:"#636E7B",
                fontFamily:"'JetBrains Mono',monospace",
                letterSpacing:"0.06em", marginTop:"2px"
              }}>
                {family?.familyName}
              </div>
            </div>

            {/* Score pill */}
            <button
              className="dash-btn"
              onClick={() => setShowSafetyScore(true)}
              style={{
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:"24px",
                padding:"6px 14px",
                display:"flex", alignItems:"center", gap:"6px",
                cursor:"pointer",
              }}
            >
              <div style={{
                width:"8px", height:"8px", borderRadius:"50%",
                background: overallScore >= 80 ? "#00FF88" : overallScore >= 60 ? "#FFD60A" : overallScore >= 40 ? "#FF6B35" : "#FF2D4B",
                boxShadow: `0 0 6px ${overallScore >= 80 ? "#00FF88" : overallScore >= 60 ? "#FFD60A" : overallScore >= 40 ? "#FF6B35" : "#FF2D4B"}`,
              }}/>
              <span className={scoreTxt} style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"17px", letterSpacing:"0.04em"
              }}>
                {overallScore}
              </span>
              <span style={{color:"#636E7B", fontSize:"10px", fontFamily:"'JetBrains Mono',monospace"}}>
                /100
              </span>
            </button>
          </div>

          {/* Right — Desktop buttons */}
          <div className="desktop-only" style={{display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"flex-end"}}>
            {[
              { icon:"🤒", label:"Symptom",   action: () => setShowSymptom(true) },
              { icon:"💊", label:"Compare",   action: () => setShowComparator(true) },
              { icon:"🍽️", label:"Food",      action: () => setShowFoodChecker(true) },
              { icon:"⏰", label:"Reminders", action: () => setShowReminder(true) },
              { icon:"🏥", label:"Brief",     action: () => setShowDoctorBrief(true) },
              { icon:"🛡️", label:"Score",     action: () => setShowSafetyScore(true) },
            ].map(btn => (
              <button key={btn.label} className="dash-btn action-btn"
                onClick={btn.action}
                style={{
                  background:"rgba(255,255,255,0.05)",
                  color:"#EAEEF2", padding:"8px 12px",
                  fontSize:"11px", gap:"5px",
                  border:"1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span>{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            ))}
            <button className="dash-btn action-btn scan-pulse"
              onClick={() => setShowScanner(true)}
              style={{background:"#CC2222", color:"white", padding:"8px 14px", fontSize:"11px"}}
            >
              📷 Scan
            </button>
            <button className="dash-btn action-btn"
              onClick={() => setShowSettings(!showSettings)}
              style={{background:"rgba(255,255,255,0.05)", color:"#EAEEF2", padding:"8px 10px",
                fontSize:"13px", border:"1px solid rgba(255,255,255,0.08)"}}
            >
              ⚙️
            </button>
          </div>

          {/* Mobile buttons */}
          <div className="mobile-only" style={{display:"flex", gap:"8px"}}>
            <button className="dash-btn action-btn scan-pulse"
              onClick={() => setShowScanner(true)}
              style={{background:"#CC2222", color:"white", padding:"8px 14px", fontSize:"12px"}}
            >
              📷
            </button>
            <button className="dash-btn action-btn"
              onClick={() => setShowSettings(!showSettings)}
              style={{background:"rgba(255,255,255,0.05)", color:"#EAEEF2",
                padding:"8px 12px", fontSize:"13px",
                border:"1px solid rgba(255,255,255,0.08)"}}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Settings / Mobile menu */}
        {showSettings && (
          <div className="fade-in" style={{
            maxWidth:"720px", margin:"0 auto",
            background:"rgba(255,255,255,0.03)",
            border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:"16px", padding:"16px",
            marginBottom:"12px"
          }}>
            {/* Mobile action grid */}
            <div className="mobile-only" style={{
              display:"grid", gridTemplateColumns:"repeat(3,1fr)",
              gap:"8px", marginBottom:"12px"
            }}>
              {[
                { icon:"🤒", label:"Symptom",   action: () => { setShowSymptom(true);     setShowSettings(false) } },
                { icon:"💊", label:"Compare",   action: () => { setShowComparator(true);  setShowSettings(false) } },
                { icon:"🍽️", label:"Food",      action: () => { setShowFoodChecker(true); setShowSettings(false) } },
                { icon:"⏰", label:"Reminders", action: () => { setShowReminder(true);    setShowSettings(false) } },
                { icon:"🛡️", label:"Score",     action: () => { setShowSafetyScore(true); setShowSettings(false) } },
                { icon:"🏥", label:"Brief",     action: () => { setShowDoctorBrief(true); setShowSettings(false) } },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action}
                  style={{
                    background:"rgba(255,255,255,0.05)",
                    border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:"12px", padding:"14px 8px",
                    color:"#EAEEF2", cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif",
                    fontSize:"11px", fontWeight:"600",
                    display:"flex", flexDirection:"column",
                    alignItems:"center", gap:"6px",
                    transition:"all 0.2s"
                  }}
                >
                  <span style={{fontSize:"20px"}}>{btn.icon}</span>
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>

            {/* Reset */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              background:"rgba(204,34,34,0.08)",
              border:"1px solid rgba(204,34,34,0.2)",
              borderRadius:"12px", padding:"14px 16px"
            }}>
              <div>
                <p style={{color:"#EAEEF2", fontWeight:"600", fontSize:"13px", margin:0}}>
                  Reset Entire App
                </p>
                <p style={{color:"#636E7B", fontSize:"11px", margin:"2px 0 0"}}>
                  Deletes all family data permanently
                </p>
              </div>
              <button onClick={handleResetApp} style={{
                background:"#CC2222", color:"white",
                border:"none", borderRadius:"10px",
                padding:"8px 16px", fontSize:"12px",
                fontWeight:"700", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",
                marginLeft:"12px", flexShrink:0
              }}>
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN ── */}
      <div style={{maxWidth:"720px", margin:"0 auto", padding:"20px 16px 100px"}}>

        {/* ── HERO STATS ROW ── */}
        <div style={{display:"flex", gap:"10px", marginBottom:"20px", overflowX:"auto", paddingBottom:"4px"}}>

          {/* Overall score big card */}
          <div
            onClick={() => setShowSafetyScore(true)}
            style={{
              background: overallScore >= 80
                ? "linear-gradient(135deg, rgba(0,255,136,0.12), rgba(0,255,136,0.04))"
                : overallScore >= 60
                ? "linear-gradient(135deg, rgba(255,214,10,0.12), rgba(255,214,10,0.04))"
                : "linear-gradient(135deg, rgba(204,34,34,0.15), rgba(204,34,34,0.05))",
              border: `1px solid ${overallScore >= 80 ? "rgba(0,255,136,0.2)" : overallScore >= 60 ? "rgba(255,214,10,0.2)" : "rgba(204,34,34,0.25)"}`,
              borderRadius:"20px", padding:"20px 24px",
              cursor:"pointer", transition:"all 0.25s",
              flexShrink:0, minWidth:"130px"
            }}
            className="dash-btn"
          >
            <p style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"9px", letterSpacing:"0.2em",
              color:"#636E7B", textTransform:"uppercase",
              margin:"0 0 8px"
            }}>Family Score</p>
            <p className={scoreTxt} style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize:"52px", lineHeight:1,
              margin:"0 0 2px"
            }}>{overallScore}</p>
            <p style={{color:"#636E7B", fontSize:"11px", margin:0}}>
              {overallScore >= 80 ? "✅ Safe" : overallScore >= 60 ? "⚠️ Moderate" : overallScore >= 40 ? "🔶 At Risk" : "🚨 Danger"}
            </p>
          </div>

          {/* Member score cards */}
          {memberScores.map(ms => (
            <div
              key={ms.member.id}
              onClick={() => setShowSafetyScore(true)}
              className="score-card dash-btn"
            >
              <p style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:"9px", letterSpacing:"0.1em",
                color:"#636E7B", textTransform:"uppercase",
                margin:"0 0 6px", whiteSpace:"nowrap", overflow:"hidden",
                textOverflow:"ellipsis"
              }}>
                {ms.member.name}
              </p>
              <p style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"32px", lineHeight:1,
                color: ms.color === "green" ? "#00FF88" : ms.color === "yellow" ? "#FFD60A" : ms.color === "orange" ? "#FF6B35" : "#FF2D4B",
                margin:"0 0 4px"
              }}>{ms.score}</p>
              <div style={{
                width:"100%", height:"3px",
                background:"rgba(255,255,255,0.08)",
                borderRadius:"2px", overflow:"hidden"
              }}>
                <div style={{
                  height:"100%",
                  width:`${ms.score}%`,
                  background: ms.color === "green" ? "#00FF88" : ms.color === "yellow" ? "#FFD60A" : ms.color === "orange" ? "#FF6B35" : "#FF2D4B",
                  borderRadius:"2px",
                  transition:"width 1s ease"
                }}/>
              </div>
              <p style={{color:"#636E7B", fontSize:"10px", margin:"4px 0 0"}}>{ms.emoji}</p>
            </div>
          ))}

          {/* Stats cards */}
          <div className="stat-box">
            <p style={{fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", letterSpacing:"0.15em", color:"#636E7B", margin:"0 0 6px"}}>MEMBERS</p>
            <p style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:"32px", color:"#00D4FF", margin:0, lineHeight:1}}>
              {family?.members.length || 0}
            </p>
          </div>

          <div className="stat-box">
            <p style={{fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", letterSpacing:"0.15em", color:"#636E7B", margin:"0 0 6px"}}>MEDICINES</p>
            <p style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:"32px", color:"#BF5AF2", margin:0, lineHeight:1}}>
              {totalMeds}
            </p>
          </div>

          <div className="stat-box" style={{cursor:"pointer"}} onClick={() => setActiveTab("alerts")}>
            <p style={{fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", letterSpacing:"0.15em", color:"#636E7B", margin:"0 0 6px"}}>ALERTS</p>
            <p style={{
              fontFamily:"'Bebas Neue',sans-serif", fontSize:"32px",
              color: totalIssues > 0 ? "#FF2D4B" : "#00FF88",
              margin:0, lineHeight:1
            }}>
              {totalIssues}
            </p>
          </div>
        </div>

        {/* ── STATUS BANNER ── */}
        {totalIssues > 0 ? (
          <div className="fade-in" style={{
            background:"linear-gradient(135deg, rgba(204,34,34,0.15), rgba(204,34,34,0.05))",
            border:"1px solid rgba(204,34,34,0.3)",
            borderRadius:"16px", padding:"16px 20px",
            marginBottom:"16px",
            display:"flex", alignItems:"center", gap:"14px"
          }}>
            <div style={{
              width:"40px", height:"40px", borderRadius:"12px",
              background:"rgba(204,34,34,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"20px", flexShrink:0,
              animation:"scanPulse 2s ease-in-out infinite"
            }}>🚨</div>
            <div>
              <p style={{color:"#FF5555", fontWeight:"700", fontSize:"14px", margin:"0 0 2px"}}>
                {totalIssues} Issue{totalIssues > 1 ? "s" : ""} Detected
              </p>
              <p style={{color:"#636E7B", fontSize:"12px", margin:0}}>
                {visibleCross.length > 0 && `${visibleCross.length} cross-family `}
                {visibleMulti.length > 0 && `${visibleMulti.length} multi-doctor `}
                {duplicates.length > 0 && `${duplicates.length} duplicate${duplicates.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="fade-in" style={{
            background:"linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,255,136,0.02))",
            border:"1px solid rgba(0,255,136,0.15)",
            borderRadius:"16px", padding:"14px 20px",
            marginBottom:"16px",
            display:"flex", alignItems:"center", gap:"12px"
          }}>
            <div style={{
              width:"36px", height:"36px", borderRadius:"10px",
              background:"rgba(0,255,136,0.12)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"18px", flexShrink:0
            }}>✅</div>
            <p style={{color:"#00CC66", fontWeight:"600", fontSize:"13px", margin:0}}>
              No issues detected — your family is safe
            </p>
          </div>
        )}

        {/* ── TABS ── */}
        <div style={{
          display:"flex", gap:"6px", marginBottom:"20px",
          overflowX:"auto", paddingBottom:"4px",
          marginLeft:"-16px", paddingLeft:"16px",
          marginRight:"-16px", paddingRight:"16px"
        }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? "active" : "inactive"}`}
              style={{position:"relative"}}
            >
              {tab === "multi-doctor" ? "👨‍⚕️ Multi" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "alerts" && visibleCross.length > 0 && (
                <span style={{
                  position:"absolute", top:"-6px", right:"-6px",
                  background:"#CC2222", color:"white",
                  width:"16px", height:"16px", borderRadius:"50%",
                  fontSize:"9px", display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:"700"
                }}>{visibleCross.length}</span>
              )}
              {tab === "multi-doctor" && visibleMulti.length > 0 && (
                <span style={{
                  position:"absolute", top:"-6px", right:"-6px",
                  background:"#CC6600", color:"white",
                  width:"16px", height:"16px", borderRadius:"50%",
                  fontSize:"9px", display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:"700"
                }}>{visibleMulti.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="fade-in">
            <FamilyMap
              members={family?.members || []}
              alerts={[...crossFamilyAlerts, ...multiDoctorAlerts]}
            />

            {/* Tool cards grid */}
            <p style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"9px", letterSpacing:"0.25em",
              color:"#636E7B", textTransform:"uppercase",
              margin:"24px 0 12px"
            }}>Quick Actions</p>

            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
              {[
                {
                  icon:"🍽️", label:"Food Interactions",
                  desc:"Check foods to avoid",
                  bg:"rgba(255,107,53,0.1)", border:"rgba(255,107,53,0.2)",
                  action: () => setShowFoodChecker(true)
                },
                {
                  icon:"🤒", label:"Symptom Checker",
                  desc:"Find medicine side effects",
                  bg:"rgba(255,214,10,0.08)", border:"rgba(255,214,10,0.18)",
                  action: () => setShowSymptom(true)
                },
                {
                  icon:"💊", label:"Compare Medicines",
                  desc:"Same molecule check",
                  bg:"rgba(0,212,255,0.08)", border:"rgba(0,212,255,0.18)",
                  action: () => setShowComparator(true)
                },
                {
                  icon:"🏥", label:"Doctor Brief",
                  desc:"AI-generated PDF",
                  bg:"rgba(191,90,242,0.08)", border:"rgba(191,90,242,0.18)",
                  action: () => setShowDoctorBrief(true)
                },
                {
                  icon:"⏰", label:"Reminders",
                  desc:"Medicine schedules",
                  bg:"rgba(0,255,136,0.08)", border:"rgba(0,255,136,0.18)",
                  action: () => setShowReminder(true)
                },
                {
                  icon:"🛡️", label:"Safety Score",
                  desc:`Family score: ${overallScore}/100`,
                  bg:"rgba(204,34,34,0.08)", border:"rgba(204,34,34,0.18)",
                  action: () => setShowSafetyScore(true)
                },
              ].map(card => (
                <div
                  key={card.label}
                  className="tool-card"
                  onClick={card.action}
                  style={{
                    background: card.bg,
                    borderColor: card.border,
                  }}
                >
                  <div className="tool-icon" style={{background: card.bg, border:`1px solid ${card.border}`}}>
                    {card.icon}
                  </div>
                  <div style={{minWidth:0}}>
                    <p style={{color:"#EAEEF2", fontWeight:"600", fontSize:"13px", margin:"0 0 2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                      {card.label}
                    </p>
                    <p style={{color:"#636E7B", fontSize:"11px", margin:0}}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ALERTS TAB ── */}
        {activeTab === "alerts" && (
          <div className="fade-in">
            {visibleCross.length === 0 ? (
              <div style={{textAlign:"center", padding:"60px 20px"}}>
                <div style={{fontSize:"48px", marginBottom:"12px"}}>✅</div>
                <p style={{color:"#EAEEF2", fontWeight:"600", marginBottom:"4px"}}>All Clear</p>
                <p style={{color:"#636E7B", fontSize:"13px"}}>No cross-family interactions detected</p>
              </div>
            ) : visibleCross.map((alert, i) => (
              <AlertCard key={i} alert={alert}
                onDismiss={() => setDismissedCross([...dismissedCross, i])} />
            ))}
          </div>
        )}

        {/* ── MULTI DOCTOR TAB ── */}
        {activeTab === "multi-doctor" && (
          <div className="fade-in">
            <p style={{color:"#636E7B", fontSize:"13px", marginBottom:"16px"}}>
              Medicines from different doctors for the same person that interact dangerously.
            </p>
            {visibleMulti.length === 0 ? (
              <div style={{textAlign:"center", padding:"60px 20px"}}>
                <div style={{fontSize:"48px", marginBottom:"12px"}}>✅</div>
                <p style={{color:"#EAEEF2", fontWeight:"600", marginBottom:"4px"}}>All Clear</p>
                <p style={{color:"#636E7B", fontSize:"13px"}}>No multi-doctor conflicts detected</p>
              </div>
            ) : visibleMulti.map((alert, i) => (
              <MultiDoctorAlert key={i} alert={alert}
                onDismiss={() => setDismissedMulti([...dismissedMulti, i])} />
            ))}
          </div>
        )}

        {/* ── DUPLICATES TAB ── */}
        {activeTab === "duplicates" && (
          <div className="fade-in">
            {duplicates.length === 0 ? (
              <div style={{textAlign:"center", padding:"60px 20px"}}>
                <div style={{fontSize:"48px", marginBottom:"12px"}}>✅</div>
                <p style={{color:"#EAEEF2", fontWeight:"600", marginBottom:"4px"}}>All Clear</p>
                <p style={{color:"#636E7B", fontSize:"13px"}}>No duplicate medicines detected</p>
              </div>
            ) : duplicates.map((dup, i) => (
              <DuplicateAlert key={i} duplicate={dup} />
            ))}
          </div>
        )}

        {/* ── MEDICINES TAB ── */}
        {activeTab === "medicines" && (
          <div className="fade-in" style={{display:"flex", flexDirection:"column", gap:"12px"}}>
            {family?.members.map(member => {
              const ms = memberScores.find(s => s.member.id === member.id)
              return (
                <div key={member.id} className="med-card">

                  {/* Member header */}
                  <div style={{
                    padding:"16px 16px 12px",
                    display:"flex", alignItems:"center",
                    justifyContent:"space-between", gap:"12px",
                    borderBottom: member.medicines.length > 0 ? "1px solid rgba(255,255,255,0.05)" : "none"
                  }}>
                    <div style={{display:"flex", alignItems:"center", gap:"12px", minWidth:0}}>
                      {/* Avatar */}
                      <div style={{
                        width:"40px", height:"40px", borderRadius:"12px",
                        background: ms?.color === "green" ? "rgba(0,255,136,0.12)" :
                                    ms?.color === "yellow" ? "rgba(255,214,10,0.12)" :
                                    ms?.color === "orange" ? "rgba(255,107,53,0.12)" :
                                    "rgba(204,34,34,0.12)",
                        border: `1px solid ${ms?.color === "green" ? "rgba(0,255,136,0.2)" :
                                              ms?.color === "yellow" ? "rgba(255,214,10,0.2)" :
                                              ms?.color === "orange" ? "rgba(255,107,53,0.2)" :
                                              "rgba(204,34,34,0.2)"}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"18px", flexShrink:0
                      }}>
                        👤
                      </div>
                      <div style={{minWidth:0}}>
                        <div style={{display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap"}}>
                          <p style={{color:"#EAEEF2", fontWeight:"600", fontSize:"14px", margin:0}}>
                            {member.name}
                          </p>
                          {ms && (
                            <span style={{
                              fontFamily:"'JetBrains Mono',monospace",
                              fontSize:"10px", fontWeight:"700",
                              padding:"2px 8px", borderRadius:"20px",
                              background: ms.color === "green"  ? "rgba(0,255,136,0.1)"  :
                                          ms.color === "yellow" ? "rgba(255,214,10,0.1)" :
                                          ms.color === "orange" ? "rgba(255,107,53,0.1)" :
                                          "rgba(204,34,34,0.1)",
                              color: ms.color === "green"  ? "#00FF88" :
                                     ms.color === "yellow" ? "#FFD60A" :
                                     ms.color === "orange" ? "#FF6B35" :
                                     "#FF2D4B",
                              border: `1px solid ${ms.color === "green"  ? "rgba(0,255,136,0.2)"  :
                                                    ms.color === "yellow" ? "rgba(255,214,10,0.2)" :
                                                    ms.color === "orange" ? "rgba(255,107,53,0.2)" :
                                                    "rgba(204,34,34,0.2)"}`
                            }}>
                              {ms.score}/100
                            </span>
                          )}
                        </div>
                        <p style={{color:"#636E7B", fontSize:"12px", margin:"2px 0 0"}}>
                          Age {member.age} · {member.medicines.length} medicine{member.medicines.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{display:"flex", gap:"6px", flexShrink:0}}>
                      {member.medicines.length > 0 && (
                        <button onClick={() => handleClearMedicines(member.id, member.name)}
                          style={{
                            background:"rgba(255,214,10,0.08)",
                            border:"1px solid rgba(255,214,10,0.2)",
                            color:"#FFD60A", borderRadius:"8px",
                            padding:"5px 10px", fontSize:"11px",
                            cursor:"pointer", fontWeight:"600",
                            fontFamily:"'DM Sans',sans-serif"
                          }}>
                          Clear
                        </button>
                      )}
                      <button onClick={() => handleRemoveMember(member.id, member.name)}
                        style={{
                          background:"rgba(204,34,34,0.08)",
                          border:"1px solid rgba(204,34,34,0.2)",
                          color:"#FF5555", borderRadius:"8px",
                          padding:"5px 10px", fontSize:"11px",
                          cursor:"pointer", fontWeight:"600",
                          fontFamily:"'DM Sans',sans-serif"
                        }}>
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Medicine list */}
                  {member.medicines.length === 0 ? (
                    <div style={{padding:"20px 16px", textAlign:"center"}}>
                      <p style={{color:"#636E7B", fontSize:"13px", fontStyle:"italic"}}>
                        No medicines added yet
                      </p>
                    </div>
                  ) : (
                    <div style={{padding:"10px 12px", display:"flex", flexDirection:"column", gap:"6px"}}>
                      {member.medicines.map((med, i) => (
                        <div key={i} className="med-item"
                          style={{padding:"10px 12px", display:"flex", alignItems:"start", gap:"10px"}}>
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px", flexWrap:"wrap"}}>
                              <p style={{color:"#EAEEF2", fontWeight:"600", fontSize:"13px", margin:0}}>
                                {med.brandName}
                              </p>
                              <span style={{
                                fontFamily:"'JetBrains Mono',monospace",
                                fontSize:"10px", color:"#636E7B",
                                background:"rgba(255,255,255,0.04)",
                                padding:"2px 8px", borderRadius:"6px",
                                flexShrink:0
                              }}>
                                {med.genericName}
                              </span>
                            </div>
                            <p style={{color:"#636E7B", fontSize:"11px", margin:"4px 0 0"}}>
                              {med.dose} · {med.frequency}
                            </p>
                            {med.doctorName && (
                              <p style={{color:"rgba(255,107,53,0.8)", fontSize:"11px", margin:"3px 0 0"}}>
                                👨‍⚕️ {med.doctorName}
                              </p>
                            )}
                          </div>
                          <button onClick={() => handleRemoveMedicine(member.id, i)}
                            style={{
                              background:"none", border:"none",
                              color:"#636E7B", cursor:"pointer",
                              fontSize:"18px", fontWeight:"bold",
                              width:"28px", height:"28px",
                              display:"flex", alignItems:"center", justifyContent:"center",
                              borderRadius:"8px", flexShrink:0,
                              transition:"all 0.2s"
                            }}
                            onMouseOver={e => e.target.style.color="#FF5555"}
                            onMouseOut={e => e.target.style.color="#636E7B"}
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

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="mobile-nav" style={{
        position:"fixed", bottom:0, left:0, right:0,
        background:"rgba(5,7,10,0.95)",
        backdropFilter:"blur(20px)",
        borderTop:"1px solid rgba(255,255,255,0.06)",
        display:"flex", zIndex:50
      }}>
        {[
          { tab:"overview",     icon:"🏠", label:"Home"    },
          { tab:"alerts",       icon:"🚨", label:"Alerts"  },
          { tab:"multi-doctor", icon:"👨‍⚕️", label:"Doctors" },
          { tab:"duplicates",   icon:"💊", label:"Dupes"   },
          { tab:"medicines",    icon:"📋", label:"Meds"    },
        ].map(item => (
          <button
            key={item.tab}
            className="mobile-nav-btn"
            onClick={() => setActiveTab(item.tab)}
            style={{color: activeTab === item.tab ? "#CC2222" : "#636E7B"}}
          >
            {activeTab === item.tab && (
              <div style={{
                position:"absolute", top:0, left:"50%",
                transform:"translateX(-50%)",
                width:"32px", height:"2px",
                background:"#CC2222", borderRadius:"0 0 2px 2px"
              }}/>
            )}
            <div style={{fontSize:"18px"}}>{item.icon}</div>
            <div style={{
              fontSize:"10px", fontWeight:"600",
              marginTop:"3px", letterSpacing:"0.02em"
            }}>{item.label}</div>
            {item.tab === "alerts" && visibleCross.length > 0 && (
              <div style={{
                position:"absolute", top:"6px", right:"8px",
                background:"#CC2222", color:"white",
                width:"14px", height:"14px", borderRadius:"50%",
                fontSize:"8px", fontWeight:"700",
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>{visibleCross.length}</div>
            )}
          </button>
        ))}
      </div>

      {/* ── MODALS ── */}
      {showScanner    && <PrescriptionScanner familyMembers={family?.members || []} onDrugsExtracted={handleDrugsExtracted} onClose={() => setShowScanner(false)} />}
      {showSymptom    && <SymptomChecker      members={family?.members || []}       onClose={() => setShowSymptom(false)} />}
      {showReminder   && <RemindersManager    members={family?.members || []}       onClose={() => setShowReminder(false)} />}
      {showComparator && <MedicineComparator                                         onClose={() => setShowComparator(false)} />}
      {showFoodChecker && <FoodChecker        members={family?.members || []}       onClose={() => setShowFoodChecker(false)} />}
      {showDoctorBrief && family && <DoctorBrief family={family}                    onClose={() => setShowDoctorBrief(false)} />}
      {showSafetyScore && family && <SafetyScore members={family.members}           onClose={() => setShowSafetyScore(false)} />}

    </div>
  )
}
