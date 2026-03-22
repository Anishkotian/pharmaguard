import { useState } from "react"
import { checkExpiry, formatExpiryDate } from "../services/expiryChecker"
import { addMedicineToMember, removeMedicineFromMember, getFamily } from "../services/familyService"

export default function ExpiryTracker({ members, familyId, onClose, onUpdate }) {
  const [activeSection, setActiveSection] = useState("expired")
  const { expired, expiring, valid } = checkExpiry(members)

  const totalTracked = expired.length + expiring.length + valid.length
  const totalMeds    = members.reduce((s, m) => s + m.medicines.length, 0)
  const notTracked   = totalMeds - totalTracked

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">📅 Expiry Tracker</h2>
            <p className="text-gray-500 text-xs mt-1">
              Track medicine expiry dates across your family
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-5">

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <button
              onClick={() => setActiveSection("expired")}
              className={`rounded-xl border p-3 text-center transition-all ${
                activeSection === "expired"
                  ? "bg-red-950 border-red-600"
                  : "bg-gray-800 border-gray-700 hover:border-red-800"
              }`}
            >
              <p className="text-2xl font-bold text-red-400"
                 style={{fontFamily:"'Bebas Neue',sans-serif"}}>
                {expired.length}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Expired</p>
            </button>
            <button
              onClick={() => setActiveSection("expiring")}
              className={`rounded-xl border p-3 text-center transition-all ${
                activeSection === "expiring"
                  ? "bg-yellow-950 border-yellow-600"
                  : "bg-gray-800 border-gray-700 hover:border-yellow-800"
              }`}
            >
              <p className="text-2xl font-bold text-yellow-400"
                 style={{fontFamily:"'Bebas Neue',sans-serif"}}>
                {expiring.length}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Expiring Soon</p>
            </button>
            <button
              onClick={() => setActiveSection("valid")}
              className={`rounded-xl border p-3 text-center transition-all ${
                activeSection === "valid"
                  ? "bg-green-950 border-green-600"
                  : "bg-gray-800 border-gray-700 hover:border-green-800"
              }`}
            >
              <p className="text-2xl font-bold text-green-400"
                 style={{fontFamily:"'Bebas Neue',sans-serif"}}>
                {valid.length}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Valid</p>
            </button>
          </div>

          {/* Not tracked notice */}
          {notTracked > 0 && (
            <div className="bg-blue-950 border border-blue-800 rounded-xl p-3 mb-5">
              <p className="text-blue-400 text-xs font-semibold mb-1">
                ℹ️ {notTracked} medicine{notTracked > 1 ? "s" : ""} without expiry date
              </p>
              <p className="text-gray-400 text-xs">
                Add expiry dates when scanning prescriptions to track them here.
              </p>
            </div>
          )}

          {/* Expired */}
          {activeSection === "expired" && (
            <div>
              {expired.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-white font-semibold">No expired medicines</p>
                  <p className="text-gray-500 text-sm mt-1">All your medicines are within their expiry date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-mono tracking-widest mb-3">
                    EXPIRED MEDICINES — DISPOSE IMMEDIATELY
                  </p>
                  {expired.map((item, i) => (
                    <div key={i} className="bg-red-950 border border-red-800 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-white font-bold text-sm">{item.brandName}</p>
                          <p className="text-gray-400 text-xs">{item.genericName} · {item.memberName}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{item.dose}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-red-400 font-bold text-xs">EXPIRED</p>
                          <p className="text-red-300 text-xs mt-0.5">
                            {formatExpiryDate(item.expiryDate)}
                          </p>
                          <p className="text-red-500 text-xs">
                            {Math.abs(item.daysLeft)} days ago
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 bg-red-900 bg-opacity-40 rounded-lg p-2">
                        <p className="text-red-300 text-xs font-semibold">
                          ⚠️ Do not use. Dispose safely. Get a fresh prescription.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Expiring Soon */}
          {activeSection === "expiring" && (
            <div>
              {expiring.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-white font-semibold">No medicines expiring soon</p>
                  <p className="text-gray-500 text-sm mt-1">No medicines expire within the next 30 days</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-mono tracking-widest mb-3">
                    EXPIRING WITHIN 30 DAYS
                  </p>
                  {expiring.map((item, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${
                      item.daysLeft <= 7
                        ? "bg-red-950 border-red-800"
                        : "bg-yellow-950 border-yellow-800"
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-white font-bold text-sm">{item.brandName}</p>
                          <p className="text-gray-400 text-xs">{item.genericName} · {item.memberName}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{item.dose}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-bold text-xs ${
                            item.daysLeft <= 7 ? "text-red-400" : "text-yellow-400"
                          }`}>
                            {item.daysLeft <= 7 ? "CRITICAL" : "EXPIRING SOON"}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {formatExpiryDate(item.expiryDate)}
                          </p>
                          <p className={`text-xs font-bold ${
                            item.daysLeft <= 7 ? "text-red-300" : "text-yellow-300"
                          }`}>
                            {item.daysLeft} days left
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5 mt-3">
                        <div
                          className={`h-1.5 rounded-full ${
                            item.daysLeft <= 7 ? "bg-red-500" : "bg-yellow-500"
                          }`}
                          style={{width:`${(item.daysLeft / 30) * 100}%`}}
                        />
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        Renew prescription before {formatExpiryDate(item.expiryDate)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Valid */}
          {activeSection === "valid" && (
            <div>
              {valid.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">📅</p>
                  <p className="text-white font-semibold">No tracked medicines</p>
                  <p className="text-gray-500 text-sm mt-1">Add expiry dates to your medicines to see them here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-mono tracking-widest mb-3">
                    VALID MEDICINES
                  </p>
                  {valid.map((item, i) => (
                    <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{item.brandName}</p>
                        <p className="text-gray-500 text-xs">{item.memberName} · {item.dose}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-green-400 text-xs font-bold">VALID</p>
                        <p className="text-gray-400 text-xs">{item.daysLeft} days left</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
