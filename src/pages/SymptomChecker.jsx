import { useState } from "react"
import { checkSymptom } from "../services/symptomChecker"

export default function SymptomChecker({ members, onClose }) {
  const [symptom, setSymptom] = useState("")
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)

  const handleSearch = () => {
    if (!symptom.trim()) return
    const found = checkSymptom(symptom, members)
    setResults(found)
    setSearched(true)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch()
  }

  // Common symptom suggestions
  const suggestions = [
    "dry cough", "muscle pain", "dizziness", "fatigue",
    "nausea", "headache", "ankle swelling", "bruising",
    "hair loss", "insomnia", "stomach pain", "tremors"
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-700 max-h-screen overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">Symptom Checker</h2>
            <p className="text-gray-500 text-xs mt-1">
              Check if your medicine is causing your symptom
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-2xl"
          >×</button>
        </div>

        <div className="p-5">

          {/* Search Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Type your symptom e.g. dry cough"
              value={symptom}
              onChange={e => setSymptom(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
            />
            <button
              onClick={handleSearch}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 rounded-lg transition-colors"
            >
              🔍
            </button>
          </div>

          {/* Suggestions */}
          {!searched && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-3 font-mono tracking-widest">
                COMMON SYMPTOMS
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setSymptom(s)
                      const found = checkSymptom(s, members)
                      setResults(found)
                      setSearched(true)
                    }}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-2 rounded-lg border border-gray-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {searched && (
            <div>
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-white font-semibold mb-2">
                    No medicine match found
                  </p>
                  <p className="text-gray-500 text-sm">
                    None of your current medicines are known to cause "{symptom}".
                    Please consult your doctor.
                  </p>
                  <button
                    onClick={() => {
                      setSearched(false)
                      setSymptom("")
                    }}
                    className="mt-4 text-red-400 text-sm hover:text-red-300"
                  >
                    Search another symptom
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-yellow-400 text-sm font-semibold mb-4">
                    ⚠️ Found {results.length} possible medicine cause{results.length > 1 ? "s" : ""} for "{symptom}"
                  </p>

                  <div className="space-y-4">
                    {results.map((result, i) => (
                      <div
                        key={i}
                        className="bg-gray-800 border border-yellow-800 rounded-xl p-4"
                      >
                        {/* Medicine info */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-bold text-base">
                              {result.brandName}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {result.genericName} · {result.memberName}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {result.dose} · {result.frequency}
                            </p>
                          </div>
                          <span className="bg-yellow-900 text-yellow-400 text-xs px-2 py-1 rounded font-mono">
                            POSSIBLE CAUSE
                          </span>
                        </div>

                        {/* Matched effect */}
                        <div className="bg-black bg-opacity-40 rounded-lg p-3 mb-3">
                          <p className="text-xs text-gray-500 mb-1 font-mono tracking-widest">
                            KNOWN SIDE EFFECT
                          </p>
                          <p className="text-yellow-300 text-sm font-semibold capitalize">
                            {result.matchedEffect}
                          </p>
                        </div>

                        {/* Timing */}
                        {result.daysSinceStart !== null && (
                          <div className="bg-black bg-opacity-40 rounded-lg p-3 mb-3">
                            <p className="text-xs text-gray-500 mb-1 font-mono tracking-widest">
                              TIMING
                            </p>
                            <p className="text-gray-300 text-sm">
                              You started this medicine{" "}
                              <span className="text-white font-bold">
                                {result.daysSinceStart} days ago
                              </span>
                              {result.daysSinceStart < 30
                                ? " — timing is consistent with a side effect."
                                : " — side effects can develop over time."}
                            </p>
                          </div>
                        )}

                        {/* Recommendation */}
                        <div className="bg-black bg-opacity-40 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1 font-mono tracking-widest">
                            RECOMMENDATION
                          </p>
                          <p className="text-green-400 text-sm font-semibold">
                            Talk to your doctor about this before booking tests.
                            Ask if switching medicine would help.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSearched(false)
                      setSymptom("")
                      setResults([])
                    }}
                    className="mt-4 w-full text-gray-500 hover:text-white py-2 text-sm"
                  >
                    Search another symptom
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
