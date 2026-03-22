import { useState } from "react"
import {
  getFoodInteractionsForFamily,
  checkFoodAgainstFamily,
  ALL_FOODS
} from "../services/foodChecker"

const SeverityBadge = ({ severity }) => (
  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
    severity === "HIGH"
      ? "bg-red-950 text-red-400 border border-red-800"
      : "bg-yellow-950 text-yellow-400 border border-yellow-800"
  }`}>
    {severity === "HIGH" ? "⚠️ AVOID" : "⚡ LIMIT"}
  </span>
)

export default function FoodChecker({ members, onClose }) {
  const [activeView, setActiveView]   = useState("bymember")
  const [searchFood, setSearchFood]   = useState("")
  const [searchResult, setSearchResult] = useState(null)
  const [selectedMember, setSelectedMember] = useState(members[0]?.id || "")

  const familyInteractions = getFoodInteractionsForFamily(members)
  const currentMember = members.find(m => m.id === selectedMember)
  const memberInteractions = currentMember
    ? (familyInteractions[selectedMember]?.interactions || [])
    : []

  const handleFoodSearch = (food) => {
    if (!food.trim()) return
    const results = checkFoodAgainstFamily(food, members)
    setSearchResult({ food, results })
  }

  const commonFoods = [
    "Grapefruit", "Alcohol", "Banana", "Dairy",
    "Coffee", "Salt", "Soy", "Garlic",
    "Green Tea", "Spinach", "Walnuts", "Mango"
  ]

  const totalInteractions = Object.values(familyInteractions)
    .reduce((sum, m) => sum + m.interactions.length, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">🍽️ Food-Drug Checker</h2>
            <p className="text-gray-500 text-xs mt-1">
              {totalInteractions} food interactions found across your family
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-5">

          {/* View toggle */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setActiveView("bymember")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeView === "bymember"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              👤 By Member
            </button>
            <button
              onClick={() => setActiveView("searchfood")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeView === "searchfood"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              🔍 Search Food
            </button>
          </div>

          {/* ── BY MEMBER VIEW ── */}
          {activeView === "bymember" && (
            <div>
              {/* Member selector */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {members.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      selectedMember === member.id
                        ? "bg-red-600 text-white"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {member.name}
                    {familyInteractions[member.id] && (
                      <span className="ml-2 bg-red-800 text-red-200 text-xs px-1.5 py-0.5 rounded-full">
                        {familyInteractions[member.id].interactions.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {memberInteractions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-white font-semibold mb-2">No food interactions found</p>
                  <p className="text-gray-500 text-sm">
                    {currentMember?.medicines.length === 0
                      ? "No medicines added for this member yet."
                      : "None of their medicines have known food interactions in our database."
                    }
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-3 font-mono tracking-widest">
                    {memberInteractions.length} FOOD INTERACTIONS FOR {currentMember?.name.toUpperCase()}
                  </p>

                  {/* Group by food */}
                  <div className="space-y-3">
                    {memberInteractions.map((interaction, i) => (
                      <div
                        key={i}
                        className={`rounded-xl border p-4 ${
                          interaction.severity === "HIGH"
                            ? "bg-red-950 border-red-800"
                            : "bg-yellow-950 border-yellow-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{interaction.emoji}</span>
                            <div>
                              <p className="text-white font-bold">{interaction.food}</p>
                              <p className="text-gray-400 text-xs mt-0.5">
                                with {interaction.medicineBrand}
                              </p>
                            </div>
                          </div>
                          <SeverityBadge severity={interaction.severity} />
                        </div>

                        <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-2">
                          <p className="text-xs text-gray-500 mb-1 font-mono tracking-widest">EFFECT</p>
                          <p className="text-gray-200 text-sm">{interaction.effect}</p>
                        </div>

                        <div className="bg-black bg-opacity-30 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1 font-mono tracking-widest">ACTION</p>
                          <p className={`text-sm font-semibold ${
                            interaction.severity === "HIGH" ? "text-red-300" : "text-yellow-300"
                          }`}>{interaction.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SEARCH FOOD VIEW ── */}
          {activeView === "searchfood" && (
            <div>
              {/* Search input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="e.g. Grapefruit, Alcohol, Banana"
                  value={searchFood}
                  onChange={e => { setSearchFood(e.target.value); setSearchResult(null) }}
                  onKeyDown={e => e.key === "Enter" && handleFoodSearch(searchFood)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={() => handleFoodSearch(searchFood)}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 rounded-lg"
                >
                  🔍
                </button>
              </div>

              {/* Common food chips */}
              {!searchResult && (
                <div>
                  <p className="text-xs text-gray-500 mb-3 font-mono tracking-widest">
                    COMMON FOODS TO CHECK
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {commonFoods.map(food => (
                      <button
                        key={food}
                        onClick={() => {
                          setSearchFood(food)
                          handleFoodSearch(food)
                        }}
                        className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs px-3 py-2 rounded-lg transition-colors"
                      >
                        {food}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search results */}
              {searchResult && (
                <div>
                  {searchResult.results.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-4xl mb-3">✅</p>
                      <p className="text-white font-semibold mb-2">
                        {searchResult.food} is safe with your family's medicines
                      </p>
                      <p className="text-gray-500 text-sm">
                        No known interactions found for {searchResult.food}.
                      </p>
                      <button
                        onClick={() => { setSearchResult(null); setSearchFood("") }}
                        className="mt-4 text-red-400 text-sm hover:text-red-300"
                      >
                        Search another food
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-yellow-400 text-sm font-semibold mb-4">
                        ⚠️ {searchResult.results.length} interaction{searchResult.results.length > 1 ? "s" : ""} found for {searchResult.food}
                      </p>
                      <div className="space-y-3">
                        {searchResult.results.map((r, i) => (
                          <div key={i} className={`rounded-xl border p-4 ${
                            r.severity === "HIGH"
                              ? "bg-red-950 border-red-800"
                              : "bg-yellow-950 border-yellow-800"
                          }`}>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div>
                                <p className="text-white font-bold">
                                  {r.emoji} {r.food} + {r.medicineBrand}
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5">
                                  {r.memberName} · {r.medicineGeneric}
                                </p>
                              </div>
                              <SeverityBadge severity={r.severity} />
                            </div>
                            <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-2">
                              <p className="text-xs text-gray-500 mb-1 font-mono tracking-widest">EFFECT</p>
                              <p className="text-gray-200 text-sm">{r.effect}</p>
                            </div>
                            <div className="bg-black bg-opacity-30 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1 font-mono tracking-widest">ACTION</p>
                              <p className={`text-sm font-semibold ${
                                r.severity === "HIGH" ? "text-red-300" : "text-yellow-300"
                              }`}>{r.action}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => { setSearchResult(null); setSearchFood("") }}
                        className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl"
                      >
                        Search another food
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
