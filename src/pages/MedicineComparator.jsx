import { useState } from "react"
import { BRAND_TO_GENERIC } from "../data/brandToGeneric"
import { getGenericFromBrand, getDrugInfo } from "../services/openFDAService"

const normalize = (name) => name.toLowerCase().trim()

// Resolve generic name — local first, then OpenFDA
const resolveLocalGeneric = (input) => {
  const lower = normalize(input)
  if (BRAND_TO_GENERIC[lower]) return BRAND_TO_GENERIC[lower]
  const partialKey = Object.keys(BRAND_TO_GENERIC).find(key =>
    lower.includes(key) || key.includes(lower)
  )
  if (partialKey) return BRAND_TO_GENERIC[partialKey]
  const knownGenerics = Object.values(BRAND_TO_GENERIC)
  const genericMatch = knownGenerics.find(g =>
    lower.includes(g) || g.includes(lower)
  )
  if (genericMatch) return genericMatch
  return null
}

const suggestions = [
  ["Crocin", "Dolo 650"],
  ["Glycomet", "Glucophage"],
  ["Stamlo", "Amlokind"],
  ["Atorva", "Lipitor"],
  ["Ecosprin", "Aspirin"],
  ["Ciplox", "Cifran"],
  ["Omez", "Ocid"],
  ["Thyronorm", "Eltroxin"],
]

