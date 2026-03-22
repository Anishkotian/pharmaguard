import { useState } from "react"
import { saveFamily } from "../services/familyService"

export default function FamilySetup({ onComplete }) {
  const [familyName, setFamilyName] = useState("")
  const [members, setMembers] = useState([
    { id: "m1", name: "", age: "", medicines: [] }
  ])
  const [saving, setSaving] = useState(false)

  const addMember = () => {
    const newId = "m" + Date.now()
    setMembers([...members, { id: newId, name: "", age: "", medicines: [] }])
  }

  const updateMember = (id, field, value) => {
    setMembers(members.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  const removeMember = (id) => {
    if (members.length === 1) return
    setMembers(members.filter(m => m.id !== id))
  }

  const handleSave = async () => {
    if (!familyName.trim()) { alert("Please enter a family name"); return }
    const validMembers = members.filter(m => m.name.trim())
    if (validMembers.length === 0) { alert("Please add at least one family member"); return }
    setSaving(true)
    const familyId = "family_" + Date.now()
    await saveFamily(familyId, {
      familyName: familyName.trim(),
      members: validMembers,
      createdAt: new Date().toISOString()
    })
    localStorage.setItem("pharmaguard_family_id", familyId)
    setSaving(false)
    onComplete(familyId)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-8 sm:px-6 sm:py-12">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-red-500 mb-2"
              style={{fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"0.06em"}}>
            PharmaGuard
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Set up your family profile to get started
          </p>
        </div>

        {/* Family Name */}
        <div className="mb-5">
          <label className="block text-xs text-gray-500 mb-2 font-mono tracking-widest uppercase">
            Family Name
          </label>
          <input
            type="text"
            placeholder="e.g. Kumar Family"
            value={familyName}
            onChange={e => setFamilyName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 text-base"
          />
        </div>

        {/* Members */}
        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-3 font-mono tracking-widest uppercase">
            Family Members
          </label>
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Name e.g. Father"
                  value={member.name}
                  onChange={e => updateMember(member.id, "name", e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 text-base"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={member.age}
                  onChange={e => updateMember(member.id, "age", e.target.value)}
                  className="w-16 sm:w-20 bg-gray-900 border border-gray-700 rounded-xl px-3 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 text-base"
                />
                <button
                  onClick={() => removeMember(member.id)}
                  className="w-11 h-11 flex items-center justify-center text-gray-600 hover:text-red-500 text-2xl font-bold rounded-xl border border-gray-800 bg-gray-900"
                >×</button>
              </div>
            ))}
          </div>
          <button
            onClick={addMember}
            className="mt-3 text-sm text-red-500 hover:text-red-400 flex items-center gap-1"
          >
            + Add another member
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white font-bold py-4 rounded-xl text-base sm:text-lg transition-colors"
        >
          {saving ? "Saving..." : "Create Family Profile →"}
        </button>

      </div>
    </div>
  )
}
