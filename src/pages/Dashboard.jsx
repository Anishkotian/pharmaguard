import { useEffect, useState } from "react"
import {
  getFamily,
  addMedicineToMember,
  removeMedicineFromMember,
  clearMemberMedicines,
  removeFamilyMember,
  deleteFamily
} from "../services/familyService"
import { checkCrossFamily, checkSamePersonMultiDoctor } from "../services/interactionChecker"
import { findDuplicates } from "../services/duplicateChecker"
import PrescriptionScanner from "../components/PrescriptionScanner"
import AlertCard from "../components/AlertCard"
import MultiDoctorAlert from "../components/MultiDoctorAlert"
import FamilyMap from "../components/FamilyMap"
import DuplicateAlert from "../components/DuplicateAlert"
import SymptomChecker from "./SymptomChecker"
import MedicineReminder from "../components/MedicineReminder"

export default function Dashboard({ familyId, onReset }) {
  const [family, setFamily]               = useState(null)
  const [loading, setLoading]             = useState(true)
  const [showScanner, setShowScanner]     = useState(false)
  const [showSymptom, setShowSymptom]     = useState(false)
  const [showReminder, setShowReminder]   = useState(false)
  const [showSettings, setShowSettings]   = useState(false)
  const [crossFamilyAlerts, setCrossFamilyAlerts] = useState([])
  const [multiDoctorAlerts, setMultiDoctorAlerts] = useState([])
  const [duplicates, setDuplicates]       = useState([])
  const [activeTab, setActiveTab]         = useState("overview")
  const [dismissedCross, setDismissedCross] = useState([])
  const [dismissedMulti, setDismissedMulti] = useState([])

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
        ...drug,
        startDate: new Date().toISOString().split("T")[0]
      })
    }
    await loadFamily()
  }

  const handleRemoveMedicine = async (memberId, medicineIndex) => {
    if (!window.confirm("Remove this medicine?")) return
    await removeMedicineFromMember(familyId, memberId, medicineIndex)
    await loadFamily()
  }

  const handleClearMedicines = async (memberId, memberName) => {
    if (!window.confirm(`Remove ALL medicines from ${memberName}?`)) return
    await clearMemberMedicines(familyId, memberId)
    await loadFamily()
  }

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the family? This will delete all their medicines too.`)) return
    await removeFamilyMember(familyId, memberId)
    await loadFamily()
  }

  const handleResetApp = async () => {
    if (!window.confirm("Reset the entire app? This will delete ALL family data permanently.")) return
    if (!window.confirm("Are you absolutely sure? This cannot be undone.")) return
    await deleteFamily(familyId)
    onReset()
  }

  const visibleCross  = crossFamilyAlerts.filter((_, i) => !dismissedCross.includes(i))
  const visibleMulti  = multiDoctorAlerts.filter((_, i) => !dismissedMulti.includes(i))
  const totalIssues   = visibleCross.length + visibleMulti.length + duplicates.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto">

        {/* ── HEADER ── */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-red-500">PharmaGuard</h1>
              <p className="text-gray-400 mt-1 text-sm">{family?.familyName}</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => setShowSymptom(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded-xl transition-colors text-xs"
              >
                🤒 Symptom
              </button>
              <button
                onClick={() => setShowReminder(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded-xl transition-colors text-xs"
              >
                ⏰ Reminder
              </button>
              <button
                onClick={() => setShowScanner(true)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-2 rounded-xl transition-colors text-xs"
              >
                📷 Scan
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded-xl transition-colors text-xs"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mt-4">
              <h3 className="text-white font-bold mb-4">Settings</h3>
              <div className="flex items-center justify-between bg-red-950 border border-red-800 rounded-lg p-4">
                <div>
                  <p className="text-white font-semibold text-sm">Reset Entire App</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Deletes all family data permanently
                  </p>
                </div>
                <button
                  onClick={handleResetApp}
                  className="bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── ISSUE SUMMARY ── */}
        {totalIssues > 0 && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <p className="text-red-400 font-bold">
                  {totalIssues} Issue{totalIssues > 1 ? "s" : ""} Found
                </p>
                <p className="text-gray-400 text-sm">
                  {visibleCross.length} cross-family · {visibleMulti.length} multi-doctor · {duplicates.length} duplicate{duplicates.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {totalIssues === 0 && (
          <div className="bg-green-950 border border-green-800 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="text-green-400 font-semibold">
              No issues detected — your family is safe
            </p>
          </div>
        )}

        {/* ── TABS ── */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["overview", "alerts", "multi-doctor", "duplicates", "medicines"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "bg-red-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white"
              }`}
            >
              {tab === "multi-doctor" ? "👨‍⚕️ Multi-Doctor" : tab}
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

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <FamilyMap
            members={family?.members || []}
            alerts={[...crossFamilyAlerts, ...multiDoctorAlerts]}
          />
        )}

        {/* ── ALERTS TAB ── */}
        {activeTab === "alerts" && (
          <div>
            {visibleCross.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-4xl mb-3">✅</p>
                <p>No cross-family interactions detected</p>
              </div>
            ) : (
              visibleCross.map((alert, i) => (
                <AlertCard
                  key={i}
                  alert={alert}
                  onDismiss={() => setDismissedCross([...dismissedCross, i])}
                />
              ))
            )}
          </div>
        )}

        {/* ── MULTI DOCTOR TAB ── */}
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
            ) : (
              visibleMulti.map((alert, i) => (
                <MultiDoctorAlert
                  key={i}
                  alert={alert}
                  onDismiss={() => setDismissedMulti([...dismissedMulti, i])}
                />
              ))
            )}
          </div>
        )}

        {/* ── DUPLICATES TAB ── */}
        {activeTab === "duplicates" && (
          <div>
            {duplicates.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-4xl mb-3">✅</p>
                <p>No duplicate medicines detected</p>
              </div>
            ) : (
              duplicates.map((dup, i) => (
                <DuplicateAlert key={i} duplicate={dup} />
              ))
            )}
          </div>
        )}

        {/* ── MEDICINES TAB ── */}
        {activeTab === "medicines" && (
          <div className="space-y-4">
            {family?.members.map(member => (
              <div
                key={member.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5"
              >
                {/* Member Header */}
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{member.name}</h2>
                    <p className="text-sm text-gray-500">Age {member.age}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className="text-2xl font-bold text-green-400">
                      {member.medicines.length}
                    </span>
                    <span className="text-xs text-gray-600">medicines</span>
                    {member.medicines.length > 0 && (
                      <button
                        onClick={() => handleClearMedicines(member.id, member.name)}
                        className="text-xs text-yellow-500 hover:text-yellow-400 border border-yellow-800 px-2 py-1 rounded-lg"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      className="text-xs text-red-500 hover:text-red-400 border border-red-800 px-2 py-1 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Medicine List */}
                {member.medicines.length === 0 ? (
                  <p className="text-sm text-gray-600 italic">No medicines added yet</p>
                ) : (
                  <div className="space-y-2">
                    {member.medicines.map((med, i) => (
                      <div
                        key={i}
                        className="bg-gray-800 rounded-lg px-4 py-3 flex items-start justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm font-medium text-white">{med.brandName}</p>
                            <span className="text-xs text-gray-600 font-mono">{med.genericName}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {med.dose} · {med.frequency}
                          </p>
                          {med.doctorName && (
                            <p className="text-xs text-orange-400 mt-1">
                              👨‍⚕️ {med.doctorName} · {med.condition}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveMedicine(member.id, i)}
                          className="text-gray-600 hover:text-red-500 text-xl font-bold flex-shrink-0"
                          title="Remove medicine"
                        >
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

      {/* ── MODALS ── */}
      {showScanner && (
        <PrescriptionScanner
          familyMembers={family?.members || []}
          onDrugsExtracted={handleDrugsExtracted}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showSymptom && (
        <SymptomChecker
          members={family?.members || []}
          onClose={() => setShowSymptom(false)}
        />
      )}

      {showReminder && (
        <MedicineReminder
          members={family?.members || []}
          onClose={() => setShowReminder(false)}
        />
      )}

    </div>
  )
}
