import { useState, useEffect } from "react"
import LandingPage from "./pages/LandingPage"
import FamilySetup from "./pages/FamilySetup"
import Dashboard from "./pages/Dashboard"
import { restoreReminders } from "./services/reminderScheduler"

export default function App() {
  const [screen, setScreen]   = useState("landing")
  const [familyId, setFamilyId] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("pharmaguard_family_id")
    if (saved) {
      setFamilyId(saved)
      setScreen("dashboard")
    }
    setChecking(false)
    restoreReminders()
  }, [])

  const handleGetStarted = () => {
    if (familyId) {
      setScreen("dashboard")
    } else {
      setScreen("setup")
    }
  }

  const handleReset = () => {
    setFamilyId(null)
    setScreen("landing")
  }

  if (checking) {
    return (
      <div style={{minHeight:"100vh",background:"#05070A",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <p style={{color:"#636E7B"}}>Loading...</p>
      </div>
    )
  }

  if (screen === "landing") {
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  if (screen === "setup") {
    return (
      <FamilySetup
        onComplete={(id) => {
          setFamilyId(id)
          setScreen("dashboard")
        }}
      />
    )
  }

  return <Dashboard familyId={familyId} onReset={handleReset} />
}