export default function MedicineComparator({ onClose }) {
  const [med1, setMed1]         = useState("")
  const [med2, setMed2]         = useState("")
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [loadingMsg, setLoadingMsg] = useState("")

  const resolveWithFDA = async (input) => {
    // Step 1 — try local list first (instant)
    const local = resolveLocalGeneric(input)
    if (local) return { generic: local, source: "local", fdaInfo: null }

    // Step 2 — try OpenFDA API
    setLoadingMsg(`Looking up ${input} in FDA database...`)
    const fdaGeneric = await getGenericFromBrand(input)
    if (fdaGeneric) {
      const fdaInfo = await getDrugInfo(input)
      return { generic: fdaGeneric, source: "fda", fdaInfo }
    }

    // Step 3 — return input as fallback
    return { generic: normalize(input), source: "unknown", fdaInfo: null }
  }

  const handleCompare = async () => {
    if (!med1.trim() || !med2.trim()) {
      alert("Please enter both medicine names")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      setLoadingMsg("Checking Medicine 1...")
      const result1 = await resolveWithFDA(med1.trim())

      setLoadingMsg("Checking Medicine 2...")
      const result2 = await resolveWithFDA(med2.trim())

      const isSame = result1.generic === result2.generic

      setResult({
        med1:     med1.trim(),
        med2:     med2.trim(),
        generic1: result1.generic,
        generic2: result2.generic,
        source1:  result1.source,
        source2:  result2.source,
        fdaInfo1: result1.fdaInfo,
        fdaInfo2: result2.fdaInfo,
        isSame
      })
    } catch (err) {
      alert("Something went wrong. Please try again.")
    }

    setLoading(false)
    setLoadingMsg("")
  }

  const handleReset = () => {
    setMed1("")
    setMed2("")
    setResult(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-700 max-h-screen overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">💊 Medicine Comparator</h2>
            <p className="text-gray-500 text-xs mt-1">
              Check if two medicines contain the same molecule
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-5">

          {/* How it works */}
          <div className="bg-blue-950 border border-blue-800 rounded-xl p-3 mb-5">
            <p className="text-blue-400 text-xs font-semibold mb-1">
              🔍 Powered by OpenFDA Database
            </p>
            <p className="text-gray-400 text-xs">
              Checks local Indian brand database first. If not found, searches
              the FDA's official drug database automatically.
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-xs text-gray-500 mb-2">MEDICINE 1</label>
              <input
                type="text"
                placeholder="e.g. Crocin, Metformin, Aspirin"
                value={med1}
                onChange={e => { setMed1(e.target.value); setResult(null) }}
                onKeyDown={e => e.key === "Enter" && handleCompare()}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-center">
              <div className="flex-1 h-px bg-gray-700"/>
              <span className="text-gray-500 text-sm mx-3 font-bold">VS</span>
              <div className="flex-1 h-px bg-gray-700"/>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">MEDICINE 2</label>
              <input
                type="text"
                placeholder="e.g. Dolo 650, Glucophage, Ecosprin"
                value={med2}
                onChange={e => { setMed2(e.target.value); setResult(null) }}
                onKeyDown={e => e.key === "Enter" && handleCompare()}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Compare Button */}
          <button
            onClick={handleCompare}
            disabled={loading || !med1.trim() || !med2.trim()}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white font-bold py-4 rounded-xl mb-5 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                <span>{loadingMsg || "Comparing..."}</span>
              </span>
            ) : "🔍 Compare Medicines"}
          </button>

          {/* Suggestions */}
          {!result && !loading && (
            <div>
              <p className="text-xs text-gray-500 mb-3 font-mono tracking-widest">
                TRY THESE EXAMPLES
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map(([s1, s2], i) => (
                  <button
                    key={i}
                    onClick={() => { setMed1(s1); setMed2(s2); setResult(null) }}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-2 text-left transition-colors"
                  >
                    <p className="text-white text-xs font-semibold">{s1}</p>
                    <p className="text-gray-500 text-xs">vs {s2}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">

              {/* Verdict */}
              <div className={`rounded-2xl border p-5 text-center ${
                result.isSame
                  ? "bg-red-950 border-red-700"
                  : "bg-green-950 border-green-700"
              }`}>
                <div className="text-5xl mb-3">
                  {result.isSame ? "⚠️" : "✅"}
                </div>
                <p className={`text-2xl font-bold mb-2 ${
                  result.isSame ? "text-red-400" : "text-green-400"
                }`}>
                  {result.isSame ? "SAME MEDICINE" : "DIFFERENT MEDICINES"}
                </p>
                <p className="text-gray-300 text-sm leading-6">
                  {result.isSame
                    ? `Both ${result.med1} and ${result.med2} contain ${result.generic1.toUpperCase()}. Taking both is double dosing.`
                    : `${result.med1} contains ${result.generic1.toUpperCase()} and ${result.med2} contains ${result.generic2.toUpperCase()}. These are different molecules.`
                  }
                </p>
              </div>

              {/* Side by side */}
              <div className="grid grid-cols-2 gap-3">

                {/* Med 1 */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2 font-mono tracking-widest">
                    MEDICINE 1
                  </p>
                  <p className="text-white font-bold mb-2">{result.med1}</p>
                  <div className="bg-gray-900 rounded-lg px-3 py-2 mb-2">
                    <p className="text-xs text-gray-500 mb-0.5">MOLECULE</p>
                    <p className="text-cyan-400 font-bold text-sm uppercase">
                      {result.generic1}
                    </p>
                  </div>
                  {/* Source badge */}
                  <div className={`rounded-lg px-3 py-1.5 ${
                    result.source1 === "fda"
                      ? "bg-blue-950 border border-blue-800"
                      : result.source1 === "local"
                      ? "bg-green-950 border border-green-800"
                      : "bg-gray-900 border border-gray-700"
                  }`}>
                    <p className="text-xs">
                      {result.source1 === "fda"
                        ? "🏛️ Found in FDA database"
                        : result.source1 === "local"
                        ? "✅ Found in local database"
                        : "⚠️ Not found in database"
                      }
                    </p>
                  </div>
                  {/* FDA extra info */}
                  {result.fdaInfo1 && (
                    <div className="mt-2 space-y-1">
                      {result.fdaInfo1.manufacturer && (
                        <div className="bg-gray-900 rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-500 mb-0.5">MANUFACTURER</p>
                          <p className="text-gray-300 text-xs">{result.fdaInfo1.manufacturer}</p>
                        </div>
                      )}
                      {result.fdaInfo1.purpose && (
                        <div className="bg-gray-900 rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-500 mb-0.5">PURPOSE</p>
                          <p className="text-gray-300 text-xs">
                            {result.fdaInfo1.purpose.substring(0, 80)}...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Med 2 */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2 font-mono tracking-widest">
                    MEDICINE 2
                  </p>
                  <p className="text-white font-bold mb-2">{result.med2}</p>
                  <div className="bg-gray-900 rounded-lg px-3 py-2 mb-2">
                    <p className="text-xs text-gray-500 mb-0.5">MOLECULE</p>
                    <p className="text-cyan-400 font-bold text-sm uppercase">
                      {result.generic2}
                    </p>
                  </div>
                  {/* Source badge */}
                  <div className={`rounded-lg px-3 py-1.5 ${
                    result.source2 === "fda"
                      ? "bg-blue-950 border border-blue-800"
                      : result.source2 === "local"
                      ? "bg-green-950 border border-green-800"
                      : "bg-gray-900 border border-gray-700"
                  }`}>
                    <p className="text-xs">
                      {result.source2 === "fda"
                        ? "🏛️ Found in FDA database"
                        : result.source2 === "local"
                        ? "✅ Found in local database"
                        : "⚠️ Not found in database"
                      }
                    </p>
                  </div>
                  {/* FDA extra info */}
                  {result.fdaInfo2 && (
                    <div className="mt-2 space-y-1">
                      {result.fdaInfo2.manufacturer && (
                        <div className="bg-gray-900 rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-500 mb-0.5">MANUFACTURER</p>
                          <p className="text-gray-300 text-xs">{result.fdaInfo2.manufacturer}</p>
                        </div>
                      )}
                      {result.fdaInfo2.purpose && (
                        <div className="bg-gray-900 rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-500 mb-0.5">PURPOSE</p>
                          <p className="text-gray-300 text-xs">
                            {result.fdaInfo2.purpose.substring(0, 80)}...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Warning if same */}
              {result.isSame && (
                <div className="bg-red-950 border border-red-800 rounded-xl p-4">
                  <p className="text-xs text-red-400 font-mono tracking-widest mb-2">
                    ⚠️ DO NOT TAKE BOTH
                  </p>
                  <p className="text-gray-300 text-sm leading-6">
                    Both medicines contain <span className="text-white font-bold uppercase">{result.generic1}</span>.
                    Taking both together risks overdose. Keep only one and consult your doctor.
                  </p>
                </div>
              )}

              {/* Safe if different */}
              {!result.isSame && (
                <div className="bg-green-950 border border-green-800 rounded-xl p-4">
                  <p className="text-xs text-green-400 font-mono tracking-widest mb-2">
                    ✅ DIFFERENT MOLECULES
                  </p>
                  <p className="text-gray-300 text-sm leading-6">
                    These are not duplicates.
                    <span className="text-white font-bold"> {result.generic1.toUpperCase()}</span> and
                    <span className="text-white font-bold"> {result.generic2.toUpperCase()}</span> are different molecules.
                    Always check with your doctor before taking both together as they may still interact.
                  </p>
                </div>
              )}

              {/* Not found warning */}
              {(result.source1 === "unknown" || result.source2 === "unknown") && (
                <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4">
                  <p className="text-xs text-yellow-400 font-mono tracking-widest mb-2">
                    ⚠️ LIMITED DATA
                  </p>
                  <p className="text-gray-300 text-sm">
                    One or both medicines were not found in our database or the FDA database.
                    The result may not be accurate. Please verify with your pharmacist.
                  </p>
                </div>
              )}

              {/* Try another */}
              <button
                onClick={handleReset}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl transition-colors"
              >
                🔄 Compare Another Pair
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
