import { useState, useEffect, useRef } from "react"
import SplashScreen from "./components/SplashScreen"
import LandingPage from "./pages/LandingPage"
import FamilySetup from "./pages/FamilySetup"
import Dashboard from "./pages/Dashboard"
import { restoreReminders } from "./services/reminderScheduler"

export default function App() {
  const [screen, setScreen]     = useState("splash")
  const [familyId, setFamilyId] = useState(null)
  const [checking, setChecking] = useState(true)
  const initialized             = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const saved = localStorage.getItem("pharmaguard_family_id")
    if (saved) setFamilyId(saved)
    setChecking(false)
    restoreReminders()
  }, [])

  const handleSplashDone = () => {
    const saved = localStorage.getItem("pharmaguard_family_id")
    if (saved) {
      setScreen("dashboard")
    } else {
      setScreen("landing")
    }
  }

  const handleGetStarted = () => {
    const saved = localStorage.getItem("pharmaguard_family_id")
    if (saved) {
      setScreen("dashboard")
    } else {
      setScreen("setup")
    }
  }

  const handleReset = () => {
    localStorage.removeItem("pharmaguard_family_id")
    setFamilyId(null)
    setScreen("landing")
  }

  if (screen === "splash") {
    return <SplashScreen onComplete={handleSplashDone} />
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

  return (
    <Dashboard
      familyId={familyId || localStorage.getItem("pharmaguard_family_id")}
      onReset={handleReset}
    />
  )
}
