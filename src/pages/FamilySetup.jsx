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
    if (!familyName.trim()) {
      alert("Please enter a family name")
      return
    }
    const validMembers = members.filter(m => m.name.trim())
    if (validMembers.length === 0) {
      alert("Please add at least one family member")
      return
    }
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
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-500 mb-2">PharmaGuard</h1>
          <p className="text-gray-400">Set up your family profile to get started</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Family Name</label>
          <input
            type="text"
            placeholder="e.g. Kumar Family"
            value={familyName}
            onChange={e => setFamilyName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-3">Family Members</label>
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Name (e.g. Father)"
                  value={member.name}
                  onChange={e => updateMember(member.id, "name", e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={member.age}
                  onChange={e => updateMember(member.id, "age", e.target.value)}
                  className="w-20 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={() => removeMember(member.id)}
                  className="text-gray-600 hover:text-red-500 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addMember}
            className="mt-3 text-sm text-red-500 hover:text-red-400"
          >
            + Add another member
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white font-bold py-4 rounded-lg text-lg transition-colors"
        >
          {saving ? "Saving..." : "Create Family Profile →"}
        </button>

      </div>
    </div>
  )
}
