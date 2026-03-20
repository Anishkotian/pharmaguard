import { useState, useEffect } from "react"
import FamilySetup from "./pages/FamilySetup"
import Dashboard from "./pages/Dashboard"

export default function App() {
  const [familyId, setFamilyId] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("pharmaguard_family_id")
    if (saved) setFamilyId(saved)
    setChecking(false)
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!familyId) {
    return <FamilySetup onComplete={(id) => setFamilyId(id)} />
  }

  return <Dashboard familyId={familyId} />
}
