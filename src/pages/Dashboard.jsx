import { useEffect, useState } from "react"
import {
  getFamily, addMedicineToMember, removeMedicineFromMember,
  clearMemberMedicines, removeFamilyMember, deleteFamily
} from "../services/familyService"
import { checkCrossFamily, checkSamePersonMultiDoctor } from "../services/interactionChecker"
import { findDuplicates } from "../services/duplicateChecker"
import PrescriptionScanner from "../components/PrescriptionScanner"
import AlertCard from "../components/AlertCard"
import MultiDoctorAlert from "../components/MultiDoctorAlert"
import FamilyMap from "../components/FamilyMap"
import DuplicateAlert from "../components/DuplicateAlert"
import SymptomChecker from "./SymptomChecker"
import RemindersManager from "./RemindersManager"
import MedicineComparator from "./MedicineComparator"

export default function Dashboard({ familyId, onReset }) {
  const [family, setFamily]                     = useState(null)
  const [loading, setLoading]                   = useState(true)
  const [showScanner, setShowScanner]           = useState(false)
  const [showSymptom, setShowSymptom]           = useState(false)
  const [showReminder, setShowReminder]         = useState(false)
  const [showSettings, setShowSettings]         = useState(false)
  const [showComparator, setShowComparator]     = useState(false)
  const [crossFamilyAlerts, setCrossFamilyAlerts] = useState([])
  const [multiDoctorAlerts, setMultiDoctorAlerts] = useState([])
  const [duplicates, setDuplicates]             = useState([])
  const [activeTab, setActiveTab]               = useState("overview")
  const [dismissedCross, setDismissedCross]     = useState([])
  const [dismissedMulti, setDismissedMulti]     = useState([])

  useEffect(() => { loadFamily() }, [familyId])

  const loadFamily = async () => {
    const data = await getFamily(familyId)
    setFamily(data)
    setLoading(false)
    if (data) {
      setCrossFamilyAlerts(checkCrossFamily(data.members))
      setMultiDoctorAlerts(checkSamePersonMultiDoctor(data.members))
      setDuplicates(findDuplicates(data.members))
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  const tabs = ["overview", "alerts", "multi-doctor", "duplicates", "medicines"]

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 bg-gray-950 border-b border-gray-800 px-4 py-3 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-red-500 truncate"
                  style={{fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"0.06em"}}>
                PharmaGuard
              </h1>
              <p className="text-gray-500 text-xs truncate">{family?.familyName}</p>
            </div>

            {/* Desktop buttons */}
            <div className="hidden sm:flex flex-wrap gap-2 justify-end">
              <button onClick={() => setShowSymptom(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors">
                🤒 Symptom
              </button>
              <button onClick={() => setShowComparator(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors">
                💊 Compare
              </button>
              <button onClick={() => setShowReminder(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors">
                ⏰ Reminders
              </button>
              <button onClick={() => setShowScanner(true)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors">
                📷 Scan
              </button>
              <button onClick={() => setShowSettings(!showSettings)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors">
                ⚙️
              </button>
            </div>

            {/* Mobile — show only scan + menu */}
            <div className="flex sm:hidden gap-2">
              <button onClick={() => setShowScanner(true)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors">
                📷 Scan
              </button>
              <button onClick={() => setShowSettings(!showSettings)}
                className="bg-gray-800 text-white font-bold px-3 py-2 rounded-xl text-xs">
                ☰
              </button>
            </div>
          </div>

          {/* Settings / Mobile menu */}
          {showSettings && (
            <div className="mt-3 bg-gray-900 border border-gray-700 rounded-xl p-4">

              {/* Mobile action buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4 sm:hidden">
                <button onClick={() => { setShowSymptom(true); setShowSettings(false) }}
                  className="bg-gray-800 text-white font-bold py-3 rounded-xl text-xs text-center">
                  🤒<br/>Symptom
                </button>
                <button onClick={() => { setShowComparator(true); setShowSettings(false) }}
                  className="bg-gray-800 text-white font-bold py-3 rounded-xl text-xs text-center">
                  💊<br/>Compare
                </button>
                <button onClick={() => { setShowReminder(true); setShowSettings(false) }}
                  className="bg-gray-800 text-white font-bold py-3 rounded-xl text-xs text-center">
                  ⏰<br/>Reminders
                </button>
              </div>

              {/* Reset */}
              <div className="flex items-center justify-between bg-red-950 border border-red-800 rounded-lg p-3">
                <div>
                  <p className="text-white font-semibold text-sm">Reset Entire App</p>
                  <p className="text-gray-400 text-xs mt-0.5">Deletes all family data permanently</p>
                </div>
                <button onClick={handleResetApp}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg ml-3 flex-shrink-0">
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-6 sm:py-6">

        {/* Issue Summary */}
        {totalIssues > 0 && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">🚨</span>
              <div>
                <p className="text-red-400 font-bold text-sm sm:text-base">
                  {totalIssues} Issue{totalIssues > 1 ? "s" : ""} Found
                </p>
                <p className="text-gray-400 text-xs">
                  {visibleCross.length} cross-family · {visibleMulti.length} multi-doctor · {duplicates.length} duplicate{duplicates.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {totalIssues === 0 && (
          <div className="bg-green-950 border border-green-800 rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <p className="text-green-400 font-semibold text-sm">No issues detected — your family is safe</p>
          </div>
        )}

        {/* Tabs — horizontal scroll on mobile */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "bg-red-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white"
              }`}
            >
              {tab === "multi-doctor" ? "👨‍⚕️ Multi" : tab}
              {tab === "alerts" && visibleCross.length > 0 && (
                <span className="ml-1 bg-red-800 text-red-200 text-xs px-1.5 py-0.5 rounded-full">
                  {visibleCross.length}
                </span>
              )}
              {tab === "multi-doctor" && visibleMulti.length > 0 && (
                <span className="ml-1 bg-orange-800 text-orange-200 text-xs px-1.5 py-0.5 rounded-full">
                  {visibleMulti.length}
                </span>
              )}
              {tab === "duplicates" && duplicates.length > 0 && (
                <span className="ml-1 bg-yellow-800 text-yellow-200 text-xs px-1.5 py-0.5 rounded-full">
                  {duplicates.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <FamilyMap members={family?.members || []} alerts={[...crossFamilyAlerts, ...multiDoctorAlerts]} />
        )}

        {/* Alerts */}
        {activeTab === "alerts" && (
          <div>
            {visibleCross.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-4xl mb-3">✅</p>
                <p>No cross-family interactions detected</p>
              </div>
            ) : visibleCross.map((alert, i) => (
              <AlertCard key={i} alert={alert} onDismiss={() => setDismissedCross([...dismissedCross, i])} />
            ))}
          </div>
        )}

        {/* Multi Doctor */}
        {activeTab === "multi-doctor" && (
          <div>
            <p className="text-gray-500 text-sm mb-4">
              Medicines prescribed to the same person by different doctors that interact dangerously.
            </p>
            {visibleMulti.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-4xl mb-3">✅</p>
                <p>No multi-doctor conflicts detected</p>
              </div>
            ) : visibleMulti.map((alert, i) => (
              <MultiDoctorAlert key={i} alert={alert} onDismiss={() => setDismissedMulti([...dismissedMulti, i])} />
            ))}
          </div>
        )}

        {/* Duplicates */}
        {activeTab === "duplicates" && (
          <div>
            {duplicates.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-4xl mb-3">✅</p>
                <p>No duplicate medicines detected</p>
              </div>
            ) : duplicates.map((dup, i) => (
              <DuplicateAlert key={i} duplicate={dup} />
            ))}
          </div>
        )}

        {/* Medicines */}
        {activeTab === "medicines" && (
          <div className="space-y-4">
            {family?.members.map(member => (
              <div key={member.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold text-white truncate">{member.name}</h2>
                    <p className="text-sm text-gray-500">Age {member.age}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xl sm:text-2xl font-bold text-green-400">{member.medicines.length}</span>
                    <span className="text-xs text-gray-600">meds</span>
                    {member.medicines.length > 0 && (
                      <button onClick={() => handleClearMedicines(member.id, member.name)}
                        className="text-xs text-yellow-500 border border-yellow-800 px-2 py-1 rounded-lg">
                        Clear
                      </button>
                    )}
                    <button onClick={() => handleRemoveMember(member.id, member.name)}
                      className="text-xs text-red-500 border border-red-800 px-2 py-1 rounded-lg">
                      Remove
                    </button>
                  </div>
                </div>

                {member.medicines.length === 0 ? (
                  <p className="text-sm text-gray-600 italic">No medicines added yet</p>
                ) : (
                  <div className="space-y-2">
                    {member.medicines.map((med, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg px-3 py-2.5 flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 flex-wrap">
                            <p className="text-sm font-medium text-white">{med.brandName}</p>
                            <span className="text-xs text-gray-600 font-mono flex-shrink-0">{med.genericName}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{med.dose} · {med.frequency}</p>
                          {med.doctorName && (
                            <p className="text-xs text-orange-400 mt-0.5">👨‍⚕️ {med.doctorName}</p>
                          )}
                        </div>
                        <button onClick={() => handleRemoveMedicine(member.id, i)}
                          className="text-gray-600 hover:text-red-500 text-xl font-bold flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── BOTTOM NAV (mobile only) ── */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-gray-950 border-t border-gray-800 safe-bottom">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center transition-colors ${
                activeTab === tab ? "text-red-500" : "text-gray-600"
              }`}
            >
              <div className="text-lg">
                {tab === "overview"     && "🏠"}
                {tab === "alerts"       && "🚨"}
                {tab === "multi-doctor" && "👨‍⚕️"}
                {tab === "duplicates"   && "💊"}
                {tab === "medicines"    && "📋"}
              </div>
              <div className="text-xs mt-0.5 font-medium">
                {tab === "overview"     && "Home"}
                {tab === "alerts"       && "Alerts"}
                {tab === "multi-doctor" && "Doctors"}
                {tab === "duplicates"   && "Dupes"}
                {tab === "medicines"    && "Meds"}
              </div>
              {tab === "alerts" && visibleCross.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-xs text-white flex items-center justify-center">
                  {visibleCross.length}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── MODALS ── */}
      {showScanner && (
        <PrescriptionScanner familyMembers={family?.members || []} onDrugsExtracted={handleDrugsExtracted} onClose={() => setShowScanner(false)} />
      )}
      {showSymptom && (
        <SymptomChecker members={family?.members || []} onClose={() => setShowSymptom(false)} />
      )}
      {showReminder && (
        <RemindersManager members={family?.members || []} onClose={() => setShowReminder(false)} />
      )}
      {showComparator && (
        <MedicineComparator onClose={() => setShowComparator(false)} />
      )}

    </div>
  )
}
