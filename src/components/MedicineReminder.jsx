import { useState } from "react"
import { scheduleReminder } from "../services/reminderScheduler"

export default function MedicineReminder({ members, onClose }) {
  const [selectedMember, setSelectedMember]     = useState(members[0]?.id || "")
  const [selectedMedicine, setSelectedMedicine] = useState("")
  const [reminderTime, setReminderTime]         = useState("08:00")
  const [patientEmail, setPatientEmail]         = useState("")
  const [familyContacts, setFamilyContacts]     = useState([{ name: "", email: "" }])
  const [saving, setSaving]                     = useState(false)
  const [saved, setSaved]                       = useState(false)

  const currentMember = members.find(m => m.id === selectedMember)
  const medicines     = currentMember?.medicines || []

  const addContact = () => {
    setFamilyContacts([...familyContacts, { name: "", email: "" }])
  }

  const updateContact = (index, field, value) => {
    setFamilyContacts(familyContacts.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    ))
  }

  const removeContact = (index) => {
    if (familyContacts.length === 1) return
    setFamilyContacts(familyContacts.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!patientEmail || !selectedMedicine || !reminderTime) {
      alert("Please fill all required fields")
      return
    }
    const medicine = medicines.find(m => m.brandName === selectedMedicine)
    if (!medicine) return

    setSaving(true)
    try {
      scheduleReminder({
        patientEmail,
        patientName:    currentMember.name,
        medicineName:   medicine.brandName,
        dose:           medicine.dose,
        reminderTime,
        familyContacts: familyContacts.filter(c => c.email.trim())
      })
      setSaved(true)
    } catch (err) {
      alert("Failed to schedule. Please check your EmailJS credentials in emailAlert.js")
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-700 max-h-screen overflow-y-auto">

        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">⏰ Medicine Reminder</h2>
            <p className="text-gray-500 text-xs mt-1">
              Email alerts for missed medicines — free
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-5">
          {saved ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-white font-bold text-lg mb-2">Reminder Set!</p>
              <p className="text-gray-400 text-sm mb-2">
                {currentMember?.name} will get an email at {reminderTime} daily.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                No confirmation in 15 minutes → family gets alerted by email.
              </p>
              <button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-lg"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Free badge */}
              <div className="bg-green-950 border border-green-800 rounded-xl p-3 flex items-center gap-2">
                <span className="text-green-400 text-lg">✅</span>
                <p className="text-green-400 text-sm font-semibold">
                  100% Free — Uses EmailJS, no payment required
                </p>
              </div>

              {/* Member */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">FAMILY MEMBER</label>
                <select
                  value={selectedMember}
                  onChange={e => {
                    setSelectedMember(e.target.value)
                    setSelectedMedicine("")
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Medicine */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">MEDICINE</label>
                {medicines.length === 0 ? (
                  <p className="text-gray-600 text-sm italic">
                    No medicines added for this member yet
                  </p>
                ) : (
                  <select
                    value={selectedMedicine}
                    onChange={e => setSelectedMedicine(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Select a medicine</option>
                    {medicines.map((med, i) => (
                      <option key={i} value={med.brandName}>
                        {med.brandName} — {med.dose}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  REMINDER TIME (daily)
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Patient email */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  PATIENT EMAIL
                </label>
                <input
                  type="email"
                  placeholder="patient@gmail.com"
                  value={patientEmail}
                  onChange={e => setPatientEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Family contacts */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  FAMILY EMAILS TO ALERT IF MISSED
                </label>
                <div className="space-y-3">
                  {familyContacts.map((contact, i) => (
                    <div
                      key={i}
                      className="bg-gray-800 border border-gray-700 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-gray-500">Family Member {i + 1}</p>
                        <button
                          onClick={() => removeContact(i)}
                          className="text-gray-600 hover:text-red-500 text-lg"
                        >×</button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Name e.g. Son"
                          value={contact.name}
                          onChange={e => updateContact(i, "name", e.target.value)}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                        />
                        <input
                          type="email"
                          placeholder="email@gmail.com"
                          value={contact.email}
                          onChange={e => updateContact(i, "email", e.target.value)}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addContact}
                  className="mt-2 text-sm text-red-500 hover:text-red-400"
                >
                  + Add another family member
                </button>
              </div>

              {/* How it works */}
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="text-xs text-gray-400 font-mono tracking-widest mb-3">
                  HOW IT WORKS
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 text-sm">1.</span>
                    <p className="text-gray-300 text-sm">
                      At {reminderTime} — patient gets reminder email
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 text-sm">2.</span>
                    <p className="text-gray-300 text-sm">
                      Patient opens app and clicks
                      <span className="text-white font-bold"> ✅ Taken</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 text-sm">3.</span>
                    <p className="text-gray-300 text-sm">
                      No confirmation in
                      <span className="text-white font-bold"> 15 minutes </span>
                      → family alerted 🚨
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || medicines.length === 0}
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white font-bold py-4 rounded-lg transition-colors"
              >
                {saving ? "Setting up..." : "⏰ Set Reminder"}
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
