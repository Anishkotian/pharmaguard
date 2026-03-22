import { useState } from "react"
import { calculateFamilyScores, calculateFamilyOverallScore } from "../services/safetyScoreService"

// Circular score dial
function ScoreDial({ score, color, size = 80 }) {
  const radius     = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const progress   = (score / 100) * circumference
  const strokeColor =
    color === "green"  ? "#00FF88" :
    color === "yellow" ? "#FFD60A" :
    color === "orange" ? "#FF6B35" :
                         "#FF2D4B"

  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      {/* Background circle */}
      <circle
        cx={size/2} cy={size/2} r={radius}
        fill="none" stroke="#21262D" strokeWidth={6}
      />
      {/* Score arc */}
      <circle
        cx={size/2} cy={size/2} r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={6}
        strokeDasharray={`${progress} ${circumference}`}
        strokeLinecap="round"
        style={{transition:"stroke-dasharray 1s ease"}}
      />
    </svg>
  )
}

export default function SafetyScore({ members, onClose }) {
  const [selectedMember, setSelectedMember] = useState(null)
  const memberScores  = calculateFamilyScores(members)
  const overallScore  = calculateFamilyOverallScore(memberScores)

  const overallColor =
    overallScore >= 80 ? "green" :
    overallScore >= 60 ? "yellow" :
    overallScore >= 40 ? "orange" : "red"

  const overallStatus =
    overallScore >= 80 ? "FAMILY SAFE" :
    overallScore >= 60 ? "MODERATE RISK" :
    overallScore >= 40 ? "AT RISK" : "DANGER"

  const selectedData = selectedMember
    ? memberScores.find(ms => ms.member.id === selectedMember)
    : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">🛡️ Safety Score</h2>
            <p className="text-gray-500 text-xs mt-1">
              Medicine safety rating for each family member
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-5">

          {/* Overall Family Score */}
          <div className={`rounded-2xl border p-5 mb-5 text-center ${
            overallColor === "green"  ? "bg-green-950  border-green-700" :
            overallColor === "yellow" ? "bg-yellow-950 border-yellow-700" :
            overallColor === "orange" ? "bg-orange-950 border-orange-700" :
                                        "bg-red-950    border-red-700"
          }`}>
            <p className="text-xs font-mono tracking-widest text-gray-400 mb-3">
              OVERALL FAMILY SAFETY SCORE
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <ScoreDial score={overallScore} color={overallColor} size={100} />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-white"
                        style={{fontFamily:"'Bebas Neue',sans-serif"}}>
                    {overallScore}
                  </span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
              </div>
              <div className="text-left">
                <p className={`text-2xl font-bold mb-1 ${
                  overallColor === "green"  ? "text-green-400" :
                  overallColor === "yellow" ? "text-yellow-400" :
                  overallColor === "orange" ? "text-orange-400" :
                                              "text-red-400"
                }`} style={{fontFamily:"'Bebas Neue',sans-serif"}}>
                  {overallStatus}
                </p>
                <p className="text-gray-400 text-sm">
                  {members.length} members · {members.reduce((s,m) => s + m.medicines.length, 0)} medicines
                </p>
              </div>
            </div>
          </div>

          {/* Individual Member Scores */}
          <p className="text-xs text-gray-500 mb-3 font-mono tracking-widest">
            MEMBER SCORES
          </p>
          <div className="space-y-3 mb-5">
            {memberScores.map(ms => (
              <div
                key={ms.member.id}
                onClick={() => setSelectedMember(
                  selectedMember === ms.member.id ? null : ms.member.id
                )}
                className={`bg-gray-800 border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedMember === ms.member.id
                    ? "border-red-600"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">

                  {/* Mini dial */}
                  <div className="relative flex-shrink-0">
                    <ScoreDial score={ms.score} color={ms.color} size={56} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white"
                            style={{fontFamily:"'Bebas Neue',sans-serif"}}>
                        {ms.score}
                      </span>
                    </div>
                  </div>

                  {/* Member info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white font-semibold text-sm">{ms.member.name}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        ms.color === "green"  ? "bg-green-950  text-green-400" :
                        ms.color === "yellow" ? "bg-yellow-950 text-yellow-400" :
                        ms.color === "orange" ? "bg-orange-950 text-orange-400" :
                                                "bg-red-950    text-red-400"
                      }`}>
                        {ms.emoji} {ms.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Age {ms.member.age} · {ms.member.medicines.length} medicines
                    </p>

                    {/* Score bar */}
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-700 ${
                          ms.color === "green"  ? "bg-green-400" :
                          ms.color === "yellow" ? "bg-yellow-400" :
                          ms.color === "orange" ? "bg-orange-400" :
                                                   "bg-red-400"
                        }`}
                        style={{width:`${ms.score}%`}}
                      />
                    </div>
                  </div>

                  <div className="text-gray-600 text-sm flex-shrink-0">
                    {selectedMember === ms.member.id ? "▲" : "▼"}
                  </div>
                </div>

                {/* Expanded reasons */}
                {selectedMember === ms.member.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    {ms.reasons.length === 0 ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <span>✅</span>
                        <p className="text-sm">No risk factors detected. Score is 100/100.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-500 mb-3 font-mono tracking-widest">
                          RISK FACTORS
                        </p>
                        <div className="space-y-2">
                          {ms.reasons.map((reason, i) => (
                            <div key={i} className={`rounded-lg px-3 py-2.5 flex items-start gap-2 ${
                              reason.severity === "HIGH"   ? "bg-red-950    border border-red-900" :
                              reason.severity === "MEDIUM" ? "bg-yellow-950 border border-yellow-900" :
                              reason.severity === "LOW"    ? "bg-blue-950   border border-blue-900" :
                                                             "bg-gray-800   border border-gray-700"
                            }`}>
                              <span className="text-sm flex-shrink-0">
                                {reason.type === "interaction"      && "⚡"}
                                {reason.type === "self_interaction"  && "🔄"}
                                {reason.type === "duplicate"        && "💊"}
                                {reason.type === "missing_info"     && "ℹ️"}
                                {reason.type === "polypharmacy"     && "⚠️"}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-200 text-xs leading-5">{reason.text}</p>
                              </div>
                              <span className={`text-xs font-bold flex-shrink-0 ${
                                reason.severity === "HIGH"   ? "text-red-400" :
                                reason.severity === "MEDIUM" ? "text-yellow-400" :
                                                               "text-blue-400"
                              }`}>
                                -{reason.deduction}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Score breakdown */}
                        <div className="mt-3 bg-gray-900 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-2 font-mono tracking-widest">
                            SCORE BREAKDOWN
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Starting score</span>
                            <span className="text-white font-bold">100</span>
                          </div>
                          {ms.reasons.map((reason, i) => (
                            <div key={i} className="flex items-center justify-between text-xs mt-1">
                              <span className="text-gray-500 truncate mr-2">
                                {reason.type === "interaction"     && "Cross-family interaction"}
                                {reason.type === "self_interaction" && "Self interaction"}
                                {reason.type === "duplicate"       && "Duplicate medicine"}
                                {reason.type === "missing_info"    && "Missing doctor info"}
                                {reason.type === "polypharmacy"    && "Too many medicines"}
                              </span>
                              <span className="text-red-400 font-bold flex-shrink-0">
                                -{reason.deduction}
                              </span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-700">
                            <span className="text-white font-bold">Final Score</span>
                            <span className={`font-bold text-sm ${
                              ms.color === "green"  ? "text-green-400" :
                              ms.color === "yellow" ? "text-yellow-400" :
                              ms.color === "orange" ? "text-orange-400" :
                                                       "text-red-400"
                            }`}>{ms.score}/100</span>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* How scores work */}
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-3 font-mono tracking-widest">
              HOW SCORES ARE CALCULATED
            </p>
            <div className="space-y-1.5">
              {[
                ["HIGH risk interaction",        "-25 points", "red"],
                ["MEDIUM risk interaction",       "-15 points", "yellow"],
                ["Self interaction (same person)","-20 points", "orange"],
                ["Duplicate molecule detected",   "-20 points", "orange"],
                ["Medicine without doctor info",  "-5 points",  "blue"],
                ["More than 5 medicines taken",   "-10 points", "yellow"],
              ].map(([label, points, color], i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-gray-400 text-xs">{label}</p>
                  <span className={`text-xs font-bold ${
                    color === "red"    ? "text-red-400" :
                    color === "yellow" ? "text-yellow-400" :
                    color === "orange" ? "text-orange-400" :
                                         "text-blue-400"
                  }`}>{points}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
