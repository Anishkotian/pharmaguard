import { useState } from "react"
import { buildBriefData, generateBriefWithAI } from "../services/doctorBriefService"
import { generateDoctorBriefPDF } from "../services/pdfGenerator"
import { checkCrossFamily } from "../services/interactionChecker"
import { findDuplicates } from "../services/duplicateChecker"

export default function DoctorBrief({ family, onClose }) {
  const [step, setStep]         = useState("ready")
  const [progress, setProgress] = useState("")
  const [briefText, setBriefText] = useState("")
  const [error, setError]       = useState(null)

  const allAlerts    = checkCrossFamily(family.members)
  const allDuplicates = findDuplicates(family.members)
  const totalMeds    = family.members.reduce((sum, m) => sum + m.medicines.length, 0)

  const handleGenerate = async () => {
    setStep("generating")
    setError(null)

    try {
      setProgress("Analysing family medicine profile...")
      const briefData = buildBriefData(family)
      await new Promise(r => setTimeout(r, 600))

      setProgress("Generating AI summary...")
      const text = await generateBriefWithAI(briefData)
      setBriefText(text)
      await new Promise(r => setTimeout(r, 400))

      setProgress("Creating PDF...")
      await new Promise(r => setTimeout(r, 400))

      setStep("done")
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setStep("ready")
    }
  }

  const handleDownload = () => {
    const doc = generateDoctorBriefPDF(
      briefText, family, allAlerts, allDuplicates
    )
    const fileName = `PharmaGuard_DoctorBrief_${family.familyName.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">🏥 Doctor Brief</h2>
            <p className="text-gray-500 text-xs mt-1">
              AI-generated PDF for your doctor appointment
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-5">

          {/* READY STATE */}
          {step === "ready" && (
            <div>
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-400"
                     style={{fontFamily:"'Bebas Neue',sans-serif"}}>
                    {family.members.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Family Members</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-cyan-400"
                     style={{fontFamily:"'Bebas Neue',sans-serif"}}>
                    {totalMeds}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total Medicines</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <p className={`text-3xl font-bold ${allAlerts.length > 0 ? "text-red-400" : "text-green-400"}`}
                     style={{fontFamily:"'Bebas Neue',sans-serif"}}>
                    {allAlerts.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Interactions</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <p className={`text-3xl font-bold ${allDuplicates.length > 0 ? "text-yellow-400" : "text-green-400"}`}
                     style={{fontFamily:"'Bebas Neue',sans-serif"}}>
                    {allDuplicates.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Duplicates</p>
                </div>
              </div>

              {/* What will be included */}
              <div className="bg-gray-800 rounded-xl p-4 mb-5">
                <p className="text-xs text-gray-500 mb-3 font-mono tracking-widest">
                  PDF WILL INCLUDE
                </p>
                <div className="space-y-2">
                  {[
                    "Patient summary with all family members",
                    "Complete medicine list per member",
                    "All critical drug interactions",
                    "Duplicate molecules detected",
                    "AI-generated recommended actions",
                    "Questions to ask your doctor",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-green-400 text-xs">✓</span>
                      <p className="text-gray-300 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts preview */}
              {allAlerts.length > 0 && (
                <div className="bg-red-950 border border-red-800 rounded-xl p-4 mb-5">
                  <p className="text-xs text-red-400 font-mono tracking-widest mb-2">
                    ⚠️ WILL BE HIGHLIGHTED IN PDF
                  </p>
                  {allAlerts.slice(0, 2).map((alert, i) => (
                    <p key={i} className="text-gray-300 text-xs mb-1">
                      • {alert.member1}'s {alert.med1} + {alert.member2}'s {alert.med2} — {alert.severity} RISK
                    </p>
                  ))}
                  {allAlerts.length > 2 && (
                    <p className="text-gray-500 text-xs">+{allAlerts.length - 2} more alerts</p>
                  )}
                </div>
              )}

              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}

              <button
                onClick={handleGenerate}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-colors"
              >
                🤖 Generate Doctor Brief PDF
              </button>
            </div>
          )}

          {/* GENERATING STATE */}
          {step === "generating" && (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">🤖</div>
              <p className="text-white font-bold text-lg mb-2">
                Generating your brief...
              </p>
              <p className="text-gray-400 text-sm mb-6">{progress}</p>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{width:"70%"}} />
              </div>
              <p className="text-gray-600 text-xs mt-4">
                AI is analysing {totalMeds} medicines across {family.members.length} family members
              </p>
            </div>
          )}

          {/* DONE STATE */}
          {step === "done" && (
            <div>
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-white font-bold text-lg mb-1">
                  Doctor Brief Ready!
                </p>
                <p className="text-gray-400 text-sm">
                  Professional PDF generated for {family.familyName}
                </p>
              </div>

              {/* Brief preview */}
              <div className="bg-gray-800 rounded-xl p-4 mb-5 max-h-48 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-2 font-mono tracking-widest">
                  BRIEF PREVIEW
                </p>
                <pre className="text-gray-300 text-xs leading-5 whitespace-pre-wrap font-mono">
                  {briefText.substring(0, 600)}...
                </pre>
              </div>

              {/* Instructions */}
              <div className="bg-blue-950 border border-blue-800 rounded-xl p-4 mb-5">
                <p className="text-xs text-blue-400 font-mono tracking-widest mb-2">
                  HOW TO USE
                </p>
                <div className="space-y-1">
                  <p className="text-gray-300 text-xs">1. Download the PDF below</p>
                  <p className="text-gray-300 text-xs">2. Print it or keep it on your phone</p>
                  <p className="text-gray-300 text-xs">3. Hand it to your doctor at the start of the appointment</p>
                  <p className="text-gray-300 text-xs">4. Ask the highlighted questions at the end</p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-colors mb-3"
              >
                ⬇️ Download PDF
              </button>
              <button
                onClick={() => setStep("ready")}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl transition-colors"
              >
                Generate Again
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
