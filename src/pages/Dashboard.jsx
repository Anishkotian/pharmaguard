import { useEffect, useState } from "react"
import { getFamily, addMedicineToMember } from "../services/familyService"
import { checkCrossFamily } from "../services/interactionChecker"
import { findDuplicates } from "../services/duplicateChecker"
import PrescriptionScanner from "../components/PrescriptionScanner"
import AlertCard from "../components/AlertCard"
import FamilyMap from "../components/FamilyMap"
import DuplicateAlert from "../components/DuplicateAlert"
import SymptomChecker from "./SymptomChecker"

export default function Dashboard({ familyId }) {
  const [family, setFamily] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [showSymptom, setShowSymptom] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [duplicates, setDuplicates] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [dismissedAlerts, setDismissedAlerts] = useState([])

  useEffect(() => {
    loadFamily()
  }, [familyId])

  const loadFamily = async () => {
    const data = await getFamily(familyId)
    setFamily(data)
    setLoading(false)
    if (data) {
      const foundAlerts = checkCrossFamily(data.members)
      const foundDuplicates = findDuplicates(data.members)
      setAlerts(foundAlerts)
      setDuplicates(foundDuplicates)
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

  const dismissAlert = (index) => {
    setDismissedAlerts([...dismissedAlerts, index])
  }

  const visibleAlerts = alerts.filter((_, i) => !dismissedAlerts.includes(i))
  const totalIssues = visibleAlerts.length + duplicates.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-red-500">PharmaGuard</h1>
            <p className="text-gray-400 mt-1">{family?.familyName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSymptom(true)}
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-3 rounded-xl transition-colors text-sm"
            >
              🤒 Symptom
            </button>
            <button
              onClick={() => setShowScanner(true)}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-3 rounded-xl transition-colors text-sm"
            >
              📷 Scan
            </button>
          </div>
        </div>

        {/* Issue Summary */}
        {totalIssues > 0 && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <p className="text-red-400 font-bold">
                  {totalIssues} Issue{totalIssues > 1 ? "s" : ""} Found
                </p>
                <p className="text-gray-400 text-sm">
                  {visibleAlerts.length} interaction{visibleAlerts.length !== 1 ? "s" : ""} · {duplicates.length} duplicate{duplicates.length !== 1 ? "s" : ""}
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["overview", "alerts", "duplicates", "medicines"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "bg-red-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white"
              }`}
            >
              {tab}
              {tab === "alerts" && visibleAlerts.length > 0 && (
                <span className="ml-2 bg-red-800 text-red-200 text-xs px-2 py-0.5 rounded-full">
                  {visibleAlerts.length}
                </span>
              )}
              {tab === "duplicates" && duplicates.length > 0 && (
                <span className="ml-2 bg-yellow-800 text-yellow-200 text-xs px-2 py-0.5 rounded-full">
                  {duplicates.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <FamilyMap members={family?.members || []} alerts={alerts} />
        )}

        {activeTab === "alerts" && (
          <div>
            {visibleAlerts.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-4xl mb-3">✅</p>
                <p>No cross-family interactions detected</p>
              </div>
            ) : (
              visibleAlerts.map((alert, i) => (
                <AlertCard key={i} alert={alert} onDismiss={() => dismissAlert(i)} />
              ))
            )}
          </div>
        )}

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

        {activeTab === "medicines" && (
          <div className="space-y-4">
            {family?.members.map(member => (
              <div key={member.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{member.name}</h2>
                    <p className="text-sm text-gray-500">Age {member.age}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">
                      {member.medicines.length}
                    </p>
                    <p className="text-xs text-gray-600">medicines</p>
                  </div>
                </div>

                {member.medicines.length === 0 ? (
                  <p className="text-sm text-gray-600 italic">No medicines added yet</p>
                ) : (
                  <div className="space-y-2">
                    {member.medicines.map((med, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg px-4 py-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{med.brandName}</p>
                          <p className="text-xs text-gray-500">{med.dose} · {med.frequency}</p>
                        </div>
                        <span className="text-xs text-gray-600 font-mono">{med.genericName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modals */}
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

    </div>
  )
}
