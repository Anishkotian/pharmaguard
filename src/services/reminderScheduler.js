import { sendMissedMedicineAlert, sendReminderToPatient } from "./emailAlert"

const activeReminders = []
const pendingConfirmations = {}

// Save reminders to localStorage so they persist on refresh
const saveToStorage = () => {
  const data = activeReminders.map(r => ({
    reminderId:     r.reminderId,
    patientEmail:   r.patientEmail,
    patientName:    r.patientName,
    medicineName:   r.medicineName,
    dose:           r.dose,
    reminderTime:   r.reminderTime,
    familyContacts: r.familyContacts
  }))
  localStorage.setItem("pharmaguard_reminders", JSON.stringify(data))
}

export const scheduleReminder = ({
  patientEmail,
  patientName,
  medicineName,
  dose,
  reminderTime,
  familyContacts
}) => {
  const reminderId = `${patientEmail}_${medicineName}_${reminderTime}`

  // Cancel existing reminder with same ID before creating new
  cancelReminder(reminderId)

  const [hours, minutes] = reminderTime.split(":").map(Number)

  const intervalId = setInterval(async () => {
    const now = new Date()
    if (now.getHours() === hours && now.getMinutes() === minutes) {

      await sendReminderToPatient({
        patientEmail,
        patientName,
        medicineName,
        dose,
        reminderTime
      })

      pendingConfirmations[reminderId] = {
        reminderId,
        patientName,
        medicineName,
        dose,
        familyContacts,
        reminderTime,
        confirmed: false
      }

      // Alert family after 15 minutes if not confirmed
      setTimeout(async () => {
        const pending = pendingConfirmations[reminderId]
        if (pending && !pending.confirmed) {
          for (const contact of familyContacts) {
            await sendMissedMedicineAlert({
              familyEmail:  contact.email,
              familyName:   contact.name,
              patientName,
              medicineName,
              dose,
              reminderTime
            })
          }
          delete pendingConfirmations[reminderId]
        }
      }, 15 * 60 * 1000)
    }
  }, 60 * 1000)

  activeReminders.push({
    reminderId,
    intervalId,
    patientEmail,
    patientName,
    medicineName,
    dose,
    reminderTime,
    familyContacts
  })

  saveToStorage()
  return reminderId
}

export const cancelReminder = (reminderId) => {
  const index = activeReminders.findIndex(r => r.reminderId === reminderId)
  if (index !== -1) {
    clearInterval(activeReminders[index].intervalId)
    activeReminders.splice(index, 1)
    saveToStorage()
    return true
  }
  return false
}

export const updateReminder = (reminderId, newData) => {
  const existing = activeReminders.find(r => r.reminderId === reminderId)
  if (!existing) return false
  cancelReminder(reminderId)
  scheduleReminder({
    patientEmail:   newData.patientEmail   || existing.patientEmail,
    patientName:    newData.patientName    || existing.patientName,
    medicineName:   newData.medicineName   || existing.medicineName,
    dose:           newData.dose           || existing.dose,
    reminderTime:   newData.reminderTime   || existing.reminderTime,
    familyContacts: newData.familyContacts || existing.familyContacts
  })
  return true
}

export const getAllReminders = () => {
  return activeReminders.map(r => ({
    reminderId:     r.reminderId,
    patientEmail:   r.patientEmail,
    patientName:    r.patientName,
    medicineName:   r.medicineName,
    dose:           r.dose,
    reminderTime:   r.reminderTime,
    familyContacts: r.familyContacts
  }))
}

export const getStoredReminders = () => {
  try {
    const data = localStorage.getItem("pharmaguard_reminders")
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const restoreReminders = () => {
  const stored = getStoredReminders()
  stored.forEach(r => {
    scheduleReminder({
      patientEmail:   r.patientEmail,
      patientName:    r.patientName,
      medicineName:   r.medicineName,
      dose:           r.dose,
      reminderTime:   r.reminderTime,
      familyContacts: r.familyContacts || []
    })
  })
  console.log(`Restored ${stored.length} reminders from storage`)
}

export const confirmMedicine = (reminderId) => {
  if (pendingConfirmations[reminderId]) {
    pendingConfirmations[reminderId].confirmed = true
    delete pendingConfirmations[reminderId]
    return true
  }
  return false
}
