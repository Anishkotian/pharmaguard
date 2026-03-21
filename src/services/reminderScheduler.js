import { sendMissedMedicineAlert, sendReminderToPatient } from "./emailAlert"

const activeReminders = []
const pendingConfirmations = {}

export const scheduleReminder = ({
  patientEmail,
  patientName,
  medicineName,
  dose,
  reminderTime,
  familyContacts
}) => {
  const reminderId = `${patientEmail}_${medicineName}_${reminderTime}`
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

  activeReminders.push({ reminderId, intervalId })
  return reminderId
}

export const cancelReminder = (reminderId) => {
  const index = activeReminders.findIndex(r => r.reminderId === reminderId)
  if (index !== -1) {
    clearInterval(activeReminders[index].intervalId)
    activeReminders.splice(index, 1)
  }
}

export const confirmMedicine = (reminderId) => {
  if (pendingConfirmations[reminderId]) {
    pendingConfirmations[reminderId].confirmed = true
    delete pendingConfirmations[reminderId]
    return true
  }
  return false
}
