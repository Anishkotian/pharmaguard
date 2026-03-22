import { useState, useEffect } from "react"
import {
  getAllReminders,
  cancelReminder,
  updateReminder,
  scheduleReminder
} from "../services/reminderScheduler"

export default function RemindersManager({ members, onClose }) {
  const [reminders, setReminders]     = useState([])
  const [editingId, setEditingId]     = useState(null)
  const [editData, setEditData]       = useState({})
  const [showAddNew, setShowAddNew]   = useState(false)

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = () => {
    setReminders(getAllReminders())
  }

  const handleDelete = (reminderId, medicineName) => {
    if (!window.confirm(`Delete reminder for ${medicineName}?`)) return
    cancelReminder(reminderId)
    loadReminders()
  }

  const handleEditStart = (reminder) => {
    setEditingId(reminder.reminderId)
    setEditData({
      reminderTime:   reminder.reminderTime,
      patientEmail:   reminder.patientEmail,
      familyContacts: reminder.familyContacts || []
    })
  }

  const handleEditSave = (reminderId) => {
    updateReminder(reminderId, editData)
    setEditingId(null)
    loadReminders()
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const updateFamilyContact = (index, field, value) => {
    const updated = editData.familyContacts.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    )
    setEditData({ ...editData, familyContacts: updated })
  }

  const addFamilyContact = () => {
    setEditData({
      ...editData,
      familyContacts: [...(editData.familyContacts || []), { name: "", email: "" }]
    })
  }

  const removeFamilyContact = (index) => {
    setEditData({
      ...editData,
      familyContacts: editData.familyContacts.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-700 max-h-screen overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">⏰ Manage Reminders</h2>
            <p className="text-gray-500 text-xs mt-1">
              View, edit and delete medicine reminders
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-2xl"
          >×</button>
        </div>

        <div className="p-5">

          {/* Add New button */}
          <button
            onClick={() => setShowAddNew(true)}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl mb-5 transition-colors"
          >
            + Add New Reminder
          </button>

          {/* Empty state */}
          {reminders.length === 0 && (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">⏰</p>
              <p className="text-white font-semibold mb-2">No reminders set</p>
              <p className="text-gray-500 text-sm">
                Click Add New Reminder to set up your first medicine reminder.
              </p>
            </div>
          )}

          {/* Reminders list */}
          <div className="space-y-4">
            {reminders.map(reminder => (
              <div
                key={reminder.reminderId}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4"
              >
                {editingId === reminder.reminderId ? (
                  /* ── EDIT MODE ── */
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">✏️</span>
                      <p className="text-white font-semibold">
                        Editing — {reminder.medicineName}
                      </p>
                    </div>

                    {/* Time */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        REMINDER TIME
                      </label>
                      <input
                        type="time"
                        value={editData.reminderTime}
                        onChange={e => setEditData({
                          ...editData,
                          reminderTime: e.target.value
                        })}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Patient email */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        PATIENT EMAIL
                      </label>
                      <input
                        type="email"
                        value={editData.patientEmail}
                        onChange={e => setEditData({
                          ...editData,
                          patientEmail: e.target.value
                        })}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Family contacts */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">
                        FAMILY ALERT CONTACTS
                      </label>
                      <div className="space-y-2">
                        {(editData.familyContacts || []).map((contact, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Name"
                              value={contact.name}
                              onChange={e => updateFamilyContact(i, "name", e.target.value)}
                              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                            />
                            <input
                              type="email"
                              placeholder="Email"
                              value={contact.email}
                              onChange={e => updateFamilyContact(i, "email", e.target.value)}
                              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                            />
                            <button
                              onClick={() => removeFamilyContact(i)}
                              className="text-gray-600 hover:text-red-500 text-lg"
                            >×</button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={addFamilyContact}
                        className="mt-2 text-xs text-red-500 hover:text-red-400"
                      >
                        + Add contact
                      </button>
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditSave(reminder.reminderId)}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                      >
                        ✅ Save Changes
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                ) : (
                  /* ── VIEW MODE ── */
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-bold text-base">
                          {reminder.medicineName}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {reminder.dose} · {reminder.patientName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-red-950 border border-red-800 rounded-lg px-3 py-1.5">
                        <span className="text-red-400 text-base">⏰</span>
                        <span className="text-red-300 font-bold text-sm">
                          {reminder.reminderTime}
                        </span>
                        <span className="text-gray-600 text-xs">daily</span>
                      </div>
                    </div>

                    {/* Patient email */}
                    <div className="bg-gray-900 rounded-lg px-3 py-2 mb-2">
                      <p className="text-xs text-gray-500 mb-0.5">PATIENT EMAIL</p>
                      <p className="text-gray-300 text-sm">{reminder.patientEmail}</p>
                    </div>

                    {/* Family contacts */}
                    {reminder.familyContacts && reminder.familyContacts.length > 0 && (
                      <div className="bg-gray-900 rounded-lg px-3 py-2 mb-3">
                        <p className="text-xs text-gray-500 mb-1">FAMILY ALERT CONTACTS</p>
                        {reminder.familyContacts.map((contact, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-orange-400 text-xs">👤</span>
                            <p className="text-gray-300 text-xs">
                              {contact.name} — {contact.email}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* How it works summary */}
                    <div className="bg-gray-900 rounded-lg px-3 py-2 mb-3">
                      <p className="text-xs text-gray-500 mb-1">ALERT FLOW</p>
                      <p className="text-gray-400 text-xs leading-5">
                        At <span className="text-white font-semibold">{reminder.reminderTime}</span> daily →
                        Reminder to <span className="text-white font-semibold">{reminder.patientName}</span> →
                        No confirm in <span className="text-white font-semibold">15 mins</span> →
                        Family alerted 🚨
                      </p>
                    </div>

                    {/* Edit / Delete buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditStart(reminder)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reminder.reminderId, reminder.medicineName)}
                        className="flex-1 bg-red-950 hover:bg-red-900 text-red-400 font-bold py-2 rounded-lg text-sm border border-red-800 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Add New Reminder Modal */}
      {showAddNew && (
        <AddReminderModal
          members={members}
          onSave={(data) => {
            scheduleReminder(data)
            loadReminders()
            setShowAddNew(false)
          }}
          onClose={() => setShowAddNew(false)}
        />
      )}

    </div>
  )
}

// ── Add New Reminder inline modal ─────────────────────────────────
function AddReminderModal({ members, onSave, onClose }) {
  const [selectedMember, setSelectedMember]     = useState(members[0]?.id || "")
  const [selectedMedicine, setSelectedMedicine] = useState("")
  const [reminderTime, setReminderTime]         = useState("08:00")
  const [patientEmail, setPatientEmail]         = useState("")
  const [familyContacts, setFamilyContacts]     = useState([{ name: "", email: "" }])

  const currentMember = members.find(m => m.id === selectedMember)
  const medicines     = currentMember?.medicines || []

  const handleSave = () => {
    if (!patientEmail || !selectedMedicine || !reminderTime) {
      alert("Please fill all required fields")
      return
    }
    const medicine = medicines.find(m => m.brandName === selectedMedicine)
    if (!medicine) return

    onSave({
      patientEmail,
      patientName:    currentMember.name,
      medicineName:   medicine.brandName,
      dose:           medicine.dose,
      reminderTime,
      familyContacts: familyContacts.filter(c => c.email.trim())
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-60 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-600 max-h-screen overflow-y-auto">

        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Add New Reminder</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-5 space-y-4">

          {/* Member */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">FAMILY MEMBER</label>
            <select
              value={selectedMember}
              onChange={e => { setSelectedMember(e.target.value); setSelectedMedicine("") }}
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
              <p className="text-gray-600 text-sm italic">No medicines for this member yet</p>
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
            <label className="block text-xs text-gray-500 mb-2">REMINDER TIME</label>
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Patient email */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">PATIENT EMAIL</label>
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
              FAMILY CONTACTS TO ALERT
            </label>
            <div className="space-y-2">
              {familyContacts.map((contact, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={contact.name}
                    onChange={e => setFamilyContacts(familyContacts.map((c, idx) =>
                      idx === i ? { ...c, name: e.target.value } : c
                    ))}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={contact.email}
                    onChange={e => setFamilyContacts(familyContacts.map((c, idx) =>
                      idx === i ? { ...c, email: e.target.value } : c
                    ))}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500"
                  />
                  <button
                    onClick={() => setFamilyContacts(familyContacts.filter((_, idx) => idx !== i))}
                    className="text-gray-600 hover:text-red-500 text-xl"
                  >×</button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setFamilyContacts([...familyContacts, { name: "", email: "" }])}
              className="mt-2 text-xs text-red-500 hover:text-red-400"
            >
              + Add another contact
            </button>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg transition-colors"
          >
            ⏰ Set Reminder
          </button>

        </div>
      </div>
    </div>
  )
}
